export TLSCERT=/etc/letsencrypt/live/chatroom.kelden.me/fullchain.pem
export TLSKEY=/etc/letsencrypt/live/chatroom.kelden.me/privkey.pem

docker pull keldenl/dotachatroom

docker rm -f mongodemo
docker rm -f chatroom
docker network rm dotaNetwork

docker network create dotaNetwork
docker run -d --network dotaNetwork --name mongodemo mongo

sleep 2s

docker run --name chatroom --network dotaNetwork -d -p 443:443 -v /etc/letsencrypt:/etc/letsencrypt:ro  -e TLSCERT=$TLSCERT -e TLSKEY=$TLSKEY keldenl/dotachatroom