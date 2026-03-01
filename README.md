# NexusChat

NexusChat 是一个面向 AI 思考与创作流程的工作台项目。当前仓库提供 **统一开发环境** 的 Node.js MVP 初始化，目标是让不同开发机使用同样步骤得到同样结果。

## 技术栈

- Node.js `20.11.1`（见 `.nvmrc`）
- npm `10.2.4`（见 `packageManager`）
- 原生 `http` 服务（零运行时第三方依赖）
- Node 内置测试框架（`node:test`）
- 内置 lint + format 脚本（统一代码风格与静态检查）

## 目录结构

```text
.
├── .githooks/               # pre-commit / pre-push hooks
├── docs/                    # 架构与 API 文档
├── scripts/                 # 启动/测试/检查/初始化脚本
├── src/                     # 主代码
├── tests/                   # 测试目录
├── .editorconfig
├── .gitignore
├── .nvmrc
├── LICENSE
├── package-lock.json
├── package.json
└── README.md
```

## 安装（统一流程）

```bash
# 1) 使用固定 Node 版本
nvm use || nvm install

# 2) 固定依赖安装（使用 lock 文件）
npm ci

# 3) （可选）启用 Git hooks
./scripts/setup-githooks.sh
```

## 启动方式

```bash
npm run dev
```

默认监听 `http://localhost:3000`。

可选：指定端口

```bash
PORT=4000 npm run dev
```

## 质量命令

```bash
npm run format:check
npm run lint
npm test
npm run check
```

`npm run check` 会串行执行：格式检查 + 静态检查 + 测试。

## 健康检查

```bash
curl http://localhost:3000/health
```

预期输出：

```json
{"status":"ok"}
```

## 部署方式（基础）

### Docker（推荐）

```dockerfile
FROM node:20.11.1-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

构建与运行：

```bash
docker build -t nexuschat:bootstrap .
docker run --rm -p 3000:3000 nexuschat:bootstrap
```

### 直接部署到 Linux 主机

```bash
npm ci --omit=dev
PORT=3000 npm run dev
```

可使用 systemd / pm2 托管进程。


## CI/CD 自动化质量闸门

- CI（PR 自动执行）：安装依赖、格式检查、静态检查、测试执行、构建产物。
- CD（仅主分支/Tag）：发布前质量门、发布后健康检查、回滚预案验证。

工作流与说明见：`docs/ci-cd.md`。


## 发布与运维闭环

- 版本号规则：SemVer（`MAJOR.MINOR.PATCH`）
- 变更日志：`CHANGELOG.md`
- 错误监控：结构化日志 + `scripts/alert-check.sh`
- 回滚机制：`scripts/rollback.sh <version-tag>`

详细说明见：`docs/release-ops.md`。


## 测试策略（最小测试金字塔）

- 单元测试：`npm run test:unit`
- 集成测试：`npm run test:integration`
- 冒烟测试：`npm run test:smoke`
- 全量回归：`npm run test:all`

执行要求：

- 每次提交至少跑：`npm run lint` + `npm run test:unit`
- 合并前至少跑：`npm run test:all`（或核心回归集）

详情见：`docs/testing-strategy.md`。


## 迭代流程与任务验收

为保证持续推进不跑偏，按以下节奏执行：

1. 需求澄清（输入/输出/边界）
2. 拆任务（每项 0.5~2 天）
3. 定义验收标准（可测试）
4. 开发 + 自测
5. PR 评审 + 合并
6. 发布记录（changelog）

流程细则与证据要求见：`docs/iteration-workflow.md`。


## Definition of Done (DoD)

每个功能/任务在合并前必须满足以下 5 项（可在 PR 模板中逐项勾选）：

- [ ] 代码实现完成
- [ ] 单元测试通过
- [ ] 接口/行为文档更新
- [ ] 日志与错误处理到位
- [ ] 代码评审通过

详细规范见：`docs/dod.md`。
