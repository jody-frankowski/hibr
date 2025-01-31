package router

import (
	"haveibeenrocked/internal/rockyou"

	"github.com/valyala/fasthttp"
)

func checkPassword(ctx *fasthttp.RequestCtx) {
	args := ctx.URI().QueryArgs()
	password := string(args.Peek("password"))

	if password == "" {
		ctx.SetStatusCode(fasthttp.StatusBadRequest)
		ctx.SetBodyString("Password parameter is missing")
		return
	}

	if rockyou.Matches(password) {
		ctx.SetStatusCode(fasthttp.StatusOK)
	} else {
		ctx.SetStatusCode(fasthttp.StatusNotFound)
	}
}

func Route(ctx *fasthttp.RequestCtx) {
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
