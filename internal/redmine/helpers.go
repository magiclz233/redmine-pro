package redmine

import (
	"fmt"
	"redmine-pro/internal/shared"
	"strings"
	"time"
)

func toIssueSummary(issue issue) IssueSummary {
	return IssueSummary{
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

func buildIssueStandardFields(issue issue) []IssueField {
	return []IssueField{
		{Name: "项目", Value: refName(issue.Project)},
		{Name: "跟踪类型", Value: refName(issue.Tracker)},
		{Name: "状态", Value: refName(issue.Status)},
		{Name: "优先级", Value: refName(issue.Priority)},
		{Name: "作者", Value: refName(issue.Author)},
		{Name: "指派给", Value: refName(issue.AssignedTo)},
		{Name: "分类", Value: refName(issue.Category)},
		{Name: "目标版本", Value: refName(issue.FixedVersion)},
		{Name: "父任务", Value: formatParent(issue.Parent)},
		{Name: "开始日期", Value: formatDateValue(issue.StartDate)},
		{Name: "截止日期", Value: formatDateValue(issue.DueDate)},
		{Name: "预计工时", Value: formatHourValue(issue.EstimatedHours)},
		{Name: "已耗工时", Value: formatHourValue(issue.SpentHours)},
		{Name: "完成进度", Value: formatDoneRatio(issue.DoneRatio)},
		{Name: "私有问题", Value: formatBoolValue(issue.IsPrivate)},
		{Name: "创建时间", Value: formatTimestampValue(issue.CreatedOn)},
		{Name: "更新时间", Value: formatTimestampValue(issue.UpdatedOn)},
		{Name: "关闭时间", Value: formatTimestampValue(issue.ClosedOn)},
	}
}

func buildIssueCustomFields(customFields []customField) []IssueField {
	result := make([]IssueField, 0, len(customFields))
	for _, field := range customFields {
		result = append(result, IssueField{
			Name:  strings.TrimSpace(field.Name),
			Value: formatCustomFieldValue(field.Value),
		})
	}
	return result
}

func formatParent(ref *Ref) string {
	if ref == nil || ref.ID <= 0 {
		return ""
	}
	if name := strings.TrimSpace(ref.Name); name != "" {
		return fmt.Sprintf("#%d %s", ref.ID, name)
	}
	return fmt.Sprintf("#%d", ref.ID)
}

func formatDateValue(value string) string {
	return strings.TrimSpace(value)
}

func formatDoneRatio(doneRatio int) string {
	if doneRatio < 0 {
		doneRatio = 0
	}
	return fmt.Sprintf("%d%%", doneRatio)
}

func formatBoolValue(value *bool) string {
	if value == nil {
		return ""
	}
	if *value {
		return "是"
	}
	return "否"
}

func formatHourValue(value *float64) string {
	if value == nil {
		return ""
	}
	formatted := strings.TrimRight(strings.TrimRight(fmt.Sprintf("%.2f", *value), "0"), ".")
	if formatted == "" {
		formatted = "0"
	}
	return formatted + " 小时"
}

func formatTimestampValue(value string) string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return ""
	}

	parsed, err := time.Parse(time.RFC3339, trimmed)
	if err != nil {
		return trimmed
	}
	return parsed.Local().Format("2006-01-02 15:04")
}

func formatCustomFieldValue(value any) string {
	switch typed := value.(type) {
	case nil:
		return ""
	case string:
		return strings.TrimSpace(typed)
	case []string:
		parts := make([]string, 0, len(typed))
		for _, item := range typed {
			if normalized := strings.TrimSpace(item); normalized != "" {
				parts = append(parts, normalized)
			}
		}
		return strings.Join(parts, "，")
	case []any:
		parts := make([]string, 0, len(typed))
		for _, item := range typed {
			if normalized := formatCustomFieldValue(item); normalized != "" {
				parts = append(parts, normalized)
			}
		}
		return strings.Join(parts, "，")
	default:
		return strings.TrimSpace(fmt.Sprint(typed))
	}
}

func refID(ref *Ref) int {
	if ref == nil {
		return 0
	}
	return ref.ID
}

func refName(ref *Ref) string {
	if ref == nil {
		return ""
	}
	return ref.Name
}

// sanitizePage 复用 shared 层的分页规范，避免多个业务域重复维护相同的分页保护逻辑。
func sanitizePage(limit, offset int) (int, int) {
	return shared.NormalizePage(limit, offset, 50, 100)
}
