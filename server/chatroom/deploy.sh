export TLSCERT=/etc/letsencrypt/live/chatroom.kelden.me/fullchain.pem
export TLSKEY=/etc/letsencrypt/live/chatroom.kelden.me/privkey.pem

docker pull keldenl/dotachatroom
docker rm -f chatroom

docker run --name chatroom -d -p 443:443 -v /etc/letsencrypt:/etc/letsencrypt:ro  -e TLSCERT=$TLSCERT -e TLSKEY=$TLSKEY keldenl/dotachatroom