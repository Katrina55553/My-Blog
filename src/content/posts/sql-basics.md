---
title: SQL 基础
date: 2026-01-09
tags: [数据库, SQL]
description: SQL（Structured Query Language）结构化查询语言，涵盖 DDL、DML、DQL、DCL 基础语法与示例。
---

# SQL 基础

SQL（Structured Query Language）结构化查询语言

关系型数据库的标准操作语言

## SQL 特点

1. **综合统一** — 集数据定义语言（DDL）、数据操控语言（DML）、数据控制语言（DCL）功能于一体
2. **高度非过程化**
3. **面向集合的操作方式**
4. **以同一种语法结构提供多种使用方式**
5. **语言简洁、易学易用**

## 数据定义语言 DDL（Data Definition Language）

### 创建库/表

```sql
CREATE DATABASE 数据库名;

CREATE TABLE 表名 (
    列名 数据类型 [约束],
    ...
);
/*
约束条件：
    NOT NULL     取值非空
    DEFAULT      指定默认值
    UNIQUE       取值不能重复
    NOT NULL UNIQUE
    CHECK        限制取值范围
    PRIMARY KEY  指定主键
    FOREIGN KEY  指定外键
*/
```

### 修改表结构

```sql
ALTER TABLE 表名 ADD 新列名 数据类型 [约束] / DROP 列名 / MODIFY 列名 新数据类型 [约束];
```

### 删除库/表

```sql
DROP DATABASE 数据库名;
DROP TABLE 表名;
```

## 数据操作语言 DML（Data Manipulation Language）

### 插入数据

```sql
INSERT INTO 表名 [(列名1, 列名2, ...)] VALUES (值1, 值2, ...);
```

### 更新数据

```sql
UPDATE 表名 SET 列名1 = 值1 [, 列名2 = 值2] WHERE 条件;
```

### 删除数据

```sql
DELETE FROM 表名 WHERE 条件;
```

## 数据查询语言 DQL（Data Query Language）

### 基本查询

```sql
SELECT [ALL | DISTINCT] 列名1, 列名2, ...
FROM 表名
[WHERE 条件]
[GROUP BY 列名 [HAVING 条件]]
[ORDER BY 列名 [ASC | DESC]];
```

### 常用运算符

- `=`、`<>`、`!=`、`<`、`<=`、`>`、`>=`
- `BETWEEN ... AND ...`
- `IN(...)`
- `LIKE 'pattern'`（`%` 任意字符，`_` 单个字符）
- `IS NULL` / `IS NOT NULL`

### 聚合函数

```sql
COUNT(*)        -- 统计行数
SUM(列名)       -- 求和
AVG(列名)       -- 平均值
MAX(列名)       -- 最大值
MIN(列名)       -- 最小值
```

### 分组与筛选

```sql
SELECT 列名, COUNT(*) AS cnt
FROM 表名
GROUP BY 列名
HAVING COUNT(*) > 1;
```

### 排序

```sql
SELECT * FROM 表名 ORDER BY 列名 ASC;  -- 升序（默认）
SELECT * FROM 表名 ORDER BY 列名 DESC; -- 降序
```

## 数据控制语言 DCL（Data Control Language）

### 授权

```sql
GRANT 权限1, 权限2 ON 表名 TO 用户名;
```

### 回收权限

```sql
REVOKE 权限1, 权限2 ON 表名 FROM 用户名;
```

## 常用数据类型

| 类型 | 说明 |
|------|------|
| `INT` | 整型 |
| `VARCHAR(n)` | 可变长度字符串，最大 n 字符 |
| `CHAR(n)` | 固定长度字符串，n 字符 |
| `DATE` | 日期 |
| `DATETIME` | 日期时间 |
| `DECIMAL(p, s)` | 精确小数，p 位精度，s 位小数 |

## 示例

```sql
-- 创建表
CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    age INT,
    gender CHAR(1) CHECK(gender IN ('M', 'F'))
);

-- 插入数据
INSERT INTO students VALUES (1, 'Alice', 20, 'F');

-- 查询
SELECT name, age FROM students WHERE gender = 'F' ORDER BY age DESC;

-- 更新
UPDATE students SET age = 21 WHERE name = 'Alice';

-- 删除
DELETE FROM students WHERE id = 1;
```

## 参考

- MySQL、PostgreSQL、SQL Server、SQLite 均支持标准 SQL 语法，部分方言略有差异