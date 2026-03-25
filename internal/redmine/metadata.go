package redmine

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"
)

// GetCurrentUser 获取当前 API Key 对应的用户信息。
func (c *Client) GetCurrentUser() (User, error) {
	var response currentUserResponse
	if err := c.doJSON(http.MethodGet, "/users/current.json", nil, nil, &response); err != nil {
		return User{}, err
	}

	name := response.User.Name
	if name == "" {
		if response.User.Firstname != "" || response.User.Lastname != "" {
			name = strings.TrimSpace(response.User.Lastname + " " + response.User.Firstname)
		} else {
			name = response.User.Login
		}
	}

	return User{
		ID:    response.User.ID,
		Name:  name,
		Login: response.User.Login,
		Mail:  response.User.Mail,
	}, nil
}

// GetIssueStatuses 获取问题状态列表。
func (c *Client) GetIssueStatuses() ([]Status, error) {
	var response issueStatusListResponse
	if err := c.doJSON(http.MethodGet, "/issue_statuses.json", nil, nil, &response); err != nil {
		return nil, err
	}

	result := make([]Status, 0, len(response.IssueStatuses))
	for _, item := range response.IssueStatuses {
		result = append(result, Status{ID: item.ID, Name: item.Name})
	}
	return result, nil
}

// GetIssuePriorities 获取问题优先级枚举。
func (c *Client) GetIssuePriorities() ([]Option, error) {
	var response issuePriorityListResponse
	if err := c.doJSON(http.MethodGet, "/enumerations/issue_priorities.json", nil, nil, &response); err != nil {
		return nil, err
	}
	return refsToOptions(response.IssuePriorities), nil
}

// GetProjectTrackers 获取项目可用跟踪类型。
func (c *Client) GetProjectTrackers(projectID int) ([]Option, error) {
	project, err := c.getProject(projectID, "trackers")
	if err != nil {
		return nil, err
	}
	return refsToOptions(project.Trackers), nil
}

// GetProjectIssueCustomFields 获取项目级问题自定义字段定义。
// 该能力在部分 Redmine 版本上可能不可用，因此调用方应按“可选增强”使用。
func (c *Client) GetProjectIssueCustomFields(projectID int) ([]customFieldDefinition, error) {
	project, err := c.getProject(projectID, "issue_custom_fields")
	if err != nil {
		return nil, err
	}
	return project.IssueCustomFields, nil
}

// GetProjectIssueCategories 获取项目分类列表。
func (c *Client) GetProjectIssueCategories(projectID int) ([]Option, error) {
	var response issueCategoryListResponse
	if err := c.doJSON(http.MethodGet, fmt.Sprintf("/projects/%d/issue_categories.json", projectID), nil, nil, &response); err != nil {
		return nil, err
	}
	return refsToOptions(response.IssueCategories), nil
}

// GetProjectVersions 获取项目版本列表。
func (c *Client) GetProjectVersions(projectID int) ([]Option, error) {
	var response versionListResponse
	if err := c.doJSON(http.MethodGet, fmt.Sprintf("/projects/%d/versions.json", projectID), nil, nil, &response); err != nil {
		return nil, err
	}
	return refsToOptions(response.Versions), nil
}

// GetCustomFieldDefinitions 获取全局自定义字段定义。
// 标准 Redmine 通常要求管理员权限，因此这里由调用方按可选增强使用。
func (c *Client) GetCustomFieldDefinitions() ([]customFieldDefinition, error) {
	var response customFieldDefinitionListResponse
	if err := c.doJSON(http.MethodGet, "/custom_fields.json", nil, nil, &response); err != nil {
		return nil, err
	}
	return response.CustomFields, nil
}

// GetIssueEditMeta 获取问题编辑面板需要的元数据。
// 这里优先返回当前 Redmine 实例真实可用的下拉选项；若某类元数据接口不可用，则降级为空列表或普通输入框。
func (c *Client) GetIssueEditMeta(issueID int) (*IssueEditMeta, error) {
	rawIssue, err := c.getIssue(issueID)
	if err != nil {
		return nil, err
	}

	projectID := refID(rawIssue.Project)

	statuses := refsToOptions(rawIssue.AllowedStatuses)
	if len(statuses) == 0 {
		if fallbackStatuses, statusErr := c.GetIssueStatuses(); statusErr == nil {
			statuses = statusListToOptions(fallbackStatuses)
		}
	}

	trackers := []Option{}
	if projectID > 0 {
		if items, trackerErr := c.GetProjectTrackers(projectID); trackerErr == nil {
			trackers = items
		}
	}
	priorities := []Option{}
	if items, priorityErr := c.GetIssuePriorities(); priorityErr == nil {
		priorities = items
	}
	assignees := []User{}
	if projectID > 0 {
		if items, assigneeErr := c.GetProjectMembers(projectID); assigneeErr == nil {
			assignees = items
		}
	}
	categories := []Option{}
	if projectID > 0 {
		if items, categoryErr := c.GetProjectIssueCategories(projectID); categoryErr == nil {
			categories = items
		}
	}
	versions := []Option{}
	if projectID > 0 {
		if items, versionErr := c.GetProjectVersions(projectID); versionErr == nil {
			versions = items
		}
	}

	projectCustomFields := []customFieldDefinition{}
	if projectID > 0 {
		if items, projectFieldErr := c.GetProjectIssueCustomFields(projectID); projectFieldErr == nil {
			projectCustomFields = items
		}
	}
	globalCustomFields := []customFieldDefinition{}
	if items, globalFieldErr := c.GetCustomFieldDefinitions(); globalFieldErr == nil {
		globalCustomFields = items
	}

	return &IssueEditMeta{
		Subject:        strings.TrimSpace(rawIssue.Subject),
		Description:    rawIssue.Description,
		TrackerID:      refID(rawIssue.Tracker),
		StatusID:       refID(rawIssue.Status),
		PriorityID:     refID(rawIssue.Priority),
		AssigneeID:     refID(rawIssue.AssignedTo),
		CategoryID:     refID(rawIssue.Category),
		FixedVersionID: refID(rawIssue.FixedVersion),
		ParentIssueID:  refID(rawIssue.Parent),
		StartDate:      strings.TrimSpace(rawIssue.StartDate),
		DueDate:        strings.TrimSpace(rawIssue.DueDate),
		EstimatedHours: formatEditHourValue(rawIssue.EstimatedHours),
		DoneRatio:      rawIssue.DoneRatio,
		Trackers:       trackers,
		Statuses:       statuses,
		Priorities:     priorities,
		Assignees:      assignees,
		Categories:     categories,
		Versions:       versions,
		CustomFields:   buildIssueEditCustomFields(rawIssue.CustomFields, projectCustomFields, globalCustomFields),
	}, nil
}

func (c *Client) getProject(projectID int, include string) (project, error) {
	var response projectResponse
	apiPath := fmt.Sprintf("/projects/%d.json", projectID)
	query := url.Values{}
	if include != "" {
		query.Set("include", include)
	}
	if err := c.doJSON(http.MethodGet, apiPath, query, nil, &response); err != nil {
		return project{}, err
	}
	return response.Project, nil
}

func refsToOptions(refs []Ref) []Option {
	result := make([]Option, 0, len(refs))
	for _, item := range refs {
		result = append(result, Option{ID: item.ID, Name: item.Name})
	}
	return result
}

func statusListToOptions(items []Status) []Option {
	result := make([]Option, 0, len(items))
	for _, item := range items {
		result = append(result, Option{ID: item.ID, Name: item.Name})
	}
	return result
}

func buildIssueEditCustomFields(currentFields []customField, projectDefs, globalDefs []customFieldDefinition) []IssueCustomFieldMeta {
	currentMap := make(map[int]customField, len(currentFields))
	definitionMap := make(map[int]customFieldDefinition, len(projectDefs)+len(globalDefs))
	order := make([]int, 0, len(projectDefs)+len(currentFields))
	seen := make(map[int]struct{}, len(projectDefs)+len(currentFields))

	for _, item := range projectDefs {
		definitionMap[item.ID] = item
		if _, exists := seen[item.ID]; !exists {
			order = append(order, item.ID)
			seen[item.ID] = struct{}{}
		}
	}

	for _, item := range globalDefs {
		existing, exists := definitionMap[item.ID]
		if !exists {
			definitionMap[item.ID] = item
			continue
		}
		definitionMap[item.ID] = mergeCustomFieldDefinition(existing, item)
	}

	for _, field := range currentFields {
		currentMap[field.ID] = field
		if _, exists := seen[field.ID]; !exists {
			order = append(order, field.ID)
			seen[field.ID] = struct{}{}
		}
	}

	result := make([]IssueCustomFieldMeta, 0, len(order))
	for _, id := range order {
		definition := definitionMap[id]
		current := currentMap[id]
		values := normalizeCustomFieldValues(current.Value)
		meta := IssueCustomFieldMeta{
			ID:             id,
			Name:           firstNonEmpty(strings.TrimSpace(current.Name), strings.TrimSpace(definition.Name)),
			FieldFormat:    strings.TrimSpace(definition.FieldFormat),
			Multiple:       definition.Multiple,
			Required:       definition.Required,
			Values:         values,
			PossibleValues: normalizeFieldOptions(definition.PossibleValues),
		}
		if len(meta.Values) > 0 {
			meta.Value = meta.Values[0]
		}
		if meta.Name == "" {
			meta.Name = fmt.Sprintf("字段 %d", id)
		}
		if meta.FieldFormat == "bool" && len(meta.PossibleValues) == 0 {
			meta.PossibleValues = []FieldOption{{Label: "是", Value: "1"}, {Label: "否", Value: "0"}}
		}
		result = append(result, meta)
	}
	return result
}

func mergeCustomFieldDefinition(base, override customFieldDefinition) customFieldDefinition {
	result := base
	if strings.TrimSpace(result.Name) == "" {
		result.Name = override.Name
	}
	if strings.TrimSpace(result.FieldFormat) == "" {
		result.FieldFormat = override.FieldFormat
	}
	if !result.Multiple {
		result.Multiple = override.Multiple
	}
	if !result.Required {
		result.Required = override.Required
	}
	if len(result.PossibleValues) == 0 && len(override.PossibleValues) > 0 {
		result.PossibleValues = override.PossibleValues
	}
	return result
}

func normalizeFieldOptions(rawValues []any) []FieldOption {
	result := make([]FieldOption, 0, len(rawValues))
	for _, item := range rawValues {
		switch typed := item.(type) {
		case string:
			value := strings.TrimSpace(typed)
			if value != "" {
				result = append(result, FieldOption{Label: value, Value: value})
			}
		case map[string]any:
			label := strings.TrimSpace(anyToString(typed["label"]))
			value := strings.TrimSpace(anyToString(typed["value"]))
			if value == "" {
				value = label
			}
			if label == "" {
				label = value
			}
			if value != "" {
				result = append(result, FieldOption{Label: label, Value: value})
			}
		default:
			value := strings.TrimSpace(anyToString(typed))
			if value != "" {
				result = append(result, FieldOption{Label: value, Value: value})
			}
		}
	}
	return result
}

func anyToString(value any) string {
	if value == nil {
		return ""
	}
	return fmt.Sprint(value)
}

func normalizeCustomFieldValues(value any) []string {
	switch typed := value.(type) {
	case nil:
		return nil
	case string:
		normalized := strings.TrimSpace(typed)
		if normalized == "" {
			return nil
		}
		return []string{normalized}
	case []string:
		result := make([]string, 0, len(typed))
		for _, item := range typed {
			if normalized := strings.TrimSpace(item); normalized != "" {
				result = append(result, normalized)
			}
		}
		return result
	case []any:
		result := make([]string, 0, len(typed))
		for _, item := range typed {
			if normalized := strings.TrimSpace(anyToString(item)); normalized != "" {
				result = append(result, normalized)
			}
		}
		return result
	default:
		normalized := strings.TrimSpace(anyToString(typed))
		if normalized == "" {
			return nil
		}
		return []string{normalized}
	}
}

func formatEditHourValue(value *float64) string {
	if value == nil {
		return ""
	}
	formatted := strings.TrimRight(strings.TrimRight(fmt.Sprintf("%.2f", *value), "0"), ".")
	if formatted == "" {
		return "0"
	}
	return formatted
}

func firstNonEmpty(values ...string) string {
	for _, item := range values {
		if strings.TrimSpace(item) != "" {
			return strings.TrimSpace(item)
		}
	}
	return ""
}
