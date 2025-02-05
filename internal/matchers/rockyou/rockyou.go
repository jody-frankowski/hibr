package rockyou

import (
	"bufio"
	"encoding/hex"
	"errors"
	"log"
	"os"

	"github.com/dgraph-io/badger/v4"
	"golang.org/x/crypto/blake2b"
)

type Hash = [32]byte

type RockYou struct {
	db *badger.DB

	// Prefix to avoid empty key errors and later potential collisions
	prefix []byte
}

func (r *RockYou) Cleanup() error {
	return r.db.Close()
}

func (r *RockYou) Matches(hash string) (bool, error) {
	log.Printf("Hash Query: %s", hash)

	txn := r.db.NewTransaction(false)
	defer txn.Discard()

	hashBytes, err := hex.DecodeString(hash)
	if err != nil {
		log.Printf("Error decoding hex hash %s: %v", hash, err)
		return false, err
	}
	_, err = txn.Get(append(r.prefix, hashBytes...))
	if err == nil {
		return true, nil
	} else if errors.Is(err, badger.ErrKeyNotFound) {
		return false, nil
	} else {
		return false, err
	}
}

func (r *RockYou) PrefixSearch(prefix string) ([]string, error) {
	return nil, nil
}

func hash(password string) Hash {
	return blake2b.Sum256([]byte(password))
}

func hashChan(password string, c chan Hash) {
	c <- hash(password)
}

func (r *RockYou) loadData(fileName string) error {
	txn := r.db.NewTransaction(false)
	_, err := txn.Get(append([]byte("LOADED_STATUS:"), r.prefix...))
	txn.Discard()
	if err == nil {
		return nil
	} else if !errors.Is(err, badger.ErrKeyNotFound) {
		return err
	}

	file, err := os.Open(fileName)
	defer file.Close()
	if err != nil {
		return err
	}

	scanner := bufio.NewScanner(file)
	writeBatch := r.db.NewWriteBatch()
	defer writeBatch.Cancel()
	// FIXME Breaks early if a line is over 64k chars (it's not a problem with our rockyou.txt)
	for scanner.Scan() {
		password := scanner.Text()
		passwordHash := hash(password)
		key := append(r.prefix, passwordHash[:]...)
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

func New() (*RockYou, error) {
	db, err := badger.Open(badger.DefaultOptions("/tmp/badger"))
	if err != nil {
		return nil, err
	}

	rockYou := RockYou{db, []byte("RYH:")} // RY = RockYou, H = Hash

	err = rockYou.loadData("rockyou.txt")
	if err != nil {
		return nil, err
	}

	// TODO Reopen with opt := badger.DefaultOptions("").WithInMemory(true)
	// when it's loaded and saved to file?

	return &rockYou, nil
}
