package rockyou

import (
	"bufio"
	"encoding/hex"
	"errors"
	"log"
	"os"

	"github.com/dgraph-io/badger/v4"
	"github.com/zeebo/xxh3"
)

var (
	hashNbBytes    = 16
	hashNbBytesHex = hashNbBytes * 2
)

type RockYou struct {
	db *badger.DB

	// Prefix to avoid empty key errors and later potential collisions
	prefix []byte
}

func GetDBPath() string {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "/tmp/badger"
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

func (r *RockYou) Cleanup() error {
	return r.db.Close()
}

func (r *RockYou) Matches(hash []byte) (bool, error) {
	log.Printf("Hash Query: %s", hash)

	txn := r.db.NewTransaction(false)
	defer txn.Discard()

	_, err := txn.Get(append(r.prefix, hash...))
	if err == nil {
		return true, nil
	} else if errors.Is(err, badger.ErrKeyNotFound) {
		return false, nil
	} else {
		return false, err
	}
}

func (r *RockYou) PrefixSearch(prefixToSearch []byte) ([]string, error) {
	txn := r.db.NewTransaction(false)
	defer txn.Discard()

	opts := badger.DefaultIteratorOptions
	opts.PrefetchValues = false
	it := txn.NewIterator(opts)
	defer it.Close()

	hashes := make([]string, 0)
	prefix := append(r.prefix, prefixToSearch...)
	for it.Seek(prefix); it.ValidForPrefix(prefix); it.Next() {
		key := it.Item().Key()
		hash := string(key[len(r.prefix):])
		hashes = append(hashes, hash)
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
	txn := r.db.NewTransaction(false)
	_, err := txn.Get(append([]byte("LOADED_STATUS:"), r.prefix...))
	txn.Discard()
	if err == nil {
		return nil
	} else if !errors.Is(err, badger.ErrKeyNotFound) {
		return err
	}

	scanner := bufio.NewScanner(rockYou)
	writeBatch := r.db.NewWriteBatch()
	defer writeBatch.Cancel()
	passwordHashHex := make([]byte, hashHexSize)
	// FIXME Breaks early if a line is over 64k chars (it's not a problem with our rockyou.txt)
	for scanner.Scan() {
		password := scanner.Text()
		passwordHash := hash(password)
		hex.Encode(passwordHashHex, passwordHash[:])

		key := append(r.prefix, passwordHashHex...)
		if err := writeBatch.Set(key, []byte{}); err != nil {
			return err
		}
	}
	err = writeBatch.Set(append([]byte("LOADED_STATUS:"), r.prefix...), []byte{1})
	if err != nil {
		return err
	}

	return writeBatch.Flush()
}

func New(rockYouFile io.Reader, dbPath string, inMemory bool) (*RockYou, error) {
	badgerOptions := badger.DefaultOptions(dbPath)
	if inMemory {
		badgerOptions = badger.DefaultOptions("").WithInMemory(true)
	}
	badgerOptions = badgerOptions.WithMetricsEnabled(false).WithLoggingLevel(badger.WARNING)
	db, err := badger.Open(badgerOptions)
	if err != nil {
		return nil, err
	}

	rockYou := RockYou{db, []byte("RY:")} // RY = RockYou

	err = rockYou.loadData(rockYouFile)
	if err != nil {
		return nil, err
	}
	log.Printf("RockYou loaded")

	// TODO Reopen with opt := badger.DefaultOptions("").WithInMemory(true)
	// when it's loaded and saved to file?

	return &rockYou, nil
}
