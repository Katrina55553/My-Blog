---
title: 2025 CCPC 北京市赛 E 题 题解
date: 2026-04-13
tags: [ACM, 题解]
description: CCPC 2025 北京市赛 E 题 解题思路，在直线上找一点最小化到最远点的距离，使用二分答案与圆的交点参数化。
---

## 题目

https://codeforces.com/gym/105851/problem/E  
2025 CCPC 北京市赛 E 题 布置 WAP

## 题目大意

平面上有 `n` 个点和一条直线。在直线上找一个点，使得该点到离它最远的点的距离最小。

## 思路

1. **参数化直线**  
   设直线方程为 `Ax + By + C = 0`。取直线上一点 `t`，方向向量 `u = {B, -A}`。  
   直线上任意一点可表示为 `Q(s) = t + s * u`，其中 `s` 为实数参数。

2. **二分答案**  
   对当前答案 `r`，以每个点为圆心画半径 `r` 的圆。  
   判断直线上是否存在一个点被所有圆覆盖（即直线与所有圆的公共交集非空）。

3. **区间求交**  
   对每个圆，求其与直线的交点，得到参数区间 `[s - dt, s + dt]`。  
   对所有区间求交集，若最终区间非空，则答案 `r` 可行。


## 代码

```c++
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
using ull = unsigned long long;
using db = double;
#define dbg(x) cerr << #x << " = " << (x) << endl;
#define vdbg(a) cout << #a << " = "; for (auto x : a) cout << x << " "; cout << endl;

struct Point { db x, y; };
using Vec = Point;
db eps = 1e-9;

struct Line { Point p; Vec v; };
struct Circle { Point O; db r; };

bool operator<(Point a, Point b) {
    return a.x == b.x ? a.x < b.y : a.x < b.x;
}

Vec operator-(Vec u, Vec v) {
    return {u.x - v.x, u.y - v.y};
}
Vec operator+(Vec u, Vec v) {
    return {u.x + v.x, u.y + v.y};
}
Vec operator*(db k, Vec v) {
    return {k * v.x, k * v.y};
}

db len(Vec u) {
    return sqrt(u.x * u.x + u.y * u.y);
}

db dot(Vec u, Vec v) {
    return u.x * v.x + u.y * v.y;
}

// 点到直线的垂足
Point pedal(Point p, Line l) {
    return l.p - dot((l.p - p), l.v) / dot(l.v, l.v) * l.v;
}

// 直线与圆的交点（参数化形式）
vector<Point> inter(Line l, Circle C) {
    Point p = pedal(C.O, l);
    db h = len(p - C.O);
    if (h - C.r > eps) return {};
    if (fabs(h - C.r) < eps) return {p};
    db d = sqrt(C.r * C.r - h * h);
    Vec u = d / len(l.v) * l.v;
    return {p + u, p - u};
}

void solve() {
    int n; cin >> n;
    vector<Point> p(n);
    for (int i = 0; i < n; ++i) {
        db a, b; cin >> a >> b;
        p[i] = {a, b};
    }
    db A, B, C; cin >> A >> B >> C;
    Vec u = {B, -A};
    Line L; Point t;
    if (A) t = {-C / A, 0};
    else t = {0, -C / B};
    L = {t, u};

    db q = sqrt(A * A + B * B);

    auto check = [&](db r) {
        db st = -1e10, ed = 1e10;
        for (int i = 0; i < n; ++i) {
            db d = fabs(A * p[i].x + B * p[i].y + C) / q;
            if (d > r + eps) return 0;
            db pp = dot(p[i] - t, u) / (q * q);
            db dt = sqrt(r * r - d * d) / q;
            st = max(st, pp - dt), ed = min(ed, pp + dt);
            if (st > ed + eps) return 0;
        }
        return 1;
    };

    db l = 0, r = 1e10, ans;
    while (r - l > eps) {
        db mid = (l + r) * 0.5;
        if (check(mid)) {
            ans = mid;
            r = mid;
        } else l = mid;
    }

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
`