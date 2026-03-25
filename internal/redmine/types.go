package redmine

// Ref 对应 Redmine API 中常见的引用对象结构，例如项目、状态、优先级。
type Ref struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// Option 用于通用的下拉选项场景。
type Option struct {
	ID   int
	Name string
}

// FieldOption 用于自定义字段的字符串型候选项。
type FieldOption struct {
	Label string
	Value string
}

// IssueSummary 是内部领域层的问题摘要模型。
// 它与前端 DTO 解耦，便于后续在 Go 侧继续扩展统计、缓存和聚合逻辑。
type IssueSummary struct {
	ID                int
	Subject           string
	ProjectID         int
	ProjectName       string
	TrackerName       string
	StatusID          int
	StatusName        string
	PriorityName      string
	AuthorID          int
	AuthorName        string
	AssigneeID        int
	AssigneeName      string
	TargetVersionName string
	DoneRatio         int
	CreatedOn         string
	UpdatedOn         string
}

// IssueList 是领域层的分页列表结果。
type IssueList struct {
	Issues     []IssueSummary
	TotalCount int
	Offset     int
	Limit      int
}

// Status 用于状态筛选和状态流转。
type Status struct {
	ID   int
	Name string
}

// User 用于当前用户、项目成员等通用用户信息场景。
type User struct {
	ID    int
	Name  string
	Login string
	Mail  string
}

// IssueField 是问题详情页通用字段项。
// 标准字段和 Redmine 自定义字段统一收敛为同一结构，便于前端按配置化方式完整渲染。
type IssueField struct {
	Name  string
	Value string
}

// Attachment 描述问题的附件信息。
type Attachment struct {
	ID          int
	Filename    string
	Filesize    int
	ContentType string
	Description string
	ContentURL  string
	AuthorName  string
	CreatedOn   string
}

// IssueCustomFieldMeta 描述自定义字段的编辑元数据和当前值。
type IssueCustomFieldMeta struct {
	ID             int
	Name           string
	FieldFormat    string
	Multiple       bool
	Required       bool
	Value          string
	Values         []string
	PossibleValues []FieldOption
}

// IssueEditMeta 是问题编辑抽屉需要的完整元数据。
type IssueEditMeta struct {
	Subject        string
	Description    string
	TrackerID      int
	StatusID       int
	PriorityID     int
	AssigneeID     int
	CategoryID     int
	FixedVersionID int
	ParentIssueID  int
	StartDate      string
	DueDate        string
	EstimatedHours string
	DoneRatio      int
	Trackers       []Option
	Statuses       []Option
	Priorities     []Option
	Assignees      []User
	Categories     []Option
	Versions       []Option
	CustomFields   []IssueCustomFieldMeta
}

// IssueCustomFieldUpdate 是问题更新时的自定义字段输入。
type IssueCustomFieldUpdate struct {
	ID     int
	Values []string
}

// IssueUpdateInput 是前端统一提交问题更新时的内部模型。
type IssueUpdateInput struct {
	IssueID        int
	Subject        string
	Description    string
	TrackerID      *int
	StatusID       *int
	PriorityID     *int
	AssigneeID     *int
	CategoryID     *int
	FixedVersionID *int
	ParentIssueID  *int
	StartDate      string
	DueDate        string
	EstimatedHours *float64
	DoneRatio      *int
	Notes          string
	CustomFields   []IssueCustomFieldUpdate
}

// IssueDetail 是问题详情场景的内部模型。
type IssueDetail struct {
	Issue           IssueSummary
	Description     string
	StandardFields  []IssueField
	CustomFields    []IssueField
	AllowedStatuses []Status
	Attachments     []Attachment
}

type issue struct {
	ID              int           `json:"id"`
	Subject         string        `json:"subject"`
	Description     string        `json:"description"`
	Project         *Ref          `json:"project"`
	Tracker         *Ref          `json:"tracker"`
	Status          *Ref          `json:"status"`
	Priority        *Ref          `json:"priority"`
	Author          *Ref          `json:"author"`
	AssignedTo      *Ref          `json:"assigned_to"`
	Category        *Ref          `json:"category"`
	FixedVersion    *Ref          `json:"fixed_version"`
	Parent          *Ref          `json:"parent"`
	StartDate       string        `json:"start_date"`
	DueDate         string        `json:"due_date"`
	EstimatedHours  *float64      `json:"estimated_hours"`
	SpentHours      *float64      `json:"spent_hours"`
	DoneRatio       int           `json:"done_ratio"`
	CreatedOn       string        `json:"created_on"`
	UpdatedOn       string        `json:"updated_on"`
	ClosedOn        string        `json:"closed_on"`
	IsPrivate       *bool         `json:"is_private"`
	CustomFields    []customField `json:"custom_fields"`
	AllowedStatuses []Ref         `json:"allowed_statuses"`
	Attachments     []attachment  `json:"attachments"`
}

type attachment struct {
	ID          int    `json:"id"`
	Filename    string `json:"filename"`
	Filesize    int    `json:"filesize"`
	ContentType string `json:"content_type"`
	Description string `json:"description"`
	ContentURL  string `json:"content_url"`
	Author      Ref    `json:"author"`
	CreatedOn   string `json:"created_on"`
}

type issueListResponse struct {
	Issues     []issue `json:"issues"`
	TotalCount int     `json:"total_count"`
	Offset     int     `json:"offset"`
	Limit      int     `json:"limit"`
}

type issueDetailResponse struct {
	Issue issue `json:"issue"`
}

type issueStatusListResponse struct {
	IssueStatuses []Ref `json:"issue_statuses"`
}

type issuePriorityListResponse struct {
	IssuePriorities []Ref `json:"issue_priorities"`
}

type versionListResponse struct {
	Versions []Ref `json:"versions"`
}

type issueCategoryListResponse struct {
	IssueCategories []Ref `json:"issue_categories"`
}

type projectResponse struct {
	Project project `json:"project"`
}

type project struct {
	ID                int                     `json:"id"`
	Trackers          []Ref                   `json:"trackers"`
	IssueCustomFields []customFieldDefinition `json:"issue_custom_fields"`
}

type customFieldDefinitionListResponse struct {
	CustomFields []customFieldDefinition `json:"custom_fields"`
}

type customFieldDefinition struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	FieldFormat    string `json:"field_format"`
	Multiple       bool   `json:"multiple"`
	Required       bool   `json:"is_required"`
	PossibleValues []any  `json:"possible_values"`
}

type currentUserResponse struct {
	User userResponse `json:"user"`
}

type userResponse struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Firstname string `json:"firstname"`
	Lastname  string `json:"lastname"`
	Login     string `json:"login"`
	Mail      string `json:"mail"`
}

type membershipListResponse struct {
	Memberships []membership `json:"memberships"`
	TotalCount  int          `json:"total_count"`
	Offset      int          `json:"offset"`
	Limit       int          `json:"limit"`
}

type membership struct {
	User *Ref `json:"user"`
}

type customField struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Value any    `json:"value"`
}

type updateIssueRequest struct {
	Issue updateIssuePayload `json:"issue"`
}

type updateCustomFieldPayload struct {
	ID    int `json:"id"`
	Value any `json:"value"`
}

type updateIssuePayload struct {
	Subject        string                     `json:"subject,omitempty"`
	Description    string                     `json:"description,omitempty"`
	TrackerID      *int                       `json:"tracker_id,omitempty"`
	StatusID       *int                       `json:"status_id,omitempty"`
	PriorityID     *int                       `json:"priority_id,omitempty"`
	AssigneeID     *int                       `json:"assigned_to_id,omitempty"`
	CategoryID     *int                       `json:"category_id,omitempty"`
	FixedVersionID *int                       `json:"fixed_version_id,omitempty"`
	ParentIssueID  *int                       `json:"parent_issue_id,omitempty"`
	StartDate      string                     `json:"start_date,omitempty"`
	DueDate        string                     `json:"due_date,omitempty"`
	EstimatedHours *float64                   `json:"estimated_hours,omitempty"`
	DoneRatio      *int                       `json:"done_ratio,omitempty"`
	CustomFields   []updateCustomFieldPayload `json:"custom_fields,omitempty"`
	Notes          string                     `json:"notes,omitempty"`
}
