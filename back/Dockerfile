FROM golang:1.24-alpine3.21 AS base

RUN adduser \
  --disabled-password \
  --gecos "" \
  --home "/nonexistent" \
  --shell "/sbin/nologin" \
  --no-create-home \
  go-user

RUN mkdir /db

# NOTE Add fallback with https://weakpass.com/download/90/rockyou.txt.gz ?
RUN wget https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt -O /tmp/rockyou.txt

WORKDIR /app
COPY . .
RUN go mod download
RUN go mod verify
RUN CGO_ENABLED=0 go build -o /main .

FROM scratch

COPY --from=base /etc/passwd /etc/passwd
COPY --from=base /etc/group /etc/group

ENV ROCKYOU_DB_PATH=/db
COPY --from=base --chown=go-user:go-user --chmod=700 /db/ /db/
VOLUME /db

ENV ROCKYOU_PATH=/tmp/rockyou.txt
COPY --from=base --chown=go-user:go-user --chmod=700 /tmp/rockyou.txt /tmp/rockyou.txt

COPY --from=base /main .

USER go-user:go-user
EXPOSE 8080
CMD ["./main"]
