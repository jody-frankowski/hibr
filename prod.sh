#!/bin/bash

set -euxo pipefail

script_dir="$(realpath "$(dirname "$0")")"
pushd "${script_dir}" > /dev/null


docker_cmd=(docker)
[[ "$OSTYPE" == linux-gnu ]] && docker_cmd=(sudo docker)
"${docker_cmd[@]}" compose up -d


source .env
if [[ -z "${PUBLIC_HOST}" ]]; then
    echo "Error: Set PUBLIC_HOST to a subdomain of a domain managed by your Cloudflare in your .env"
    exit 1
fi

[[ -f ~/.cloudflared/cert.pem ]] || cloudflared tunnel login

tunnel_name="hibr"
tunnel_cred=".cloudflare.json"
tunnel_env=".env"
tunnel_cmd=(cloudflared tunnel --credentials-file "${tunnel_cred}")

[[ -f "${tunnel_cred}" ]] || "${tunnel_cmd[@]}" create "${tunnel_name}"
"${tunnel_cmd[@]}" route dns --overwrite-dns "${tunnel_name}" "${PUBLIC_HOST}"
grep -q TOKEN "${tunnel_env}" || echo "TOKEN='$(cloudflared tunnel token "${tunnel_name}")'" > "${tunnel_env}"

"${docker_cmd[@]}" compose --profile prod up --wait
