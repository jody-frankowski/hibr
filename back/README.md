# Have I Been Rocked? API

## Usage

### Local Development

Download the rockyou list:

```shell
curl -LO https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt
```

Install the go dependencies:

```shell
go mod tidy
```

Run the server:

```shell
go run .
```

The API will be available at `http://localhost:8080/api/`.

#### Tests

Run all the tests:

```shell
go test ./...
```

### Docker

Build the image:

```shell
docker build -t haveibeenrocked-api .
```

Run the container:

```shell
docker run -p 8080:8080 haveibeenrocked-api
```

## API Docs

### Prefix Search ([k-anonymity](https://en.wikipedia.org/wiki/K-anonymity))

`GET /api/v1/prefix/[a-z0-9]{4}`

Example:

```shell
password="password"
hash="$(python -c "import hashlib; print(hashlib.blake2b(b'${password}', digest_size=32).hexdigest())")"
curl -s http://localhost:8080/api/v1/prefix/"${hash:0:4}" | grep -o "${hash}"
```

### Complete Hash Search

`GET /api/v1/hash/[a-z0-9]{64}`

Example:

```shell
password="password"
hash="$(python -c "import hashlib; print(hashlib.blake2b(b'${password}', digest_size=32).hexdigest())")"
curl -sf http://localhost:8080/api/v1/hash/"${hash}" && echo Found || echo Not found
```

## TODOs

- Tests
    - E&E tests
