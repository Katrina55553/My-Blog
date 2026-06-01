---
title: 2026 CCPC 福建 F 题 题解
date: 2026-06-01
tags: [ACM, 题解]
description: 2026 CCPC 福建 F 题，二分答案 + 倍增在环上选 k 个点使最小间距最大。
---

[Problem - F - Codeforces](https://codeforces.com/gym/106565/problem/F)

Easy Version ：

[3464. 正方形上的点之间的最大距离 - 力扣（LeetCode）](https://leetcode.cn/problems/maximize-the-distance-between-points-on-a-square/description/)

## 问题转化


将正方形边上的点，按照顺时针映射到一维数轴上。 

二分答案后问题变成：

- 能否在数组 $a$ 中选 $k$ 个数，要求任意两个相邻元素相差至少为 $d$，且第一个数和最后一个数相差至多为 $side \cdot 4 - d$。
- $side \cdot 4 - d$ 是因为 $a$ 是个环形数组，设第一个点为 $x$，最后一个点为 $y$，那么 $y$ 可以视作负方向上的 $y - side \cdot 4$，我们要求 $x - (y - side \cdot 4) \geq d$，解得 $y - x \leq side \cdot 4 - d$。

对于二分得到的 $d$，检查能否在环上选出 $k$ 个点，使相邻环上坐标间隔均至少为 $d$，且最后一个点距离起点也至少为 $d$。

对每个点求 $nxt(i)$，表示 $i$ 后方第一个满足 $p_{nxt(i)} - p_i \geq d$ 的点。
这个数组可以对每个 $i$ 二分求出，也可以用双指针线性求出。

直接跳 $k-1$ 次会得到 $O(nk \log S)$。
注意到 $nxt$ 是一个函数图上的跳转，可以为它预处理倍增表：$up[t][i] = nxt^{2^i}(i).$

于是每个起点只需 $O(\log k)$ 就能求出第 $k$ 个点。
一次 check 为 $O(n \log k)$ ，总复杂度  $O(n \log k \log S).$


## 代码


```python
import sys
input = lambda: sys.stdin.readline().rstrip()
from bisect import bisect_left, bisect_right


def solve():
    side, k, n = map(int, input().split())
    points = [(0, 0) for _ in range(n)]
    for i in range(n):
        x, y = map(int, input().split())
        points[i] = (x, y)

    a = []
    for x, y in points:
        if (x == 0):
            a.append(y)
        elif (y == side):
            a.append(side + x)
        elif (x == side):
            a.append(side * 3 - y)
        else:
            a.append(side * 4 - x)
    a.sort()

    def check(x):
        m = k.bit_length()
        # 倍增表：up[t][i] 表示从 i 跳 2^t 步到达的位置
        up = [[-1] * n for _ in range(m)]
        for i in range(n):
            j = bisect_left(a, a[i] + x)
            if j < n and a[j] - a[i] <= 4 * side - x:
                up[0][i] = j

        for t in range(1, m):
            for i in range(n):
                up[t][i] = up[t - 1][up[t - 1][i]]

        for st in range(n):
            if up[0][st] == -1:  
                continue
            cur = st
            ok = 1
            for t in range(m):
                if ((k - 1) >> t & 1):
                    if (cur == -1 or up[t][cur] == -1):
                        ok = 0
                        break
                    cur = up[t][cur]
            if not ok:
                continue

            dis = a[cur] - a[st]
            if (cur < st):
                dis += 4 * side
            if 4 * side - dis >= x:
                return 1
        return 0

    l = 1
    r = 4 * side
    ans = 0
    while (l <= r):
        mid = l + r >> 1
        if (check(mid)):
            l = mid + 1
            ans = mid
        else:
            r = mid - 1
    print(ans)


T = 1
T = int(input())
for _ in range(T):
    solve()
```


