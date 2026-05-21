---
title: 第十三届 ICPC 山东省赛 M 题 题解
date: 2026-03-19
tags: [ACM, 题解]
description: 第十三届 ICPC 山东省赛 M 题 解题思路，使用双指针（旋转卡壳）维护最优解，求多边形最大面积。
---

[Problem - M - Codeforces](https://codeforces.com/gym/104417/problem/M)

第十三届 ICPC 山东省赛 M 题 题解

## 思路

用 **双指针（旋转卡壳）** 维护最优：

1. 将原多边形复制一倍，得到 `2n` 个点，便于环形遍历
2. 固定边 `(p[i], p[i+k])`，用指针 `j` 在 `[i+k+1, i+n-1]` 范围内移动，寻找使三角形 `(p[i], p[i+k], p[j])` 面积最大的点
3. 维护三角形面积和，遍历所有起始点 `i`，取最大值

## 细节

- 叉积使用 `long long`，避免整数溢出
- 面积计算使用叉积绝对值，最终输出 `*0.5`

## 代码

```c++
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
using ull = unsigned long long;
using db = double;
#define dbg(x) cerr << #x << " = " << (x) << endl;
#define vdbg(a) cerr << #a << " = "; for (auto x : a) cerr << x << " "; cerr << endl;

struct Point { ll x, y; };
using Vec = Point;
ll cross(const Vec &u, const Vec &v) { return u.x * v.y - u.y * v.x; }
ll area2(const vector<Point> &p) {
    int n = p.size();
    if (n < 3) return 0.0;
    ll ans = 0;
    for (int i = 0; i < n; ++i) {
        int j = (i + 1) % n;
        ans += cross(p[i], p[j]);
    }
    return abs(ans);
}

void solve() {
    int n, k; cin >> n >> k;
    vector<Point> p(2 * n);
    for (int i = 0; i < n; ++i) {
        int x, y; cin >> x >> y;
        p[i] = {x, y}; p[n + i] = p[i];
    }

    ll ans = 0;
    int j = k + 1;
    vector<Point> t;
    for (int i = 0; i < k; ++i) t.push_back(p[i]);
    ll s1 = area2(t);
    for (int i = 0; i < n; ++i) {
        if (j < i + k + 1) j = i + k + 1;
        vector<Point> t = {p[i], p[i + k], p[i + k - 1]};
        s1 += area2(t);
        ll s2 = area2({p[i], p[i+k], p[j]});
        while (j < i + n) {
            ll ns = area2({p[i], p[i+k], p[j + 1]});
            if (ns > s2) {
                j++;
                s2 = ns;
            }
            else break;
        }
        ans = max(ans, s1 + s2);
        t = {p[i], p[i + 1], p[i + k]};
        s1 -= area2(t);
    }
    cout << (db)ans * 0.5 << "\n";
}

signed main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout << fixed << setprecision(10);

    int T = 1;
    cin >> T;
    while (T--) solve();
    return 0;
}
```

## 提示

- 坐标是整数，叉积可能很大，使用 `long long` 避免溢出
- 面积是叉积绝对值的一半，输出时 `*0.5`