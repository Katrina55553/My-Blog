---
title: 数据库进阶概念
date: 2026-01-10
tags: [数据库, SQL]
description: 数据库进阶内容，涵盖事务 ACID、并发控制、索引、视图、触发器、存储过程与数据库恢复。
---

# 数据库进阶概念

## 事务（Transaction）

事务是一系列的数据库操作，是数据库应用程序的逻辑单位。

### 事务的特性（ACID）

1. **原子性（Atomicity）** — 事务的所有操作在数据库要么都做要么都不做
2. **一致性（Consistency）** — 事务执行的结果必须是使数据库从一个一致性状态变到另一个一致性状态
3. **隔离性（Isolation）** — 一个事务的执行不能被其他事务干扰，并发执行的各个事务之间不能互相干扰
4. **持久性（Durability）** — 一个事务一旦提交，它对数据库中数据的改变就应该是永久性的

### 事务控制语句

- `begin transaction` — 事务开始
- `commit` — 事务提交，永久保存更改
- `rollback` — 事务回滚，撤销更改

## 并发控制

### 并发操作的问题

1. **丢失修改** — 两个事务对同一个数据修改，会发生覆盖
2. **不可重复读** — 两次读取的间隙数据被另一事务修改，对同一数据进行两次读取的结果会不同
3. **读脏数据** — 事务读取的数据是其他事务修改后的值，但此修改后来又撤销了

### 封锁机制

- **排它锁（X 锁）** — 写锁，事务修改数据时加锁，其他事务不能读取或修改
- **共享锁（S 锁）** — 读锁，事务读取数据时加锁，其他事务可加 S 锁读取，但不能加 X 锁修改

### 封锁协议

| 协议 | 解决的问题 | 加锁规则 |
|------|------------|----------|
| 一级封锁协议 | 丢失修改 | 修改前加 X 锁，事务结束释放 |
| 二级封锁协议 | 丢失修改 + 读脏数据 | 一级 + 读取前加 S 锁，读后立即释放 |
| 三级封锁协议 | 丢失修改 + 读脏数据 + 不可重复读 | 一级 + 读取前加 S 锁，事务结束释放 |

### 两段锁协议（2PL）

- **扩展阶段** — 事务可以申请任何锁，但不能释放锁
- **收缩阶段** — 事务可以释放锁，但不能申请新锁

遵循两段锁协议的调度是可串行化的。

## 索引（Index）

### 优点

加快数据查询速度，降低数据库IO成本

### 缺点

索引会占用存储空间
降低了insert、update、delete的效率

### 创建索引

```sql
create [unique][cluster] index 索引名 on 表名（列名 次序）;
/*
次序: asc（升序，默认）, desc（降序）
unique: 唯一索引，每个索引值只对应唯一的数据记录
cluster: 聚簇索引，数据行按索引顺序存储
*/
```

### 删除索引

```sql
drop index 索引名;
```

## 视图（View）

视图是由一个或多个基表（或其他视图）导出的虚拟表，其内容由查询定义。

### 优点

1. 简化复杂查询
2. 提高安全性（权限控制）
3. 保持逻辑数据独立性

### 创建视图

```sql
create view 视图名 [(列名1, 列名2, ...)] as 子查询 [with check option];
/*
with check option: 通过视图修改（插入/更新）数据时，会检查修改后的数据是否仍然符合视图定义的条件。如果不符合，就拒绝修改。
*/
```

## 触发器（Trigger）

触发器是在数据库表上定义的一种特殊存储过程，当特定事件（insert/update/delete）发生时自动执行。

### 创建触发器

```sql
create trigger 触发器名称 
before|after 
delete|insert|update 
on 表名 
for each row|for each statement
when 触发条件 
begin 
    <触发动作>
end;

/*
before/after：执行触发语句之前还是之后激发触发器
for each row：行级触发器，对每一行执行一次
for each statement：语句级触发器，对整个事件只执行一次（默认）
*/
```

## 存储过程（Stored Procedure）

存储过程是预编译的 SQL 语句集合，可以接受参数并返回结果。

### 创建存储过程

```sql
create procedure 存储过程名 (参数列表)
begin
    -- SQL 语句
end;
```

### 调用存储过程

```sql
call 存储过程名(参数);
```

## 数据库恢复

### 故障类型

1. **事务故障** — 程序执行错误引起事务异常终止
2. **系统故障** — 硬件故障、软件漏洞导致内存信息丢失
3. **介质故障** — 磁盘损坏等存储介质故障

### 恢复技术

- **日志文件** — 记录事务的开始、结束和对数据库的增删改操作
- **数据转储** — 定期备份数据库
- **数据库镜像** — 避免磁盘介质故障

### 恢复操作

- **UNDO（撤销）** — 将未完成的事务撤销，恢复到事务执行前的状态
- **REDO（重做）** — 将已提交的事务重新执行

## 示例总结

```sql
-- 创建索引
create unique index idx_student_id on students(id);

-- 创建视图
create view v_active_students as
select id, name from students where status = 'active' with check option;

-- 创建触发器
create trigger trg_before_insert
before insert on students
for each row
begin
    set new.created_at = now();
end;

-- 创建存储过程
delimiter //
create procedure sp_get_student(in sid int)
begin
    select * from students where id = sid;
end//
delimiter ;

-- 调用存储过程
call sp_get_student(1);
```

## 参考

- 以上内容适用于 MySQL、PostgreSQL、SQL Server 等主流关系型数据库，部分语法细节可能有差异。