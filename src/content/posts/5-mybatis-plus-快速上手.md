---
title: Mybatis-Plus 快速上手
date: 2026-05-15
tags: [MyBatis-Plus, SpringBoot, 后端开发]
description: 学习 MyBatis-Plus 的基本使用，包括依赖配置、全局设置、CRUD 操作和常用注解
---

## ORM介绍

ORM -- Object Relational Mapping，对象关系映射
是为了解决面向对象与关系数据库存在的互不匹配现象的一种技术。

ORM通过使用描述对象和数据库之间映射的元数据将程序中的对象自动持久化到关系数据库中。

ORM框架的本质是简化编程中操作数据库的编码。

![ORM.png](/images/orm.png)


## MyBatis-Plus介绍

MyBatis是一款优秀的数据持久层ORM框架，被广泛地应用于应用系统。

MyBatis能非常灵活地实现动态SQL，可以使用XML或注解来配置和映射原生信息，轻松地将Java的POJO（Plain Ordinary Java Object，普通的Java对象）与数据库中的表和字段进行映射关联。

MyBatis-Plus是一个MyBatis的增强工具，在MyBatis的基础上做了增强，简化了开发。


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

配置数据库相关信息

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

添加@MapperScan注解


## Mybatis CRUD注解

![Mybatis CRUD注解.png](/images/mybatis-crud-.png)


```java
@Mapper
public interface UserMapper {
    // 插入用户
    @Insert("insert into user values(#{id},#{username},#{password},#{birthday})")
    int add(User user);

    // 更新用户
    @Update("update user set username=#{username},password=#{password},birthday=#{birthday} where id=#{id}")
    int update(User user);

    // 删除用户
    @Delete("delete from user where id=#{id}")
    int delete(int id);

    // 根据ID查询用户
    @Select("select * from user where id=#{id}")
    User findById(int id);

    // 查询所有用户
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

## Mybatis-Plus 注解

@TableName，
当表名与实体类名称不一致时，可以使用@TableName注解进行关联。

@TableField，
当表中字段名称与实体类属性不一致时，使用@TableField进行关联

@TableId，
用于标记表中的主键字段，MybatisPlus也提供了主键生成策略。

