package main

import (
	"encoding/json"
	"haveibeenrocked/internal/matchers/rockyou"
	"log"

	"github.com/fasthttp/router"
	"github.com/valyala/fasthttp"
)

func main() {
	rockYou, err := rockyou.New()
	if err != nil {
		log.Fatalf("Error loading rockyou: %v", err)
	}

	handlePassword := func(ctx *fasthttp.RequestCtx) {
		password := ctx.UserValue("password").(string)
		if password == "" {
			ctx.Error("Empty password parameter", fasthttp.StatusBadRequest)
			return
		}

		matches, err := rockYou.Matches(password)
		if err != nil {
			ctx.Error("Internal Server Error", fasthttp.StatusInternalServerError)
			log.Printf("Error matching password %s: %v", password, err)
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
		if prefix == "" {
			ctx.Error("Empty prefix parameter", fasthttp.StatusBadRequest)
			return
		}

		hashes, err := rockYou.PrefixSearch(prefix)
		if err != nil {
			ctx.Error("Internal Server Error", fasthttp.StatusInternalServerError)
			log.Printf("Error searching prefix %s: %v", prefix, err)
			return
		}

		ctx.SetStatusCode(fasthttp.StatusOK)
		ctx.Response.Header.SetCanonical([]byte("Content-Type"), []byte("application/json"))
		if err = json.NewEncoder(ctx).Encode(hashes); err != nil {
			log.Printf("Error encoding hashes %v: %v", hashes, err)
			ctx.Error("Internal Server Error", fasthttp.StatusInternalServerError)
		}
	}

	r := router.New()
	r.GET("/api/v1/password/{password}", handlePassword)
	r.GET("/api/v1/prefix/{prefix}", handlePrefix)

	const address = "127.0.0.1:8080"
	log.Printf("Starting server on %s", address)

	err = fasthttp.ListenAndServe(
		address,
		fasthttp.TimeoutHandler(r.Handler, 1000000000000, "Timeout"),
	)
	if err != nil {
		log.Fatalf("Error starting server: %v", err)
	}

	// FIXME Never reached because we stop the server with SIGINT
	if err = rockYou.Cleanup(); err != nil {
		log.Fatalf("Error cleaning up rockyou: %v", err)
	}
}
