package rockyou

import (
	"testing"
)

func TestMatches(t *testing.T) {
	tests := map[string]struct {
		input       string
		shouldMatch bool
	}{
		"Failing Test": {"bird", true},
	}

	for name, test := range tests {
		t.Run(name, func(t *testing.T) {
			t.Parallel()

			if match := Matches(test.input); match != test.shouldMatch {
				if test.shouldMatch {
					t.Fatalf("%s: false negative", test.input)
				} else {
					t.Fatalf("%s: false positive", test.input)
				}
			}
		})
	}
}
