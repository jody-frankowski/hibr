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
go run .
```

Start the reverse proxy:

```bash
caddy run
```

The API will be available at `http://localhost:8081/api`.

## API

### Prefix Search ([k-anonymity - Wikipedia](https://en.wikipedia.org/wiki/K-anonymity))

`GET /api/v1/prefix/[a-z0-9]{4}`

Example:

```bash
password="password"
hash="$(python -c "import hashlib; print(hashlib.blake2b(b'${password}', digest_size=32).hexdigest())")"
curl -s http://localhost:8080/api/v1/prefix/"${hash:0:4}" | grep -o "${hash}"
```

### Complete Hash Search

`GET /api/v1/hash/[a-z0-9]{64}`

Example:

```bash
password="password"
hash="$(python -c "import hashlib; print(hashlib.blake2b(b'${password}', digest_size=32).hexdigest())")"
curl -sf http://localhost:8080/api/v1/hash/"${hash}" && echo Found || echo Not found
```

## TODOs

- DB
  - Use 128 bits hash?
- Tests
    - E&E tests
