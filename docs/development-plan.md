# Redmine Pro 开发与架构主规划文档

更新时间：2026-03-23

## 1. 文档定位

本文档是 `redmine-pro` 的开发主控文档，用于统一以下内容：

- 固定技术选型
- 固定 UI 风格与设计约束
- 前后端架构边界
- 模块拆分与开发顺序
- 每轮 AI 开发后的状态更新方式

本文件与 [redmine-pro-full-requirements.md](./redmine-pro-full-requirements.md) 的关系如下：

- `redmine-pro-full-requirements.md`：定义“做什么”
- `development-plan.md`：定义“怎么做、先做什么、做到什么算完成”

后续 AI 或人工开发必须同时遵循这两份文档。

## 2. 开发原则

本项目开发遵循以下原则：

- `KISS`：优先直接、稳定、可维护的实现，不引入不必要的中间层
- `YAGNI`：只实现当前阶段明确需要的能力，不为未来假想需求过度设计
- `DRY`：公共布局、字段渲染、筛选器、状态标签、表单动作必须组件化复用
- `SOLID`：前端按模块分层，Go 端按 API 域拆分，避免单文件持续膨胀

## 3. 当前代码基线

截至 2026-03-23，仓库内已有以下基础：

- [x] Wails 项目已初始化
- [x] 前端已接入 `React + TypeScript + Tailwind CSS + shadcn/ui + Base UI + TanStack Query + Zustand`
- [x] 已建立单一 Git 仓库，忽略规则已整理
- [x] Go 侧已具备基础 Redmine API 封装
- [x] 已实现的 Go 接口包括：
- `GetCurrentUser`
- `GetIssueStatuses`
- `GetMyIssues`
- `GetIssueDetail`
- `GetProjectMembers`
- `UpdateIssueStatus`
- `AssignIssue`
- [x] 前端已接入基础状态存储与 Wails 绑定调用
- [ ] 还未形成稳定的页面路由体系
- [ ] 还未按 Stitch 稿件完成统一的应用壳层
- [ ] 还未形成完整的任务中心、工时、项目管理、统计看板页面
- [x] Redmine API 访问逻辑已从 `app.go` 拆分到 `internal/redmine`
- [x] 前端已完成 `app / layouts / features` 首轮结构整理
- [ ] 统计与报表聚合逻辑尚未拆分到 `internal/stats`

这意味着后续开发不是从零开始，而是在现有基线上继续推进。

## 4. 固定技术栈

以下技术栈视为本项目的固定决策，后续不再反复比较或切换。

### 4.1 桌面端基础

- 桌面框架：`Wails v2`
- 语言：`Go`
- 目标平台：`Windows`、`macOS`
- 运行模式：本地桌面应用直接访问公司 Redmine，不部署独立业务后端

### 4.2 前端技术栈

- UI 框架：`React 18`
- 语言：`TypeScript`
- 构建工具：`Vite`
- 路由：`react-router-dom`
- 数据请求与缓存：`TanStack Query`
- 全局状态：`Zustand`
- 表单：`react-hook-form`
- 校验：`zod`
- 样式：`Tailwind CSS`
- 基础组件：`shadcn/ui`
- Primitive 层：`Base UI`
- 表格：`TanStack Table`
- 图表：`Recharts`
- 日期处理：`dayjs`
- 命令面板与全局搜索：`cmdk`

### 4.3 图标与字体

- 图标：`Material Symbols Outlined`
- 正文与界面字体：`Inter + PingFang SC`
- 编号、工时、状态栏数字：`JetBrains Mono`

### 4.4 Go 侧技术职责

Go 侧不是业务界面层，而是本地桌面应用的系统服务层，负责：

- 统一访问 Redmine REST API
- 统一处理 API Key 注入与 HTTP 错误
- 本地安全存储敏感配置
- 文件下载、缓存、导出
- 桌面通知、系统能力调用
- 较重的聚合统计计算

建议引入：

- 敏感信息存储：`github.com/99designs/keyring`
- HTTP：标准库 `net/http`
- JSON：标准库 `encoding/json`

### 4.5 明确不采用的方案

- 不使用 `Ant Design`
- 不使用 `Electron`
- 不引入独立 Node/Go Web 服务端
- 不引入 SSR
- 不在前端直接请求 Redmine HTTP API，所有请求统一走 Wails Go 绑定

## 5. UI 风格执行规范

本项目 UI 风格以 `ui/stitch_1.html` 到 `ui/stitch_7.html` 为唯一视觉基准，后续开发必须按该风格实现，不允许自由发挥为另一套后台模板。

### 5.1 风格关键词

- 风格名：`The Monolith`
- 视觉方向：`Graphite Dark`、冷紫强调色、MD3 风格 surface 分层
- 交互特征：高信息密度、低干扰、弱装饰、强状态反馈
- 结构特征：固定侧栏、毛玻璃顶栏、底部状态栏、内容区卡片化

### 5.2 主题模式策略

主题能力是正式需求，不是附属功能，必须支持以下三种模式：

- `dark`：当前 Stitch 稿件对应的 `Graphite Dark / The Monolith`
- `light`：`Linear Light` 风格浅色主题
- `system`：跟随操作系统主题自动切换

约束：

- 三种模式必须保持相同的信息架构、组件结构、间距、字号和交互节奏
- 亮色主题不能另起一套新后台样式，只能在当前暗色风格基础上做颜色映射
- 主题切换只改变颜色系统、阴影强度和边框对比度，不改变页面布局

### 5.3 暗色 Token

暗色主题严格对齐 Stitch 稿件，后续 Tailwind Token 必须与之对齐：

- `background`: `#121315`
- `background-deep`: `#0e0f11`
- `surface-container-lowest`: `#0d0e10`
- `surface-container-low`: `#1b1c1e`
- `surface-container`: `#1f2022`
- `surface-container-high`: `#292a2c`
- `surface-container-highest`: `#343537`
- `outline`: `#908f9e`
- `outline-variant`: `#454652`
- `on-surface`: `#e3e2e4`
- `on-surface-variant`: `#c6c5d5`
- `primary`: `#bdc2ff`
- `primary-container`: `#5e6ad2`
- `secondary`: `#c0c3f2`
- `secondary-container`: `#42466e`
- `tertiary`: `#ffb867`
- `error`: `#ffb4ab`

### 5.4 亮色 Token（Linear Light）

亮色主题保持 `The Monolith` 的结构和密度，仅切换到更接近 Linear 的浅色中性色系统：

- `background`: `#f7f7f8`
- `background-deep`: `#f3f3f5`
- `surface-container-lowest`: `#ffffff`
- `surface-container-low`: `#fafafb`
- `surface-container`: `#f3f3f5`
- `surface-container-high`: `#ececf0`
- `surface-container-highest`: `#e6e6eb`
- `outline`: `#b8b8c2`
- `outline-variant`: `#d9d9e1`
- `on-surface`: `#161618`
- `on-surface-variant`: `#6b6b78`
- `primary`: `#5e6ad2`
- `primary-container`: `#eef1ff`
- `secondary`: `#6b728e`
- `secondary-container`: `#eceef8`
- `tertiary`: `#b76a15`
- `error`: `#d14343`

### 5.5 字体与排版

- 页面主字体统一使用 `Inter + PingFang SC`
- 编号、工时、状态栏计时、百分比优先使用 `JetBrains Mono`
- 正文密度偏高，常用字号以 `12px` 和 `10px` 为主
- 标题层级：
- 页面标题：`text-lg` 到 `text-xl`
- 卡片标题：`text-sm`
- 说明文字：`text-xs`
- 辅助标签：`text-[10px]`

### 5.6 布局硬约束

- 侧边栏宽度固定为 `256px`，即 `w-64`
- 顶栏高度固定为 `56px`，即 `h-14`
- 底部状态栏高度固定为 `32px`，即 `h-8`
- 主内容区默认使用 `p-8`
- 主卡片圆角以 `rounded-xl` 为主
- 按钮和输入框以 `rounded-lg` 或 `rounded-md` 为主
- 顶栏需保留毛玻璃效果：`bg-background/70 + backdrop-blur-xl`

### 5.7 组件风格约束

- 侧栏选中项使用 `bg-surface-container + text-primary + border-r-2 border-primary-container`
- 表格和列表 hover 使用 `surface-container-high`
- 状态标签使用低饱和背景加边框，而不是纯色块
- 暗色模式下输入框和筛选框应保留深色内凹感，不做高亮描边
- 亮色模式下输入框和筛选框保持 Linear 式浅灰容器感，避免纯白大平面
- 暗色与亮色图表都必须使用对应主题的 surface 卡片，图例和刻度文字跟随当前主题的 `on-surface-variant`

### 5.8 明确禁止

- 不允许把亮色模式做成通用白底后台，必须保持 `The Monolith` 结构与层级，仅切换为 Linear 风格配色
- 不允许改成 Ant Design 或 MUI 的默认视觉风格
- 不允许大量使用大圆角、夸张渐变、炫光背景
- 不允许将页面简化成普通 CRUD 表单页而丢失 Stitch 稿件中的层级与氛围
- 不允许因为切换主题而改变布局、字号、组件层级和信息密度

## 6. 页面与路由映射

UI 稿件与目标页面的对应关系固定如下：

| UI 稿件 | 页面模块 | 目标路由 |
| --- | --- | --- |
| `stitch_1.html` | 连接与鉴权 | `/connect` |
| `stitch_2.html` | 工作台 | `/dashboard` |
| `stitch_3.html` | 任务中心 | `/issues` |
| `stitch_4.html` | 研发组长看板 | `/analytics` |
| `stitch_5.html` | 工时日志 | `/time-entries` |
| `stitch_6.html` | 项目与版本管理 | `/projects` |
| `stitch_7.html` | 设置 | `/settings` |

## 7. 架构设计

### 7.1 总体数据流

统一采用以下链路：

`React 页面 -> Query Hook -> Wails JS Bindings -> Go Service -> Redmine REST API`

职责边界：

- 前端负责：页面渲染、交互状态、筛选器、局部 UI 逻辑、轻量格式化
- Go 负责：Redmine API 访问、安全存储、系统通知、文件下载、复杂聚合

### 7.2 前端分层

前端当前采用混合版结构，目录基线如下：

```text
frontend/src/
  app/
    app.tsx
    providers.tsx
  layouts/
    app-shell.tsx
  features/
    issues/
      components/
      hooks/
      pages/
  components/
    ui/
  lib/
  services/
  stores/
  types/
```

说明：

- `features` 作为业务主目录，按页面域拆分
- `components/ui` 放基础 UI 组件
- `services` 放对 Wails 绑定的调用封装
- `stores` 仅保存本地 UI 状态与偏好，不替代服务端数据缓存

### 7.3 Go 侧分层

当前 Go 侧已经完成第一步拆分：

- `app.go`：仅保留 Wails 生命周期与绑定入口
- `app_redmine.go`：承载 Wails 暴露方法与 DTO 映射
- `app_types.go`：承载前端消费的稳定 DTO
- `internal/redmine`：承载 Redmine 客户端、模型与业务访问逻辑
- `internal/shared`：承载跨域可复用的分页等通用工具

后续仍需补齐以下目录：

```text
internal/
  redmine/
    client.go
    issues.go
    projects.go
    versions.go
    memberships.go
    time_entries.go
    metadata.go
  stats/
    issues.go
    time_entries.go
    versions.go
  platform/
    keyring.go
    notify.go
    export.go
  shared/
    paging.go
    timefmt.go
```

演进策略：

- `P0` 期间允许保留 `app.go` 作为最薄的绑定入口
- `internal/redmine` 已完成首轮拆分
- 在进入统计、项目管理和设置模块前，必须继续补齐 `internal/stats` 与 `internal/platform`

### 7.4 数据建模规则

业务字段统一口径如下：

- `指派给`：使用 Redmine 原生 `assigned_to_id`
- `责任人`：仅在实例中已有自定义字段时纳入；否则不额外创造第二套语义
- `原因分类 / 错误类型`：优先映射到 `category` 或列表型 `custom field`
- `功能 / 错误 / 优化`：优先映射到 `tracker`
- `设计 / 测试 / case`：优先映射到 `time entry activity` 或自定义字段
- `版本 / 迭代`：统一映射到 `fixed_version`

### 7.5 安全与本地数据

- API Key 不允许以明文保存在普通 Zustand persist 中
- API Key 统一由 Go 侧持久化到 Keyring 或加密配置文件
- 本地仅保存非敏感设置，例如：
- 最近使用项目
- 最近使用版本
- 默认筛选条件
- 主题和布局偏好
- 报表导出偏好

## 8. 组件与公共能力规划

以下能力必须优先抽象，避免页面越做越散：

- `AppShell`：侧栏、顶栏、状态栏的整体壳层
- `PageHeader`：页面标题、面包屑、搜索框、右侧动作区
- `SearchableSelect`：支持搜索、最近使用、空态的可搜索选择器
- `IssueStatusBadge`：问题状态标签
- `PriorityBadge`：优先级标签
- `TrackerBadge`：跟踪类型标签
- `MetricCard`：工作台和管理看板指标卡片
- `EmptyState` / `ErrorState` / `LoadingState`
- `IssueQuickActions`：问题详情页的一键动作区
- `FilterBar`：多维筛选条
- `TimeEntryForm`：工时录入表单

## 9. 开发阶段与勾选清单

说明：

- 每完成一个子任务并通过自测，就把 `[ ]` 改成 `[x]`
- 只允许在完成当前子任务后再进入下一个子任务
- 如果某项依赖 Redmine API 权限或实例配置，需要在备注中补充限制

### 9.1 Phase 0：工程基线与设计系统

- [x] Wails 工程初始化
- [x] React + TypeScript + Vite 基线完成
- [x] Tailwind CSS 接入
- [x] shadcn/ui + Base UI 接入
- [x] TanStack Query 接入
- [x] Zustand 接入
- [x] 基础 UI 组件已创建：Button / Input / Card / Badge / Select / Separator
- [ ] 引入 `react-router-dom` 并完成应用路由骨架
- [x] 建立 `AppShell` 结构
- [ ] 将 Stitch 暗色 Token 映射到当前 Tailwind Theme
- [ ] 定义 Linear Light 亮色 Token
- [ ] 建立 dark / light / system 三态主题 Store 与系统主题同步
- [ ] 接入 Material Symbols 与 JetBrains Mono
- [ ] 统一空态、加载态、错误态组件
- [x] 定义前端目录结构并完成首轮整理

### 9.2 Phase 1：连接页与应用壳层

- [ ] 按 `stitch_1.html` 完成连接页 UI
- [ ] 完成 Redmine URL 与 API Key 表单校验
- [ ] 完成连接测试与错误提示
- [ ] 完成多实例配置切换
- [ ] 完成 API Key 安全存储
- [ ] 完成侧栏导航、顶栏搜索、底部状态栏
- [ ] 完成主题初始化、系统主题监听与壳层切换

### 9.3 Phase 2：工作台

- [ ] 按 `stitch_2.html` 完成工作台页面 UI
- [ ] 接入“指派给我的问题”列表真实数据
- [ ] 接入摘要指标卡片：我的问题、待处理、今日工时
- [ ] 接入常用项目与最近活动区
- [ ] 接入版本里程碑卡片
- [ ] 接入右侧月历和当日活动提示
- [ ] 支持工作台快捷筛选

### 9.4 Phase 3：任务中心

- [x] Go 侧已支持获取我的问题、问题详情、状态更新、指派
- [ ] 按 `stitch_3.html` 完成任务中心整体 UI
- [ ] 完成问题列表筛选条
- [ ] 完成问题列表卡片或表格视图
- [ ] 完成问题详情主体区域
- [ ] 完成问题历史记录与评论区域
- [ ] 完成问题右侧 Quick Edit 区
- [ ] 完成状态更新
- [ ] 完成指派更新
- [ ] 完成目标版本、优先级、跟踪类型编辑
- [ ] 完成可搜索成员选择器
- [ ] 完成工时登记入口
- [ ] 完成一键完成、一键转测试、一键重开动作
- [ ] 完成附件上传与关联问题入口

### 9.5 Phase 4：工时日志

- [ ] 按 `stitch_5.html` 完成工时日志页面 UI
- [ ] 接入我的工时日志列表
- [ ] 完成日历/热力图视图
- [ ] 完成每日明细面板
- [ ] 完成新增工时记录
- [ ] 完成编辑工时记录
- [ ] 完成删除工时记录
- [ ] 完成日报视图
- [ ] 完成月报视图
- [ ] 完成工时筛选与导出

### 9.6 Phase 5：项目与版本管理

- [ ] 按 `stitch_6.html` 完成项目管理页面 UI
- [ ] 完成项目树视图
- [ ] 完成项目搜索
- [ ] 完成项目概览面板
- [ ] 完成版本列表与版本详情
- [ ] 完成创建版本
- [ ] 完成编辑版本
- [ ] 完成创建问题到指定项目/版本
- [ ] 完成项目成员列表与角色展示
- [ ] 完成成员管理动作
- [ ] 完成版本概览统计

### 9.7 Phase 6：研发组长看板与报表

- [ ] 按 `stitch_4.html` 完成统计看板页面 UI
- [ ] 完成时间范围筛选
- [ ] 完成项目/版本筛选
- [ ] 完成指标卡：问题总量、关闭量、未关闭量
- [ ] 完成按状态分布统计
- [ ] 完成按跟踪类型分布统计
- [ ] 完成按人员工时和任务数统计
- [ ] 完成版本预估/实际工时对比
- [ ] 完成重开率、平均解决时长等质量指标
- [ ] 完成报表导出

### 9.8 Phase 7：设置、缓存与通知

- [ ] 按 `stitch_7.html` 完成设置页 UI
- [ ] 完成账户连接设置
- [ ] 完成外观设置
- [ ] 完成 明 / 暗 / 系统 主题切换入口
- [ ] 完成本地缓存设置
- [ ] 完成桌面通知设置
- [ ] 完成清除本地缓存能力
- [ ] 完成默认视图和筛选偏好设置

### 9.9 Phase 8：架构收口与质量保障

- [x] 将 Redmine API 访问层从 `app.go` 拆分为 `internal/redmine`
- [ ] 将统计聚合逻辑拆分为 `internal/stats`
- [ ] 为核心 Go 逻辑补充单元测试
- [ ] 为前端核心组件补充 Vitest 测试
- [ ] 为主要页面流程补充最小 E2E 用例
- [ ] 补充构建与打包说明
- [ ] 补充异常处理和错误日志策略

## 10. 每轮开发的 Definition of Done

一个模块只有满足以下条件，才能将复选框改为 `[x]`：

- UI 已按对应 Stitch 稿件实现，结构和风格没有明显偏离
- 使用真实 Redmine API 数据，或文档中明确标注当前为占位实现
- 具备加载态、空态、错误态
- 关键操作具备成功与失败反馈
- 不破坏现有构建
- `go build ./...` 通过
- 前端 `npm run build` 通过
- 本文档中的对应任务已更新状态

## 11. 后续 AI 迭代工作流

每次新的 AI 开发都按以下步骤执行：

1. 先读本文件与 `redmine-pro-full-requirements.md`
2. 找到当前最小的未完成子任务，只做这一小块
3. 开发前确认对应 UI 稿件和 Redmine API 边界
4. 实现代码并本地验证
5. 更新本文件的复选框
6. 在“开发记录”中追加一条记录
7. 再进入下一轮开发

禁止直接跨 Phase 大面积并行铺开，否则很容易让 UI、接口和文档全部脱节。

## 12. 开发记录

| 日期 | 模块 | 结果 | 说明 |
| --- | --- | --- | --- |
| 2026-03-23 | 工程基线 | 已完成 | Wails 工程已初始化，前端基础技术栈已接入 |
| 2026-03-23 | Redmine API 初始封装 | 已完成 | 已具备当前用户、状态、我的问题、问题详情、成员、状态更新、指派能力 |
| 2026-03-23 | 需求与规划文档 | 已完成 | 已生成全功能需求清单与本开发主规划文档 |

## 13. 下一步明确建议

下一轮开发应优先做以下内容，不建议跳步：

1. `Phase 0` 收尾：路由骨架、AppShell、设计 Token、字体与图标统一
2. `Phase 1`：连接页与 API Key 安全存储
3. `Phase 2`：工作台页面按 Stitch 稿落地
4. `Phase 3`：任务中心页面替换现有临时 UI
