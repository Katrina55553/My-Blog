---
title: Maven 基础
date: 2026-05-20
tags: [Maven, 后端]
description: Maven 项目管理与构建自动化工具的核心概念，涵盖 POM 配置、依赖管理、生命周期和仓库管理等基础知识。
---

Maven 是一个项目管理与构建自动化工具，主要用于 Java 项目。

### **Maven 的主要功能和优势**

| **功能**              | **说明**                                          |
| ------------------- | ----------------------------------------------- |
| **依赖管理**            | 自动下载和管理 `.jar` 文件，避免手动管理依赖                      |
| **标准化构建流程**         | 提供 `clean`、`compile`、`test`、`package` 等标准生命周期   |
| **项目模板（Archetype）** | 快速生成项目结构（如 `maven-archetype-quickstart`）        |
| **多模块支持**           | 适用于大型项目，可以拆分为多个子模块                              |
| **插件扩展**            | 支持自定义构建任务（如 `maven-compiler-plugin` 指定 Java 版本） |
|                     |                                                 |

## Maven POM

POM ( Project Object Model，项目对象模型 ) 是 Maven 的核心配置文件，采用 XML 格式，默认命名为 pom.xml。包含了项目的基本信息，用于描述项目如何构建，声明项目依赖，等等。
执行任务或目标时，Maven 会在当前目录中查找 POM，获取所需的配置信息，然后执行目标。

**POM 文件基本结构：**

```xml
<project>
    <!-- 1. 基础信息 -->
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <!-- 2. 元信息 -->
    <name>My Application</name>
    <description>A demo project</description>
    <url>https://example.com</url>

    <!-- 3. 依赖管理 -->
    <dependencies>...</dependencies>

    <!-- 4. 构建配置 -->
    <build>...</build>

    <!-- 5. 环境配置 -->
    <properties>...</properties>
    <repositories>...</repositories>
</project>
```


## Maven 依赖

1. **坐标系统 (Coordinates)**

Maven 使用三个基本坐标来唯一标识一个依赖项：

- **groupId**：定义项目所属的组织或公司（如 `org.apache`）
- **artifactId**：定义项目的名称（如 `commons-lang3`）
- **version**：定义项目的版本（如 `3.12.0`）

这三个元素组合起来形成了 Maven 依赖的唯一标识符

<br>

2. **依赖范围 (Scope）**

依赖的 jar 包，默认情况下，可以在任何地方使用。可以通过 `<scope> </scope>` 设置其作用范围。

作用范围：
- **compile**（默认）：编译、测试和运行时都可用
- **provided**：编译和测试时可用，但运行时由 JDK 或容器提供
- **runtime**：只在测试和运行时需要
- **test**：仅在测试编译和执行阶段需要
- **system**：类似于 provided，但需要显式指定 JAR 路径

<br>

3. **传递性依赖 (Transitive Dependencies)**

当项目 A 依赖项目 B，而项目 B 又依赖项目 C 时，Maven 会自动将项目 C 也作为项目 A 的依赖引入。这种自动处理依赖关系的特性称为传递性依赖。


## Maven 生命周期

Maven 构建生命周期定义了一个项目构建跟发布的过程，包含三个标准生命周期：

- clean：清理项目
- default（或 build）：核心构建流程
- site：生成项目文档

同一套生命周期中，运行后面的阶段时，前面的阶段都会运行


核心阶段：

**clean**：删除目标目录中的编译输出文件。
**compile**：编译项目的源代码
**test**：运行项目的单元测试。
**package**：将编译后的代码打包成可分发的格式，例如 JAR 或 WAR。
**install**：将项目的构建结果安装到本地 Maven 仓库中，以供其他项目使用。


## Maven 仓库

Maven 仓库是项目中依赖的第三方库，这个库所在的位置叫做仓库。Maven 仓库能帮助我们管理构件（主要是 JAR），它就是放置所有 JAR 文件（WAR，ZIP，POM 等等）的地方。

**Maven 依赖搜索顺序: 
先查找本地仓库，然后依次查找在  `pom.xml` 中配置的远程仓库，最后才查找中央仓库**


<br>

**Maven 的 Snapshot 版本与 Release 版本**

1、Snapshot 版本代表不稳定、尚处于开发中的版本。
2、Release 版本则代表稳定的版本