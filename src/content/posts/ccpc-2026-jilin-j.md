---
title: 2026 CCPC 吉林省赛 J 题 题解
date: 2026-06-04
tags: [ACM, 题解]
description: 2026 CCPC 吉林省赛 J 题，枚举区间翻转求最大逆序对增量。
---

## 题解

翻转一段 $[l, r]$ 时，区间外面的数谁前谁后都不变，只有区间里面的逆序对会变。

区间里任意一对 $i < j$：若 $p_i > p_j$，翻完就不算逆序对了，少 1；若 $p_i < p_j$，翻完反而多 1。

记翻转 $[l, r]$ 能多出来的逆序对数数为 $\Delta(l, r)$，答案就是原来的逆序对数 + 所有 $\Delta(l, r)$ 里的最大值（不翻转相当于 $\Delta = 0$）。

怎么求每个 $\Delta(l, r)$？想法是：先固定左端点 $l$，再让右端点 $r$ 从左往右一个一个扩进来。

$$
f(l, r) = f(l + 1, r) + \sum_{j=l+1}^{r} 
\begin{cases} 
1, & p_l < p_j \\ 
-1, & p_l > p_j 
\end{cases}
$$
复杂度 $O(n^2)$。


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
    p = list(map(int, input().split()))

    base = 0
    for i in range(n):
        for j in range(i + 1, n):
            if p[i] > p[j]:
                base += 1

    # f[l][r] = Δ(l,r)
    f = [[0] * n for _ in range(n)]

    ans = base
    for l in range(n - 1, -1, -1):
        cur = 0
        for r in range(l + 1, n):
            if p[l] < p[r]:
                cur += 1
            else:
                cur -= 1

            f[l][r] = f[l + 1][r] + cur
            ans = max(ans, base + f[l][r])

    print(ans)


T = 1
T = int(input())
for _ in range(T):
    solve()
```