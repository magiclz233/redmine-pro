package redmine

import (
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
)

// GetProjectMembers 获取项目成员列表。
// Redmine 的项目成员接口可能分页返回，因此这里在 Go 侧统一拉平，前端只消费最终结果。
func (c *Client) GetProjectMembers(projectID int) ([]User, error) {
	if projectID <= 0 {
		return nil, errors.New("项目 ID 必须大于 0")
	}

	seen := map[int]struct{}{}
	result := make([]User, 0)
	offset := 0
	limit := 100

	for {
		query := url.Values{}
		query.Set("limit", strconv.Itoa(limit))
		query.Set("offset", strconv.Itoa(offset))

		var response membershipListResponse
		if err := c.doJSON(
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

		for _, item := range response.Memberships {
			if item.User == nil {
				continue
			}
			if _, exists := seen[item.User.ID]; exists {
				continue
			}

			seen[item.User.ID] = struct{}{}
			result = append(result, User{
				ID:   item.User.ID,
				Name: item.User.Name,
			})
		}

		offset += len(response.Memberships)
		if response.TotalCount == 0 || offset >= response.TotalCount {
			break
		}
	}

	return result, nil
}
