---
title: FastAPI 基础
date: 2026-01-19
tags: [后端, FastAPI]
description: FastAPI 基础入门教程，涵盖最简单的接口创建、请求参数处理（路径参数、查询参数、请求体）、响应类型设置等核心功能
---

## 一、示例

### 最简单的 FastAPI 接口

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}
```

**启动服务：**
```bash
uvicorn main:app --reload
```

---

## 二、Request（请求参数）

### 1. 路径参数

路径参数通过 URL 路径传递，在函数参数中直接定义即可。

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/{item_id}")
def read_item(item_id):
    return {"item_id": item_id}
```

### 路径参数 - 类型注解 Path

使用 `Path` 进行类型注解和参数约束：

```python
from fastapi import FastAPI, Path

app = FastAPI()

@app.get("/items/{item_id}")
def read_item(
    item_id: int = Path(..., title="物品ID", ge=1, le=100),
    description: str = "物品描述"
):
    return {"item_id": item_id}
```

**常用参数：**
- `ge` (greater than or equal) - 大于等于
- `le` (less than or equal) - 小于等于
- `gt` (greater than) - 大于
- `lt` (less than) - 小于
- `title` - 参数标题
- `description` - 参数描述

---

### 2. 查询参数

查询参数通过 URL 的 query string 传递（`?key=value`），在函数参数中定义即可。

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/")
def read_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}
```

**示例请求：**
```
GET /items/?skip=0&limit=10
```

### 查询参数 - 类型注解 Query

使用 `Query` 进行类型注解和参数约束，用法与 `Path` 一样：

```python
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items/")
def read_items(
    q: str = Query(None, min_length=3, max_length=50),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100)
):
    return {"q": q, "skip": skip, "limit": limit}
```

---

## 三、请求体参数

请求体参数通过 HTTP 请求体传递，通常使用 JSON 格式，需要定义 Pydantic 模型。

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    description: str = None
    price: float
    tax: float = None

@app.post("/items/")
def create_item(item: Item):
    return item
```

### 示例

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    description: str = None
    price: float
    tax: float = None

@app.post("/items/")
async def create_item(item: Item):
    """
    创建物品
    """
    item_dict = item.dict()
    if item.tax:
        price_with_tax = item.price + item.tax
        item_dict.update({"price_with_tax": price_with_tax})
    return item_dict
```

**示例请求：**
```json
POST /items/
{
    "name": "商品名称",
    "description": "商品描述",
    "price": 99.99,
    "tax": 10.0
}
```

### 请求体参数 - 类型注解 Field

使用 `Field` 对请求体参数进行约束和验证：

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

class Item(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    description: str = Field(None, max_length=300)
    price: float = Field(..., gt=0, description="价格必须大于0")
    tax: float = Field(None, ge=0)

    class Config:
        schema_extra = {
            "example": {
                "name": "商品名称",
                "description": "商品描述",
                "price": 99.99,
                "tax": 10.0
            }
        }

@app.post("/items/")
def create_item(item: Item):
    return item
```

---

## 四、请求与响应

### HTTP 请求流程

```
客户端请求 → FastAPI 路由匹配 → 参数解析 → 业务处理 → 返回响应 → 客户端接收
```

---

## 五、Response（响应）

### FastAPI 内置响应类型

FastAPI 默认响应类型是 `JSONResponse`。如果需要返回非 JSON 数据（如 HTML、文件流），FastAPI 提供了丰富的响应类型：

| 响应类型 | 说明 |
|---------|------|
| `JSONResponse` | JSON 格式响应（默认） |
| `HTMLResponse` | HTML 格式响应 |
| `PlainTextResponse` | 纯文本响应 |
| `RedirectResponse` | 重定向响应 |
| `StreamingResponse` | 流式响应（文件下载） |
| `FileResponse` | 文件响应 |
| `ORJSONResponse` | 高性能 JSON 响应 |

### 响应类型设置

```python
from fastapi import FastAPI
from fastapi.responses import JSONResponse, HTMLResponse

app = FastAPI()

@app.get("/json")
def get_json():
    return JSONResponse(content={"message": "Hello"})

@app.get("/html", response_class=HTMLResponse)
def get_html():
    return "<h1>Hello, World!</h1>"
```

### 示例：响应 HTML 格式

```python
from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/", response_class=HTMLResponse)
async def read_root():
    html_content = """
    <html>
        <head>
            <title>FastAPI</title>
        </head>
        <body>
            <h1>Hello, FastAPI!</h1>
        </body>
    </html>
    """
    return html_content
```

### 示例：响应文件格式

```python
from fastapi import FastAPI
from fastapi.responses import FileResponse

app = FastAPI()

@app.get("/download")
async def download_file():
    return FileResponse(
        path="file.pdf",
        filename="download.pdf",
        media_type="application/pdf"
    )
```

### 自定义响应（自己写个类）

```python
from fastapi import FastAPI, Response
from fastapi.responses import JSONResponse

app = FastAPI()

class CustomResponse(JSONResponse):
    def render(self, content):
        # 自定义响应头
        self.headers["X-Custom-Header"] = "CustomValue"
        return super().render(content)

@app.get("/custom", response_class=CustomResponse)
def get_custom():
    return {"message": "Custom Response"}
```

### 异常处理

使用 `HTTPException` 抛出异常响应：

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

items = {"foo": "The Foo Wrestlers"}

@app.get("/items/{item_id}")
def read_item(item_id: str):
    if item_id not in items:
        raise HTTPException(
            status_code=404,
            detail="Item not found",
            headers={"X-Error": "There goes my error"}
        )
    return {"item": items[item_id]}
```

**自定义异常处理器：**

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

class UnicornException(Exception):
    def __init__(self, name: str):
        self.name = name

@app.exception_handler(UnicornException)
async def unicorn_exception_handler(request: Request, exc: UnicornException):
    return JSONResponse(
        status_code=418,
        content={"message": f"Oops! {exc.name} did something. There goes a rainbow..."}
    )

@app.get("/unicorns/{name}")
def read_unicorn(name: str):
    if name == "yolo":
        raise UnicornException(name=name)
    return {"unicorn_name": name}
```