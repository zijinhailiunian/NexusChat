# 测试策略（先有最小，再逐步扩展）

目标：防止“能跑但不可靠”。

## 最小测试金字塔

1. 单元测试（核心逻辑）
   - 目标：验证纯逻辑、边界分支与返回值。
   - 当前覆盖：`resolveRoute` 路由决策逻辑。
   - 命令：`npm run test:unit`

2. 集成测试（模块协作）
   - 目标：验证 HTTP 服务、路由处理、响应结构与日志行为。
   - 当前覆盖：`createServer` + `http` 请求往返。
   - 命令：`npm run test:integration`

3. 冒烟测试（启动 + 核心路径）
   - 目标：验证应用真实启动并可访问核心路径。
   - 当前覆盖：启动入口 + `/health` + `/`。
   - 命令：`npm run test:smoke`

## 执行策略

- 每次提交至少执行：`lint + 单测`
  - 通过 `pre-commit` 强制执行：`npm run lint` + `npm run test:unit`
- 合并前至少执行：全量测试或核心回归集
  - 通过 `pre-push` 执行：`npm run test:all`
  - CI 建议执行：`npm run check`

## 命令映射

- 快速反馈：`npm run test:unit`
- 模块协作：`npm run test:integration`
- 启动冒烟：`npm run test:smoke`
- 合并前回归：`npm run test:all`
- 质量总入口：`npm run check`
