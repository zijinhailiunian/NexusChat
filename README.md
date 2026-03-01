# NexusChat

NexusChat 是一个面向 Agent/知识图谱场景的协作平台。当前仓库已完成 **MVP 工程初始化**，采用前后端分层与可演进的存储设计。

## 技术栈决策

### 前端：React + TypeScript + React Flow
- 选择 React 的核心原因：DAG / Graph 编辑生态成熟（React Flow、AntV X6 均优先支持 React 生态）。
- MVP 先集成 React Flow 作为可视化图谱基础组件，后续可按场景引入 X6。

### 后端/AI 层：Python FastAPI
- 面向 AI Agent、向量检索、图谱推理等能力时，Python 生态（LangChain/LlamaIndex/各类模型 SDK）更灵活。
- FastAPI 在异步 IO、类型提示、OpenAPI 自动文档方面适合快速迭代。

### 数据库：PostgreSQL + pgvector（MVP）
- MVP 阶段统一使用 PostgreSQL（含 pgvector 扩展）降低系统复杂度。
- 后续按负载和场景再拆分：
  - 向量检索迁移到 Qdrant/Milvus；
  - 图关系计算迁移到 Neo4j/Memgraph。

## 目录结构

```text
.
├── apps
│   ├── api            # FastAPI + SQLAlchemy + Alembic(预留)
│   └── web            # React + Vite + React Flow
├── infra
│   └── docker-compose.yml
├── scripts
│   └── bootstrap.sh   # 一键初始化本地开发环境
└── docs
    └── architecture.md
```

## 快速开始

### 1) 启动基础设施（PostgreSQL + pgvector）

```bash
docker compose -f infra/docker-compose.yml up -d
```

### 2) 启动后端 API

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3) 启动前端 Web

```bash
cd apps/web
npm install
npm run dev
```

### 4) 访问
- Web: http://localhost:5173
- API Health: http://localhost:8000/healthz
- API Docs: http://localhost:8000/docs

## 下一步建议
- 增加 Alembic 迁移与用户/会话/节点/边等核心表。
- 接入 pgvector 检索 Pipeline。
- 在前端 Graph View 中加入节点执行状态与边数据流可视化。
