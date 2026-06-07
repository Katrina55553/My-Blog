---
title: Redis 五种基本数据结构
date: 2026-05-28
tags: [后端, Redis, 中间件]
description: Redis 五种基本数据结构（字符串、链表、哈希表、集合、有序集合）的底层实现详解，涵盖 SDS、渐进式 rehash、intset、跳跃表等核心机制。
---

### 字符串

Redis 本身用 C 语言实现（高性能和跨平台性）。

**为什么 Redis 不用 C 原生字符串？**

C 原生字符串（以 `\0` 结尾的 char 数组）存在几个关键问题：

1. **获取长度 O(n)**：需要遍历整个字符串直到 `\0`。
2. **缓冲区溢出风险**：修改字符串时容易越界，没有好的扩容机制。
3. **二进制不安全**：无法存储包含 `\0` 的数据（如图片、序列化对象）。

Redis 选择 **SDS** (Simple Dynamic String)。

```c
struct sdshdr {
    unsigned int len;      // 已使用的字节数（不含结尾的\0）
    unsigned int alloc;    // 分配的总字节数（不含头部和\0）
    unsigned char flags;   // SDS类型标志（低3位表示类型，高5位预留）
    char buf[];            // 柔性数组，实际存储字符串内容
};
```

Redis 选择 SDS 的原因：

1. 字符串长度获取时间复杂度从 O(n) -> O(1)。
2. 自动内存管理，防止溢出，还能内存优化。
3. 二进制安全，支持各种数据类型。

### 链表

Redis 链表的底层实现是双向链表。

```c
// 链表节点结构
typedef struct listNode {
    struct listNode *prev; // 前驱节点指针
    struct listNode *next; // 后继节点指针
    void *value;           // 节点值，void* 实现多态
} listNode;

// 链表管理结构
typedef struct list {
    listNode *head;                // 头节点指针
    listNode *tail;                // 尾节点指针
    unsigned long len;             // 链表节点计数器
    void *(*dup)(void *ptr);       // 节点值复制函数
    void (*free)(void *ptr);       // 节点值释放函数
    int (*match)(void *ptr, void *key); // 节点值匹配函数
} list;
```

### 哈希表

由于 C 语言自己没有内置哈希表这一数据结构，因此 Redis 自己实现了 Hash 表。

Redis 的哈希表实现主要依赖于三个结构体：
`dictht`（哈希表）、`dictEntry`（节点）和 `dict`（字典）。

**哈希表结构 (`dictht`)**

```c
typedef struct dictht {
    dictEntry **table;      // 哈希表数组（每个元素是一个链表的头指针）
    unsigned long size;     // 哈希表大小（桶的数量，总是2的幂）
    unsigned long sizemask; // 哈希表大小掩码（用于计算索引，等于 size-1）
    unsigned long used;     // 已有节点的数量
} dictht;
```

**哈希表节点 (`dictEntry`)**

```c
typedef struct dictEntry {
    void *key;              // 键（指向 SDS 字符串）
    union {                 // 值（支持多种类型）
        void *val;
        uint64_t u64;
        int64_t s64;
        double d;
    } v;
    struct dictEntry *next; // 指向下一个节点（拉链法解决冲突）
} dictEntry;
```

**字典结构 (`dict`)**

```c
typedef struct dict {
    dictType *type;         // 类型特定函数（多态）
    void *privdata;         // 私有数据
    dictht ht[2];           // 两个哈希表，ht[0]主用，ht[1]用于rehash
    long rehashidx;         // rehash索引，-1表示未进行rehash
    int16_t pauserehash;    // 是否暂停rehash
} dict;
```

**负载因子** = 哈希表内元素个数 / 哈希表大小。

当负载因子不在合理范围内时，程序需要对哈希表进行扩展或收缩。由于空间变大或缩小，键在老表的存储位置在新表中不一定一样，需要重新计算。这个重新计算并把老表元素转移到新表的过程就叫做 **rehash**。

**普通 rehash 流程（一次性迁移）：**

1. **分配空间**：为 `ht[1]` 分配内存空间。其最终大小（通常是大于等于 `ht[0].used * 2` 的最小 2 的幂）由 `ht[0]` 的当前负载和操作类型（扩容/缩容）决定。
2. **迁移数据**：将 `ht[0]` 中存储的所有键值对，**重新计算**哈希值和索引位置，然后迁移并存储到 `ht[1]` 中对应的桶内。
3. **切换指针**：当全部数据迁移完成后，释放 `ht[0]` 原本占用的内存空间。然后将 `ht[0]` 的指针指向 `ht[1]` 当前的地址，使其成为新的主哈希表。
4. **重置辅助表**：将 `ht[1]` 指向空表（`NULL`），为下一次可能发生的 Rehash 做好准备。

**问题**：如果 `ht[0]` 里有几百万个键值对，第 2 步的"一次性迁移"会耗时几秒甚至更久。对于单线程的 Redis 来说，这意味着所有命令都得排队等待，服务会卡死。

因此，Redis 实际采用的是 **"渐进式 rehash"**。

| 步骤 | 一次性 rehash (如 Go map) | Redis 渐进式 rehash |
| :--- | :--- | :--- |
| **1. 分配空间** | 为 `ht[1]` 分配好空间。 | 相同。 |
| **2. 迁移数据** | **一次性**将所有键从 `ht[0]` 移到 `ht[1]`。 | **分多次**：每次增删改查时**顺便**搬几个，空闲时定时任务也会来搬。 |
| **3. 释放空间** | 释放 `ht[0]`，把 `ht[1]` 变成新的 `ht[0]`。 | 相同，完成后标记 `rehashidx = -1`。 |
| **4. 置空辅助表** | `ht[1]` 指向 `NULL`。 | 相同。 |

### 集合

在底层实现上，Redis 根据数据量大小为集合选择了两种不同的数据结构：

1. **整数集合 (intset)**：当所有元素都是整数且数量较少时使用。
2. **哈希表 (dict)**：当元素数量变多，或包含字符串时使用。

**整数集合 (intset)**

当集合较小且全是整数时，intset 是 Redis 的内存优化利器。

```c
typedef struct intset {
    uint32_t encoding;  // 编码方式 (int16_t, int32_t, int64_t)
    uint32_t length;    // 集合中元素个数
    int8_t contents[];  // 柔性数组，实际存储元素的数组
};
```

**核心特性**：

- **有序数组**：元素在 `contents` 数组中按**从小到大**排列。
- **类型升级**：当插入一个更大范围的整数时（如从 `int16_t` 升级到 `int64_t`），整个数组会自动升级编码。**但一旦升级，就不能降级**。
- **二分查找**：因为是有序的，查找元素使用二分查找，复杂度 O(log N)。

**哈希表 (dict)**

当集合不满足 intset 条件时，Redis 会将其转换为哈希表实现。

- **O(1) 操作**：增、删、查都非常快，适合大集合。

### 有序集合

有序集合同时使用**跳跃表 (skiplist)** 和**哈希表 (dict)**。

```c
typedef struct zset {
    dict *dict;      // 哈希表：元素 -> 分数 的映射，O(1) 复杂度
    zskiplist *zsl;  // 跳跃表：按分数排序存储元素，支持范围查询
} zset;
```

**核心设计思想**：**空间换时间，双索引**。

- **哈希表 (dict)**：维护 `元素 -> 分数` 的映射，用于快速查询元素分数或判断元素是否存在，复杂度 O(1)。
- **跳跃表 (zskiplist)**：按分数从小到大维护所有元素，用于按分数范围查询、排名计算等，复杂度 O(log N)。

**注意**：两个结构**共享**同一个元素和分数，不存在两份数据拷贝，只是用不同的方式组织指针。

**跳跃表结构**

```c
// 跳跃表节点
typedef struct zskiplistNode {
    sds ele;                    // 元素（字符串）
    double score;               // 分数（排序依据）
    struct zskiplistNode *backward;  // 后退指针（指向前一个节点）
    struct zskiplistLevel {
        struct zskiplistNode *forward; // 前进指针
        unsigned long span;            // 跨度（用于计算排名）
    } level[];                  // 层级数组（柔性数组）
} zskiplistNode;

// 跳跃表管理结构
typedef struct zskiplist {
    struct zskiplistNode *header, *tail;  // 头尾节点指针
    unsigned long length;                 // 节点数量
    int level;                            // 当前最大层数
} zskiplist;
```


## 参考视频



[【面试八股文】Redis入门](https://www.bilibili.com/video/BV1aU4y1Z71c?vd_source=ff4b1d4c42eea739695d4eb2df88faca)