---
title: 蓝桥杯 2026 省 B 理想温度 题解
date: 2026-06-05
tags: [蓝桥杯, 题解]
description: 蓝桥杯 2026 省 B 理想温度，最大子段和求最优操作区间。
---

[P16238 [蓝桥杯 2026 省 B] 理想温度 - 洛谷](https://www.luogu.com.cn/problem/P16238)

## 思路

首先，对于每个位置 $i$，我们定义差值 $d_i = b_i - a_i$，接下来有两种情况：

- 若 $d_i = 0$，说明开始时已满足要求。
- 若 $d_i \neq 0$，则需要加上 $-d_i$ 才能使其满足要求。

这时，我们可以选定增加的数值 $k = -v$ ($v \neq 0$)，则对任意位置 $i$：

- 若 $d_i = v$，即原本不满足要求，操作后满足要求则答案需要增加 1。
- 若 $d_i = 0$，即原本满足要求，操作后变为 $k \neq 0$ 不满足要求，答案需要减 1。
- 若 $d_i$ 为其他值，原本不满足要求，操作后仍不满足要求，答案不变。

所以，我们可以这样思考，对于每一种非零差值 $v$，建立一个价值数组 $w$，则满足以下情况：

- $w_i = 1$ 当且仅当 $d_i = v$ 时；
- $w_i = -1$ 当且仅当 $d_i = 0$ 时；
- $w_i = 0$ 当且仅当 $d_i$ 为其他值时。

然后在 $w$ 上求最大子段和，为方便记忆，我们将其记做该 $v$ 的最大净收益 $x$，然后，我们将所有 $x$ 的最大值记为 $ans$。最终答案即是 初始匹配数 与 $ans$ 的和。

如果每次都做一次最大子段和显然会超时，关键在于：**不是对每个 k 都遍历整个数组**，而是只遍历 $d_i=k$ 的那些位置。具体见代码


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
    a = [0] + list(map(int, input().split()))
    b = [0] + list(map(int, input().split()))

    f = [0] * (n + 1)
    d = defaultdict(list)
    for i in range(1, n + 1):
        f[i] = f[i - 1] + (a[i] == b[i])
        if (a[i] == b[i]):
            continue
        d[b[i] - a[i]].append(i)
    
    ans = 0
    for ls in d.values():
        cur = 0
        for i in range(len(ls)):
            if (i):
                cur = max(1, cur + 1 - f[ls[i] - 1] + f[ls[i - 1]])
            else:
                cur = 1
            ans = max(ans, cur)

    print(ans + f[n])

    
T = 1
# T = int(input())
for _ in range(T):
    solve()
```