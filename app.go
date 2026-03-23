package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call runtime methods.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

type namedRef struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type redmineIssue struct {
	ID              int        `json:"id"`
	Subject         string     `json:"subject"`
	Description     string     `json:"description"`
	Project         *namedRef  `json:"project"`
	Tracker         *namedRef  `json:"tracker"`
	Status          *namedRef  `json:"status"`
	Priority        *namedRef  `json:"priority"`
	Author          *namedRef  `json:"author"`
	AssignedTo      *namedRef  `json:"assigned_to"`
	FixedVersion    *namedRef  `json:"fixed_version"`
	DoneRatio       int        `json:"done_ratio"`
	CreatedOn       string     `json:"created_on"`
	UpdatedOn       string     `json:"updated_on"`
	AllowedStatuses []namedRef `json:"allowed_statuses"`
}

type redmineIssueListResponse struct {
	Issues     []redmineIssue `json:"issues"`
	TotalCount int            `json:"total_count"`
	Offset     int            `json:"offset"`
	Limit      int            `json:"limit"`
}

type redmineIssueDetailResponse struct {
	Issue redmineIssue `json:"issue"`
}

type redmineIssueStatusListResponse struct {
	IssueStatuses []namedRef `json:"issue_statuses"`
}

type redmineCurrentUserResponse struct {
	User redmineUser `json:"user"`
}

type redmineUser struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Login string `json:"login"`
	Mail  string `json:"mail"`
}

type redmineMembershipListResponse struct {
	Memberships []redmineMembership `json:"memberships"`
	TotalCount  int                 `json:"total_count"`
	Offset      int                 `json:"offset"`
	Limit       int                 `json:"limit"`
}

type redmineMembership struct {
	User *namedRef `json:"user"`
}

type redmineUpdateIssueRequest struct {
	Issue redmineUpdateIssuePayload `json:"issue"`
}

type redmineUpdateIssuePayload struct {
	StatusID   *int   `json:"status_id,omitempty"`
	AssigneeID *int   `json:"assigned_to_id,omitempty"`
	Notes      string `json:"notes,omitempty"`
}

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

type RedmineIssueList struct {
	Issues     []RedmineIssueSummary `json:"issues"`
	TotalCount int                   `json:"totalCount"`
	Offset     int                   `json:"offset"`
	Limit      int                   `json:"limit"`
}

type RedmineStatusOption struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type RedmineUserOption struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Login string `json:"login"`
	Mail  string `json:"mail"`
}

type RedmineIssueDetail struct {
	Issue           RedmineIssueSummary   `json:"issue"`
	Description     string                `json:"description"`
	AllowedStatuses []RedmineStatusOption `json:"allowedStatuses"`
}

type redmineClient struct {
	baseURL string
	apiKey  string
	client  *http.Client
}

func newRedmineClient(baseURL, apiKey string) (*redmineClient, error) {
	normalizedURL, err := normalizeBaseURL(baseURL)
	if err != nil {
		return nil, err
	}

	key := strings.TrimSpace(apiKey)
	if key == "" {
		return nil, errors.New("API Key 不能为空")
	}

	return &redmineClient{
		baseURL: normalizedURL,
		apiKey:  key,
		client: &http.Client{
			Timeout: 20 * time.Second,
		},
	}, nil
}

func normalizeBaseURL(raw string) (string, error) {
	value := strings.TrimSpace(raw)
	if value == "" {
		return "", errors.New("Redmine 地址不能为空")
	}

	parsed, err := url.Parse(value)
	if err != nil {
		return "", fmt.Errorf("Redmine 地址格式不正确: %w", err)
	}
	if parsed.Scheme == "" || parsed.Host == "" {
		return "", errors.New("Redmine 地址必须包含协议和域名，例如 https://redmine.example.com")
	}

	parsed.Path = strings.TrimRight(parsed.Path, "/")
	parsed.RawQuery = ""
	parsed.Fragment = ""

	return parsed.String(), nil
}

func (c *redmineClient) doJSON(method, apiPath string, query url.Values, reqBody any, respBody any) error {
	fullURL := c.baseURL + apiPath
	if query != nil && len(query) > 0 {
		fullURL += "?" + query.Encode()
	}

	var bodyReader io.Reader
	if reqBody != nil {
		payload, err := json.Marshal(reqBody)
		if err != nil {
			return fmt.Errorf("序列化请求失败: %w", err)
		}
		bodyReader = strings.NewReader(string(payload))
	}

	req, err := http.NewRequest(method, fullURL, bodyReader)
	if err != nil {
		return fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("X-Redmine-API-Key", c.apiKey)
	req.Header.Set("Accept", "application/json")
	if reqBody != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("访问 Redmine 失败: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		raw, _ := io.ReadAll(io.LimitReader(resp.Body, 8*1024))
		msg := strings.TrimSpace(string(raw))
		if msg == "" {
			msg = http.StatusText(resp.StatusCode)
		}
		return fmt.Errorf("Redmine API 请求失败: %s %s (HTTP %d) %s", method, apiPath, resp.StatusCode, msg)
	}

	if respBody == nil {
		_, _ = io.Copy(io.Discard, resp.Body)
		return nil
	}

	if err := json.NewDecoder(resp.Body).Decode(respBody); err != nil {
		return fmt.Errorf("解析 Redmine 响应失败: %w", err)
	}

	return nil
}

func toIssueSummary(issue redmineIssue) RedmineIssueSummary {
	return RedmineIssueSummary{
		ID:                issue.ID,
		Subject:           issue.Subject,
		ProjectID:         refID(issue.Project),
		ProjectName:       refName(issue.Project),
		TrackerName:       refName(issue.Tracker),
		StatusID:          refID(issue.Status),
		StatusName:        refName(issue.Status),
		PriorityName:      refName(issue.Priority),
		AuthorID:          refID(issue.Author),
		AuthorName:        refName(issue.Author),
		AssigneeID:        refID(issue.AssignedTo),
		AssigneeName:      refName(issue.AssignedTo),
		TargetVersionName: refName(issue.FixedVersion),
		DoneRatio:         issue.DoneRatio,
		CreatedOn:         issue.CreatedOn,
		UpdatedOn:         issue.UpdatedOn,
	}
}

func refID(ref *namedRef) int {
	if ref == nil {
		return 0
	}
	return ref.ID
}

func refName(ref *namedRef) string {
	if ref == nil {
		return ""
	}
	return ref.Name
}

func sanitizePage(limit, offset int) (int, int) {
	const (
		defaultLimit = 50
		maxLimit     = 100
	)

	if limit <= 0 {
		limit = defaultLimit
	}
	if limit > maxLimit {
		limit = maxLimit
	}
	if offset < 0 {
		offset = 0
	}
	return limit, offset
}

func (a *App) GetCurrentUser(baseURL, apiKey string) (*RedmineUserOption, error) {
	client, err := newRedmineClient(baseURL, apiKey)
	if err != nil {
		return nil, err
	}

	var response redmineCurrentUserResponse
	if err := client.doJSON(http.MethodGet, "/users/current.json", nil, nil, &response); err != nil {
		return nil, err
	}

	return &RedmineUserOption{
		ID:    response.User.ID,
		Name:  response.User.Name,
		Login: response.User.Login,
		Mail:  response.User.Mail,
	}, nil
}

func (a *App) GetIssueStatuses(baseURL, apiKey string) ([]RedmineStatusOption, error) {
	client, err := newRedmineClient(baseURL, apiKey)
	if err != nil {
		return nil, err
	}

	var response redmineIssueStatusListResponse
	if err := client.doJSON(http.MethodGet, "/issue_statuses.json", nil, nil, &response); err != nil {
		return nil, err
	}

	result := make([]RedmineStatusOption, 0, len(response.IssueStatuses))
	for _, item := range response.IssueStatuses {
		result = append(result, RedmineStatusOption{
			ID:   item.ID,
			Name: item.Name,
		})
	}
	return result, nil
}

func (a *App) GetMyIssues(baseURL, apiKey, statusID string, limit, offset int) (*RedmineIssueList, error) {
	client, err := newRedmineClient(baseURL, apiKey)
	if err != nil {
		return nil, err
	}

	limit, offset = sanitizePage(limit, offset)

	filterStatus := strings.TrimSpace(statusID)
	if filterStatus == "" {
		filterStatus = "*"
	}

	query := url.Values{}
	query.Set("assigned_to_id", "me")
	query.Set("status_id", filterStatus)
	query.Set("sort", "updated_on:desc")
	query.Set("limit", strconv.Itoa(limit))
	query.Set("offset", strconv.Itoa(offset))

	var response redmineIssueListResponse
	if err := client.doJSON(http.MethodGet, "/issues.json", query, nil, &response); err != nil {
		return nil, err
	}

	result := &RedmineIssueList{
		Issues:     make([]RedmineIssueSummary, 0, len(response.Issues)),
		TotalCount: response.TotalCount,
		Offset:     response.Offset,
		Limit:      response.Limit,
	}

	for _, issue := range response.Issues {
		result.Issues = append(result.Issues, toIssueSummary(issue))
	}

	return result, nil
}

func (a *App) GetIssueDetail(baseURL, apiKey string, issueID int) (*RedmineIssueDetail, error) {
	if issueID <= 0 {
		return nil, errors.New("问题 ID 必须大于 0")
	}

	client, err := newRedmineClient(baseURL, apiKey)
	if err != nil {
		return nil, err
	}

	query := url.Values{}
	query.Set("include", "allowed_statuses")

	var response redmineIssueDetailResponse
	if err := client.doJSON(http.MethodGet, fmt.Sprintf("/issues/%d.json", issueID), query, nil, &response); err != nil {
		return nil, err
	}

	detail := &RedmineIssueDetail{
		Issue:       toIssueSummary(response.Issue),
		Description: response.Issue.Description,
	}

	for _, status := range response.Issue.AllowedStatuses {
		detail.AllowedStatuses = append(detail.AllowedStatuses, RedmineStatusOption{
			ID:   status.ID,
			Name: status.Name,
		})
	}

	return detail, nil
}

func (a *App) GetProjectMembers(baseURL, apiKey string, projectID int) ([]RedmineUserOption, error) {
	if projectID <= 0 {
		return nil, errors.New("项目 ID 必须大于 0")
	}

	client, err := newRedmineClient(baseURL, apiKey)
	if err != nil {
		return nil, err
	}

	seen := map[int]struct{}{}
	result := make([]RedmineUserOption, 0)
	offset := 0
	limit := 100

	for {
		query := url.Values{}
		query.Set("limit", strconv.Itoa(limit))
		query.Set("offset", strconv.Itoa(offset))

		var response redmineMembershipListResponse
		if err := client.doJSON(
			http.MethodGet,
			fmt.Sprintf("/projects/%d/memberships.json", projectID),
			query,
			nil,
			&response,
		); err != nil {
			return nil, err
		}

		if len(response.Memberships) == 0 {
			break
		}

		for _, membership := range response.Memberships {
			if membership.User == nil {
				continue
			}
			if _, exists := seen[membership.User.ID]; exists {
				continue
			}
			seen[membership.User.ID] = struct{}{}
			result = append(result, RedmineUserOption{
				ID:   membership.User.ID,
				Name: membership.User.Name,
			})
		}

		offset += len(response.Memberships)
		if response.TotalCount == 0 || offset >= response.TotalCount {
			break
		}
	}

	return result, nil
}

func (a *App) updateIssue(baseURL, apiKey string, issueID int, payload redmineUpdateIssuePayload) error {
	if issueID <= 0 {
		return errors.New("问题 ID 必须大于 0")
	}

	client, err := newRedmineClient(baseURL, apiKey)
	if err != nil {
		return err
	}

	requestBody := redmineUpdateIssueRequest{Issue: payload}
	return client.doJSON(
		http.MethodPut,
		fmt.Sprintf("/issues/%d.json", issueID),
		nil,
		requestBody,
		nil,
	)
}

func (a *App) UpdateIssueStatus(baseURL, apiKey string, issueID, statusID int, notes string) (string, error) {
	if statusID <= 0 {
		return "", errors.New("状态 ID 必须大于 0")
	}

	payload := redmineUpdateIssuePayload{
		StatusID: &statusID,
		Notes:    strings.TrimSpace(notes),
	}
	if err := a.updateIssue(baseURL, apiKey, issueID, payload); err != nil {
		return "", err
	}

	return fmt.Sprintf("问题 #%d 状态已更新", issueID), nil
}

func (a *App) AssignIssue(baseURL, apiKey string, issueID, assigneeID int, notes string) (string, error) {
	if assigneeID <= 0 {
		return "", errors.New("指派人 ID 必须大于 0")
	}

	payload := redmineUpdateIssuePayload{
		AssigneeID: &assigneeID,
		Notes:      strings.TrimSpace(notes),
	}
	if err := a.updateIssue(baseURL, apiKey, issueID, payload); err != nil {
		return "", err
	}

	return fmt.Sprintf("问题 #%d 已指派给用户 %d", issueID, assigneeID), nil
}
