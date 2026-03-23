package main

import "context"

// App 是 Wails 暴露给前端的绑定根对象。
// 这里仅保留应用生命周期和方法挂载入口，不再承载具体的 Redmine 业务实现。
type App struct {
	ctx context.Context
}

// NewApp 创建应用实例。
func NewApp() *App {
	return &App{}
}

// startup 在应用启动时由 Wails 调用。
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}
