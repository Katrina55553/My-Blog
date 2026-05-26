---
title: 2024 ICPC 昆明 M 题 题解
date: 2026-03-07
tags: [ACM, 题解]
description: 凸包包含一个圆，选择凸包的两个顶点切一刀，使得不经过圆且不包含圆的那部分面积尽可能大。使用旋转卡壳，枚举切割线端点并维护最远点，复杂度 O(n)。
---

## 简要题意

凸包包含一个圆，选择凸包的两个顶点切一刀，使得不经过 圆且不包含圆的那部分面积尽可能大。 


## 题解

枚举切割线的一个端点A，另一个端点离它越远越好。
因此使用旋转卡壳，在枚举A的同时维护逆时针最远的B，使得AB位于圆心固定的一侧，且圆心到AB 的距离大于等于半径。
顺时针最远的C同理。
复杂度O(n)。

## 参考代码

```c++
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
using ull = unsigned long long;
using db = double;
#define dbg(x) cerr << #x << " = " << (x) << endl;
#define vdbg(a) cout << #a << " = "; for (auto x : a) cout << x << " "; cout << endl;

#define int long long
struct Point {ll x, y; };
using Vec = Point;
struct Circle { Point O; ll r; };
struct Seg { Point A, B; };
Vec operator-(const Vec &u, const Vec &v) {
    return {u.x - v.x, u.y - v.y};
}
ll cross(const Vec &u, const Vec &v) {
    return u.x * v.y - u.y * v.x; 
}
ll len2(const Vec &v) {
    return v.x * v.x + v.y * v.y;
}
ll area2(const vector<Point> &p) {
    int n = p.size();
    ll ans = 0;
    for (int i = 0; i < n; ++i) {
        int j = (i + 1) % n;
        ans += cross(p[i], p[j]);
    }
    return abs(ans); 
}
void solve() {  
    int n; cin >> n;
    ll x, y, r; cin >> x >> y >> r;
    Point o = {x, y};
    Circle O = {o, r};
    vector<Point> g(n);
    for (int i = 0; i < n; ++i) {
        ll x, y; cin >> x >> y;
        g[i] = {x, y};
        g.push_back(g[i]);
    }

    ll ans = 0;
    // int j = 1;
    int j = 1;
    ll s = 0;
    for (int i = 0; i < n; ++i) {
        while (1) {
            int nxt = j + 1;
            ll cro = cross(g[nxt] - g[i],o -  g[i]);
            if ((__int128_t)cro * cro < (__int128_t)r * r * len2(g[i] - g[nxt]) || cro <= 0) break;
            cro = cross(g[j] - g[i], g[nxt] - g[i]);
            s += abs(cro);
            j = nxt;

        }
        ans = max(ans, s);
        ll cro = cross(g[j] - g[i], g[i + 1] - g[i]);
        s -= abs(cro);
    }
    cout << ans << "\n";
}

signed main() {  
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout << fixed << setprecision(12);
  
    int T = 1;
    cin >> T;  
    while (T--) solve();    
    return 0;
}  
```