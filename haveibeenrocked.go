package main

import (
	"encoding/json"
	"haveibeenrocked/internal/matchers/rockyou"
	"log"
	"time"

	"github.com/fasthttp/router"
	"github.com/valyala/fasthttp"
)

var (
	prefixSize             = 4
	msgInternalServerError = "Internal Server Error"
)

func main() {
	rockYou, err := rockyou.New()
	if err != nil {
		log.Fatalf("Error loading rockyou: %v", err)
	}
	log.Printf("DB started")

	handleHash := func(ctx *fasthttp.RequestCtx) {
		hash := ctx.UserValue("hash").(string)
		if hash == "" {
			ctx.Error("Empty hash parameter", fasthttp.StatusBadRequest)
			return
		}

		matches, err := rockYou.Matches([]byte(hash))
		if err != nil {
			ctx.Error(msgInternalServerError, fasthttp.StatusInternalServerError)
			log.Printf("Error matching hash %s: %v", hash, err)
			return
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
			ctx.Error("Error: Prefix is too long or too short", fasthttp.StatusBadRequest)
			return
		}

		hashes, err := rockYou.PrefixSearch([]byte(prefix))
		if err != nil {
			ctx.Error(msgInternalServerError, fasthttp.StatusInternalServerError)
			log.Printf("Error searching prefix %s: %v", prefix, err)
			return
		}

		ctx.SetStatusCode(fasthttp.StatusOK)
		ctx.Response.Header.SetCanonical([]byte("Content-Type"), []byte("application/json"))
		if err = json.NewEncoder(ctx).Encode(hashes); err != nil {
			ctx.Error(msgInternalServerError, fasthttp.StatusInternalServerError)
			log.Printf("Error encoding hashes %v: %v", hashes, err)
		}
	}

	r := router.New()
	r.GET("/api/v1/hash/{hash}", handleHash)
	r.GET("/api/v1/prefix/{prefix}", handlePrefix)

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

	// FIXME Never reached because we stop the server with SIGINT
	if err = rockYou.Cleanup(); err != nil {
		log.Fatalf("Error cleaning up rockyou: %v", err)
	}
}
