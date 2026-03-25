package main

import (
	"fmt"
	"redmine-pro/internal/redmine"
	"strconv"
	"strings"
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

// GetMyIssues 获取符合筛选条件的问题列表。
func (a *App) GetMyIssues(baseURL, apiKey string, filter RedmineIssueFilter, limit, offset int) (*RedmineIssueList, error) {
	client, err := redmine.NewClient(baseURL, apiKey)
	if err != nil {
		return nil, err
	}

	internalFilter := redmine.RedmineIssueFilter{
		StatusID:       filter.StatusID,
		AssignedToID:   filter.AssigneeID,
		AuthorID:       filter.AuthorID,
		FixedVersionID: filter.FixedVersionID,
		ProjectID:      filter.ProjectID,
	}

	issueList, err := client.GetMyIssues(internalFilter, limit, offset)
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
		Issue:          toIssueSummary(detail.Issue),
		Description:    detail.Description,
		StandardFields: make([]RedmineIssueField, 0, len(detail.StandardFields)),
		CustomFields:   make([]RedmineIssueField, 0, len(detail.CustomFields)),
	}
	for _, item := range detail.StandardFields {
		result.StandardFields = append(result.StandardFields, toIssueField(item))
	}
	for _, item := range detail.CustomFields {
		result.CustomFields = append(result.CustomFields, toIssueField(item))
	}
	for _, item := range detail.AllowedStatuses {
		result.AllowedStatuses = append(result.AllowedStatuses, toStatusOption(item))
	}
	for _, item := range detail.Attachments {
		result.Attachments = append(result.Attachments, toAttachment(item))
	}

	return result, nil
}

// GetIssueEditMeta 获取问题编辑抽屉所需的元数据。
func (a *App) GetIssueEditMeta(baseURL, apiKey string, issueID int) (*RedmineIssueEditMeta, error) {
	client, err := redmine.NewClient(baseURL, apiKey)
	if err != nil {
		return nil, err
	}

	meta, err := client.GetIssueEditMeta(issueID)
	if err != nil {
		return nil, err
	}

	result := &RedmineIssueEditMeta{
		Subject:        meta.Subject,
		Description:    meta.Description,
		TrackerID:      meta.TrackerID,
		StatusID:       meta.StatusID,
		PriorityID:     meta.PriorityID,
		AssigneeID:     meta.AssigneeID,
		CategoryID:     meta.CategoryID,
		FixedVersionID: meta.FixedVersionID,
		ParentIssueID:  meta.ParentIssueID,
		StartDate:      meta.StartDate,
		DueDate:        meta.DueDate,
		EstimatedHours: meta.EstimatedHours,
		DoneRatio:      meta.DoneRatio,
		Trackers:       make([]RedmineSelectOption, 0, len(meta.Trackers)),
		Statuses:       make([]RedmineSelectOption, 0, len(meta.Statuses)),
		Priorities:     make([]RedmineSelectOption, 0, len(meta.Priorities)),
		Assignees:      make([]RedmineUserOption, 0, len(meta.Assignees)),
		Categories:     make([]RedmineSelectOption, 0, len(meta.Categories)),
		Versions:       make([]RedmineSelectOption, 0, len(meta.Versions)),
		CustomFields:   make([]RedmineIssueCustomFieldMeta, 0, len(meta.CustomFields)),
	}

	for _, item := range meta.Trackers {
		result.Trackers = append(result.Trackers, toSelectOption(item))
	}
	for _, item := range meta.Statuses {
		result.Statuses = append(result.Statuses, toSelectOption(item))
	}
	for _, item := range meta.Priorities {
		result.Priorities = append(result.Priorities, toSelectOption(item))
	}
	for _, item := range meta.Assignees {
		result.Assignees = append(result.Assignees, toUserOption(item))
	}
	for _, item := range meta.Categories {
		result.Categories = append(result.Categories, toSelectOption(item))
	}
	for _, item := range meta.Versions {
		result.Versions = append(result.Versions, toSelectOption(item))
	}
	for _, item := range meta.CustomFields {
		result.CustomFields = append(result.CustomFields, toIssueCustomFieldMeta(item))
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

// GetProjectVersions 获取项目版本列表，供筛选和编辑选择。
func (a *App) GetProjectVersions(baseURL, apiKey string, projectID int) ([]RedmineSelectOption, error) {
	client, err := redmine.NewClient(baseURL, apiKey)
	if err != nil {
		return nil, err
	}

	versions, err := client.GetProjectVersions(projectID)
	if err != nil {
		return nil, err
	}

	result := make([]RedmineSelectOption, 0, len(versions))
	for _, item := range versions {
		result = append(result, toSelectOption(item))
	}

	return result, nil
}

// UpdateIssue 统一更新问题属性，并返回前端可直接展示的提示文本。
func (a *App) UpdateIssue(baseURL, apiKey string, payload RedmineIssueUpdatePayload) (string, error) {
	client, err := redmine.NewClient(baseURL, apiKey)
	if err != nil {
		return "", err
	}

	input, err := toIssueUpdateInput(payload)
	if err != nil {
		return "", err
	}

	if err := client.UpdateIssue(input); err != nil {
		return "", err
	}

	return redmine.FormatIssueUpdatedMessage(payload.IssueID), nil
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

func toIssueField(field redmine.IssueField) RedmineIssueField {
	return RedmineIssueField{
		Name:  field.Name,
		Value: field.Value,
	}
}

func toAttachment(att redmine.Attachment) RedmineAttachment {
	return RedmineAttachment{
		ID:          att.ID,
		Filename:    att.Filename,
		Filesize:    att.Filesize,
		ContentType: att.ContentType,
		Description: att.Description,
		ContentURL:  att.ContentURL,
		AuthorName:  att.AuthorName,
		CreatedOn:   att.CreatedOn,
	}
}

func toSelectOption(option redmine.Option) RedmineSelectOption {
	return RedmineSelectOption{
		ID:   option.ID,
		Name: option.Name,
	}
}

func toFieldOption(option redmine.FieldOption) RedmineFieldOption {
	return RedmineFieldOption{
		Label: option.Label,
		Value: option.Value,
	}
}

func toIssueCustomFieldMeta(field redmine.IssueCustomFieldMeta) RedmineIssueCustomFieldMeta {
	result := RedmineIssueCustomFieldMeta{
		ID:             field.ID,
		Name:           field.Name,
		FieldFormat:    field.FieldFormat,
		Multiple:       field.Multiple,
		Required:       field.Required,
		Value:          field.Value,
		Values:         append([]string(nil), field.Values...),
		PossibleValues: make([]RedmineFieldOption, 0, len(field.PossibleValues)),
	}
	for _, item := range field.PossibleValues {
		result.PossibleValues = append(result.PossibleValues, toFieldOption(item))
	}
	return result
}

func toIssueUpdateInput(payload RedmineIssueUpdatePayload) (redmine.IssueUpdateInput, error) {
	trackerID, err := parseOptionalInt(payload.TrackerID, "跟踪类型")
	if err != nil {
		return redmine.IssueUpdateInput{}, err
	}
	statusID, err := parseOptionalInt(payload.StatusID, "状态")
	if err != nil {
		return redmine.IssueUpdateInput{}, err
	}
	priorityID, err := parseOptionalInt(payload.PriorityID, "优先级")
	if err != nil {
		return redmine.IssueUpdateInput{}, err
	}
	assigneeID, err := parseOptionalInt(payload.AssigneeID, "指派人")
	if err != nil {
		return redmine.IssueUpdateInput{}, err
	}
	categoryID, err := parseOptionalInt(payload.CategoryID, "分类")
	if err != nil {
		return redmine.IssueUpdateInput{}, err
	}
	fixedVersionID, err := parseOptionalInt(payload.FixedVersionID, "目标版本")
	if err != nil {
		return redmine.IssueUpdateInput{}, err
	}
	parentIssueID, err := parseOptionalInt(payload.ParentIssueID, "父任务")
	if err != nil {
		return redmine.IssueUpdateInput{}, err
	}
	estimatedHours, err := parseOptionalFloat(payload.EstimatedHours, "预计工时")
	if err != nil {
		return redmine.IssueUpdateInput{}, err
	}
	doneRatio, err := parseOptionalInt(payload.DoneRatio, "完成进度")
	if err != nil {
		return redmine.IssueUpdateInput{}, err
	}

	input := redmine.IssueUpdateInput{
		IssueID:        payload.IssueID,
		Subject:        strings.TrimSpace(payload.Subject),
		Description:    payload.Description,
		TrackerID:      trackerID,
		StatusID:       statusID,
		PriorityID:     priorityID,
		AssigneeID:     assigneeID,
		CategoryID:     categoryID,
		FixedVersionID: fixedVersionID,
		ParentIssueID:  parentIssueID,
		StartDate:      strings.TrimSpace(payload.StartDate),
		DueDate:        strings.TrimSpace(payload.DueDate),
		EstimatedHours: estimatedHours,
		DoneRatio:      doneRatio,
		Notes:          payload.Notes,
		CustomFields:   make([]redmine.IssueCustomFieldUpdate, 0, len(payload.CustomFields)),
	}
	for _, field := range payload.CustomFields {
		input.CustomFields = append(input.CustomFields, redmine.IssueCustomFieldUpdate{
			ID:     field.ID,
			Values: append([]string(nil), field.Values...),
		})
	}
	return input, nil
}

func parseOptionalInt(raw, fieldName string) (*int, error) {
	value := strings.TrimSpace(raw)
	if value == "" {
		return nil, nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return nil, fmt.Errorf("%s格式不正确", fieldName)
	}
	return &parsed, nil
}

func parseOptionalFloat(raw, fieldName string) (*float64, error) {
	value := strings.TrimSpace(raw)
	if value == "" {
		return nil, nil
	}
	parsed, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return nil, fmt.Errorf("%s格式不正确", fieldName)
	}
	return &parsed, nil
}
