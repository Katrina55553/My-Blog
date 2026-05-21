---
title: SQL 基础
date: 2026-01-09
tags: [数据库, SQL]
description: SQL（Structured Query Language）结构化查询语言，涵盖 DDL、DML、DQL、DCL 基础语法与示例。
---

# SQL 基础

SQL（Structured Query Language）结构化查询语言

关系型数据库的标准操作语言

## SQL 特点

1. **综合统一** — 集数据定义语言（DDL）、数据操控语言（DML）、数据控制语言（DCL）功能于一体
2. **高度非过程化**
3. **面向集合的操作方式**
4. **以同一种语法结构提供多种使用方式**
5. **语言简洁、易学易用**

## 数据定义语言 DDL（Data Definition Language）

### 创建库/表

```sql
create database 数据库名;

create table 表名 (
    列名 数据类型 [约束],
    ...
);
/*
约束条件：
    not null     取值非空
    default      指定默认值
    unique       取值不能重复
    not null unique
    check        限制取值范围
    primary key  指定主键
    foreign key  指定外键
*/
```

### 修改表结构

```sql
alter table 表名 add 新列名 数据类型 [约束] / drop 列名 / modify 列名 新数据类型 [约束];
```

### 删除库/表

```sql
drop database 数据库名;
drop table 表名;
```

## 数据操作语言 DML（Data Manipulation Language）

### 插入数据

```sql
insert into 表名 [(列名1, 列名2, ...)] values (值1, 值2, ...);
```

### 更新数据

```sql
update 表名 set 列名1 = 值1 [, 列名2 = 值2] where 条件;
```

### 删除数据

```sql
delete from 表名 where 条件;
```

## 数据查询语言 DQL（Data Query Language）

### 基本查询

```sql
select [all | distinct] 列名1, 列名2, ...
from 表名
[where 条件]
[group by 列名 [having 条件]]
[order by 列名 [asc | desc]];
```

### 常用运算符

- `=`、`<>`、`!=`、`<`、`<=`、`>`、`>=`
- `between ... and ...`
- `in(...)`
- `like 'pattern'`（`%` 任意字符，`_` 单个字符）
- `is null` / `is not null`

### 聚合函数

```sql
count(*)        -- 统计行数
sum(列名)       -- 求和
avg(列名)       -- 平均值
max(列名)       -- 最大值
min(列名)       -- 最小值
```

### 分组与筛选

```sql
select 列名, count(*) as cnt
from 表名
group by 列名
having count(*) > 1;
```

### 排序

```sql
select * from 表名 order by 列名 asc;  -- 升序（默认）
select * from 表名 order by 列名 desc; -- 降序
```

## 数据控制语言 DCL（Data Control Language）

### 授权

```sql
grant 权限1, 权限2 on 表名 to 用户名;
```

### 回收权限

```sql
revoke 权限1, 权限2 on 表名 from 用户名;
```

## 常用数据类型

| 类型 | 说明 |
|------|------|
| `int` | 整型 |
| `varchar(n)` | 可变长度字符串，最大 n 字符 |
| `char(n)` | 固定长度字符串，n 字符 |
| `date` | 日期 |
| `datetime` | 日期时间 |
| `decimal(p, s)` | 精确小数，p 位精度，s 位小数 |

## 示例

```sql
-- 创建表
create table students (
    id int primary key,
    name varchar(50) not null,
    age int,
    gender char(1) check(gender in ('M', 'F'))
);

-- 插入数据
insert into students values (1, 'Alice', 20, 'F');

-- 查询
select name, age from students where gender = 'F' order by age desc;

-- 更新
update students set age = 21 where name = 'Alice';

-- 删除
delete from students where id = 1;
```

## 参考

- MySQL、PostgreSQL、SQL Server、SQLite 均支持标准 SQL 语法，部分方言略有差异