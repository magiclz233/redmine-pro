package shared

// NormalizePage 用于统一处理列表型接口的分页参数。
// 这里放在 shared 层而不是具体业务包中，是因为后续 issues、projects、time entries、
// statistics 等多个域都会复用相同的分页约束规则。
func NormalizePage(limit, offset, defaultLimit, maxLimit int) (int, int) {
	if defaultLimit <= 0 {
		defaultLimit = 50
	}
	if maxLimit <= 0 {
		maxLimit = 100
	}

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
