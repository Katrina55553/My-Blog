---
title: 2026 CCPC 南昌 M 题 题解
date: 2026-06-02
tags: [ACM, 题解]
description: 2026 CCPC 南昌 M 题，二分答案 + 贪心覆盖求最小化最大距离。
---

[Problem - M - Codeforces](https://codeforces.com/gym/106554/problem/M)

## 分析

问题本质是：从 n 个点中选最多 m 个点，使得 $[0, k]$ 中所有整数点到最近选中点的最大距离最小。

这是一个经典的 **最小化最大距离** 问题，很容易想到二分答案 d ，

问题转化为：给定一个距离 d，我们需要判断：
能否用不超过 m 个点覆盖整个 $[0, k]$ 区间，使得每个点都被某个选中点的距离 d 范围内。

**正确 check 策略**：
- 当前未覆盖的最左端位置为 pre（初始为 0）
- 在可选点中，选择**能覆盖 pre 且覆盖范围最远**的点 ( upper_bound )
- 即选择满足 $a_i - d <= pre$ 的所有点中，$a_i + d$ 最大的那个
- 然后将 cur 更新为该点覆盖的最右端 + 1（即 $a_i + d + 1$）

## 代码

```c++
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
using ull = unsigned long long;
using db = double;
#define dbg(x) cerr << #x << " = " << (x) << endl;
#define vdbg(a) cout << #a << " = "; for (auto x : a) cout << x << " "; cout << endl;


void solve() {
    ll n, m, k; cin >> n >> m >> k;
    vector<ll> a(n);
    for (int i = 0; i < n; ++i) cin >> a[i];
    sort(a.begin(), a.end());
    a.erase(unique(a.begin(), a.end()), a.end());
    n = a.size();

    auto check = [&](ll x) -> bool {
        int cnt = 0;
        ll pre = 0;
        while (pre <= k) {
            auto it = upper_bound(a.begin(), a.end(), pre + x);
            if (it == a.begin()) return 0;
            ll cur = *(--it);
            if (cur + x < pre) return 0;
            cnt++;
            pre = cur + x + 1;
        }
        return cnt <= m;
    };

    ll l = 0, r = k, ans = k;
    while (l <= r) {
        ll mid = l + r >> 1;
        if (check(mid)) {
            ans = mid;
            r = mid - 1;
        }
        else l = mid + 1;
    }
    cout << ans << "\n";
}

signed main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout << fixed << setprecision(10);
    
    int T = 1;
    // cin >> T;  
    while (T--) solve();
    return 0;
}
```