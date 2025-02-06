# Have I Been Rocked?

## Usage

```sh
docker compose up --build
```

[https://localhost:8081](https://localhost:8081)

The password leak checker and generator are on the homepage and also on their own pages:
- [https://localhost:8081/PasswordGenerator](https://localhost:8081/PasswordGenerator)
- [https://localhost:8081/PasswordLeakChecker](https://localhost:8081/PasswordLeakChecker)

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

The hash used is [`blake2b`](https://www.blake2.net/) with a 256-bit digest. False positives 
should be virtually impossible. If possible, using a 128-bit digest should make the DB twice as 
small and make the first load time faster. AFAICT the first load time is IO-bound on my machine 
(Mostly writing the DB).

### Front

The front uses Next.js in TypeScript.

Typescript was used for its type safety over JavaScript.

Next.js was chosen for its simplicity, quick setup, and previous knowledge of React.

[mui/material-ui](https://github.com/mui/material-ui) was used for a slider component.
An obvious improvement would be to use Material UI for the checkboxes and inputs fields as well.
It's not because MUI was added last for the slider after the other components were done and tested.

### Reverse Proxy

[caddyserver/caddy](https://github.com/caddyserver/caddy) was used a reverse proxy in order to 
serve both the front and the api on the same address.

It also sets some HTTP cache headers and compresses responses (~50% size reduction).