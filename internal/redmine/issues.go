package redmine

import (
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

// GetMyIssues 获取“指派给我”的问题列表。
func (c *Client) GetMyIssues(statusID string, limit, offset int) (*IssueList, error) {
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

	var response issueListResponse
	if err := c.doJSON(http.MethodGet, "/issues.json", query, nil, &response); err != nil {
		return nil, err
	}

	result := &IssueList{
		Issues:     make([]IssueSummary, 0, len(response.Issues)),
		TotalCount: response.TotalCount,
		Offset:     response.Offset,
		Limit:      response.Limit,
	}
	for _, item := range response.Issues {
		result.Issues = append(result.Issues, toIssueSummary(item))
	}

	return result, nil
}

// GetIssueDetail 获取单个问题详情。
// 这里携带 allowed_statuses，便于前端在详情页只展示当前问题允许流转到的状态。
func (c *Client) GetIssueDetail(issueID int) (*IssueDetail, error) {
	responseIssue, err := c.getIssue(issueID)
	if err != nil {
		return nil, err
	}

	detail := &IssueDetail{
		Issue:          toIssueSummary(responseIssue),
		Description:    responseIssue.Description,
		StandardFields: buildIssueStandardFields(responseIssue),
		CustomFields:   buildIssueCustomFields(responseIssue.CustomFields),
		Attachments:    make([]Attachment, 0, len(responseIssue.Attachments)),
	}
	for _, att := range responseIssue.Attachments {
		detail.Attachments = append(detail.Attachments, Attachment{
			ID:          att.ID,
			Filename:    att.Filename,
			Filesize:    att.Filesize,
			ContentType: att.ContentType,
			Description: att.Description,
			ContentURL:  att.ContentURL,
			AuthorName:  att.Author.Name,
			CreatedOn:   att.CreatedOn,
		})
	}
	for _, item := range responseIssue.AllowedStatuses {
		detail.AllowedStatuses = append(detail.AllowedStatuses, Status{
			ID:   item.ID,
			Name: item.Name,
		})
	}

	return detail, nil
}

// UpdateIssue 统一更新问题属性。
// 若同时修改多个字段，只发送一次 Redmine PUT 请求，避免前端拆成多个动作后产生重复备注。
func (c *Client) UpdateIssue(input IssueUpdateInput) error {
	if input.IssueID <= 0 {
		return errors.New("问题 ID 必须大于 0")
	}
	if input.StatusID != nil && *input.StatusID < 0 {
		return errors.New("状态 ID 不能小于 0")
	}
	if input.AssigneeID != nil && *input.AssigneeID < 0 {
		return errors.New("指派人 ID 不能小于 0")
	}
	if input.TrackerID != nil && *input.TrackerID <= 0 {
		return errors.New("跟踪类型 ID 必须大于 0")
	}
	if input.PriorityID != nil && *input.PriorityID <= 0 {
		return errors.New("优先级 ID 必须大于 0")
	}
	if input.CategoryID != nil && *input.CategoryID < 0 {
		return errors.New("分类 ID 不能小于 0")
	}
	if input.FixedVersionID != nil && *input.FixedVersionID < 0 {
		return errors.New("目标版本 ID 不能小于 0")
	}
	if input.ParentIssueID != nil && *input.ParentIssueID <= 0 {
		return errors.New("父任务 ID 必须大于 0")
	}
	if input.DoneRatio != nil && (*input.DoneRatio < 0 || *input.DoneRatio > 100) {
		return errors.New("完成进度必须在 0 到 100 之间")
	}
	if input.EstimatedHours != nil && *input.EstimatedHours < 0 {
		return errors.New("预计工时不能小于 0")
	}

	payload := updateIssuePayload{
		Subject:        strings.TrimSpace(input.Subject),
		Description:    input.Description,
		TrackerID:      input.TrackerID,
		StatusID:       input.StatusID,
		PriorityID:     input.PriorityID,
		AssigneeID:     input.AssigneeID,
		CategoryID:     input.CategoryID,
		FixedVersionID: input.FixedVersionID,
		ParentIssueID:  input.ParentIssueID,
		StartDate:      strings.TrimSpace(input.StartDate),
		DueDate:        strings.TrimSpace(input.DueDate),
		EstimatedHours: input.EstimatedHours,
		DoneRatio:      input.DoneRatio,
		Notes:          strings.TrimSpace(input.Notes),
	}

	for _, field := range input.CustomFields {
		payload.CustomFields = append(payload.CustomFields, updateCustomFieldPayload{
			ID:    field.ID,
			Value: toCustomFieldUpdateValue(field.Values),
		})
	}

	if payload.Subject == "" && payload.Description == "" && payload.TrackerID == nil && payload.StatusID == nil && payload.PriorityID == nil && payload.AssigneeID == nil && payload.CategoryID == nil && payload.FixedVersionID == nil && payload.ParentIssueID == nil && payload.StartDate == "" && payload.DueDate == "" && payload.EstimatedHours == nil && payload.DoneRatio == nil && len(payload.CustomFields) == 0 && payload.Notes == "" {
		return errors.New("请至少修改一个字段或填写备注")
	}

	return c.updateIssue(input.IssueID, payload)
}

// UpdateIssueStatus 更新问题状态。
func (c *Client) UpdateIssueStatus(issueID, statusID int, notes string) error {
	return c.UpdateIssue(IssueUpdateInput{
		IssueID:  issueID,
		StatusID: &statusID,
		Notes:    notes,
	})
}

// AssignIssue 更新问题指派人。
func (c *Client) AssignIssue(issueID, assigneeID int, notes string) error {
	return c.UpdateIssue(IssueUpdateInput{
		IssueID:    issueID,
		AssigneeID: &assigneeID,
		Notes:      notes,
	})
}

func (c *Client) getIssue(issueID int) (issue, error) {
	if issueID <= 0 {
		return issue{}, errors.New("问题 ID 必须大于 0")
	}

	query := url.Values{}
	query.Set("include", "allowed_statuses,attachments")

	var response issueDetailResponse
	if err := c.doJSON(http.MethodGet, fmt.Sprintf("/issues/%d.json", issueID), query, nil, &response); err != nil {
		return issue{}, err
	}
	return response.Issue, nil
}

func (c *Client) updateIssue(issueID int, payload updateIssuePayload) error {
	if issueID <= 0 {
		return errors.New("问题 ID 必须大于 0")
	}

	requestBody := updateIssueRequest{Issue: payload}
	return c.doJSON(
		http.MethodPut,
		fmt.Sprintf("/issues/%d.json", issueID),
		nil,
		requestBody,
		nil,
	)
}

func toCustomFieldUpdateValue(values []string) any {
	normalized := make([]string, 0, len(values))
	for _, item := range values {
		normalized = append(normalized, strings.TrimSpace(item))
	}
	if len(normalized) == 0 {
		return ""
	}
	if len(normalized) == 1 {
		return normalized[0]
	}
	return normalized
}

// FormatIssueUpdatedMessage 返回统一的更新提示文本。
func FormatIssueUpdatedMessage(issueID int) string {
	return fmt.Sprintf("问题 #%d 已更新", issueID)
}

// FormatIssueStatusUpdatedMessage 返回统一的状态更新提示文本。
func FormatIssueStatusUpdatedMessage(issueID int) string {
	return fmt.Sprintf("问题 #%d 状态已更新", issueID)
}

// FormatIssueAssignedMessage 返回统一的指派提示文本。
func FormatIssueAssignedMessage(issueID, assigneeID int) string {
	return fmt.Sprintf("问题 #%d 已指派给用户 %d", issueID, assigneeID)
}
