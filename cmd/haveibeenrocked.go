package main

import (
	"haveibeenrocked/internal/router"
	"log"

	"github.com/valyala/fasthttp"
)

func main() {
	const address = "127.0.0.1:8080"
	if err := fasthttp.ListenAndServe(address, router.Route); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
