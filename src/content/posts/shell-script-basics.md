---
title: Shell 脚本基础
date: 2026-05-16
tags: [Linux, Shell]
description: Shell 脚本入门，涵盖变量、参数、条件判断、循环、算术运算、输入输出及综合实例。
---

# Shell 脚本基础

## Hello World

```bash
#!/bin/bash

echo "Hello World !"
```

## 变量与算术运算

```bash
#!/bin/bash

a=10
b=20
SUM=$((a + b))
echo -e "$a + $b: $SUM\n"
```

## 命令行参数

```bash
#!/bin/bash

echo "File Name: $0"
echo "First Parameter : $1"
echo "Second Parameter : $2"
echo "All parameters \$@: $@"
echo "All parameters \$*: $*"
echo "Total: $#"
```

## 条件判断

### 整数比较

```bash
#!/bin/bash

a=10
b=10
if [ $a -eq $b ]; then
   echo -e "$a -eq $b : true \n"
else
   echo -e "$a -eq $b: false \n"
fi
```

### 逻辑运算符

```bash
#!/bin/bash

if [ $a -lt 100 -o $b -gt 100 ]; then
    echo "或运算 true"
fi

if [[ $a -lt 100 && $b -gt 100 ]]; then
    echo "与运算 true"
fi
```

### 字符串比较

```bash
#!/bin/bash

A="hello"
B="world"
if [ $A = $B ]; then
    echo "equal"
else
    echo "not equal"
fi
```

### 文件测试

```bash
#!/bin/bash

file="/linux"
if [ -e $file ]; then
    echo "exist"
else
    echo "not exist"
fi
```

## 循环

### for 循环

```bash
#!/bin/bash

for loop in 1 2 3 4 5; do
    echo "The value is: $loop"
done
```

### while 循环

```bash
#!/bin/bash

i=1
sum=0
while ((i <= 100)); do
    ((sum += i))
    ((i++))
done
echo "The sum is: $sum"
```

### until 循环

```bash
#!/bin/bash

i=1
sum=0
until ((i > 100)); do
    ((sum += i))
    ((i++))
done
echo "The sum is: $sum"
```

## 用户输入与正则校验

```bash
#!/bin/bash

PRICE=$((RANDOM % 100 + 1))
COUNT=0

while true; do
    read -p "请输入价格：" GUESS

    if ! [[ "$GUESS" =~ ^[0-9]+$ ]]; then
        echo "错误：请输入一个有效的数字！"
        continue
    fi

    COUNT=$((COUNT + 1))

    if [ $GUESS -eq $PRICE ]; then
        echo "恭喜！猜对了！"
        echo "您总共猜了 $COUNT 次"
        exit 0
    elif [ $GUESS -gt $PRICE ]; then
        echo "猜高了！低一点试试"
    else
        echo "猜低了！高一点试试"
    fi
done
```

## 常用符号速查

| 符号 | 含义 |
|------|------|
| `$0` | 脚本名称 |
| `$1`, `$2` | 第 1、2 个参数 |
| `$@` | 所有参数（独立） |
| `$*` | 所有参数（合并） |
| `$#` | 参数个数 |
| `$((...))` | 算术运算 |
| `[[ ... ]]` | 扩展条件测试（支持 &&/&#124;&#124;） |
| `[ ... ]` | POSIX 条件测试 |
| `=`, `!=` | 字符串比较 |
| `-eq`, `-ne`, `-lt`, `-gt` | 整数比较 |
| `-e file` | 文件是否存在 |

## 运行方式

```bash
chmod +x script.sh
./script.sh arg1 arg2
```
