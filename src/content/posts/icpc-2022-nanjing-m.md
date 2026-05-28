---
title: 2022 ICPC 南京站 M 题 题解
date: 2026-05-28
tags: [ACM, 题解]
description: 求多边形中所有局部最低点的数量，分为水平面和非水平面两种情况，使用向量叉积和坐标判断，复杂度 O(n)。
---

[Problem - M - Codeforces](https://codeforces.com/gym/104128/problem/M)

## 题解

每个局部最低点都要安装一个出水阀门，因此本题求的就是局部最低点的数量。

局部最低点可以按是否位于水平平面上分成两种情况。

 第一种情况：局部最低点 $P$ 不在水平平面上

- 以 $P$ 为终点的向量 $\vec{v}_1$ 的 $y$ 值应该小于 $0$，而以 $P$ 为起点的向量 $\vec{v}_2$ 的 $y$ 值应该大于 $0$。
- 为了防止“天花板”上的点被错误统计，由于多边形的顶点是按逆时针顺序给出的，因此还要额外判断：
  $$
  \vec{v}_1 \times \vec{v}_2 > 0
  $$
  这里 $\times$ 是向量的叉积。

第二种情况：局部最低点 $P$ 在水平平面上

我们不妨以平面上的第一个点 $P$ 为代表。这里的“第一个点”指的是以 $P$ 为终点的向量不是水平的。

- 以 $P$ 为终点的向量 $\vec{v}_1$ 的 $y$ 值应该小于 $0$，而从 $P$ 开始下一条不是水平的向量 $\vec{v}_2$ 的 $y$ 值应该大于 $0$。
- 为了防止“天花板”上的点被错误统计，由于多边形的顶点是按逆时针顺序给出的，因此还要额外判断 $P$ 的下一个点 $Q$：
  $$
  Q_x > P_x
  $$枚举每个点并进行判断即可。复杂度 $O(n)$。


## 代码


```c++
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
using db = double;
#define dbg(x) cerr << #x << " = " << (x) << endl;
#define vdbg(a) cout << #a << " = "; for (auto x : a) cout << x << " "; cout << endl;


struct Point {
    ll x, y;
};
ll cross(Point a, Point b) {
    return a.x * b.y - b.x * a.y;
}
Point operator-(Point a, Point b) {
    return {a.x - b.x, a.y - b.y};
}

void solve() {
    int n; cin >> n;
    vector<Point> p(n);
    for (int i = 0; i < n; ++i) {
        int x, y; cin >> x >> y;
        p[i] = {x, y};
    }
    int ans = 0;
    int j = 1;
    for (int i = 0; i < n; ++i) {
        while (p[i].y == p[j].y) j = (j + 1) % n;
        int l = (i - 1 + n) % n;
        if (p[l].y > p[i].y && p[i].y < p[j].y) {
            int ni = (i + 1) % n;
            if (p[i].y == p[ni].y) {
                if (p[ni].x > p[i].x) ans++;
            }
            else {
                if (cross(p[i] - p[l], p[ni] - p[i]) > 0) ans++;
            }
        }
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