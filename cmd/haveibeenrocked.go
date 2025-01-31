package main

import (
	"log"
	"slices"

	"github.com/valyala/fasthttp"
)

var passwords = []string{"cat", "dog"}

func checkPassword(ctx *fasthttp.RequestCtx) {
	args := ctx.URI().QueryArgs()
	password := string(args.Peek("password"))

	if password == "" {
		ctx.SetStatusCode(fasthttp.StatusBadRequest)
		ctx.SetBodyString("Password parameter is missing")
		return
	}

	if slices.Contains(passwords, password) {
		ctx.SetStatusCode(fasthttp.StatusOK)
		ctx.SetBodyString("Found")
	} else {
		ctx.SetStatusCode(fasthttp.StatusNotFound)
		ctx.SetBodyString("Nope")
	}
}

func apiHandler(ctx *fasthttp.RequestCtx) {
	routes := map[string]func(ctx *fasthttp.RequestCtx){
		"/api/v1/check": checkPassword,
	}

	if string(ctx.Method()) != fasthttp.MethodGet {
		ctx.SetStatusCode(fasthttp.StatusMethodNotAllowed)
		ctx.SetBodyString("Method Not Allowed")
		return
	}

	if handler, ok := routes[string(ctx.Path())]; ok {
		handler(ctx)
		return
	}

	ctx.SetStatusCode(fasthttp.StatusBadRequest)
	ctx.SetBodyString("Route not found")
	return
}

func main() {
	const address = "127.0.0.1:8080"
	if err := fasthttp.ListenAndServe(address, apiHandler); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
