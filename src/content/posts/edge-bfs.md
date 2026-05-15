---
title: '"边" BFS'
date: 2026-03-20
tags: [ACM, 题解, BFS, 最短路]
description: 当限制条件涉及连续三个点的三元组时，把"边"作为状态进行 BFS，记录路径回溯输出完整方案。
---



[P1811 最短路 - 洛谷](https://www.luogu.com.cn/problem/P1811)
[Problem - E - Codeforces](https://codeforces.com/contest/59/problem/E)
(双倍经验)

不同于常规BFS，这道题的限制条件涉及"连续三个点"。
因此当前的决策不仅取决于"现在在哪里"，还取决于"上一步是从哪里来的"。

- 定义状态 `(u, v)`：表示**当前位于点 `v`，且上一步是从点 `u` 走过来的**。
- 从 `v` 走向 `w` 时，就可以检查三元组 `(u, v, w)` 是否在禁止列表中。
- 记录 path 路径，回溯

这道题的难点在于意识到**普通的点最短路不够用，必须把"边"或者"点对"作为状态**。
一旦建立了 `(u, v)` 的状态模型，剩下的就是标准的 BFS 实现，处理禁忌条件即可。


```c++
void solve() {  
    int n, m, k;
    cin >> n >> m >> k;
    vector<vector<int>> g(n + 1);
    for (int i = 0; i < m; ++i) {
        int x, y; cin >> x >> y;
        g[x].push_back(y);
        g[y].push_back(x);
    }
    map<array<int, 3>, int> nok;
    for (int i = 0; i < k; ++i) {
        int u, v, w; cin >> u >> v >> w;
        nok[{u, v, w}] = 1;
    }
    vector<vector<int>> fa(n + 1, vector<int>(n + 1));
    queue<pair<int, int>> q; q.push({1, 1}); 
    bool f = 0; pair<int, int> t;
    while (q.size()) {
        auto [u, v] = q.front(); q.pop();
        if (v == n) {
            t = {u, v};
            f = 1;
            break;
        }
        for (int w : g[v]) {
            if (nok.count({u, v, w}) || fa[v][w]) continue;
            fa[v][w] = u;
            q.push({v, w});
        }
    }
    if (!f) cout << "-1\n";
    else {
        vector<int> path;
        while (t.second != 1) {
            path.push_back(t.second);
            t = {fa[t.first][t.second], t.first};
        }
        path.push_back(1);
        int ans = path.size() - 1;
        cout << ans << "\n";
        for (int i = ans; i >= 0; --i) cout << path[i] << " \n"[i == 0];
    }
}  
```
