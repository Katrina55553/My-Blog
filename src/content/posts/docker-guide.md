---
title: Docker 知识梳理
date: 2026-05-22
tags: [Docker, Linux]
description: Docker 核心概念、技术原理与常用操作指南，涵盖镜像、容器、Dockerfile、数据卷、网络及 Docker Compose 等内容。
---

## 相关概念


> **Docker = 把"应用 + 依赖 + 运行环境"打包成一个标准化容器来运行**


## 为什么需要 Docker？


### 经典问题

> "我本地能跑，服务器跑不了"

原因通常是：

- 系统不一样
- 依赖版本不一致
- 环境变量不同

### Docker 的解决方式

Docker 把这些**统统打包进容器里**：

```
应用程序
+ Python / Java / Node
+ 依赖库
+ 系统环境
= Docker 镜像
```

运行时只需要一句：

```bash
docker run
```

## 核心概念


### 镜像（Image）

> **只读模板**，相当于"程序安装包"

- 包含：代码 + 依赖 + 环境

类比：**镜像 ≈ exe / 安装包**

#### 镜像是分层的（Layer）

例如一个 Python 镜像：

```
Layer 1: ubuntu
Layer 2: python 3.10
Layer 3: pip install numpy
Layer 4: copy main.py
```

优点：

- 节省磁盘
- 构建快
- 复用强

这也是 Docker 高效的核心原因之一。

---

### 容器（Container）

> **镜像运行后的实例**

- 镜像是静态的
- 容器是正在跑的进程

类比：**容器 ≈ 正在运行的程序**

---

### Dockerfile

> **描述如何构建镜像的脚本**

示例（Python 项目）：

```dockerfile
FROM python:3.10
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "main.py"]
```

---

### Docker Engine

> 真正执行容器的后台服务

你敲的：

```bash
docker run
```

本质是在和 Docker Engine 对话。

## 技术原理

Docker 并不是虚拟机，它利用的是 **Linux 内核特性**：

### 核心技术

| 技术 | 作用 |
|------|------|
| Namespace | 进程隔离（看起来像独立系统） |
| Cgroups | 限制 CPU / 内存 / IO |
| UnionFS | 镜像分层，提高复用 |

所以 **容器 ≈ 隔离的进程**

### Docker vs 虚拟机

| 对比项 | Docker | 虚拟机 |
|--------|--------|--------|
| 启动速度 | 秒级 | 分钟级 |
| 资源占用 | 极低 | 很高 |
| 是否包含 OS | 否（共享宿主机内核） | 是 |
| 性能 | 接近原生 | 有损耗 |
| 隔离性 | 较弱 | 很强 |

总结一句话：

> **虚拟机是"虚拟一台电脑"，Docker 是"隔离运行一个程序"**


## 镜像操作


### 下载镜像

Docker Pull 命令用来从仓库下载镜像。

```shell
docker pull docker.io/library/nginx:latest
```

一个 Docker 镜像下载地址包含 4 部分内容：

- **docker.io**：registry / 仓库地址，如果是 Docker 官方仓库，则可以省略这个地址。
- **library**：命名空间（镜像作者），为了防止不同用户上传同一个名字的镜像发生冲突。"library" 是 docker 官方仓库的命名空间，这个空间下的所有镜像都是由 Docker 官方维护。如果是官方的命名空间则可以省略不写。
- **nginx**：镜像名
- **latest**：标签名、版本号。写 "latest" 或者不写表示获取最新版本的镜像。

**镜像库** repository：存放一个镜像的不同版本，"docker.io/library/nginx" 就是一个镜像库。

简化后的命令如下：

```shell
# 从 Docker 官方仓库的官方命名空间里面下载最新的 Nginx Docker 镜像
docker pull nginx
```

其他例子：

```shell
# 从 docker.n8n.io 的私有仓库下载 n8nio 上传的 n8n 镜像
docker pull docker.n8n.io/n8nio/n8n
```

**拉取特定架构的镜像**

```shell
docker pull --platform=xxx nginx
```

默认情况下，docker 会选择当前宿主机 CPU 架构的镜像，大部分情况下不需要关注这个参数。

### 查看镜像

```shell
docker images
```

使用此命令可以查看所有 Pull 到本地的镜像。

### 删除镜像

```shell
docker rmi [镜像标识]
```

使用此命令可以删除 pull 到本地的镜像，镜像标识可以选择镜像的 ID（image id）或者镜像的名称（repository）。


## 容器操作


### 创建并运行容器

```shell
docker run [镜像标识]
```

使用 run 命令可以通过镜像创建一个容器，并启动它。镜像标识可以是镜像 ID 或者镜像名称。

例如：`docker run nginx` 就是创建一个 Nginx 容器。

docker pull 命令可以省略，直接使用 docker run 运行，如果 docker 发现本地没有这个镜像则会自动拉取。

### 分离模式

默认情况下 `docker run` 创建容器后会导致当前终端挂起，不能进行其他操作，可以增加 `-d` 参数表示容器在后台运行，不阻塞当前窗口。

```shell
docker run -d nginx
```

控制台只会打印一个容器 ID，后续容器的日志不会打印在控制台。

### 端口映射

容器的网络和宿主机的网络是隔离的，例如运行了一个 Nginx 容器，容器内的 Nginx 监听了 80 端口。这时通过宿主机的 80 端口是无法访问到 Nginx 服务的。

所以需要 `-p {宿主机端口}:{容器的端口}` 命令进行映射，例如 `-p 8080:80` 表示将 Nginx 容器的 80 端口映射到宿主机的 8080 端口。

### 目录映射（绑定挂载）

与端口映射类似的就是目录映射，将容器外和容器内的目录进行绑定，容器内对文件的修改会影响宿主机的文件夹，宿主机的修改也会影响容器内文件夹。

`-v {宿主机目录}:{容器的目录}`

这种目录也被称为挂载卷，他的最大作用是数据的持久化。
当容器删除时，容器内的所有数据都会被删除，但通过挂载卷映射到宿主机的文件夹将得以保留。

```shell
docker run -d -p 8080:80 -v ./:/usr/share/nginx/html nginx
```

使用绑定挂载的时候，宿主机的文件会暂时覆盖掉容器内的目录。
除了这种用法还有一种叫 Docker 卷，可以在容器之间共享和重用。

### 环境变量

可以在命令行通过 `-e` 参数传递环境变量到容器内部，例如创建一个数据库应用，需要在创建容器时就指定数据库的账户、密码等信息。

```shell
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=tech \
  -e MONGO_INITDB_ROOT_PASSWORD=dbkuaizi \
  mongo
```

如果不知道容器的环境变量有哪些，可以在 Docker Hub 上搜索一下，都有详细的描述。

### 自定义容器名称

```shell
docker run -d --name my_nginx nginx
```

容器的名称和容器 ID 的效果是等价的，但是名字更方便记忆。

### 进入容器

```shell
docker run -it alpine
```

通过 `-it` 参数可以在创建一个容器时，同时进入容器内部的终端。

### 退出删除

```shell
docker run -it --rm alpine
```

`--rm` 表示当退出容器时，自动删除这个容器。
一般和 `-it` 命令配合使用，用于临时调试一个容器。

### 容器重启策略

```shell
docker run -d --restart always nginx
```

`--restart` 参数用来表示容器在停止时的重启策略，它有两个选项：

- `always`：只要容器停止了，就会立即重启。包含容器因为内部错误崩溃，或者宿主机断电等场景。
- `unless-stopped`：与 `always` 类似，唯一区别是手动停止的容器不会尝试重启（生产环境）。

### 创建容器

```shell
docker create nginx
```

与 run 命令功能类似，区别在于只创建容器，不自动启动。

### 容器列表

```shell
# 列出正在运行中的容器
docker ps
```

ps 是 Process Status（进程状态）的缩写，也是 Linux 上的一个经典命令，用于查看进程的状态信息。这一命令也被继承到 Docker 里面了。

这些列含义如下：

- `CONTAINER ID`：容器 ID，每个容器在创建时会生成一个唯一的 ID
- `IMAGE`：基于哪个镜像创建出来的
- `CREATED`：镜像创建时间
- `STATUS`：镜像当前状态
- `PORTS`：镜像使用端口
- `NAMES`：容器的名字，如果创建容器时没有指定名字，系统就会随机分配一个。

增加 `-a` 参数可以看到所有的容器，包括正在运行的和已经停止的。

### 启停容器

每次使用 `docker run` 运行都会创建一个新的容器，如果需要对同一个容器进行持续的操作，可以通过容器的启停命令来控制。

```shell
# 启动容器
docker start {容器标识}
# 停止容器
docker stop {容器标识}
```

使用 `start` / `stop` 启停容器的时候，创建容器时的端口映射、挂载卷、环境变量等参数都不需要重新写了，docker 已经自动保存了，重新启动可以按照原样运行。

### 查看创建信息

```shell
docker inspect {容器标识}
```

使用这个命令可以看到容器的所有信息，输出的是一个 JSON 格式，可以直接丢给 AI 帮忙解析。

### 容器日志

```shell
docker logs {容器标识}
```

这个命令可以查看容器的日志，加上 `-f` 命令可以持续输出，滚动查看。

### 删除容器

```shell
docker rm [-f] {容器标识}
```

使用 rm 命令可以删除容器，如果要删除运行中的容器需要加 `-f` 参数强制删除。

### 容器内部

```shell
# 进入容器内部
docker exec -it {容器标识} bash
```

使用 `exec -it` 命令可以进入容器，在容器内部执行 shell 命令。

```shell
docker exec {容器标识} {shell 命令}
```

也可以通过这种方式在容器外部执行容器内部的命令。

```shell
# 查看容器 alpine 中的进程信息
docker exec alpine ps -ef
```

注意：docker 镜像为了尽可能缩小镜像体积，内部一般是一个极简的操作系统，很多系统工具、基础命令都是缺失的。

## 卷（Volume）


### 为什么需要 Docker 卷？

容器的文件系统有一个**致命缺陷**：

1. **生命周期绑定**：容器删除后，容器层（可写层）中的所有数据都会**永久消失**。
2. **隔离性限制**：不同容器之间无法直接共享文件。
3. **性能问题**：UnionFS 的写时复制机制有一定性能开销，不适合高 IO 场景（如数据库）。

这就引出了 Docker 卷——**独立于容器生命周期之外的持久化存储方案**。

### Docker 的三种数据存储方式

|存储类型|存储位置|生命周期|适用场景|
|---|---|---|---|
|**Bind Mount**|宿主机任意目录|宿主机管理|开发环境、配置文件注入|
|**Volume**|`/var/lib/docker/volumes/`|Docker 管理|生产环境、数据库、日志|
|**tmpfs mount**|内存|容器生命周期|临时敏感数据（密码、密钥）|

docker volume 命令用于管理 Docker 卷。卷是用于持久化数据的文件系统，可以将数据和应用程序分离，便于管理，可以在容器之间共享和重用。同时卷可以用于数据的备份和恢复。

**创建卷**

```shell
docker volume create {卷名称}
```

**查看所有卷**

```shell
docker volume list
```

**删除卷**

```shell
docker volume rm nginx_html
```

**删除所有没有容器在使用的卷**

```shell
docker volume prune -a
```

## Dockerfile

Dockerfile 是一个用来构建镜像文件的文本文件，Dockerfile 文件内包含了构建镜像所需的各种信息。

在项目目录下创建一个名为 `Dockerfile` 的文件，并在文件中编写镜像构成的信息。

Dockerfile 文件写好了，使用 `docker build` 构建镜像。

## 网络

### 桥接模式

Docker 网络默认 Bridge（桥接模式），所有的容器都连接到这个网络中，每一个容器都分配了一个内部的 IP 地址，一般都是 172.17 开头。
在这个内部子网里面，容器可以通过内部 IP 地址互相访问，但**容器网络和宿主机的网络是隔离的**。

可以使用 `docker network create` 命令创建子网，默认情况下，子网也是桥接模式的一种，然后可以指定容器加入不同的子网，同一个子网内的容器可以互相通信，而跨子网则不可以通信。

使用子网还有一个好处，同一个子网内的容器，可以直接使用容器名称互相访问，而不必使用内部的 IP 地址（DNS 机制）。

> **子网负责划分 IP 地址范围以保障隔离，而 DNS 负责提供服务发现，让容器可以通过名字而非易变的 IP 地址相互通信。**

### HOST 模式

host 模式下，docker 容器直接共享宿主机的网络，容器直接使用宿主机的 IP 地址，无需 `-p` 参数进行端口映射，容器内的服务直接运行在宿主机的端口上，通过宿主机的 IP 和端口就能访问到容器中服务。

```shell
docker run -d --network host nginx
```

### NONE 模式

这个模式表示不联网。

### 控制命令

**创建网络**

```shell
docker network create network1
```

**查看网络**

```shell
docker network list
```

除了我们创建的模式以外，还有 Docker 自带的三种模式，需要注意的是这三个自带的网络模式是不可删除的。

**删除网络**

```shell
docker network rm network1
```

## Docker Compose

有时候一个完整的应用可能会由很多部分组成，例如前端、后端、数据库以及各种附加的技术栈，这些东西应该如何容器化呢？

我们可以自然地想到，将这些模块都打包在一起，做成一个巨大的容器。但这样做有一个弊端：只要其中一个模块发生故障（例如服务端内存泄漏），可能会导致整个容器都崩溃挂掉。

并且这样做的可伸缩性差，如果想给系统做扩容，只能把整个大容器再复制一份，做不到对某个模块的精确扩容。

多应用的最佳实践，是把每一个模块都打包成一个独立的容器。但这样多容器增加了很多使用成本，因为想创建多个容器就要多次使用 `docker run`，还需要配置容器之间的网络环境，尝试管理这些容器时，一个遗漏就会导致很多问题，并且若让其他人部署项目，如果操作者对部署流程不熟悉也会导致各种问题的发生。

这个时候，容器编排技术就很有用了，也就是 **Docker Compose**，它使用 yml 文件管理多个容器，在这个文件中记录了容器之间如何创建以及如何协同工作的。我们可以简单地把 Docker Compose 文件理解成一个或多个 `docker run` 命令，按照特定的格式书写到一个文件中。

我们可以借助 AI 来生成需要的 Compose 文件，而无需手动编写。

在启动目录下创建 `docker-compose.yaml` 文件，然后执行 `docker compose up -d` 运行，如果容器已经在运行了重复执行这个命令不会有任何效果。

执行该命令时，会检测当前目录下名为 `docker-compose.yaml` 或 `compose.yaml` 文件。可以通过 `docker compose -f test.yaml up -d` 指定 compose 文件。

- `docker compose down`：停止并删除容器
- `docker compose stop`：停止并且不会删除容器
- `docker compose start`：启动停止的容器

## 参考视频

[40分钟的Docker实战攻略，一期视频精通Docker](https://www.bilibili.com/video/BV1THKyzBER6?vd_source=ff4b1d4c42eea739695d4eb2df88faca)

