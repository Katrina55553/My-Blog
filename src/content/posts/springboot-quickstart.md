---
title: SpringBoot 快速上手
date: 2026-02-09
tags: [SpringBoot, 后端]
description: SpringBoot 快速入门指南，介绍约定优于配置、内嵌服务器、Starter依赖、热部署等核心特性，以及Web开发入门
---

## 介绍

基于Spring的全新框架，旨在简化Spring应用的初始搭建和开发过程。

## 特点

- 遵循"约定优于配置"的原则，只需要很少的配置或使用默认的配置
- 能够使用内嵌的Tomcat、Jetty服务器，不需要部署war文件
- 提供定制化的启动器Starters，简化Maven配置，开箱即用
- 纯Java配置，没有代码生成，也不需要XML配置
- 提供了生产级的服务监控方案，如安全监控、应用监控、健康检测等

## 开发环境热部署

在实际的项目开发调试过程中会频繁地修改后台类文件，导致需要重新编译、重新启动，整个过程非常麻烦，影响开发效率。

SpringBoot提供了spring-boot-devtools组件，使得无须手动重启SprinBoot应用即可重新编译、启动项目，大大缩短编译启动的时间。

devtools会监听classpath下的文件变动，触发Restart类加载器重新加载该类，从而实现类文件和属性文件的热部署。

并不是所有的更改都需要重启应用（如静态资源、视图模板），可以通过设置spring.devtools.restart.exclude属性来指定一些文件或目录的修改不用重启应用

### 配置步骤

**1. 在pom.xml配置文件中添加dev-tools依赖**

```xml
<!-- Spring Boot DevTools 依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>
```

使用optional=true表示依赖不会传递，即该项目依赖devtools；其他项目如果引入此项目生成的JAR包，则不会包含devtools

**2. 在application.properties中配置devtools**

```properties
spring.devtools.restart.enabled=true
spring.devtools.restart.additional-paths=src/main/java
```

---

## Web入门

SpringBoot将传统Web开发的mvc、json、tomcat等框架整合，提供了spring-boot-starter-web组件，简化了Web应用配置。

创建SpringBoot项目勾选SpringWeb选项后，会自动将spring-boot-starter-web组件加入到项目中。

spring-boot-starter-web启动器主要包括web、webmvc、json、tomcat等基础依赖组件：
- webmvc为Web开发的基础框架
- json为JSON数据解析组件
- tomcat为自带的容器依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webmvc</artifactId>
</dependency>
```

---

## 控制器

SpringBoot 提供了@Controller和@RestController两种注解来标识此类负责接收和处理HTTP请求。

- 如果请求的是页面和数据，使用@Controller注解即可
- 如果只是请求数据，则可以使用@RestController注解

### @RestController的用法

默认情况下，@RestController注解会将返回的对象数据转换为JSON格式。

```java
@RestController
public class HelloController {

    @RequestMapping("/user")
    public User getUser() {
        User user = new User();
        user.setUsername("zhangsan");
        user.setPassword("123");
        return user;
    }
}
```

### 路由URL映射

@RequestMapping注解主要负责URL的路由映射，它可以添加在Controller类或者具体的方法上。

如果添加在Controller类上，则这个Controller中的所有路由映射都将会加上此映射规则；如果添加在方法上，则只对当前方法生效。

@RequestMapping注解包含很多属性参数来定义HTTP的请求映射规则：

- **value**: 请求URL的路径，支持URL模板、正则表达式
- **method**: HTTP请求方法
- **consumes**: 请求的媒体类型（Content-Type），如application/json
- **produces**: 响应的媒体类型
- **params, headers**: 请求的参数及请求头的值

Method匹配也可以使用@GetMapping、@PostMapping等注解代替。

### 参数传递

- **@RequestParam**: 将请求参数绑定到控制器的方法参数上，接收的参数来自HTTP请求体或请求url的QueryString。当请求的参数名称与Controller的业务方法参数名称一致时，@RequestParam可以省略
- **@PathVariable**: 用来处理动态的URL，URL的值可以作为控制器中处理方法的参数
- **@RequestBody**: 接收的参数是来自requestBody中，即请求体。一般用于处理非Content-Type:application/x-www-form-urlencoded编码格式的数据，比如：`application/json`、`application/xml`等类型的数据

```java
@RestController
public class HelloController {

    // http://localhost:8080/hello
    // http://localhost:8080/hello?username=katrina&phone=123
    @RequestMapping(value = "/hello", method = RequestMethod.GET)
    public String sayHello(String username, String phone) {
        System.out.println(username + " " + phone);
        return "Hello World by " +  username;
    }

    // http://localhost:8080/hello2?username=katrina
    @RequestMapping(value = "/hello2", method = RequestMethod.GET)
    public void sayHello2(@RequestParam(value = "username", required = false) String name) {
        System.out.println(name);
    }
}
```

```java
@RequestMapping(value = "/hello3", method = RequestMethod.POST)
public String sayHello3(@RequestBody User user) {
    System.out.println(user);
    return "POST请求";
}
```

---

## 静态资源访问

使用IDEA创建SpringBoot项目，会默认创建出classpath:/static/目录，静态资源一般放在这个目录下即可。

如果默认的静态资源过滤策略不能满足开发需求，也可以自定义静态资源过滤策略。

在application.properties中直接定义过滤规则和静态资源位置：

```
过滤规则为/static/** ，静态资源位置为classpath:/static/
```

---

## 文件上传

SpringBoot工程嵌入的tomcat限制了请求的文件大小，每个文件的配置最大为1Mb，单次请求的文件的总数不能大于10Mb。

要更改这个默认值需要在配置文件（如application.properties）中加入两个配置：

```properties
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
```

当表单的enctype="multipart/form-data"时，可以使用MultipartFile获取上传的文件数据，再通过transferTo方法将其写入到磁盘中：

```java
@RestController
public class FileUploadController {
    
    @PostMapping("/upload")
    public String up(String username, MultipartFile photo, HttpServletRequest request) throws IOException {
        System.out.println(username);
        // 获取图片原始名称
        System.out.println(photo.getOriginalFilename());
        // 获取图片类型
        System.out.println(photo.getContentType());

        String path = request.getServletContext().getRealPath("/upload");
        System.out.println(path);
        saveFile(photo, path);
        return "上传成功";
    }
    
    public void saveFile(MultipartFile photo, String path) throws IOException {
        File dir = new File(path);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        File file = new File(path + photo.getOriginalFilename());
        photo.transferTo(file);
    }
}
```

---

## 拦截器

拦截器在Web系统中非常常见，对于某些全局统一的操作，我们可以把它提取到拦截器中实现。

拦截器大致有以下几种使用场景：

- **权限检查**：如登录检测，进入处理程序检测是否登录，如果没有，则直接返回登录页面
- **性能监控**：有时系统在某段时间莫名其妙很慢，可以通过拦截器在进入处理程序之前记录开始时间，在处理完后记录结束时间，从而得到该请求的处理时间
- **通用行为**：读取cookie得到用户信息并将用户对象放入请求，从而方便后续流程使用，还有提取Locale、Theme信息等，只要是多个处理程序都需要的，即可使用拦截器实现

SpringBoot定义了HandlerInterceptor接口来实现自定义拦截器的功能。HandlerInterceptor接口定义了preHandle、postHandle、afterCompletion三种方法，通过重写这三种方法实现请求前、请求后等操作。

### 拦截器定义

```java
public class LoginInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("LoginInterceptor preHandle");
        return false;
    }
}
```

### 拦截器注册

addPathPatterns方法定义拦截的地址，excludePathPatterns定义排除某些地址不被拦截。

添加的一个拦截器没有addPathPattern任何一个url则默认拦截所有请求；如果没有excludePathPatterns任何一个请求，则默认不放过任何一个请求。

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 添加一个登录拦截器实例，并指定它要拦截的请求路径
        registry.addInterceptor(new LoginInterceptor()).addPathPatterns("/user/**");
        // 拦截所有以 "/user/" 开头的请求路径
    }
}
```

---

## RESTful服务与Swagger

### RESTful 介绍

REST -- Representational State Transfer，表述性状态转移，定义了互联网软件服务的架构原则，如果一个架构符合REST原则，则称之为RESTful架构。

REST并不是一个标准，它更像一组客户端和服务端交互时的架构理念和设计原则，基于这种架构理念和设计原则的WebAPI更加简洁，更有层次。

### RESTful 特点

- 每一个URI代表一种资源
- 客户端使用GET、POST、PUT、DELETE四种表示操作方式的动词对服务端资源进行操作：
  - GET用于获取资源
  - POST用于新建资源（也可以用于更新资源）
  - PUT用于更新资源
  - DELETE用于删除资源
- 通过操作资源的表现形式来实现服务端请求操作
- 资源的表现形式是JSON或者HTML
- 客户端与服务端之间的交互在请求之间是无状态的，从客户端到服务端的每个请求都包含必需的信息

### RESTful API

符合RESTful规范的Web API需要具备如下两个关键特性：

**安全性**：安全的方法被期望不会产生任何副作用。当我们使用GET操作获取资源时，不会引起资源本身的改变，也不会引起服务器状态的改变。

**幂等性**：幂等的方法保证了重复进行一个请求和一次请求的效果相同（并不是指响应总是相同的，而是指服务器上资源的状态从第一次请求后就不再改变了）。在数学上幂等性是指N次变换和一次变换相同。

### HTTP状态码

HTTP状态码就是服务向用户返回的状态码和提示信息，客户端的每一次请求，服务都必须给出回应，回应包括HTTP状态码和数据两部分。

HTTP定义了40个标准状态码，可用于传达客户端请求的结果。状态码分为以下5个类别：

- **1xx**：信息，通信传输协议级信息
- **2xx**：成功，表示客户端的请求已成功接受
- **3xx**：重定向，表示客户端必须执行一些其他操作才能完成其请求
- **4xx**：客户端错误，此类错误状态码指向客户端
- **5xx**：服务器错误，服务器负责这些错误状态码

### SpringBoot实现RESTful API

SpringBoot 提供的spring-boot-starter-web组件完全支持开发RESTful API，提供了与REST操作方式（GET、POST、PUT、DELETE）对应的注解：

- @GetMapping：处理GET请求，获取资源
- @PostMapping：处理POST请求，新增资源
- @PutMapping：处理PUT请求，更新资源
- @DeleteMapping：处理DELETE请求，删除资源
- @PatchMapping：处理PATCH请求，用于部分更新资源

在RESTful架构中，每个网址代表一种资源，所以URI中建议不要包含动词，只包含名词即可，而且所用的名词往往与数据库的表格名对应。

用户管理模块API示例：

| HTTP Method | 接口地址       | 接口说明          |
|-------------|----------------|-------------------|
| POST        | /user          | 创建用户          |
| GET         | /user/{id}     | 根据 id 获取用户信息 |
| PUT         | /user          | 更新用户          |
| DELETE      | /user/{id}     | 根据 id 删除对应的用户 |

```java
@RestController
public class UserController {

    @GetMapping("/user/{id}")
    public String getUserById(@PathVariable String id) {
        System.out.println(id);
        return "根据ID获取用户信息";
    }

    @PostMapping("/user")
    public String createUser(User user) {
        System.out.println(user);
        return "添加用户";
    }
}
```

### 什么是Swagger

Swagger是一个规范和完整的框架，用于生成、描述、调用和可视化RESTful风格的Web服务，是非常流行的API表达工具。

Swagger能够自动生成完善的RESTfulAPI文档，同时并根据后台代码的修改同步更新，同时提供完整的测试页面来调试API。

### Swagger集成步骤

**1. 添加 Maven 依赖（`pom.xml`）**

```xml
<!-- Springdoc OpenAPI UI - 用于生成和展示 Swagger 文档 -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.6.0</version> <!-- 请根据需要使用最新版 -->
</dependency>
```

**2. （可选）添加配置类（自定义信息）**

```java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("学习SpringBoot项目 API")
                        .version("v1.0.0")
                        .description("提供用户查询、创建等接口"));
    }
}
```

**3. 启动应用并访问 Swagger UI**

启动项目访问 http://localhost:8080/swagger-ui.html 即可打开自动生成的可视化测试页面