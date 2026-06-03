---
title: 2026 CCPC 南昌 I 题 题解
date: 2026-06-03
tags: [ACM, 题解]
description: 2026 CCPC 南昌 I 题，贪心处理限制区间 + 构造填色方案。
---

[Problem - I - Codeforces](https://codeforces.com/gym/106554/problem/I)

## 思路


把所有**互不相交的限制区间**当成若干个独立“块”，每个块里只要用到不超过两种颜色即可。因为块之间互不影响，所以我们只需要决定每个块里消耗多少 `R/G/B`，最后再把剩下的颜色填到空隙里。

关键做法是：

1. **按区间长度从大到小处理**。
2. 处理一个长度为 `L` 的区间时，看看当前剩余最多的两种颜色 `x,y`：
    - 如果 `x + y < L`，一定无解；
    - 否则，这个区间只用这两种颜色填。
3. 为了给后面更短的区间留余地，**先尽量消耗较少的那种颜色**，再用较多的那种颜色补齐。
4. 所有限制区间处理完后，剩下的就是普通空位，随便用剩余颜色填满就行。


## 代码


```c++
#include <bits/stdc++.h>
using namespace std;

struct Seg {
    int l, r, id;
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int T;
    cin >> T;

    while (T--) {
        int n, m, r, g, b;
        cin >> n >> m >> r >> g >> b;

        vector<Seg> seg(m);
        for (int i = 0; i < m; i++) {
            cin >> seg[i].l >> seg[i].r;
            seg[i].id = i;
        }

        vector<int> cnt = {r, g, b};
        vector<string> part(m);

        vector<int> ord(m);
        iota(ord.begin(), ord.end(), 0);

        sort(ord.begin(), ord.end(), [&](int a, int b) {
            return seg[a].r - seg[a].l > seg[b].r - seg[b].l;
        });

        bool ok = true;

        for (int id : ord) {
            int len = seg[id].r - seg[id].l + 1;

            vector<pair<int,int>> v;
            for (int i = 0; i < 3; i++)
                v.push_back({cnt[i], i});

            sort(v.begin(), v.end());

            if (v[1].first + v[2].first < len) {
                ok = false;
                break;
            }

            int t = min(v[1].first, len);

            string s;

            s += string(t, "RGB"[v[1].second]);
            s += string(len - t, "RGB"[v[2].second]);

            cnt[v[1].second] -= t;
            cnt[v[2].second] -= (len - t);

            part[id] = s;
        }

        if (!ok) {
            cout << -1 << '\n';
            continue;
        }

        string ans(n, '?');

        int p = 0;

        sort(seg.begin(), seg.end(), [](auto a, auto b) {
            return a.l < b.l;
        });

        for (auto [l, r, id] : seg) {

            while (p < l - 1) {
                if (cnt[0]) ans[p] = 'R', cnt[0]--;
                else if (cnt[1]) ans[p] = 'G', cnt[1]--;
                else ans[p] = 'B', cnt[2]--;
                p++;
            }

            for (char c : part[id])
                ans[p++] = c;
        }

        while (p < n) {
            if (cnt[0]) ans[p] = 'R', cnt[0]--;
            else if (cnt[1]) ans[p] = 'G', cnt[1]--;
            else ans[p] = 'B', cnt[2]--;
            p++;
        }

        cout << ans << '\n';
    }
}
```