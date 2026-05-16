---
title: MyBatis-Plus 快速上手
date: 2026-02-10
tags: [后端, SpringBoot, MyBatis, ORM]
description: 介绍 ORM 概念、MyBatis-Plus 的依赖配置和 CRUD 基本用法，对比传统 MyBatis 与 MyBatis-Plus 的代码差异。
---

## ORM 介绍

ORM（Object Relational Mapping，对象关系映射）是为了解决面向对象与关系数据库之间互不匹配现象的一种技术。

ORM 通过描述对象和数据库之间映射的元数据，将程序中的对象自动持久化到关系数据库中。
ORM 框架的本质是简化编程中操作数据库的编码。

![ORM](/images/orm.png)

## MyBatis-Plus 介绍

MyBatis 是一款优秀的数据持久层 ORM 框架，能够灵活地实现动态 SQL，可以使用 XML 或注解来配置和映射原生信息，轻松地将 Java 的 POJO 与数据库中的表和字段进行映射关联。

MyBatis-Plus 是 MyBatis 的增强工具，在 MyBatis 的基础上进一步简化了开发。

## 添加依赖

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.4.2</version>
</dependency>

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>5.1.47</version>
</dependency>

<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.1.20</version>
</dependency>
```

## 全局配置

```properties
# 数据库连接配置
spring.datasource.type=com.alibaba.druid.pool.DruidDataSource
spring.datasource.driver-class-name=com.mysql.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/your_database?useSSL=false
spring.datasource.username=root
spring.datasource.password=root

# MyBatis Plus 日志配置
mybatis-plus.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl
```

添加 `@MapperScan` 注解扫描 Mapper 接口。

## MyBatis CRUD 注解

![MyBatis CRUD 注解](/images/mybatis-crud-.png)

```java
@Mapper
public interface UserMapper {
    @Insert("insert into user values(#{id},#{username},#{password},#{birthday})")
    int add(User user);

    @Update("update user set username=#{username},password=#{password},birthday=#{birthday} where id=#{id}")
    int update(User user);

    @Delete("delete from user where id=#{id}")
    int delete(int id);

    @Select("select * from user where id=#{id}")
    User findById(int id);

    @Select("select * from user")
    List<User> getAll();
}
```

## MyBatis-Plus 简化版

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 无需编写任何方法，BaseMapper 已提供基本的 CRUD 方法
}
```

继承 `BaseMapper<User>` 即可获得所有基础 CRUD 能力，代码量大幅减少。

## MyBatis-Plus 注解

- **`@TableName`** — 当表名与实体类名称不一致时，使用此注解进行关联
- **`@TableField`** — 当表中字段名称与实体类属性不一致时，使用此注解进行关联
- **`@TableId`** — 用于标记表中的主键字段，MyBatis-Plus 也提供了主键生成策略
