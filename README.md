# Redmine Pro (Wails)

基于 `Wails + Go + React + TypeScript` 的 Redmine 桌面端项目骨架。

## 当前前端栈

- React + TypeScript
- Tailwind CSS
- shadcn/ui（Base UI）
- TanStack Query
- Zustand

## 开发运行

在项目根目录执行：

```bash
wails dev
```

如果只想单独调试前端：

```bash
cd frontend
npm install
npm run dev
```

## 生产构建

在项目根目录执行：

```bash
wails build
```

## 已完成基础能力

- Wails + React 项目初始化
- shadcn/base 组件初始化（button/card/input/badge/select/separator）
- Zustand 本地持久化配置（Redmine 地址、API Key、筛选状态）
- TanStack Query 数据查询骨架
- “我的问题 + 统计”示例页面（当前为 mock 数据）
