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
	if issueID <= 0 {
		return nil, errors.New("问题 ID 必须大于 0")
	}

	query := url.Values{}
	query.Set("include", "allowed_statuses")

	var response issueDetailResponse
	if err := c.doJSON(http.MethodGet, fmt.Sprintf("/issues/%d.json", issueID), query, nil, &response); err != nil {
		return nil, err
	}

	detail := &IssueDetail{
		Issue:       toIssueSummary(response.Issue),
		Description: response.Issue.Description,
	}
	for _, item := range response.Issue.AllowedStatuses {
		detail.AllowedStatuses = append(detail.AllowedStatuses, Status{
			ID:   item.ID,
			Name: item.Name,
		})
	}

	return detail, nil
}

// UpdateIssueStatus 更新问题状态。
func (c *Client) UpdateIssueStatus(issueID, statusID int, notes string) error {
	if statusID <= 0 {
		return errors.New("状态 ID 必须大于 0")
	}

	payload := updateIssuePayload{
		StatusID: &statusID,
		Notes:    strings.TrimSpace(notes),
	}
	return c.updateIssue(issueID, payload)
}

// AssignIssue 更新问题指派人。
func (c *Client) AssignIssue(issueID, assigneeID int, notes string) error {
	if assigneeID <= 0 {
		return errors.New("指派人 ID 必须大于 0")
	}

	payload := updateIssuePayload{
		AssigneeID: &assigneeID,
		Notes:      strings.TrimSpace(notes),
	}
	return c.updateIssue(issueID, payload)
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

// FormatIssueStatusUpdatedMessage 返回统一的状态更新提示文本。
func FormatIssueStatusUpdatedMessage(issueID int) string {
	return fmt.Sprintf("问题 #%d 状态已更新", issueID)
}

// FormatIssueAssignedMessage 返回统一的指派提示文本。
func FormatIssueAssignedMessage(issueID, assigneeID int) string {
	return fmt.Sprintf("问题 #%d 已指派给用户 %d", issueID, assigneeID)
}
