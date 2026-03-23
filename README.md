# Redmine Pro

基于 `Wails + Go + React + TypeScript` 的跨平台 Redmine 桌面端工具，目标是替代公司当前老旧的 Redmine Web 使用体验，重点解决以下问题：

- 问题列表与详情处理效率低
- 人员、项目、版本筛选不便
- 工时登记与回看效率低
- 项目、版本、人员维度统计能力弱
- 原版界面陈旧，不适合高频研发使用

本项目运行在本地桌面端，直接访问公司 Redmine REST API，不依赖独立业务后端。

## 当前定位

当前仓库不是纯脚手架，而是已经进入可持续迭代开发阶段。

已具备的基础能力：

- Wails 桌面应用基线
- React + TypeScript 前端基线
- Tailwind CSS + shadcn/ui + Base UI
- TanStack Query + Zustand
- Redmine 基础 API 接入
- 单仓库 Git 结构与项目文档体系

当前已接入的 Redmine 能力：

- 获取当前用户
- 获取问题状态列表
- 获取“指派给我”的问题列表
- 获取问题详情
- 获取项目成员
- 更新问题状态
- 指派问题给其他成员

## 技术栈

### 桌面端

- `Wails v2`
- `Go 1.23`

### 前端

- `React 18`
- `TypeScript`
- `Vite`
- `Tailwind CSS`
- `shadcn/ui`
- `Base UI`
- `TanStack Query`
- `Zustand`

### 设计系统

- 风格基线：`The Monolith`
- 暗色主题：`Graphite Dark`
- 亮色主题：`Linear Light`
- 主题模式：`明 / 暗 / 跟随系统`
- 设计稿来源：`ui/stitch_1.html` 到 `ui/stitch_7.html`

## 文档导航

开发前建议先看这几份文档：

- [全功能需求清单](./docs/redmine-pro-full-requirements.md)
- [开发与架构主规划文档](./docs/development-plan.md)
- [项目协作约束](./AGENTS.md)

三份文档的职责：

- `redmine-pro-full-requirements.md`：定义做什么
- `development-plan.md`：定义先做什么、怎么做、做到什么算完成
- `AGENTS.md`：定义语言、注释、文档、UI、开发流程约束

## 环境要求

- `Go 1.23+`
- `Node.js 18+`
- `npm 9+`
- 已安装 `Wails CLI`

如果本机未安装 Wails CLI，可参考 Wails 官方文档安装。

## 快速开始

### 1. 安装前端依赖

```bash
cd frontend
npm install
```

### 2. 启动开发环境

在项目根目录执行：

```bash
wails dev
```

### 3. 单独调试前端

如果只需要调试前端界面：

```bash
cd frontend
npm run dev
```

## 常用命令

### 启动桌面开发模式

```bash
wails dev
```

### 构建桌面应用

```bash
wails build
```

### 校验 Go 构建

```bash
go build ./...
```

### 校验前端构建

```bash
cd frontend
npm run build
```

## 目录结构

```text
redmine-pro/
├─ AGENTS.md
├─ README.md
├─ app.go
├─ app_redmine.go
├─ app_types.go
├─ main.go
├─ wails.json
├─ docs/
│  ├─ development-plan.md
│  └─ redmine-pro-full-requirements.md
├─ internal/
│  ├─ redmine/
│  │  ├─ client.go
│  │  ├─ helpers.go
│  │  ├─ issues.go
│  │  ├─ memberships.go
│  │  ├─ metadata.go
│  │  └─ types.go
│  └─ shared/
│     └─ paging.go
├─ frontend/
│  ├─ src/
│  │  ├─ app/
│  │  ├─ components/
│  │  ├─ features/
│  │  ├─ layouts/
│  │  ├─ lib/
│  │  ├─ services/
│  │  ├─ stores/
│  │  └─ types/
│  └─ ...
└─ ui/
   ├─ stitch_1.html
   ├─ stitch_2.html
   ├─ stitch_3.html
   ├─ stitch_4.html
   ├─ stitch_5.html
   ├─ stitch_6.html
   └─ stitch_7.html
```

目录说明：

- `app.go`：当前 Wails 生命周期与绑定入口
- `app_redmine.go`：Wails 暴露方法与前后端 DTO 映射
- `app_types.go`：前端消费的稳定 DTO 定义
- `internal/redmine`：Redmine API 客户端、模型与业务访问层
- `internal/shared`：跨业务域复用的通用工具
- `frontend/src/services`：前端对 Wails 绑定的调用封装
- `frontend/src/stores`：本地状态与偏好存储
- `ui/`：Stitch 导出的设计稿源文件
- `docs/`：需求、规划、迭代主文档

## 当前开发状态

当前阶段以 `docs/development-plan.md` 为准。

已完成：

- 工程初始化
- 需求文档
- 开发规划文档
- 项目协作规范文档
- 基础 Redmine API 接入
- Go 后端按领域完成首轮拆分
- 前端完成 `app / layouts / features` 首轮结构整理

未完成的核心模块：

- 路由骨架与完整 Stitch 应用壳层
- 连接页
- 工作台
- 完整任务中心
- 工时日志
- 项目与版本管理
- 研发组长统计看板
- 设置页与主题切换入口

## 开发约定

开始开发前，请遵循以下规则：

- 默认使用简体中文进行对话、文档编写和代码注释
- 代码中需要的地方补充详细中文注释
- 前端不直接请求 Redmine HTTP API，统一通过 Wails Go 侧处理
- 开发完成后，更新 `docs/development-plan.md` 的勾选状态
- UI 必须严格参考 `ui/stitch_1.html` 到 `ui/stitch_7.html`

## 后续建议

建议按以下顺序继续推进：

1. 完成 `Phase 0`：路由、主题 Token、应用壳层、字体与图标统一
2. 完成 `Phase 1`：连接页、实例配置、API Key 安全存储
3. 完成 `Phase 2`：工作台
4. 完成 `Phase 3`：任务中心替换当前临时页面
