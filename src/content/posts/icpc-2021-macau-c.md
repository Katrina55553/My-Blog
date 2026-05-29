---
title: 2021 ICPC 澳门站 C 题 题解
date: 2026-05-29
tags: [ACM, 题解]
description: 2021 ICPC 澳门站 C 题，极角排序 + 双指针求最少移除光源数。
---

[Problem - C - Codeforces](https://codeforces.com/gym/104373/problem/C)


极角排序：将光源按照极角排序后,起点和终点逆时针角度相差不超过 $\pi$ 的点都可以全选 ，用双指针算法可以在 `O(n)`时间内求解

注意:极角排序不能用 `atan2`，要使用叉积写法，不然会被卡精度.


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
Vec operator-(Vec u, Vec v) { return {u.x - v.x, u.y - v.y}; }  
ll cross(Point a, Point b) { return a.x * b.y - a.y * b.x; }
const Point O = {0, 0};

// 极角排序（叉乘）
bool up(Vec a){
    return a.y > 0 || (a.y == 0 && a.x >= 0);
}
void psort(vector<Point>& p, Point c = O)  
{
    sort(p.begin(), p.end(), [&](Point a, Point b){
        Vec u = a - c, v = b - c;
        if (up(u) != up(v)) return up(u) > up(v);
        return cross(u, v) > 0;
    });
}

void solve() {
    int n; cin >> n;
    vector<Point> p(n);
    for (int i = 0; i < n; ++i) {
        ll x, y; cin >> x >> y;
        p[i] = {x, y};
    }
    psort(p);
    for (int i = 0; i < n; ++i) p.push_back(p[i]);
    int j = 0, ans = n;
    for (int i = 0; i < n; ++i) {
        while (j + 1 < n + i && cross(p[i], p[j + 1]) >= 0) j++;
        ans = min(ans, min(j - i + 1, n - j + i - 1));
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
```