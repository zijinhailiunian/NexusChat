# NexusChat MVP Architecture

## 1. Why this setup

- **React + React Flow**：优先满足 Graph/DAG 可视化与交互能力。
- **FastAPI + Python**：优先满足 AI Agent 与知识处理能力扩展。
- **PostgreSQL + pgvector**：先用一个数据库承载关系数据与向量检索，降低 MVP 运维复杂度。

## 2. Service boundaries

- `apps/web`: 用户交互层，包含 Chat、Graph View、工作流配置页面。
- `apps/api`: 业务与 AI 编排层，提供 REST API（后续可加 WebSocket）。
- `infra`: 运行时基础设施（数据库、缓存、消息队列等）。

## 3. Data evolution plan

1. **Phase MVP**: PostgreSQL + pgvector
2. **Phase Scale**:
   - 向量检索高吞吐后拆分到 Qdrant/Milvus
   - 图关系算法复杂后拆分到 Neo4j/Memgraph

## 4. API conventions

- `/healthz`: 运行健康检查
- `/api/v1/graph/*`: 图谱与工作流相关接口（预留）
- `/api/v1/chat/*`: 会话与 Agent 交互接口（预留）
