package main

import (
	"encoding/hex"
	"encoding/json"
	"errors"
	"haveibeenrocked/internal/matchers/rockyou"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/fasthttp/router"
	"github.com/valyala/fasthttp"
)

var (
	prefixSize            = 4
	errorEmptyHashParam   = "Empty hash parameter"
	errorInternalServer   = "Error: Internal Server Error"
	errorOddLengthHashHex = "Error: Hex hash parameter has an invalid odd length"
	errorWrongPrefixSize  = "Error: Wrong prefix size"
)

func main() {
	rockYouFile, err := rockyou.GetRockYouFile()
	if err != nil {
		log.Fatalf("Error opening RockYou file: %v", err)
	}
	dbPath := rockyou.GetDBPath()

	rockYou, err := rockyou.New(rockYouFile, dbPath)
	_ = rockYouFile.Close()
	if err != nil {
		log.Fatalf("Error starting RockYou DB: %v", err)
	}
	defer func() {
		if err = rockYou.Cleanup(); err != nil {
			log.Fatalf("Error stopping RockYou DB: %v", err)
		}
	}()

	log.Printf("DB started")

	handleHash := func(ctx *fasthttp.RequestCtx) {
		hash := ctx.UserValue("hash").(string)
		if hash == "" {
			ctx.Error(errorEmptyHashParam, fasthttp.StatusBadRequest)
			return
		}

		matches, err := rockYou.Matches([]byte(hash))
		if err != nil {
			log.Printf("Error matching hash %s: %v", hash, err)
			if errors.Is(err, hex.ErrLength) {
				ctx.Error(errorOddLengthHashHex, fasthttp.StatusBadRequest)
				return
			} else {
				ctx.Error(errorInternalServer, fasthttp.StatusInternalServerError)
				return
			}
		}

		if matches {
			ctx.SetStatusCode(fasthttp.StatusOK)
		} else {
			ctx.SetStatusCode(fasthttp.StatusNotFound)
		}
	}

	handlePrefix := func(ctx *fasthttp.RequestCtx) {
		prefix := ctx.UserValue("prefix").(string)
		if len(prefix) != prefixSize {
			ctx.Error(errorWrongPrefixSize, fasthttp.StatusBadRequest)
			return
		}

		hashes, err := rockYou.PrefixSearch([]byte(prefix))
		if err != nil {
			ctx.Error(errorInternalServer, fasthttp.StatusInternalServerError)
			log.Printf("Error searching prefix %s: %v", prefix, err)
			return
		}

		ctx.SetStatusCode(fasthttp.StatusOK)
		ctx.Response.Header.SetCanonical([]byte("Content-Type"), []byte("application/json"))
		if err = json.NewEncoder(ctx).Encode(hashes); err != nil {
			ctx.Error(errorInternalServer, fasthttp.StatusInternalServerError)
			log.Printf("Error encoding hashes %v: %v", hashes, err)
		}
	}

	r := router.New()
	r.GET("/api/v1/hash/{hash}", handleHash)
	r.GET("/api/v1/prefix/{prefix}", handlePrefix)

	go func() {
		const address = "0.0.0.0:8080"
		log.Printf("Starting server on %s", address)
		// 1s timeout (Actually responds in less than 1ms).
		timeoutDuration := time.Duration(1000 * 1000 * 1000)
		err = fasthttp.ListenAndServe(
			address,
			fasthttp.TimeoutHandler(r.Handler, timeoutDuration, "Timeout"),
		)
		if err != nil {
			log.Fatalf("Error starting server: %v", err)
		}
	}()

	// Block until a signal is received
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	sig := <-sigChan
	log.Printf("Received signal: %v. Shutting down...", sig)
}
