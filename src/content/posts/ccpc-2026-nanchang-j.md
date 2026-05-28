---
title: 2026 CCPC 南昌 J 题 题解
date: 2026-05-28
tags: [ACM, 题解]
description: 2026 CCPC 南昌站 J 题，通过极角排序 + 滑动窗口求最小扇形面积覆盖至少 k 个点。
---

[Problem - J - Codeforces](https://codeforces.com/gym/106554/problem/J)


## 题目大意

平面上有 $n$ 个食物，位于 $(x_i, y_i)$。蛇从原点出发，选择一个角度区间 $[\alpha, \beta]$ 作为扇形，扇形向外扩展直到吞下该区间内的所有食物。扇形面积即为消耗的能量。求至少吞下 $k$ 个食物所需的最小能量。

## 思路

### 1. 问题转化

扇形面积 = $\frac{1}{2} \theta r^2$，其中 $\theta$ 是扇形角度，$r$ 是扇形半径（即区间内最远食物的距离）。

需要选择角度区间 $[\alpha, \beta]$，使得区间内至少有 $k$ 个食物，且 $\frac{1}{2}(\beta - \alpha) \cdot r_{\max}^2$ 最小。

### 2. 关键观察

- 最优扇形的边界一定会落在某个食物的极角上（可以微调）。
- 同极角上的所有食物，要么全部在扇形内，要么全部不在。因此只需保留每个极角上的最大距离和点数。
- 由于是环形问题，将数组复制一份（极角 $+2\pi$），然后滑动窗口。

### 3. 滑动窗口

设合并后有 $m$ 个不同极角。复制后共 $2m$ 个。

对于每个左端点 $i$，右端点 $j$ 不断扩展，直到窗口内点数 $\ge k$。此时：
- $\theta = \text{angle}(p_i, p_j)$，其中 $p_i, p_j$ 是左右端点极角上距离最大的点的坐标。
- $r^2 = \max\{\text{窗口内各极角的最大距离平方}\}$

维护一个 `multiset` 存储窗口内各极角的最大距离平方，以及一个 `map` 记录每个极角在窗口内的出现次数。只有极角完全离开窗口时才从 `multiset` 中删除。

### 4. 角度计算

用 `atan2(cross, dot)` 直接计算两个向量的逆时针夹角，避免极角做差的精度问题：

```cpp
db angle_ccw(Point a, Point b) {
    db cr = a.x * b.y - a.y * b.x;  // 叉积
    db dt = a.x * b.x + a.y * b.y;  // 点积
    db ang = atan2(cr, dt);
    if (ang < 0) ang += 2 * PI;
    return ang;
}
```

叉积和点积由整数坐标计算，完全精确。只做一次 `atan2`，精度高。

### 5. 时间复杂度

- 排序：$O(n \log n)$
- 滑动窗口：$O(m \log m)$，其中 $m \le n$

总复杂度 $O(n \log n)$。

## 代码

```c++
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
using db = double;

const db PI = acos(-1);
struct Point { db x, y; };
db cross(Point a, Point b) { return a.x * b.y - a.y * b.x; }
db dot(Point a, Point b) { return a.x * b.x + a.y * b.y; }

db angle(Point a, Point b) {
    db cr = cross(a, b);
    db dt = dot(a, b);
    db ang = atan2(cr, dt);
    if (ang < 0) ang += 2 * PI;
    return ang;
}

void solve() {
    int n, k; cin >> n >> k;
    // 合并同极角的点
    struct Info {
        db ang;      // 极角（仅用于排序）
        db max_d2;   // 该极角上的最大距离平方
        int cnt;     // 该极角上的点数
        Point max_p; // 距离最大的点的原始坐标（用于精确计算角度）
    };
    
    map<db, Info> mp;
    for (int i = 0; i < n; ++i) {
        db x, y; cin >> x >> y;
        Point p = {x, y};
        db ang = atan2(y, x);
        db d2 = x * x + y * y;
        if (!mp.count(ang)) {
            mp[ang] = {ang, d2, 1, p};
        } else {
            Info& info = mp[ang];
            info.cnt++;
            if (d2 > info.max_d2) {
                info.max_d2 = d2;
                info.max_p = p;
            }
        }
    }
    
    vector<Info> g;
    for (auto& [_, info] : mp) g.push_back(info);

    for (int i = 0; i < n; ++i) {
        Info info = g[i];
        info.ang += 2 * PI;
        g.push_back(info);
    }
    
    db ans = 1e15;
    multiset<db> mx;
    map<db, int> cnt;
    
    for (int i = 0, j = 0, tot = 0; i < n; ++i) {
        while (j < i + n && tot < k) {
            Info& info = g[j];
            if (cnt[info.ang] == 0) {
                mx.insert(info.max_d2);
            }
            cnt[info.ang]++;
            tot += info.cnt;
            ++j;
        }
        if (tot >= k) {
            Point pi = g[i].max_p;
            Point pj = g[j - 1].max_p;
            
            db dang = angle(pi, pj);
            
            ans = min(ans, 0.5 * dang * (*mx.rbegin()));
        }
        
        Info& info = g[i];
        tot -= info.cnt;
        cnt[info.ang]--;
        if (cnt[info.ang] == 0) {
            mx.erase(mx.find(info.max_d2));
        }
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