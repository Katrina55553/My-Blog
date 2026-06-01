---
title: 2026 CCPC 福建 G 题 题解
date: 2026-06-01
tags: [ACM, 题解]
description: 2026 CCPC 福建 G 题，打表找规律 + 等差数列求和。
---

[Problem - G - Codeforces](https://codeforces.com/gym/106565/problem/G)

## 思路

打表拿到神秘序列 0 1 1 4 6 11 15 22 后 瞪眼法得出：分奇偶项是公差为 4 的等差数列

## 打表代码

```python
def solve():
   x = 194304
   y = 1000000
   for i in range(10):
      xx = x + i * y
      print(bin(xx)[2:])
   print(len('10000000000000000000000'))

T = 1
# T = int(input())
for _ in range(T):
   solve()
```

```c++
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
using ull = unsigned long long;
using db = double;
#define dbg(x) cerr << #x << " = " << (x) << endl;
#define vdbg(a) cout << #a << " = "; for (auto x : a) cout << x << " "; cout << endl;

void solve() {
    int n; cin >> n;
    ll tot = 1ll << (n * (n - 1) / 2);
    map<vector<vector<int>>, int> cnt;
    for (int msk = 0; msk < tot; ++msk) {
        vector<int> deg(n + 1);
        vector<vector<int>> g(n + 1);
        int idx = 0;
        for (int i = 1; i <= n; ++i) {
            for (int j = i + 1; j <= n; ++j) {
                if (msk >> idx & 1) {
                    deg[i]++, deg[j]++;
                    g[i].push_back(j);
                }
                idx++;
            }
        }
        bool f = 1, odd = 0, even = 0;
        for (int i = 1; i <= n; ++i) {
            if (deg[i] & 1) odd = 1;
            else even = 1;
            if (odd && even) {
                f = 0;
                break;
            }
        }
        if (f) cnt[g]++;
    }
    int tmp = cnt.size(), res = 0;
    while (tmp % 2 == 0) {
        tmp /= 2;
        res++;
    }
    cout << res << "\n";  // 2 的几次幂
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

## AC代码

```c++
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
using ull = unsigned long long;
using db = double;
#define dbg(x) cerr << #x << " = " << (x) << endl;
#define vdbg(a) cout << #a << " = "; for (auto x : a) cout << x << " "; cout << endl;

ll qpow(ll a, ll b, ll m) {
    ll res = 1;
    while (b) {
        if (b & 1) res = res * a % m;
        a = a * a % m;
        b >>= 1;
    }
    return res;
}

void solve() {
    ll n, m; cin >> n >> m;
    if (n & 1) {
        ll x = n / 2;
        ll y = (1 + 1 + 4 * (x - 1)) * x / 2;
        cout << qpow(2, y, m) << "\n";
    }
    else {
        ll x = n / 2 - 1;
        ll y = 1 + (3 + 3 + 4 * (x - 1)) * x / 2;
        cout << qpow(2, y, m) << "\n";
    }
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
