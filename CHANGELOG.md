# Changelog

All notable changes to this project will be documented in this file.

The format is inspired by Keep a Changelog.

## [Unreleased]

### Added
- 新增发布与运维闭环文档 `docs/release-ops.md`（SemVer / Changelog / 监控告警 / 回滚 / 复盘）。
- 新增运维脚本：`scripts/alert-check.sh`、`scripts/release.sh`、`scripts/rollback.sh`。
- 新增 CI/CD 文档与 GitHub Actions 工作流（CI + CD）。
- 新增发布后健康检查脚本 `scripts/health-check.sh` 与回滚预案验证脚本 `scripts/rollback-verify.sh`。
- 新增测试策略文档 `docs/testing-strategy.md`，定义单元/集成/冒烟三层最小测试金字塔。
- 新增 `tests/unit/server.unit.test.js`（核心路由逻辑单测）。
- 新增 `tests/integration/server.integration.test.js`（HTTP 集成测试）。
- 新增 `scripts/smoke.sh`（启动 + 核心路径冒烟测试）。

### Changed
- 服务日志升级为结构化 JSON 事件，便于线上异常定位与检索。
- CD 流程新增发布后告警检查步骤。
- `package.json` 脚本升级为 `test:unit` / `test:integration` / `test:smoke` / `test:all`。
- `pre-commit` 强制执行 `lint + test:unit`，`pre-push` 执行 `test:all`。
- README 增加测试策略与提交/合并前测试要求。

### Fixed
- 将“每次提交至少 lint + 单测；合并前跑全量/回归”落实为可执行命令与 hooks 约束。
- 明确测试金字塔与提交/合并前测试门禁在 PR 模板与 DoD 中均可勾选验证。

