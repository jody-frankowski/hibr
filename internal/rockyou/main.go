package rockyou

import (
	"slices"
)

var passwords = []string{"cat", "dog"}

func Matches(password string) bool {
	return slices.Contains(passwords, password)
}
