package rockyou

import (
	"bytes"
	"io"
	"log"
	"os"
	"slices"
	"testing"
)

var (
	tests = map[string]struct {
		input       string
		shouldMatch bool
	}{
		"Very First":   {"123456", true},
		"At The Start": {"123456789", true},
		"At The End":   {"       1234567", true},
		"Very Last": {
			string([]byte{0x04, 0x2a, 0x03, 0x37, 0xc2, 0xa1, 0x56, 0x61, 0x6d, 0x6f, 0x73,
				0x21, 0x03}),
			true}, // Useful to check that the whole file was properly loaded
		"Empty Password":     {"", true},
		"Longest Empty Line": {"                  ", true},
		"Longest Line": {"<div align=\\\\\\\\\\\\'center\\\\\\\\\\\\' style=\\\\\\\\\\\\'font:bold" +
			" 11px Verdana; width:310px\\\\\\\\\\\\'><a style=\\\\\\\\\\\\'background-color:#eeeeee" +
			";display:block;width:310px;border:solid 2px black; padding:5px\\\\\\\\\\\\' href" +
			"=\\\\\\\\\\\\'http://www.musik-live." +
			"net\\\\\\\\\\\\' target=\\\\\\\\\\\\'_blank\\\\\\\\\\\\'>Playing/Tangga", true},
		"Not In The List": {"DoesNotExistInRockYou", false},
	}
)

func Test(t *testing.T) {
	log.SetFlags(0)
	log.SetOutput(io.Discard)

	rockYouFile, err := GetRockYouFile()
	if err != nil {
		t.Fatalf("Error opening RockYou file: %v", err)
	}
	rockYou, err := New(rockYouFile, "/tmp/rockyou-db-tests")
	if err != nil {
		t.Fatalf("Error loading RockYou DB: %v", err)
	}

	for name, test := range tests {
		t.Run("Matches/"+name, func(t *testing.T) {
			t.Parallel()

			passwordHashHex := hexEncode(hash([]byte(test.input)))
			match, err := rockYou.Matches(passwordHashHex)
			if err != nil {
				t.Fatalf("Error matching password %s: %v", test.input, err)
			}
			if match != test.shouldMatch {
				if test.shouldMatch {
					t.Fatalf("hash(%s)=%s not found", test.input, passwordHashHex)
				} else {
					t.Fatalf("hash(%s)=%s unexpectedly found", test.input, passwordHashHex)
				}
			}
		})
	}

	for name, test := range tests {
		t.Run("PrefixSearch/"+name, func(t *testing.T) {
			t.Parallel()

			passwordHashHex := hexEncode(hash([]byte(test.input)))
			prefix := passwordHashHex[:4]
			hashes, err := rockYou.PrefixSearch(prefix)
			if err != nil {
				t.Fatalf("Error searching prefix %s for password %s: %v", prefix, test.input, err)
			}
			match := slices.Contains(hashes, string(passwordHashHex))
			if match != test.shouldMatch {
				if test.shouldMatch {
					t.Fatalf("hash(%s)=%s not found", test.input, passwordHashHex)
				} else {
					t.Fatalf("hash(%s)=%s unexpectedly found", test.input, passwordHashHex)
				}
			}
		})
	}
}

func BenchmarkNew(b *testing.B) {
	// Suppress logs to avoid stdout output during the benchmark
	log.SetFlags(0)
	log.SetOutput(io.Discard)

	// Read the input file in memory to avoid disk I/O during the benchmark
	data, err := os.ReadFile(getRockYouFilePath())
	if err != nil {
		b.Fatalf("Error reading rockyou: %v", err)
	}
	rockYouFile := bytes.NewReader(data)

	b.Run("New", func(b *testing.B) {
		for b.Loop() {
			rockYou, err := New(rockYouFile, "")
			if err != nil {
				b.Fatalf("Error loading RockYou DB: %v", err)
			}
			for _, test := range tests {
				passwordHashHex := hexEncode(hash([]byte(test.input)))
				prefix := passwordHashHex[:4]
				hashes, err := rockYou.PrefixSearch(prefix)
				if err != nil {
					b.Fatalf("Error searching prefix %s for password %s: %v", prefix, test.input, err)
				}
				match := slices.Contains(hashes, string(passwordHashHex))
				if match != test.shouldMatch {
					if test.shouldMatch {
						b.Fatalf("hash(%s)=%s not found", test.input, passwordHashHex)
					} else {
						b.Fatalf("hash(%s)=%s unexpectedly found", test.input, passwordHashHex)
					}
				}
			}
		}

		if _, err = rockYouFile.Seek(0, io.SeekStart); err != nil {
			b.Fatalf("Error seeking in RockYou file: %v", err)
		}
	})
}

func BenchmarkMatches(b *testing.B) {
	// Suppress logs to avoid stdout output during the benchmark
	log.SetFlags(0)
	log.SetOutput(io.Discard)

	rockYouFile, err := GetRockYouFile()
	if err != nil {
		b.Fatalf("Error opening RockYou file %s: %v", getRockYouFilePath(), err)
	}
	rockYou, err := New(rockYouFile, "")
	if err != nil {
		b.Fatalf("Error loading RockYou DB: %v", err)
	}

	for name, test := range tests {
		b.Run(name, func(b *testing.B) {
			for b.Loop() {
				passwordHashHex := hexEncode(hash([]byte(test.input)))
				match, err := rockYou.Matches(passwordHashHex)
				if err != nil {
					b.Fatalf("Error matching password %s: %v", test.input, err)
				}
				if match != test.shouldMatch {
					if test.shouldMatch {
						b.Fatalf("hash(%s)=%s not found", test.input, passwordHashHex)
					} else {
						b.Fatalf("hash(%s)=%s unexpectedly found", test.input, passwordHashHex)
					}
				}
			}
		})
	}
}

func BenchmarkHash(b *testing.B) {
	b.Run("Short Password", func(b *testing.B) {
		for b.Loop() {
			hash([]byte("password"))
		}
	})

	b.Run("Long Password", func(b *testing.B) {
		for b.Loop() {
			hash([]byte("This is a very long password to hash. " +
				"It's probably longer than yours ;) Really, it's a really long one!!!!!!!!"))
		}
	})
}
