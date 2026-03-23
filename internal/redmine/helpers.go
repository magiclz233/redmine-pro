package redmine

import "redmine-pro/internal/shared"

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
