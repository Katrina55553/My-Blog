---
title: 蓝桥杯 2025 国 B 魔法护盾 题解
date: 2026-06-04
tags: [蓝桥杯, 题解]
description: 蓝桥杯 2025 国 B 魔法护盾，DP + 滚动数组求最少增幅次数。
---

## 思路


贪心的想法就是遇见一个出不去的房间，就翻倍一次。但问题在于：
假设现在有两个房间，并且到达这两个房价的护盾值均小于当前房间的攻击力，这种情况翻倍两次，但是我在前面一个护盾值较大的房间翻倍，就有可能只翻一次。所以考虑动态规划。

定义 $dp_{i,j}$ 为前 $i$ 个房间使用 $j$ 次护盾增幅的最大护盾值，有两种情况，一种是使用护盾增幅，一种是不使用，则有下面式子。

$$
dp_{i,j} = \max(\min(dp_{i-1,j-1} + 2 \times s_i, c), dp_{i-1,j} + s_i)。
$$

注意：需要使用滚动数组优化空间

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
    n, c, b = map(int, input().split())
    s = [0] + list(map(int, input().split()))
    a = [0] + list(map(int, input().split()))

    dp = [[-inf] * (n + 1) for _ in range(2)]
    dp[0][0] = b

    for i in range(1, n + 1):
        cur = i & 1
        pre = (i - 1) & 1

        for j in range(n + 1):
            dp[cur][j] = -inf

        for j in range(i + 1):
            if (dp[pre][j] != -inf):
                dp[cur][j] = dp[pre][j] + s[i]
                
            if (j and dp[pre][j - 1] != -inf):
                dp[cur][j] = max(dp[cur][j], dp[pre][j - 1] + 2 * s[i])
            
            dp[cur][j] = min(c, dp[cur][j])
            if (dp[cur][j] < a[i]):
                dp[cur][j] = -inf  # 当前状态设置为不可达
            
    for j in range(n + 1):
        if dp[n & 1][j] != -inf: 
            print(j)
            return
    print(-1)

T = 1
# T = int(input())
for _ in range(T):
    solve()
```