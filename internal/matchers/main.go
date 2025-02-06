package matchers

type Matcher interface {
	Cleanup() error
	Matches([]byte) (bool, error)
	PrefixSearch([]byte) ([]string, error)
}
