# 架构说明（MVP Bootstrap）

## 目标
让空仓库在最短时间内进入“可启动、可测试、可扩展”，并且在不同开发机保持一致结果。

## 当前分层
- `src/index.js`: 进程入口，负责启动 HTTP 服务。
- `src/server.js`: 应用层（路由 + 响应）与启动函数。
- `tests/unit/` 与 `tests/integration/`: 使用 Node 内置测试框架验证核心逻辑与模块协作。
- `scripts/`: 自动化脚本（启动、测试、检查、hooks 初始化）。

## 工程一致性策略
- 固定 Node 版本：`.nvmrc` (`20.11.1`)。
- 固定 npm 与依赖解析结果：`packageManager` + `package-lock.json` + `npm ci`。
- 固定代码风格与基础静态检查：`scripts/format.js` + `scripts/lint.js`。
- 固定提交前质量门禁（可选启用）：`.githooks/pre-commit`、`.githooks/pre-push`。

## 运行时
- Node.js（默认端口：`3000`，可通过 `PORT` 覆盖）

## 下一步建议
1. 增加 `POST /chat` 接口和请求体校验。
2. 引入配置管理（`.env.example` + schema 校验）。
3. 按模块拆分 `services/`、`adapters/`、`domain/`。


## 日志与错误处理
- 每次请求记录一条结构化日志事件：`request_received`（含 `method`、`url`）。
- 请求处理异常时记录 `request_error` 并返回 `500`。
- 服务级异常通过 `server.on('error')` 记录 `server_error`。


## 测试分层
- 单元测试：`tests/unit/`，验证核心逻辑。
- 集成测试：`tests/integration/`，验证模块协作。
- 冒烟测试：`scripts/smoke.sh`，验证启动与核心路径。


## 运维可观测性
- 结构化日志字段：`ts`、`level`、`message` 及请求上下文。
- 错误事件：`request_error`、`server_error`。
- 告警脚本：`scripts/alert-check.sh` 可用于阈值检测。
