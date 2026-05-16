---
title: 蓝桥杯 2026 省 Python B 组 蓝小圈 题解 —— 并查集 启发式合并
date: 2026-04-12
tags: [蓝桥杯, 题解]
description: 通过启发式合并（小集合合并到大集合）优化并查集的合并操作，维护集合内元素的额外信息。
---

[P16265 [蓝桥杯 2026 省 Python B 组] 蓝小圈 - 洛谷](https://www.luogu.com.cn/problem/P16265)


```c++
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
using ull = unsigned long long;
using db = double;
#define dbg(x) cerr << #x << " = " << (x) << endl;
#define vdbg(a) cout << #a << " = "; for (auto x : a) cout << x << " "; cout << endl;

#define int long long
const int N = 2e5;
vector<int> w(N + 1), a(N + 1);

struct DSU {
    vector<int> fa;
    vector<vector<int>> g;
    DSU (int n) {
        fa.resize(n);
        g.resize(n);
        for (int i = 0; i < n; ++i) {
            fa[i] = i;
            g[i].push_back(i);
        }
    }

    int find (int x) {
        if (fa[x] != x) fa[x] = find(fa[x]);
        return fa[x];
    }

    void unite(int x, int y) {
        int rx = find(x), ry = find(y);
        if (rx == ry) return;

        if (g[rx].size() > g[ry].size()) swap(rx, ry);
        for (int u : g[rx]) {
            a[u] += w[rx] - w[ry];
            g[ry].push_back(u);
        }
        w[rx] = 0;
        g[rx].clear();
        fa[rx] = ry;
    }

};

void solve() {
    int n, q; cin >> n >> q;
    DSU t(n + 1);
    while (q--) {
        int op, x, y;
        cin >> op >> x;
        if (op == 1) {
            cin >> y;
            t.unite(x, y);
        }
        else if (op == 2) {
            cin >> y;
            a[x] += y;
        }
        else if (op == 3) {
            cin >> y;
            w[t.find(x)] += y;
        }
        else {
            cout << a[x] + w[t.find(x)] << "\n";
        }
    }
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
