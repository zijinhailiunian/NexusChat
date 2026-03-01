# CI/CD 流程（自动化质量闸门）

目标：让“可用性检查”自动执行，并对任意 PR 自动给出“是否可合并”结论。

## CI（Pull Request 质量闸门）

工作流文件：`.github/workflows/ci.yml`

每次 PR 自动执行：

1. 安装依赖：`npm ci`
2. 代码格式检查：`npm run format:check`
3. 静态检查：`npm run lint`
4. 测试执行：`npm run test:all`
5. 构建产物：`npm pack`（并上传 `.tgz`）

通过以上步骤，PR 会得到明确的“可合并 / 不可合并”结论。

## CD（主分支/Tag 发布）

工作流文件：`.github/workflows/cd.yml`

触发条件：

- 仅 `main` 分支 push
- 或版本 tag（`v*`）push

发布流程：

1. 依赖安装：`npm ci`
2. 发布前质量门：`npm run check`
3. 构建产物：`npm pack`
4. 发布后健康检查验证：`scripts/health-check.sh`
5. 发布后告警检查：`scripts/alert-check.sh`
6. 回滚预案验证：`scripts/rollback-verify.sh`

## 本地对齐命令

在本地可用以下命令模拟 CI 关键步骤：

```bash
npm ci
npm run format:check
npm run lint
npm run test:all
npm pack
```


发布与运维闭环规范见：`docs/release-ops.md`。
