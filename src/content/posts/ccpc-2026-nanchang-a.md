---
title: 2026 CCPC 南昌 A 题 题解
date: 2026-06-03
tags: [ACM, 题解]
description: 2026 CCPC 南昌 A 题，状态压缩 DP 求最大额外开心度。
---

[Problem - A - Codeforces](https://codeforces.com/gym/106554/problem/A)


## 思路

把每包馍片最终分成两类：

- `A`：不扔，留在前面；
- `B`：扔到最后。

那么最终吃的顺序一定是 `A` 的顺序 + `B` 的顺序，且两边内部都保持原顺序。

额外开心度只来自相邻两包，所以总额外值 =

- `A` 内部相邻贡献
- `B` 内部相邻贡献
- 以及 `A` 最后一个到 `B` 第一个的边界贡献（如果两边都非空）

关键是：

- 往 `A` 里加东西，只需要知道 `A` 的最后一种味道；
- 往 `B` 里加东西，需要知道 `B` 的第一个味道和最后一个味道；

因此定义： $dp[la][fb][lb]$ 表示当前最大内部贡献。

- $la$：A 最后一个味道
- $fb$：B 第一个味道
- $lb$：B 最后一个味道

所以范围都是：$0 \sim 5$   总状态数： $6^3 = 216$


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
    a = list(map(int, input().split()))
    INF = 10**18
    # dp[la][fb][lb]
    dp = [[[-INF] * 6 for _ in range(6)] for _ in range(6)]
    dp[0][0][0] = 0

    def cost(x, y):
        return (y - x) % 5

    for c in a:
        ndp = [[[-INF] * 6 for _ in range(6)] for _ in range(6)]
        for la in range(6):
            for fb in range(6):
                for lb in range(6):
                    cur = dp[la][fb][lb]
                    if cur == -INF:
                        continue

                    # 1. 放入 A
                    add = 0 if la == 0 else cost(la, c)
                    ndp[c][fb][lb] = max(ndp[c][fb][lb], cur + add)

                    # 2. 放入 B
                    if fb == 0:
                        ndp[la][c][c] = max(ndp[la][c][c], cur)
                    else:
                        add = cost(lb, c)
                        ndp[la][fb][c] = max(ndp[la][fb][c], cur + add)
        dp = ndp

    ans = 0
    for la in range(6):
        for fb in range(6):
            for lb in range(6):
                cur = dp[la][fb][lb]
                if cur == -INF:
                    continue
                if la != 0 and fb != 0:
                    cur += cost(la, fb)
                ans = max(ans, cur)
    print(ans + n)


T = 1
# T = int(input())
for _ in range(T):
    solve()
```