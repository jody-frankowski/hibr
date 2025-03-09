package rockyou

import (
	"bufio"
	"encoding/binary"
	"encoding/hex"
	"errors"
	"io"
	"log"
	"os"

	"github.com/dgraph-io/badger/v4"
	"github.com/dgraph-io/badger/v4/options"
	"github.com/zeebo/xxh3"
)

var (
	hashNbBytes    = 16
	hashNbBytesHex = hashNbBytes * 2
)

type RockYou struct {
	db *badger.DB
}

func GetDBPath() string {
	dbPath := os.Getenv("ROCKYOU_DB_PATH")
	if dbPath == "" {
		dbPath = "/tmp/rockyou-db"
	}
	return dbPath
}

func GetRockYouFile() (*os.File, error) {
	return os.Open(getRockYouFilePath())
}

func getRockYouFilePath() string {
	rockYouPath := os.Getenv("ROCKYOU_PATH")
	if rockYouPath == "" {
		rockYouPath = "rockyou.txt"
	}
	return rockYouPath
}

func hexEncode(hash []byte) []byte {
	hexHash := make([]byte, hashNbBytesHex)
	hex.Encode(hexHash, hash)
	return hexHash
}

func (r *RockYou) Cleanup() error {
	return r.db.Close()
}

// Matches returns true if the hash is found in the RockYou database.
func (r *RockYou) Matches(hashHex []byte) (bool, error) {
	log.Printf("Hash Query: %s", hashHex)

	txn := r.db.NewTransaction(false)
	defer txn.Discard()

	hash, err := hex.DecodeString(string(hashHex))
	if err != nil {
		return false, err
	}

	_, err = txn.Get(hash)
	if err == nil {
		return true, nil
	} else if errors.Is(err, badger.ErrKeyNotFound) {
		return false, nil
	} else {
		return false, err
	}
}

func (r *RockYou) PrefixSearch(prefixToSearchHex []byte) ([]string, error) {
	txn := r.db.NewTransaction(false)
	defer txn.Discard()

	opts := badger.DefaultIteratorOptions
	opts.PrefetchValues = false
	it := txn.NewIterator(opts)
	defer it.Close()

	prefix, err := hex.DecodeString(string(prefixToSearchHex))
	if err != nil {
		return nil, err
	}

	hash := make([]byte, hashNbBytesHex)
	hashes := make([]string, 0)
	for it.Seek(prefix); it.ValidForPrefix(prefix); it.Next() {
		key := it.Item().Key()
		hex.Encode(hash, key)
		hashes = append(hashes, string(hash))
	}

	log.Printf("Hashes Found: %v %v", len(hashes), hashes)
	return hashes, nil
}

func hash(password []byte) []byte {
	hash := xxh3.Hash128(password)
	buf := make([]byte, hashNbBytes)
	binary.BigEndian.PutUint64(buf[:8], hash.Hi)
	binary.BigEndian.PutUint64(buf[8:], hash.Lo)
	return buf
}

func (r *RockYou) loadData(rockYou io.Reader) error {
	// Check if the data is already loaded
	const statusKey = "IS_LOADED"
	txn := r.db.NewTransaction(false)
	_, err := txn.Get([]byte(statusKey))
	txn.Discard()
	if err == nil {
		return nil
	} else if !errors.Is(err, badger.ErrKeyNotFound) {
		return err
	}

	scanner := bufio.NewScanner(rockYou)
	writeBatch := r.db.NewWriteBatch()
	defer writeBatch.Cancel()

	// FIXME Breaks early if a line is over 64k chars (it's not a problem with our rockyou.txt)
	for scanner.Scan() {
		password := scanner.Bytes()
		if err := writeBatch.Set(hash(password), nil); err != nil {
			return err
		}
	}

	// Set the key that indicates that the data is loaded
	err = writeBatch.Set([]byte(statusKey), []byte{1})
	if err != nil {
		return err
	}

	return writeBatch.Flush()
}

func New(rockYouFile io.Reader, dbPath string) (*RockYou, error) {
	badgerOptions := badger.DefaultOptions(dbPath).WithLoggingLevel(badger.WARNING)
	if dbPath == "" {
		badgerOptions = badger.DefaultOptions("").WithInMemory(true)
	}

	// Because our values are stored inline with the keys,
	// we don't need the value log to have a large pre-allocated size.
	// Set value log size to the minimum of 2MB.
	badgerOptions = badgerOptions.WithValueLogFileSize(1 << 20)
	// Set ZSTD compression instead of the Snappy default (~36MB smaller)
	badgerOptions = badgerOptions.WithCompression(options.ZSTD)
	// Use the maximum block size allowed. (~8MB smaller)
	badgerOptions = badgerOptions.WithBlockSize(16 * 1024)
	// Disable metrics
	badgerOptions = badgerOptions.WithMetricsEnabled(false)

	db, err := badger.Open(badgerOptions)
	if err != nil {
		return nil, err
	}

	rockYou := RockYou{db}

	err = rockYou.loadData(rockYouFile)
	if err != nil {
		return nil, err
	}
	log.Printf("RockYou loaded")

	return &rockYou, nil
}
