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

// RedmineIssueFilter 包含问题的多维筛选条件。
type RedmineIssueFilter struct {
	StatusID       string `json:"statusId"`
	AssigneeID     string `json:"assigneeId"`
	AuthorID       string `json:"authorId"`
	FixedVersionID string `json:"fixedVersionId"`
	ProjectID      string `json:"projectId"`
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

// RedmineIssueField 是问题详情页统一展示的字段结构。
type RedmineIssueField struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

// RedmineSelectOption 是通用下拉项 DTO。
type RedmineSelectOption struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// RedmineFieldOption 是自定义字段的字符串型选项 DTO。
type RedmineFieldOption struct {
	Label string `json:"label"`
	Value string `json:"value"`
}

// RedmineAttachment 描述问题的附件信息。
type RedmineAttachment struct {
	ID          int    `json:"id"`
	Filename    string `json:"filename"`
	Filesize    int    `json:"filesize"`
	ContentType string `json:"contentType"`
	Description string `json:"description"`
	ContentURL  string `json:"contentUrl"`
	AuthorName  string `json:"authorName"`
	CreatedOn   string `json:"createdOn"`
}

// RedmineIssueCustomFieldMeta 是问题编辑页的自定义字段元数据。
type RedmineIssueCustomFieldMeta struct {
	ID             int                  `json:"id"`
	Name           string               `json:"name"`
	FieldFormat    string               `json:"fieldFormat"`
	Multiple       bool                 `json:"multiple"`
	Required       bool                 `json:"required"`
	Value          string               `json:"value"`
	Values         []string             `json:"values"`
	PossibleValues []RedmineFieldOption `json:"possibleValues"`
}

// RedmineIssueEditMeta 是问题编辑抽屉所需的完整元数据。
type RedmineIssueEditMeta struct {
	Subject        string                        `json:"subject"`
	Description    string                        `json:"description"`
	TrackerID      int                           `json:"trackerId"`
	StatusID       int                           `json:"statusId"`
	PriorityID     int                           `json:"priorityId"`
	AssigneeID     int                           `json:"assigneeId"`
	CategoryID     int                           `json:"categoryId"`
	FixedVersionID int                           `json:"fixedVersionId"`
	ParentIssueID  int                           `json:"parentIssueId"`
	StartDate      string                        `json:"startDate"`
	DueDate        string                        `json:"dueDate"`
	EstimatedHours string                        `json:"estimatedHours"`
	DoneRatio      int                           `json:"doneRatio"`
	Trackers       []RedmineSelectOption         `json:"trackers"`
	Statuses       []RedmineSelectOption         `json:"statuses"`
	Priorities     []RedmineSelectOption         `json:"priorities"`
	Assignees      []RedmineUserOption           `json:"assignees"`
	Categories     []RedmineSelectOption         `json:"categories"`
	Versions       []RedmineSelectOption         `json:"versions"`
	CustomFields   []RedmineIssueCustomFieldMeta `json:"customFields"`
}

// RedmineIssueCustomFieldUpdate 是前端提交的自定义字段更新输入。
type RedmineIssueCustomFieldUpdate struct {
	ID     int      `json:"id"`
	Values []string `json:"values"`
}

// RedmineIssueUpdatePayload 是前端统一提交的问题更新载荷。
type RedmineIssueUpdatePayload struct {
	IssueID        int                             `json:"issueId"`
	Subject        string                          `json:"subject"`
	Description    string                          `json:"description"`
	TrackerID      string                          `json:"trackerId"`
	StatusID       string                          `json:"statusId"`
	PriorityID     string                          `json:"priorityId"`
	AssigneeID     string                          `json:"assigneeId"`
	CategoryID     string                          `json:"categoryId"`
	FixedVersionID string                          `json:"fixedVersionId"`
	ParentIssueID  string                          `json:"parentIssueId"`
	StartDate      string                          `json:"startDate"`
	DueDate        string                          `json:"dueDate"`
	EstimatedHours string                          `json:"estimatedHours"`
	DoneRatio      string                          `json:"doneRatio"`
	Notes          string                          `json:"notes"`
	CustomFields   []RedmineIssueCustomFieldUpdate `json:"customFields"`
}

// RedmineIssueDetail 是详情页展示所需的组合 DTO。
type RedmineIssueDetail struct {
	Issue           RedmineIssueSummary   `json:"issue"`
	Description     string                `json:"description"`
	StandardFields  []RedmineIssueField   `json:"standardFields"`
	CustomFields    []RedmineIssueField   `json:"customFields"`
	AllowedStatuses []RedmineStatusOption `json:"allowedStatuses"`
	Attachments     []RedmineAttachment   `json:"attachments"`
}
