---
title: 2026 CCPC 福建 I 题 题解
date: 2026-05-31
tags: [ACM, 题解, CCPC, 动态规划, 字符串, 贪心]
description: 2026 CCPC 福建 I 题，DP 预处理 + 字典序贪心构造最长合法车牌。
---

[Problem - I - Codeforces](https://codeforces.com/gym/106565/problem/I)

## 思路

令 $f_{i,j}$ 表示：考虑原串后缀 $[i, n]$，并且选出的车牌首字母为 $j$ 时，能得到的最长合法长度。

初始有 $f_{n,j} = [t_n = j]$。

从后往前转移时有三类选择：  
- 不选 $t_i$: $f_{i,j} \leftarrow \max(f_{i,j}, f_{i+1,j})$;  
- 在已有串前选 $t_i$: 若不存在规则 $(t_i, j)$，则 $f_{i,t_i} \leftarrow \max(f_{i,t_i}, f_{i+1,j} + 1)$;  
- 把 $t_i$ 单独作为新串: $f_{i,t_i} \leftarrow \max(f_{i,t_i}, 1)$.

若不存在 $j$ 使 $f_{1,j} \geq k$，则无解。  
否则按字典序贪心构造答案。

令 $i$ 为当前答案尾字符在原串中的位置，初始 $i = 0$，并认为 $t_0 = \#$。  
每一步从 $a$ 到 $z$ 枚举下一个字符 $j$。
若满足：  $f_{i+1,j} \geq k - |s|$  且不存在限号规则 $(t_i, j)$，则选择 $j$。  

选中后，把 $i$ 更新为 $j$ 在区间 $(i, n]$ 中第一次出现的位置，继续构造。
由于总是尝试最小字符，得到的就是字典序最小可行车牌。  

时间复杂度 $O((n+k)|\Sigma|)$，其中 $|\Sigma| = 26$。


## 代码

```python
import sys
input = lambda: sys.stdin.readline().rstrip()

def solve():
    n, m, k = map(int, input().split())
    t = ' ' + input().strip()
    
    vis = [[0] * 26 for _ in range(26)]
    for _ in range(m):
        x, y = input().split()
        vis[ord(x) - ord('a')][ord(y) - ord('a')] = 1

    # dp[i][j]: 后缀 t[i..n] 中，以 j 为首字母的最长合法长度
    dp = [[0] * 26 for _ in range(n + 2)]
    dp[n][ord(t[n]) - ord('a')] = 1
    
    for i in range(n - 1, 0, -1):
        c = ord(t[i]) - ord('a')  
        
        for j in range(26):
            dp[i][j] = dp[i + 1][j]
        
        dp[i][c] = max(dp[i][c], 1)
        
        for j in range(26):
            if dp[i + 1][j] > 0 and vis[c][j] == 0:  
                dp[i][c] = max(dp[i][c], dp[i + 1][j] + 1)

    ans = -1
    for j in range(26):
        if dp[1][j] >= k:
            ans = j
            break
    
    if ans == -1:
        print(-1)
        return
    
    # nxt[i][c]: 位置 i 及之后，字符 c 第一次出现的位置
    nxt = [[-1] * 26 for _ in range(n + 2)]
    for i in range(n, 0, -1):
        for j in range(26):
            nxt[i][j] = nxt[i + 1][j]
        nxt[i][ord(t[i]) - ord('a')] = i


    ans = []
    i = 1
    pre = -1
    res = k
    while (res > 0):
        f = 0
        for j in range(26):
            if (pre != -1 and vis[pre][j]):
                continue

            pos = nxt[i][j]
            if (pos == -1):
                continue

            if res == 1:
                if dp[i][j] >= 1:
                    ans.append(chr(j + ord('a')))
                    f = 1
                    res = 0
                    break
            else:
                for nj in range(26):
                    if vis[j][nj] == 0 and dp[pos + 1][nj] >= res - 1:
                        ans.append(chr(j + ord('a')))
                        i = pos + 1
                        pre = j
                        res -= 1
                        f = 1
                        break
                if f:
                    break
        
        if not f:
            print(-1)
            return

    print(''.join(ans))


T = 1
T = int(input())
for _ in range(T):
    solve()

```



