# NexusChat

NexusChat 是一个 **AI 思考与创作 IDE（IDE for Thinking）**：不是“带侧边栏的聊天软件”，而是一个能无限发散、最终又能完美收敛的「可编辑知识工作台」。

当前仓库已实现**前端 MVP**（无需后端即可使用，BYO API Key），核心能力：

- **主线 Chat**：流式回答，主线本身就是一篇可编辑草稿。
- **语义化划词菜单**：划选文字时按内容类型（代码 / 术语 / 句子）给出不同动作。
- **递归释疑抽屉**：划词在右侧滑出抽屉深钻，可层层嵌套并带面包屑导航。
- **富文本可编辑气泡**：双击任意气泡用 Tiptap 进入富文本编辑。
- **向上融合**：把抽屉里的分支灵感以「扩展 / 替换 / 子段插入」三种策略合并回主线。
- **生成依据溯源（Prompt Trace）**：查看某段内容的融合来源与编辑历史。
- **全局图谱视野**：一键把主线 + 抽屉分支转成知识结构图（React Flow）。

## 快速开始（前端）

```bash
cd apps/web
npm install
npm run dev   # http://localhost:5173
```

打开后点击右上角 **⚙️ 设置** 填入模型 API Key：
- **Anthropic（推荐）**：默认模型 `claude-3-5-sonnet-latest`。
- **OpenAI 兼容**：可填 OpenAI / DeepSeek 等的 Base URL 与模型名（如 DeepSeek `https://api.deepseek.com/v1` + `deepseek-chat`）。

Key 仅保存在浏览器 localStorage，请求由前端直连模型服务，不经过任何中间服务器。

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

## 完整开发环境（含后端，预留）

> 后端目前仅有健康检查等占位接口，下面是面向后续后端化的完整启动方式。

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
- 后端化：把对话/分支 DAG 持久化到 PostgreSQL，并提供 `/api/v1/chat` 流式代理（避免前端暴露 Key）。
- 接入 pgvector 检索 Pipeline 与全局知识记忆。
- 富文本编辑增强：表格、图片、Slash 命令。
- 专注模式（Focus Mode）与键盘快捷键。
