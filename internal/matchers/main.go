package matchers

type Matcher interface {
	Cleanup() error
	Matches(string) (bool, error)
	PrefixSearch(string) ([]string, error)
}
