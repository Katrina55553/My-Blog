---
title: 前缀和优化 DP
date: 2026-03-28
tags: [Codeforces, 题解]
description: 双指针 + 前缀和优化 DP，解决将数组划分为合法凸多边形边的计数问题，复杂度 O(n)。
---

[Problem - A - Codeforces](https://codeforces.com/gym/105316/problem/A)

## 题意

将数组划分为若干**连续非空子数组**，每个子数组的和作为多边形的一条边。要求这些边能构成一个**凸多边形**，求方案数（对 1e9 + 7 取模）。

## 转化

问题等价于：将数组划分为若干个连续非空子数组，使得**每个子数组的和 < 总和 / 2**。

多边形至少需要 3 条边 → 划分至少要有 3 段。但不可能出现只有 1 段或 2 段且满足"每段 < 总和/2"的情况：

- **1 段**：整个数组和 = S，而 `S < S/2` 不可能。
- **2 段**：设两段和为 x 和 S−x。要求 `x < S/2` 且 `S−x < S/2` ⇒ `x < S/2` 且 `x > S/2` → 矛盾。

所以**任何满足"每段和 < S/2"的划分，自动有 ≥3 段，且合法。**

## 解法

双指针维护合法区间 + 前缀和优化 DP。

`dp[r]` — 以 r 结尾的合法划分数。
`dp2[r]` — dp 的前缀和。

对于每个 r，双指针找到最小的 l 使得 `(pre[r] - pre[l-1]) * 2 < sum`，然后用前缀和 O(1) 转移。

```c++
const int MOD = 1e9 + 7;

void solve() {
    int n; cin >> n;
    vector<ll> a(n + 1), dp(n + 1), pre(n + 1), dp2(n + 1);
    for (int i = 1; i <= n; ++i) {
        cin >> a[i];
        pre[i] = pre[i - 1] + a[i];
    }
    ll sum = pre[n];
    dp[0] = 1, dp2[0] = 1;
    int l = 1;
    for (int r = 1; r <= n; ++r) {
        while (2 * (pre[r] - pre[l - 1]) >= sum) l++;

        if (l <= r) {
            int tmp = (l - 2 >= 0) ? dp2[l - 2] : 0;
            dp[r] = (dp2[r - 1] - tmp + MOD) % MOD;
        }
        else dp[r] = 0;

        dp2[r] = (dp2[r - 1] + dp[r]) % MOD;
    }
    cout << dp[n] << "\n";
}
```

## 复杂度

双指针 + 前缀和 O(n)，每个位置最多被 l 和 r 各访问一次。
