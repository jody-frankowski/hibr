# Have I Been Rocked?

## Usage

```sh
docker compose up --build
```

[https://localhost:8081](https://localhost:8081)

Local development instructions are in the READMEs of the subdirectories.

## Architecture

- `back/`  Go API
- `front/` Next.js TypeScript frontend
- `rp/`    Caddy reverse proxy

### Back

Go was chosen for its simplicity and speed.

[hypermodeinc/badger](https://github.com/hypermodeinc/badger),
a key-value store, was used because of its speed and the nature of the data being stored and
queried (only checking the existence of a key in the dataset is needed).
The DB lives in the same Go process as the HTTP server. Even though it's saved to disk, the DB
should be completely loaded into memory.

If there ever were a need to share the DB between several back-end instances, the code should
easily be extractable into a separate service.
However, it wasn't given much further considerations since network queries would add some
latencies and our dataset should fit in most instance memory and hence allow for a quick and easy
horizontal-scaling, should it be needed.

The rockyou.txt file is stored in the Docker image as a convenience. And for local development,
an environment variable `ROCKYOU_PATH` can be set to point the file otherwise a default
`back/rockyou.txt` is used.

When loading the DB, we check if the DB was already loaded by checking for a key's existence. If
it's not, we read the file, hash every password and store them in the DB.

The back has two routes, one for searching a whole password with its hash and another for
searching a password with its hash prefix.

The first route was the first way this service was built and is kept as an example, but isn't
used by the actual front-end.

The second route is the one used by the front-end and uses the same mechanism as the original
project ([Cloudflare, Privacy and k-Anonymity](https://www.troyhunt.com/ive-just-launched-pwned-passwords-version-2/#cloudflareprivacyandkanonymity))
to anonymize the passwords queried.

The hash used is [`xxh128`](https://xxhash.com/) with a 128-bit digest.

### Front

The front uses Next.js in TypeScript.

Typescript was used for its type safety over JavaScript.

Next.js was chosen for its simplicity, quick setup, and previous knowledge of React.

[HeroUI](https://www.heroui.com/) was used for the input components.

### Reverse Proxy

[caddyserver/caddy](https://github.com/caddyserver/caddy) was used as a reverse proxy in order to
serve both the front and the api on the same address.

It also sets some HTTP cache headers and compresses responses (~50% size reduction).
