---
title: Nginx 入门教程
date: 2026-05-18
tags: [Nginx, 反向代理, 中间件]
description: Nginx 入门教程，涵盖安装方式、配置文件结构、常用配置、反向代理、负载均衡、静态资源服务等核心功能
---

## 一、Nginx 简介

**Nginx**是一款轻量级高性能的、兼具 Web 服务器和反向代理服务器功能的中间件。

### 安装方式

- 包管理器安装
- 源码编译安装  
- Docker 容器安装

---

## 二、配置文件

### 2.1 配置文件位置

Nginx的配置文件是 `nginx.conf`，一般位于 `/etc/nginx/nginx.conf`。

### 2.2 配置检查命令

```bash
nginx -t  # 检查配置文件是否正确，也可用来定位配置文件的位置
```

### 2.3 配置文件结构

Nginx配置文件采用分层结构：

```nginx
# 全局块
worker_processes  1;

events {
    # events块 - 处理网络连接
}

http {
    # http块 - 主要配置部分
    server {
        # server块 - 配置虚拟主机
        location / {
            # location块 - URL匹配配置
        }
    }
}
```

### 2.4 各模块说明

| 配置块           | 说明                                                       |
| ------------- | -------------------------------------------------------- |
| **全局块**       | 配置文件第一个块，设置影响Nginx整体运行的配置指令，包括运行用户、worker进程数、PID路径、日志路径等 |
| **events块**   | 负责网络连接处理的核心模块，控制Nginx如何处理与客户端的网络连接                       |
| **http块**     | 配置文件的主要部分，包含http全局块和server块                              |
| **server块**   | 配置虚拟主机，一个http块可包含多个server块，每个server块就是一个虚拟主机             |
| **location块** | 用于匹配URL，对特定请求进行处理                                        |

---

## 三、反向代理

### 3.1 基本概念

Nginx反向代理是一种高效的服务器架构模式，充当客户端和后端服务器之间的"中间人"。客户端向Nginx发起请求，Nginx根据配置将这些请求转发给一个或多个后端服务器处理，再将结果返回给客户端。

### 3.2 核心优势

- **负载均衡**：将请求分发到多台服务器，提升系统处理能力
- **高可用性**：自动检测并隔离故障服务器，保证服务稳定
- **安全与灵活**：隐藏后端服务器真实信息，并可统一处理SSL、缓存等任务

### 3.3 配置示例

```nginx
# 1. 定义后端服务器集群
upstream backend_servers {
    # 常用的负载均衡算法（默认是轮询 round-robin）
    # 1. 轮询 (默认): 按顺序分配
    # 2. least_conn: 分配给活动连接数最少的服务器
    # 3. ip_hash: 根据客户端IP分配，同一客户端始终访问同一台服务器
    
    # ip_hash; # 取消注释可启用基于IP的会话保持
    
    server 192.168.1.101:8080 weight=3; # weight越大，权重越高
    server 192.168.1.102:8080 weight=2;
    server 192.168.1.103:8080 backup;  # 备用服务器
}

# 2. 配置虚拟主机
server {
    listen 80;                  # 监听端口
    server_name your-domain.com; # 你的域名

    location / {
        # 将请求转发到上面定义的upstream集群
        proxy_pass http://backend_servers;

        # 3. 传递客户端真实信息给后端
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3.4 负载均衡算法

| 算法类型                         | 说明                                     |
| ---------------------------- | -------------------------------------- |
| **轮询 (Round Robin)**         | 默认方式，按顺序轮流分配                           |
| **加权轮询**                     | 通过`weight`参数为性能更强的服务器分配更多权重            |
| **IP哈希 (IP Hash)**           | 确保来自同一客户端的请求始终被分发到同一台服务器，解决Session共享问题 |
| **最少连接 (Least Connections)** | 将请求发给当前活动连接数最少的服务器                     |

### 3.5 其他功能

**动静分离与缓存**：Nginx处理静态文件效率极高，可将动态请求转发给后端（如Tomcat），而将图片、CSS、JS等静态资源直接在自己这里处理并返回，大幅减轻后端压力。

**端口转发与域名隐藏**：通过反向代理，可以将运行在非标准端口（如`3000`、`8080`）上的服务，绑定到标准的`80`(HTTP)或`443`(HTTPS)端口上，用户通过标准的`http://your-domain.com`即可访问。

**SSL/HTTPS配置**：Nginx可以统一处理HTTPS加密，卸载SSL握手计算的负担，然后再以HTTP协议与后端服务器通信。

---

## 四、HTTPS 配置

### 4.1 核心思路

HTTPS配置的核心是让Nginx监听443端口并加载SSL证书。

### 4.2 HTTP自动跳转HTTPS

将HTTP（80端口）的访问请求自动跳转到HTTPS（443端口）。

**实现方式**：监听80端口，收到请求后返回301永久重定向，指向同一个域名的HTTPS地址。

---

## 五、虚拟主机

### 5.1 基本概念

**虚拟主机（Virtual Host）** 是指在一台物理服务器上运行多个网站的技术。Nginx通过`server`块来实现虚拟主机，可以基于**域名**（最常见）、**IP地址**或**端口**来区分不同的站点。

### 5.2 配置示例

```nginx
# 这是默认配置文件的结构
http {
    # 站点1
    server {
        listen 80;
        server_name site1.com;
        # ... 站点1的配置
    }
    
    # 站点2
    server {
        listen 80;
        server_name site2.com;
        # ... 站点2的配置
    }
}
```

---

## 六、常用命令

| 命令 | 说明 |
|------|------|
| `nginx` | 启动Nginx |
| `nginx -c filename` | 指定配置文件 |
| `nginx -V` | 查看Nginx的版本和编译参数等信息 |
| `nginx -t` | 检查配置文件是否正确，也可用来定位配置文件的位置 |
| `nginx -s quit` | 优雅停止Nginx |
| `nginx -s stop` | 快速停止Nginx |
| `nginx -s reload` | 重新加载配置文件 |
| `nginx -s reopen` | 重新打开日志文件 |

---

## 七、参考资源

- 【GeekHour】30分钟Nginx入门教程：https://www.bilibili.com/video/BV1mz4y1n7PQ?vd_source=ff4b1d4c42eea739695d4eb2df88faca
- Nginx官方文档：https://nginx.org/en/docs/