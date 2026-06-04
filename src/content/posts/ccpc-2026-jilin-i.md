---
title: 2026 CCPC 吉林省赛 I 题 题解
date: 2026-06-03
tags: [ACM, 题解]
description: 2026 CCPC 吉林省赛 I 题，贪心 + 小根堆构造合法序列。
---

## 题意

已知将序列 a 与其前缀最大值序列 b 拼接后 shuffle 得到的 c（长度 2n，$1≤a_i ≤n$）。
求任意一组合法的 a ，或判定无解。 $n ≤3×10^5$


## 思路

对于某个数 $x$：第一次成为前缀最大值时一定产生：$(a_i, b_i) = (x, x)$
因此：每个作为前缀最大值出现的数，至少出现两次。

若前缀最大继续保持为 $x$ 则会产生：$(y, x),\quad y \le x$
即：每多一个 $x$ 就需要一个不超过 $x$ 的数与之配对。

统计每个数出现次数 $cnt[x]$。

维护一个小根堆 `no`：存放当前还没使用、可以作为“小数”的数。

对于每个 $x$：

1. 若 $cnt[x] = 1$ 说明它不可能作为新的前缀最大值。只能作为普通数使用。加入堆中。
2. 若 $cnt[x] \ge 2$ 先固定一对：$(x, x)$ 。在 $a$ 中放一个 $x$ ， 在 $b$ 中放一个 $x$ 把这个 $x$ 加入答案。

剩余：$cnt[x] - 2$ 个 $x$。这些都需要某个 $y \le x$ 来配对。

若堆顶 $\le x$，取出来配对。
否则当前没有可用小数。此时把 $x$ 本身加入堆中，留给以后更大的数使用。

若最终堆不为空：说明还有数无法配对，无解。否则当前构造出的数组就是合法的 $a$。


## 代码

```python
import sys
input = lambda: sys.stdin.readline().rstrip()
from bisect import bisect_left, bisect_right
from heapq import heappop, heappush, heapify
from collections import Counter, deque, defaultdict
from math import inf, ceil, gcd, sqrt, factorial, log2, log
from itertools import combinations, permutations

def solve():
    n = int(input())
    c = list(map(int, input().split()))
    cnt = Counter(c)
    re = []
    no = []
    for x in range(1, n + 1):
        if cnt[x] == 1:
            heappush(no, x)
        elif cnt[x] >= 2:
            re.append((x, x))
            for _ in range(cnt[x] - 2):
                re.append((0, x))

    ans = []
    for l, r in re:
        if l == r:
            ans.append(l)
        else:
            if no and no[0] <= r:
                ans.append(heappop(no))
            else:
                heappush(no, r)
    if no:
        print("No")
        return

    print("Yes")
    print(*ans)

T = 1
T = int(input())
for _ in range(T):
    solve()
```