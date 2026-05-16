---
title: ST 表
date: 2026-04-16
tags: [蓝桥杯, 题解]
description: ST 表（稀疏表）求区间 GCD，结合二分答案/双指针。
---

[P8792 [蓝桥杯 2022 国 A] 最大公约数 - 洛谷](https://www.luogu.com.cn/problem/P8792)

## 思路

1. 统计数组中 1 的个数 `c`
   - 若 `c > 0`，答案为 `n - c`
   - 否则建 ST 表预处理区间 GCD
2. 二分答案 `x`（区间长度）
   - 检查是否存在长度为 `x` 的子数组，其 GCD 为 1
3. 若最终答案为 `ans`，输出 `n - 1 + ans`；若无解输出 `-1`

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
    for (int i = 1; i <= n; ++i) cin >> a[i];

    int c = 0;
    for (int i = 1; i <= n; ++i) {
        if (a[i] == 1) c++;
    }

    if (c) {
        cout << n - c << "\n";
        return;
    }

    vector<vector<int>> st(n + 1, vector<int>(log2(n) + 1));
    for (int i = 1; i <= n; ++i) st[i][0] = a[i];
    for (int j = 1; (1 << j) <= n; ++j) {
        for (int i = 1; i + (1 << j) - 1 <= n; ++i) {
            st[i][j] = gcd(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
        }
    }

    auto query = [&] (int l, int r) -> int {
        int k = (int)log2(r - l + 1);
        return gcd(st[l][k], st[r - (1 << k) + 1][k]);
    };

    auto check = [&] (int x) -> bool {
        for (int i = 1; i <= n - x; ++i) {
            if (query(i, i + x) == 1) return 1;
        }
        return 0;
    };

    int l = 0, r = n - 1, ans = -1;
    while (l <= r) {
        int mid = l + r >> 1;
        if (check(mid)) {
            r = mid - 1;
            ans = mid;
        }
        else l = mid + 1;
    }
    if (ans == -1) cout << "-1\n";
    else cout << n - 1 + ans << "\n";
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
`