# HaveIBeenRocked

Download the rockyou list:

```bash
curl -LO https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt
```

Install the go dependencies:

```bash
go mod tidy
```

Run the server:

```bash
go run cmd/haveibeenrocked.go
```

Start the reverse proxy:

```bash
caddy run
```

The API will be available at `http://localhost:8081/api`.

## TODOs

### Tests

- E&E tests
