docker pull keldenl/dotaclient

export TLSCERT=/etc/letsencrypt/live/kelden.me/fullchain.pem
export TLSKEY=/etc/letsencrypt/live/kelden.me/privkey.pem

docker rm -f dotaClient

docker run --name dotaClient -d -p 80:80 -p 443:443  -v /etc/letsencrypt:/etc/letsencrypt:ro  -e TLSCERT=$TLSCERT -e TLSKEY=$TLSKEY keldenl/dotaclient:latest