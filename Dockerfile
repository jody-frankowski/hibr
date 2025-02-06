FROM golang:1.23-alpine3.21 AS base

RUN adduser \
  --disabled-password \
  --gecos "" \
  --home "/nonexistent" \
  --shell "/sbin/nologin" \
  --no-create-home \
  go-user

RUN mkdir /db

WORKDIR /app

COPY . .

RUN go mod download
RUN go mod verify
RUN CGO_ENABLED=0 go build -o /main .

FROM scratch

COPY --from=base /etc/passwd /etc/passwd
COPY --from=base /etc/group /etc/group

COPY --from=base /main .

ENV DB_PATH=/db
COPY --from=base --chown=go-user:go-user --chmod=700 /db/ /db/
VOLUME /db

USER go-user:go-user
EXPOSE 8080
CMD ["./main"]