package rockyou

import (
	"encoding/hex"
	"io"
	"log"
	"testing"
)

func TestMatches(t *testing.T) {
	tests := map[string]struct {
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

	log.SetFlags(0)
	log.SetOutput(io.Discard)
	rockYou, err := New()
	if err != nil {
		log.Fatalf("Error loading rockyou: %v", err)
		return
	}

	for name, test := range tests {
		t.Run(name, func(t *testing.T) {
			t.Parallel()

			passwordHash := hash(test.input)
			passwordHashHex := hex.EncodeToString(passwordHash[:])
			if match, _ := rockYou.Matches(passwordHashHex); match != test.shouldMatch {
				if test.shouldMatch {
					t.Fatalf("%s: false negative", test.input)
				} else {
					t.Fatalf("%s: false positive", test.input)
				}
			}
		})
	}
}

func BenchmarkMatches(b *testing.B) {
	tests := map[string]struct {
		input       string
		shouldMatch bool
	}{
		"Very First": {"123456", true},
		"Very Last": {
			string([]byte{0x04, 0x2a, 0x03, 0x37, 0xc2, 0xa1, 0x56, 0x61, 0x6d, 0x6f, 0x73, 0x21, 0x03}),
			true,
		},
		"Not In The List": {"DoesNotExistInRockYou", false},
	}

	log.SetFlags(0)
	log.SetOutput(io.Discard)
	rockYou, err := New()
	if err != nil {
		log.Fatalf("Error loading rockyou: %v", err)
		return
	}

	for name, test := range tests {
		b.Run(name, func(b *testing.B) {
			passwordHash := hash(test.input)
			passwordHashHex := hex.EncodeToString(passwordHash[:])

			match, err := rockYou.Matches(passwordHashHex)
			if err != nil {
				b.Fatalf("Error matching password %s: %v", test.input, err)
			}
			if match != test.shouldMatch {
				if test.shouldMatch {
					b.Fatalf("%s: false negative", test.input)
				} else {
					b.Fatalf("%s: false positive", test.input)
				}
			}
		})
	}
}
