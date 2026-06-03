---
title: 蓝桥杯 2024 省 B 拔河 题解
date: 2026-06-03
tags: [蓝桥杯, 题解]
description: 蓝桥杯 2024 省 B 拔河，枚举 + set 二分求最小差值。
---

[P10429 [蓝桥杯 2024 省 B] 拔河 - 洛谷](https://www.luogu.com.cn/problem/P10429)

## 思路

考虑先枚举 $l_2$ 再枚举 $r_2$，思考如何确定最小的差值。

我们发现，$l_1 \leq r_1 < l_2$，所以可以处理出所有的满足条件的第一个队伍的力量值之和，然后二分即可，这里使用 set 会更加方便。

从小到大枚举 $l_2$，每次枚举后再把新的满足条件的力量值之和（右端点为 $l_2$）加入即可。

时间复杂度 $O(n^2 \log n)$

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
    int n; cin >> n;
    vector<int> a(n + 1);
    vector<ll> pre(n + 1);
    for (int i = 1; i <= n; ++i) {
        cin >> a[i];
        pre[i] = pre[i - 1] + a[i];
    }
    ll ans = 4e18;
    set<ll> vis;
    vis.insert(pre[1]);
    for (int l2 = 2; l2 <= n; ++l2) {
        for (int r2 = l2; r2 <= n; ++r2) {
            ll s = pre[r2] - pre[l2 - 1];
            auto it = vis.lower_bound(s);
            ans = min(ans, abs(s - *it));
            if (it != vis.begin()) ans = min(ans, abs(s - *(--it)));
        }
        for (int l1 = 1; l1 <= l2; ++l1) vis.insert(pre[l2] - pre[l1 - 1]);
    }
    cout << ans << "\n";
}

signed main() { 
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
 
    int T = 1;
    // cin >> T;  
    while (T--) solve();
    return 0;
}
```