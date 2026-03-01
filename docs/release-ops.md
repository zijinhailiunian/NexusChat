# 发布与运维闭环（Release & Operations Loop）

目标：不仅能开发，还能持续稳定运行；线上异常可定位、可回滚、可复盘。

## 1) 版本号规则（SemVer）

采用 `MAJOR.MINOR.PATCH`：

- MAJOR：不兼容变更
- MINOR：向后兼容的新功能
- PATCH：向后兼容的问题修复

建议使用：

```bash
./scripts/release.sh 0.5.0
```

该脚本会校验 SemVer 格式并更新 `package.json` 版本。

## 2) 变更日志（Changelog）

- 使用 `CHANGELOG.md` 记录每次变更。
- 至少包含：`Added / Changed / Fixed`。
- 每个发布版本应从 `Unreleased` 收敛为带日期的版本小节。

## 3) 错误监控（日志 + 告警）

- 服务日志采用结构化 JSON 输出（包含 `ts/level/message`）。
- 关键错误事件：`request_error`、`server_error`。
- 告警检查脚本：

```bash
bash scripts/alert-check.sh /tmp/nexuschat-health-check.log
```

当错误数达到阈值（默认 `ERROR_THRESHOLD=1`）时脚本返回非 0，可接入告警通道。

## 4) 回滚机制（上一版本一键回退）

- 回滚执行脚本：

```bash
bash scripts/rollback.sh v0.4.0
```

- 回滚后自动执行：健康检查 + 告警检查。
- 发布管线中保留 `scripts/rollback-verify.sh`，确保回滚预案步骤可执行。

## 5) 复盘（Postmortem）

每次线上异常建议记录：

- 影响范围与时间窗
- 触发条件与根因
- 发现方式（监控/告警/人工）
- 处置步骤（含回滚）
- 后续改进项与负责人
