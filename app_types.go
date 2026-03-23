package main

// RedmineIssueSummary 是暴露给前端的问题摘要 DTO。
// 该结构保持稳定，避免内部包重构时影响前端调用和生成的 Wails 模型。
type RedmineIssueSummary struct {
	ID                int    `json:"id"`
	Subject           string `json:"subject"`
	ProjectID         int    `json:"projectId"`
	ProjectName       string `json:"projectName"`
	TrackerName       string `json:"trackerName"`
	StatusID          int    `json:"statusId"`
	StatusName        string `json:"statusName"`
	PriorityName      string `json:"priorityName"`
	AuthorID          int    `json:"authorId"`
	AuthorName        string `json:"authorName"`
	AssigneeID        int    `json:"assigneeId"`
	AssigneeName      string `json:"assigneeName"`
	TargetVersionName string `json:"targetVersionName"`
	DoneRatio         int    `json:"doneRatio"`
	CreatedOn         string `json:"createdOn"`
	UpdatedOn         string `json:"updatedOn"`
}

// RedmineIssueList 是前端问题列表页消费的分页结果。
type RedmineIssueList struct {
	Issues     []RedmineIssueSummary `json:"issues"`
	TotalCount int                   `json:"totalCount"`
	Offset     int                   `json:"offset"`
	Limit      int                   `json:"limit"`
}

// RedmineStatusOption 用于状态下拉和 allowed_statuses 展示。
type RedmineStatusOption struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// RedmineUserOption 用于用户选择器与当前用户信息展示。
type RedmineUserOption struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Login string `json:"login"`
	Mail  string `json:"mail"`
}

// RedmineIssueDetail 是详情页展示所需的组合 DTO。
type RedmineIssueDetail struct {
	Issue           RedmineIssueSummary   `json:"issue"`
	Description     string                `json:"description"`
	AllowedStatuses []RedmineStatusOption `json:"allowedStatuses"`
}
