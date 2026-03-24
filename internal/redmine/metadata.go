package redmine

import (
	"net/http"
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
		result = append(result, Status{
			ID:   item.ID,
			Name: item.Name,
		})
	}

	return result, nil
}
