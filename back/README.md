# Have I Been Rocked? Back

## Usage

### Local Development

Download the RockYou file:

```shell
curl -LO https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt
```

Or alternatively, set the RockYou file URL, which will be automatically downloaded and loaded for
you:

```shell
export ROCKYOU_URL=https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt
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
docker build -t hibr-back .
```

Run the container:

```shell
docker run -p 8080:8080 hibr-back
```

## API Docs

### Prefix Search ([k-anonymity](https://en.wikipedia.org/wiki/K-anonymity))

`GET /api/v1/prefix/[a-z0-9]{4}`

Example:

```shell
hash="$(echo -n password | xxh128sum | awk '{print $1}')"
curl -s http://localhost:8080/api/v1/prefix/"${hash:0:4}" | grep -o "${hash}"
```

### Complete Hash Search

`GET /api/v1/hash/[a-z0-9]{64}`

Example:

```shell
hash="$(echo -n password | xxh128sum | awk '{print $1}')"
curl -sf http://localhost:8080/api/v1/hash/"${hash}" && echo Found || echo Not found
```
