---
title: 前缀和优化算贡献
date: 2026-03-21
tags: [ACM, 题解]
description: 通过前缀和预处理将 O(n²) 的贡献计算优化到 O(n)，解决奶龙农场的宝藏计算问题。
---

[M-奶龙农场的宝藏计算_湖北工业大学2025年ACM校赛（同步赛）](https://ac.nowcoder.com/acm/contest/106269/M)



对于每个 `(i,j)` 直接计算 `a[i]*a[j]*2^(j-i-1)`，$O(n^2)$

转换为 `a[j]*2^(j-1) * (a[i]/2^i)`，预处理前缀和 $\sum_{i=0}^{j-1} a[i]/2^i$，$O(n)$

```python
n = int(input())
a = list(map(int, input().split()))
a.sort()
mod = 998244353
ans = 0

pow2 = [1] * (n + 1)
for i in range(1, n + 1):
    pow2[i] = pow2[i - 1] * 2 % mod

pre = [0] * (n + 1)
for i in range(1, n + 1):
    pre[i] = (pre[i - 1] + a[i - 1] * pow(pow2[i - 1], mod - 2, mod)) % mod

for j in range(1, n):
    ans = (ans + a[j] * pow2[j - 1] % mod * pre[j] % mod) % mod

for i in a:
    ans = (ans + i ** 2) % mod
    
print(ans)
```
