---
title: 2025 码蹄杯国赛 MC0487·宝玉的考验 题解
date: 2026-03-22
tags: [码蹄杯, 题解, 状压DP, Dijkstra]
description: 结合状压 DP 与 Dijkstra 解决带有特殊点访问顺序约束的最短路问题，k ≤ 5 时状态空间可接受。
---

[题目链接 — 码蹄集OJ 宝玉的考验](https://www.matiji.net/exam/brushquestion/87/4693/305EE97B0D5E361DE6A28CD18C929AF0)

## 题意

最短路，但是 k 个特殊点之间有**访问顺序**约束。由于 `k ≤ 5`，考虑状压。

## 解法

### 1. 状态定义

`dis[u][mask]` — 当前在节点 `u`，已经访问过的特殊点集合为 `mask` 时的最短距离。其中 `mask` 是一个二进制数，第 `i` 位表示第 `i` 个特殊点是否已经被访问过。

### 2. 依赖关系处理

- 每个特殊点有一个编号 `pos[x]`（0 ~ k-1）
- `fa[bit]` 存储必须**先于** `bit` 访问的特殊点的编号集合（前置依赖）
- 当要进入一个新的特殊点 `v` 时（即 `bit != -1` 且该点尚未访问），检查它的所有前置依赖点是否都已经在当前的 `mask` 中。若都满足，才能访问，并把该位加入 `nst`

### 代码

```c++
#define int long long
const int INF = 4e18;

void solve() {
    int n, m, k, t; cin >> n >> m >> k >> t;
    vector<vector<pair<int, int>>> g(n + 1);
    for (int i = 0; i < m; ++i) {
        int u, v, w; cin >> u >> v >> w;
        g[u].push_back({w, v});
        g[v].push_back({w, u});
    }

    vector<int> pos(n + 1, -1);
    vector<vector<int>> fa(k);
    if (k > 0) {
        for (int i = 0; i < k; ++i) {
            int x; cin >> x;
            pos[x] = i;
        }
        for (int i = 0; i < t; ++i) {
            int u, v; cin >> u >> v;
            fa[pos[v]].push_back(pos[u]);
        }
    }

    vector<vector<int>> dis(n + 1, vector<int>(1 << k, INF));
    priority_queue<array<int, 3>, vector<array<int, 3>>, greater<array<int, 3>>> pq;
    pq.push({0, 1, 0}); dis[1][0] = 0;

    while (pq.size()) {
        auto [d, u, st] = pq.top(); pq.pop();
        if (d > dis[u][st]) continue;
        for (auto [w, v] : g[u]) {
            int bit = pos[v], nst = st;
            bool f = 1;
            if (bit != -1 && (st & (1 << bit)) == 0) {
                for (int x : fa[bit]) {
                    if ((st & (1 << x)) == 0) {
                        f = 0;
                        break;
                    }
                }
                if (!f) continue;
                nst |= (1 << bit);
            }
            if (d + w < dis[v][nst]) {
                dis[v][nst] = d + w;
                pq.push({d + w, v, nst});
            }
        }
    }

    int ans = INF;
    for (int i = 0; i < (1 << k); ++i) ans = min(ans, dis[n][i]);
    if (ans == INF) cout << "impossible\n";
    else cout << ans << "\n";
}
```

## 复杂度

Dijkstra 在状态图上的节点数为 `O(n · 2^k)`，边数为 `O(m · 2^k)`。`k ≤ 5` 时 `2^k ≤ 32`，完全可接受。
