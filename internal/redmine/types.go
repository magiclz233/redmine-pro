package redmine

// Ref 对应 Redmine API 中常见的引用对象结构，例如项目、状态、优先级。
type Ref struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
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

// IssueDetail 是问题详情场景的内部模型。
type IssueDetail struct {
	Issue           IssueSummary
	Description     string
	AllowedStatuses []Status
}

type issue struct {
	ID              int    `json:"id"`
	Subject         string `json:"subject"`
	Description     string `json:"description"`
	Project         *Ref   `json:"project"`
	Tracker         *Ref   `json:"tracker"`
	Status          *Ref   `json:"status"`
	Priority        *Ref   `json:"priority"`
	Author          *Ref   `json:"author"`
	AssignedTo      *Ref   `json:"assigned_to"`
	FixedVersion    *Ref   `json:"fixed_version"`
	DoneRatio       int    `json:"done_ratio"`
	CreatedOn       string `json:"created_on"`
	UpdatedOn       string `json:"updated_on"`
	AllowedStatuses []Ref  `json:"allowed_statuses"`
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

type updateIssueRequest struct {
	Issue updateIssuePayload `json:"issue"`
}

type updateIssuePayload struct {
	StatusID   *int   `json:"status_id,omitempty"`
	AssigneeID *int   `json:"assigned_to_id,omitempty"`
	Notes      string `json:"notes,omitempty"`
}
