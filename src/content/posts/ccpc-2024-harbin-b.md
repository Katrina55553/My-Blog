---
title: 2024 CCPC 哈尔滨 B 题 题解
date: 2026-04-19
tags: [ACM, 题解]
description: 2024 CCPC 哈尔滨 B 题 解题思路，使用旋转卡壳求凹包，枚举外凸包边并维护内凸包最近点。
---

## 题目

[Concave Hull](https://codeforces.com/gym/105459/problem/B)  
2024 CCPC 哈尔滨 B 题

## 思路

1. **凸包算法**  
   - 使用 Andrew 算法分别求出外凸包 `tu` 和内层点集的凸包 `nei`
   - 标记外凸包上的点，剩余点为内层点

2. **旋转卡壳**  
   - 枚举外凸包的每条边 `(tu[i], tu[ni])`
   - 在内凸包上移动指针 `j`，找到距离当前边最近的点  
   - 维护最小距离 `mi`
   - 若不存在内层点，输出 `-1`

## 代码

```c++
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
using ull = unsigned long long;
using db = double;
#define dbg(x) cerr << #x << " = " << (x) << endl;
#define vdbg(a) cout << #a << " = "; for (auto x : a) cout << x << " "; cout << endl;

struct Point { ll x, y; };
using Vec = Point;

Vec operator-(Vec u, Vec v) {
    return {u.x - v.x, u.y - v.y};
}

bool operator==(Vec u, Vec v) {
    return u.x == v.x && u.y == v.y;
}
bool operator<(Vec u, Vec v) {
    return u.x == v.x ? u.y < v.y : u.x < v.x;
}

ll cross(Vec u, Vec v) {
    return u.x * v.y - u.y * v.x;
}

ll area2(vector<Point> &p) {
    int n = p.size();
    if (n < 3) return 0;
    ll ans = 0;
    for (int i = 0; i < n; ++i) {
        int j = (i + 1) % n;
        ans += cross(p[i], p[j]);
    }
    return abs(ans);
}

// Andrew 算法求凸包
vector<Point> Andrew(vector<Point> p) {
    sort(p.begin(), p.end(), [&](Point a, Point b) {
        return a.x == b.x ? a.y < b.y : a.x < b.x;
    });
    p.erase(unique(p.begin(), p.end()), p.end());

    int n = p.size();
    vector<Point> hi, lo;
    for (int i = 0; i < n; ++i) {
        while (hi.size() > 1 &&
               cross(hi.back() - hi[hi.size() - 2], p[i] - hi.back()) >= 0) {
            hi.pop_back();
        }
        while (lo.size() > 1 &&
               cross(lo.back() - lo[lo.size() - 2], p[i] - lo.back()) <= 0) {
            lo.pop_back();
        }
        hi.push_back(p[i]);
        lo.push_back(p[i]);
    }
    vector<Point> hull;
    for (int i = 0; i < lo.size(); ++i) hull.push_back(lo[i]);
    for (int i = hi.size() - 2; i > 0; --i) hull.push_back(hi[i]);
    return hull;
}

ll cal(Point a, Point b, Point c) {
    return abs(cross(b - a, c - a));
}

void solve() {
    int n; cin >> n;
    vector<Point> p(n);
    map<Point, int> mp;
    for (int i = 0; i < n; ++i) {
        ll x, y; cin >> x >> y;
        p[i] = {x, y};
        mp[p[i]] = i;
    }

    vector<bool> vis(n + 1);
    vector<Point> tu = Andrew(p);           // 外凸包
    for (auto t : tu) vis[mp[t]] = 1;

    vector<Point> t;
    for (int i = 0; i < n; ++i) {
        if (vis[i]) continue;
        t.push_back(p[i]);
    }

    vector<Point> nei = Andrew(t);          // 内层凸包
    int j = 0, m1 = tu.size(), m2 = nei.size();
    if (!m2) {
        cout << "-1\n";
        return;
    }
    ll mi = 4e18;
    for (int i = 0; i < m1; ++i) {
        int ni = (i + 1) % m1;
        while (cal(tu[i], tu[ni], nei[(j + 1) % m2]) < cal(tu[i], tu[ni], nei[j])) {
            int j1 = j;
            j = (j + 1) % m2;
        }
        mi = min(mi, cal(tu[i], tu[ni], nei[j]));
    }
    ll ans = area2(tu) - mi;
    cout << ans << "\n";
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