---
title: 蓝桥杯 2023 省 Java A 组 太阳 题解
date: 2023-04-24
tags:
  - 蓝桥杯
  - 题解
description: 通过投影变换将线段遮挡问题转化为一维区间覆盖问题，利用 set 维护可见区间，复杂度 O(n log n)。
---

[P13883 [蓝桥杯 2023 省 Java A] 太阳 - 洛谷](https://www.luogu.com.cn/problem/P13883)

## 问题分析

关键在于理解遮挡关系：

- 太阳位置在 (X, Y)，Y 很大$（10^6 < Y ≤ 10^7）$
- 线段在较低的位置$（0 < y_i ≤ 10^5）$
- 线段之间不会有重合或部分重合
- 判断一条线段是否被照亮，就是看从太阳出发到该线段的光线是否被其他线段遮挡

## 解题思路

1. **按 y 坐标排序**：从上往下处理线段（y 大的先处理），因为上面的线段会遮挡下面的线段

2. **投影到 x 轴**：对于每条线段，计算从太阳出发经过线段两端的光线与 x 轴的交点，得到一个区间 [l, r]

3. **区间合并**：使用 set 维护当前可见区间的并集。对于每条线段：
   - 检查其投影区间是否与当前可见区间有交集
   - 如果有交集，说明该线段至少有一部分能被照亮
   - 将该线段的投影区间合并到可见区间中


## 代码解释

```cpp
#include <bits/stdc++.h>
using namespace std;
using db = long double;

struct Point { db x, y; };
using Vec = Point;
struct Line { Point p; Vec v; };

// 计算直线与x轴的交点x坐标
db at(Line l) { 
    return l.p.x - l.p.y * l.v.x / l.v.y; 
}

void solve() {  
    int n; db X, Y; 
    cin >> n >> X >> Y;
    Point o = {X, Y};  // 太阳位置

    vector<pair<Point, Point>> g(n);
    for (int i = 0; i < n; ++i) {
        int x, y, len; 
        cin >> x >> y >> len;
        Point a = {x, y}, b = {x + len, y};
        g[i] = {a, b};
    }
    
    // 按y坐标从大到小排序（从上往下处理）
    sort(g.begin(), g.end(), [](auto &a, auto &b) {
        return a.first.y > b.first.y;
    });

    set<pair<db, db>> s;  // 存储可见区间
    int ans = 0;

    // 检查区间[l, r]是否与当前可见区间有交集
    auto check = [&](db l, db r) -> bool {
        auto it = s.lower_bound({l, l});
        if (it != s.begin()) {
            --it;
            if (it->second < l) ++it;
        }
        db ed = l;
        while (it != s.end() && it->first <= r) {
            if (it->first > ed + eps) return false;
            ed = max(ed, it->second);
            if (ed >= r) return true;
            ++it;
        }
        return ed >= r;
    };

    for (int i = 0; i < n; ++i) {
        auto [a, b] = g[i];
        // 计算从太阳到线段两端的光线与x轴的交点
        Line l1 = {o, a - o}, l2 = {o, b - o};
        db l = at(l1), r = at(l2);

        // 检查当前线段是否有可见部分
        if (check(l, r)) ans++;

        // 将当前线段的投影区间合并到可见区间
        auto it = s.lower_bound({l, l});
        if (it != s.begin()) {
            --it;
            if (it->second < l) ++it;
        }
        while (it != s.end() && it->first <= r) {
            l = min(l, it->first);
            r = max(r, it->second);
            it = s.erase(it);
        }
        s.insert({l, r});
    }
    
    cout << n - ans << "\n";  // 输出被遮挡的线段数
}
```

## 核心要点

1. **投影变换**：将 3D 的遮挡问题转化为 1D 的区间覆盖问题
2. **从上往下处理**：确保处理每条线段时，所有可能遮挡它的线段都已经被考虑
3. **区间合并**：使用 set 维护可见区间，高效地进行区间查询和合并
4. **精度处理**：使用 long double 和 eps 处理浮点数精度问题

**时间复杂度**：O(n log n)，**空间复杂度**：O(n)
