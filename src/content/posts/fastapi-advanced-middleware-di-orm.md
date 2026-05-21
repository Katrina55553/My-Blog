---
title: FastAPI 进阶 - 中间件、依赖注入与 ORM
date: 2026-01-20
tags: [后端, FastAPI, 中间件, ORM]
description: FastAPI 进阶教程，深入讲解中间件原理与应用、依赖注入机制、SQLAlchemy ORM 集成，以及完整的数据库操作流程
---

## 一、中间件（Middleware）

### 什么是中间件

中间件是一个函数，它会在每个请求被特定的路径操作处理之前，以及在每个响应返回之前工作。

### 中间件的工作流程

```
请求 → 中间件1 → 中间件2 → ... → 路由处理 → ... → 中间件2 → 中间件1 → 响应
```

### 中间件写法示例

```python
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    # 请求处理前执行
    start_time = time.time()

    # 调用下一个中间件或路由处理
    response = await call_next(request)

    # 请求处理后执行
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)

    return response
```

### 中间件常见用途

| 用途 | 说明 |
|-----|------|
| 请求日志 | 记录所有请求信息 |
| CORS 处理 | 跨域资源共享配置 |
| 身份验证 | 验证 Token 或 Session |
| 响应头添加 | 添加统一的响应头 |
| 性能监控 | 记录请求处理时间 |

---

## 二、依赖注入（Dependency Injection）

### 什么是依赖注入

依赖注入是一种设计模式，允许你声明函数需要哪些依赖，然后由 FastAPI 自动提供这些依赖。

### 依赖注入的应用场景

| 场景 | 说明 |
|-----|------|
| 数据库连接 | 获取数据库会话 |
| 身份验证 | 验证用户身份 |
| 权限检查 | 检查用户权限 |
| 参数校验 | 统一的参数校验逻辑 |
| 日志记录 | 统一的日志处理 |

### 依赖注入基本用法

```python
from fastapi import FastAPI, Depends

app = FastAPI()

# 定义依赖函数
def get_db():
    # 获取数据库连接
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 在路由中使用依赖
@app.get("/items/")
def read_items(db = Depends(get_db)):
    # db 已经被自动注入
    items = db.query(Item).all()
    return items

# 多个依赖
@app.get("/users/{user_id}")
def read_user(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return {"user_id": user_id, "user": current_user}
```

### 带参数的依赖注入

```python
from fastapi import FastAPI, Depends

app = FastAPI()

def common_parameters(q: str = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}

@app.get("/items/")
def read_items(commons: dict = Depends(common_parameters)):
    return commons

@app.get("/users/")
def read_users(commons: dict = Depends(common_parameters)):
    return commons
```

---

## 三、ORM（对象关系映射）

### ORM 简介

ORM（Object-Relational Mapping）是一种技术，它将数据库表映射为编程语言中的对象，使开发者可以使用面向对象的方式操作数据库，而不需要直接写 SQL 语句。

### 常见的 ORM 框架

| 框架 | 语言 | 特点 |
|-----|------|------|
| SQLAlchemy | Python | 最流行的 Python ORM，功能强大 |
| Django ORM | Python | Django 自带 ORM，简单易用 |
| Peewee | Python | 轻量级 ORM，适合小项目 |
| Hibernate | Java | Java 生态最流行的 ORM |
| Entity Framework | .NET | .NET 官方 ORM |

### FastAPI 中的 ORM 使用（以 SQLAlchemy 为例）

#### ORM 使用流程

```
1. 安装依赖 → 2. 创建数据库引擎 → 3. 定义模型类 → 4. 创建表 → 5. CRUD 操作
```

#### 安装依赖

```bash
pip install sqlalchemy
pip install aiomysql  # 如果使用 MySQL
pip install psycopg2-binary  # 如果使用 PostgreSQL
```

#### 创建数据库引擎

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 数据库连接字符串格式：mysql+pymysql://用户名:密码@主机:端口/数据库名
DATABASE_URL = "mysql+pymysql://root:password@localhost:3306/fastapi_db"

# 创建数据库引擎
engine = create_engine(DATABASE_URL)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类
Base = declarative_base()

# 获取数据库会话的依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### 定义模型类

```python
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    description = Column(String(300))
    price = Column(Float, nullable=False)
    tax = Column(Float)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(100), nullable=False)
    is_active = Column(Integer, default=1)
```

#### 创建数据库表

```python
# 创建所有表
Base.metadata.create_all(bind=engine)

# 或只创建特定表
Item.__table__.create(bind=engine)
```

#### 在路由中使用 ORM

```python
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

app = FastAPI()

@app.get("/items/")
def get_items(db: Session = Depends(get_db)):
    items = db.query(Item).all()
    return items

@app.get("/items/{item_id}")
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        return {"error": "Item not found"}
    return item
```

### ORM 查询操作

#### 基础查询

```python
# 获取所有记录
items = db.query(Item).all()

# 获取第一条记录
item = db.query(Item).first()

# 根据主键获取
item = db.query(Item).get(1)

# 限制数量
items = db.query(Item).limit(10).all()

# 排序
items = db.query(Item).order_by(Item.price).all()
items = db.query(Item).order_by(Item.price.desc()).all()  # 降序
```

#### 条件查询

```python
from sqlalchemy import and_, or_, not_

# 等于
items = db.query(Item).filter(Item.name == "手机").all()

# 不等于
items = db.query(Item).filter(Item.price != 0).all()

# 大于、小于
items = db.query(Item).filter(Item.price > 100).all()
items = db.query(Item).filter(Item.price < 1000).all()

# 大于等于、小于等于
items = db.query(Item).filter(Item.price >= 100).all()
items = db.query(Item).filter(Item.price <= 1000).all()

# IN 查询
items = db.query(Item).filter(Item.name.in_(["手机", "电脑"])).all()

# NOT IN 查询
items = db.query(Item).filter(~Item.name.in_(["手机", "电脑"])).all()

# IS NULL
items = db.query(Item).filter(Item.description == None).all()

# IS NOT NULL
items = db.query(Item).filter(Item.description != None).all()

# AND 条件
items = db.query(Item).filter(and_(Item.price > 100, Item.price < 1000)).all()

# OR 条件
items = db.query(Item).filter(or_(Item.name == "手机", Item.name == "电脑")).all()

# NOT 条件
items = db.query(Item).filter(not_(Item.price == 0)).all()
```

#### 模糊查询

```python
from sqlalchemy import like, ilike

# LIKE（区分大小写）
items = db.query(Item).filter(Item.name.like("%手机%")).all()  # 包含"手机"
items = db.query(Item).filter(Item.name.like("手机%")).all()   # 以"手机"开头
items = db.query(Item).filter(Item.name.like("%手机")).all()   # 以"手机"结尾

# ILIKE（不区分大小写）
items = db.query(Item).filter(Item.name.ilike("%PHONE%")).all()
```

#### 聚合查询

```python
from sqlalchemy import func

# COUNT（计数）
count = db.query(func.count(Item.id)).scalar()
count = db.query(Item).count()

# SUM（求和）
total_price = db.query(func.sum(Item.price)).scalar()

# AVG（平均值）
avg_price = db.query(func.avg(Item.price)).scalar()

# MAX（最大值）
max_price = db.query(func.max(Item.price)).scalar()

# MIN（最小值）
min_price = db.query(func.min(Item.price)).scalar()

# GROUP BY（分组）
from sqlalchemy import GroupBy
results = db.query(Item.name, func.count(Item.id)).group_by(Item.name).all()

# HAVING（分组过滤）
results = db.query(Item.name, func.count(Item.id)).group_by(Item.name).having(func.count(Item.id) > 1).all()
```

#### 分页查询

```python
from sqlalchemy import desc

def get_items(page: int = 1, page_size: int = 10, db: Session = Depends(get_db)):
    # 计算偏移量
    offset = (page - 1) * page_size

    # 查询总数
    total = db.query(Item).count()

    # 分页查询
    items = db.query(Item).order_by(desc(Item.id)).offset(offset).limit(page_size).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }
```

#### ORM 获取数据总结

```python
# 基本查询
db.query(Model).all()           # 获取所有
db.query(Model).first()         # 获取第一条
db.query(Model).get(id)         # 根据主键获取

# 条件过滤
db.query(Model).filter(Model.field == value).all()
db.query(Model).filter_by(field=value).all()  # 简化写法

# 排序
db.query(Model).order_by(Model.field).all()
db.query(Model).order_by(Model.field.desc()).all()

# 限制数量
db.query(Model).limit(10).all()

# 聚合
db.query(func.count(Model.id)).scalar()
db.query(func.sum(Model.field)).scalar()
```

### ORM 新增操作

```python
# 方式一：创建对象后添加
new_item = Item(name="新商品", price=99.99)
db.add(new_item)
db.commit()
db.refresh(new_item)  # 刷新以获取生成的 ID

# 方式二：直接添加
db.add(Item(name="新商品", price=99.99))
db.commit()

# 批量添加
items = [
    Item(name="商品1", price=99.99),
    Item(name="商品2", price=199.99),
    Item(name="商品3", price=299.99)
]
db.add_all(items)
db.commit()
```

### ORM 更新操作

```python
# 方式一：先查询后更新
item = db.query(Item).filter(Item.id == 1).first()
if item:
    item.name = "更新后的名称"
    item.price = 199.99
    db.commit()
    db.refresh(item)

# 方式二：批量更新
db.query(Item).filter(Item.price < 100).update({"price": 100})
db.commit()

# 方式三：使用 update()
db.query(Item).filter(Item.id == 1).update({
    Item.name: "新名称",
    Item.price: 99.99
})
db.commit()
```

### ORM 删除操作

```python
# 方式一：先查询后删除
item = db.query(Item).filter(Item.id == 1).first()
if item:
    db.delete(item)
    db.commit()

# 方式二：批量删除
db.query(Item).filter(Item.price == 0).delete()
db.commit()

# 方式三：使用 delete()
db.query(Item).filter(Item.id == 1).delete()
db.commit()
```

### ORM 使用注意事项

1. **提交事务**：增删改操作后必须调用 `commit()` 提交事务
2. **刷新对象**：新增后使用 `refresh()` 获取生成的 ID
3. **关闭会话**：使用 `finally` 确保会话被关闭
4. **防止 SQL 注入**：使用 ORM 参数化查询，避免字符串拼接
5. **批量操作**：大量数据使用 `bulk_insert_mappings()` 或 `bulk_update_mappings()` 提高性能