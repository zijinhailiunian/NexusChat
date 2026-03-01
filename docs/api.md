# API 文档（MVP）

## `GET /health`

- 说明：服务健康检查。
- 成功响应：`200`

```json
{ "status": "ok" }
```

## `GET /`

- 说明：启动确认与服务标识。
- 成功响应：`200`

```json
{
  "service": "NexusChat",
  "message": "NexusChat bootstrap server is running."
}
```

## 其他路径

- 响应：`404`

```json
{ "error": "Not Found" }
```

## 通用错误

- 响应：`500`

```json
{ "error": "Internal Server Error" }
```
