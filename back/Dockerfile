FROM golang:1.25-alpine AS base

RUN adduser \
  --disabled-password \
  --gecos "" \
  --home "/nonexistent" \
  --shell "/sbin/nologin" \
  --no-create-home \
  go

RUN mkdir /db

WORKDIR /app
COPY . .
RUN go mod download
RUN go mod verify
RUN CGO_ENABLED=0 go build -o /main .

FROM scratch

COPY --from=base /etc/group /etc/group
COPY --from=base /etc/passwd /etc/passwd
COPY --from=base /etc/ssl /etc/ssl

ENV ROCKYOU_URL=https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt
ENV ROCKYOU_DB_PATH=/db
COPY --from=base --chown=go:go /db /db
VOLUME /db

COPY --from=base /main .

USER go:go
EXPOSE 8080
CMD ["./main"]
