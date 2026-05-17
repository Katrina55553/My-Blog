---
title: 三层架构与依赖注入原理
date: 2026-05-17
tags: [后端, SpringBoot, 架构设计]
description: 详细讲解三层架构(Controller/Service/Dao)和依赖注入(IoC/DI)的设计原理，以及Spring框架的实现方式
---

## 三层架构

● Controller : 控制层，接收前端发送的请求，对请求进行处理，并响应数据。

● Service : 业务逻辑层，处理具体的业务逻辑。

● Dao : 数据访问层 (Data Access Object) (持久层)，负责数据访问操作，包括数据的 CRUD。


**Controller ↔ Service**：通常用 **VO**（View Object）或 **DTO**，返回前端需要的数据

 **Service ↔ Dao**：通常用 **PO**（Persistent Object） 或 **Entity**，与数据库表一一对应。


## 分层解耦


内聚：软件中各个功能模块内部的功能联系。
耦合：衡量软件中各个层/模块之间的依赖、关联的程度。

软件设计原则：高内聚低耦合


**高内聚低耦合的好处**：

- **方便维护**：改数据库（Dao）不影响前端（Controller）。
- **方便测试**：可以单独测试Service层，不用启动数据库。
- **方便替换**：把MySQL换成Redis？只要改Dao实现类即可


控制反转：Inversion of Control 简称 loC。

对象的创建控制权由程序自身转移到外部（容器），这种思想称为控制反转。

依赖注入：Dependency Injection 简称 Dl。

容器为应用程序提供运行时，所依赖的资源，称之为依赖注入。


**IoC是一种设计原则**，**DI是实现这个原则的设计模式**


---


Spring框架下：

**Spring IoC容器启动流程**：

1. 扫描`@Controller`、`@Service`等注解 → 创建Bean对象
    
2. 扫描`@Autowired` → 自动注入依赖
    
3. 将Bean放入容器（Map结构，key=类名/value=对象实例）
    
4. 应用程序运行时，直接从容器中获取Bean


**DI的三种实现方式**

|注入方式|示例|特点|
|---|---|---|
|**字段注入**|`@Autowired private UserService service;`|最简洁，但不利于单元测试|
|**构造器注入**（推荐）|`public UserController(UserService service) { this.service = service; }`|不可变、易测试|
|**Setter注入**|`@Autowired public void setService(...)`|用于可选依赖|


Bean：**由 Spring IoC 容器管理的 Java 对象**