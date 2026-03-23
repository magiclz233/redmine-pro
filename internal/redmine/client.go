package redmine

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	defaultTimeout = 20 * time.Second
)

// Client 是 Redmine REST API 的轻量客户端。
// 它只负责请求构建、认证头注入、错误处理和 JSON 编解码，
// 不直接承载页面级 DTO 和 Wails 绑定逻辑。
type Client struct {
	baseURL string
	apiKey  string
	client  *http.Client
}

// NewClient 创建一个可复用的 Redmine 客户端。
func NewClient(baseURL, apiKey string) (*Client, error) {
	normalizedURL, err := normalizeBaseURL(baseURL)
	if err != nil {
		return nil, err
	}

	key := strings.TrimSpace(apiKey)
	if key == "" {
		return nil, errors.New("API Key 不能为空")
	}

	return &Client{
		baseURL: normalizedURL,
		apiKey:  key,
		client: &http.Client{
			Timeout: defaultTimeout,
		},
	}, nil
}

func normalizeBaseURL(raw string) (string, error) {
	value := strings.TrimSpace(raw)
	if value == "" {
		return "", errors.New("Redmine 地址不能为空")
	}

	parsed, err := url.Parse(value)
	if err != nil {
		return "", fmt.Errorf("Redmine 地址格式不正确: %w", err)
	}
	if parsed.Scheme == "" || parsed.Host == "" {
		return "", errors.New("Redmine 地址必须包含协议和域名，例如 https://redmine.example.com")
	}

	parsed.Path = strings.TrimRight(parsed.Path, "/")
	parsed.RawQuery = ""
	parsed.Fragment = ""

	return parsed.String(), nil
}

// doJSON 统一处理 Redmine JSON API 的请求与响应。
// 这里集中处理认证、错误文案和响应解码，避免业务代码重复堆叠同样的样板逻辑。
func (c *Client) doJSON(method, apiPath string, query url.Values, reqBody any, respBody any) error {
	fullURL := c.baseURL + apiPath
	if query != nil && len(query) > 0 {
		fullURL += "?" + query.Encode()
	}

	var bodyReader io.Reader
	if reqBody != nil {
		payload, err := json.Marshal(reqBody)
		if err != nil {
			return fmt.Errorf("序列化请求失败: %w", err)
		}
		bodyReader = strings.NewReader(string(payload))
	}

	req, err := http.NewRequest(method, fullURL, bodyReader)
	if err != nil {
		return fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("X-Redmine-API-Key", c.apiKey)
	req.Header.Set("Accept", "application/json")
	if reqBody != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("访问 Redmine 失败: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		raw, _ := io.ReadAll(io.LimitReader(resp.Body, 8*1024))
		msg := strings.TrimSpace(string(raw))
		if msg == "" {
			msg = http.StatusText(resp.StatusCode)
		}
		return fmt.Errorf("Redmine API 请求失败: %s %s (HTTP %d) %s", method, apiPath, resp.StatusCode, msg)
	}

	if respBody == nil {
		_, _ = io.Copy(io.Discard, resp.Body)
		return nil
	}

	if err := json.NewDecoder(resp.Body).Decode(respBody); err != nil {
		return fmt.Errorf("解析 Redmine 响应失败: %w", err)
	}

	return nil
}
