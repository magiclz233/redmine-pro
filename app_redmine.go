package main

import (
	"redmine-pro/internal/redmine"
)

// GetCurrentUser 获取当前 API Key 对应的 Redmine 用户。
func (a *App) GetCurrentUser(baseURL, apiKey string) (*RedmineUserOption, error) {
	client, err := redmine.NewClient(baseURL, apiKey)
	if err != nil {
		return nil, err
	}

	user, err := client.GetCurrentUser()
	if err != nil {
		return nil, err
	}

	option := toUserOption(user)
	return &option, nil
}

// GetIssueStatuses 获取问题状态选项，用于筛选和状态流转。
func (a *App) GetIssueStatuses(baseURL, apiKey string) ([]RedmineStatusOption, error) {
	client, err := redmine.NewClient(baseURL, apiKey)
	if err != nil {
		return nil, err
	}

	statuses, err := client.GetIssueStatuses()
	if err != nil {
		return nil, err
	}

	result := make([]RedmineStatusOption, 0, len(statuses))
	for _, item := range statuses {
		result = append(result, toStatusOption(item))
	}
	return result, nil
}

// GetMyIssues 获取指派给当前用户的问题列表。
func (a *App) GetMyIssues(baseURL, apiKey, statusID string, limit, offset int) (*RedmineIssueList, error) {
	client, err := redmine.NewClient(baseURL, apiKey)
	if err != nil {
		return nil, err
	}

	issueList, err := client.GetMyIssues(statusID, limit, offset)
	if err != nil {
		return nil, err
	}

	result := &RedmineIssueList{
		Issues:     make([]RedmineIssueSummary, 0, len(issueList.Issues)),
		TotalCount: issueList.TotalCount,
		Offset:     issueList.Offset,
		Limit:      issueList.Limit,
	}

	for _, item := range issueList.Issues {
		result.Issues = append(result.Issues, toIssueSummary(item))
	}

	return result, nil
}

// GetIssueDetail 获取问题详情，并补充可流转状态。
func (a *App) GetIssueDetail(baseURL, apiKey string, issueID int) (*RedmineIssueDetail, error) {
	client, err := redmine.NewClient(baseURL, apiKey)
	if err != nil {
		return nil, err
	}

	detail, err := client.GetIssueDetail(issueID)
	if err != nil {
		return nil, err
	}

	result := &RedmineIssueDetail{
		Issue:       toIssueSummary(detail.Issue),
		Description: detail.Description,
	}
	for _, item := range detail.AllowedStatuses {
		result.AllowedStatuses = append(result.AllowedStatuses, toStatusOption(item))
	}

	return result, nil
}

// GetProjectMembers 获取项目成员列表，供指派操作选择。
func (a *App) GetProjectMembers(baseURL, apiKey string, projectID int) ([]RedmineUserOption, error) {
	client, err := redmine.NewClient(baseURL, apiKey)
	if err != nil {
		return nil, err
	}

	members, err := client.GetProjectMembers(projectID)
	if err != nil {
		return nil, err
	}

	result := make([]RedmineUserOption, 0, len(members))
	for _, item := range members {
		result = append(result, toUserOption(item))
	}

	return result, nil
}

// UpdateIssueStatus 更新问题状态，并返回前端可直接展示的提示文本。
func (a *App) UpdateIssueStatus(baseURL, apiKey string, issueID, statusID int, notes string) (string, error) {
	client, err := redmine.NewClient(baseURL, apiKey)
	if err != nil {
		return "", err
	}

	if err := client.UpdateIssueStatus(issueID, statusID, notes); err != nil {
		return "", err
	}

	return redmine.FormatIssueStatusUpdatedMessage(issueID), nil
}

// AssignIssue 更新问题指派人，并返回前端可直接展示的提示文本。
func (a *App) AssignIssue(baseURL, apiKey string, issueID, assigneeID int, notes string) (string, error) {
	client, err := redmine.NewClient(baseURL, apiKey)
	if err != nil {
		return "", err
	}

	if err := client.AssignIssue(issueID, assigneeID, notes); err != nil {
		return "", err
	}

	return redmine.FormatIssueAssignedMessage(issueID, assigneeID), nil
}

func toIssueSummary(issue redmine.IssueSummary) RedmineIssueSummary {
	return RedmineIssueSummary{
		ID:                issue.ID,
		Subject:           issue.Subject,
		ProjectID:         issue.ProjectID,
		ProjectName:       issue.ProjectName,
		TrackerName:       issue.TrackerName,
		StatusID:          issue.StatusID,
		StatusName:        issue.StatusName,
		PriorityName:      issue.PriorityName,
		AuthorID:          issue.AuthorID,
		AuthorName:        issue.AuthorName,
		AssigneeID:        issue.AssigneeID,
		AssigneeName:      issue.AssigneeName,
		TargetVersionName: issue.TargetVersionName,
		DoneRatio:         issue.DoneRatio,
		CreatedOn:         issue.CreatedOn,
		UpdatedOn:         issue.UpdatedOn,
	}
}

func toStatusOption(status redmine.Status) RedmineStatusOption {
	return RedmineStatusOption{
		ID:   status.ID,
		Name: status.Name,
	}
}

func toUserOption(user redmine.User) RedmineUserOption {
	return RedmineUserOption{
		ID:    user.ID,
		Name:  user.Name,
		Login: user.Login,
		Mail:  user.Mail,
	}
}
