---
title: 蓝桥杯 2022 省 A 选数异或 题解
date: 2026-06-02
tags: [蓝桥杯, 题解]
description: 蓝桥杯 2022 省 A 选数异或，预处理 + ST 表求区间最大值。
---

[P8773 [蓝桥杯 2022 省 A] 选数异或 - 洛谷](https://www.luogu.com.cn/problem/P8773)

## 思路

注意到 $x$ 是提前给出的，所以可以考虑预处理

对于每一个 $i$ 我们预处理一个 $pos_i$ 代表 $i$ 前面的最后一个与 $A_i$ 的异或等于 $x$ 的数的下标，这个可以开个桶，边扫边统计。

预处理出这个后，不难发现对于区间 $[l, r]$，有解的充要条件是存在至少一个 $i \in [l, r]$ 使得 $ans_i \geq l$，所以只需要求出 $ans_l$ 到 $ans_r$ 的区间最大值，将其与 $l$ 比较就行了。

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
    n, m, x = map(int, input().split())
    a = [0] + list(map(int, input().split()))

    pos = [0] * (n + 1) # i 前面的最后一个与 A_i 的异或等于 x 的数的下标
    b = defaultdict(int)
    for i in range(1, n + 1):
        pos[i] = b[a[i] ^ x]
        b[a[i]] = i

    LG = n.bit_length()
    st = [[0] * LG for _ in range(n + 1)] # 从 i 开始 长度为 2^j 的区间 max
    for i in range(1, n + 1):
        st[i][0] = pos[i]
        
    for j in range(1, LG + 1):
        for i in range(1, n - (1 << j) + 2):
            st[i][j] = max(st[i][j - 1], st[i + (1 << (j - 1))][j - 1])

    def ask(l, r):
        k = (r - l + 1).bit_length() - 1
        return max(st[l][k], st[r - (1 << k) + 1][k])
    
    for _ in range(m):
        l, r = map(int, input().split())
        if (ask(l, r) >= l):
            print("yes")
        else:
            print('no')

T = 1
# T = int(input())
for _ in range(T):
    solve()
```