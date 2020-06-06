export TLSCERT=/etc/letsencrypt/live/api.kelden.me/fullchain.pem
export TLSKEY=/etc/letsencrypt/live/api.kelden.me/privkey.pem
export SESSIONKEY="xxxxxx"
export REDISADDR="redisServer:6379"
export MYSQL_ROOT_PASSWORD="dating123"
export MYSQL_DATABASE="usersdb"
export DSN="root:$MYSQL_ROOT_PASSWORD@tcp(dotaDb:3306)/$MYSQL_DATABASE"

docker rm -f redisServer
docker rm -f dotaDb
docker rm -f dotaGateway
docker rm -f mongoDb
docker rm -f chatroomSrv
docker network rm dotaNetwork

docker pull keldenl/dotadb
docker pull keldenl/dotagateway
docker pull keldenl/dotachatroom

docker network create dotaNetwork

docker run -d --name redisServer --network dotaNetwork redis

docker run -d \
--network dotaNetwork \
--name dotaDb \
-e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
-e MYSQL_DATABASE=$MYSQL_DATABASE \
keldenl/dotadb

docker run -d --network dotaNetwork --name mongoDb mongo

sleep 10s

# docker run --name chatroomSrv --network dotaNetwork -d -v /etc/letsencrypt:/etc/letsencrypt:ro  -e TLSCERT=$TLSCERT -e TLSKEY=$TLSKEY keldenl/dotachatroom

docker run --name chatroomSrv --network dotaNetwork -d -v /etc/letsencrypt:/etc/letsencrypt:ro  keldenl/dotachatroom

docker run --name dotaGateway -d -p 443:443 --network dotaNetwork --restart unless-stopped  -v /etc/letsencrypt:/etc/letsencrypt:ro -e ADDR=:443  -e TLSCERT=$TLSCERT -e TLSKEY=$TLSKEY -e SESSIONKEY=$SESSIONKEY -e DSN=$DSN -e REDISADDR=$REDISADDR keldenl/dotagateway:latest

# docker run \
#     -d \
#     -e ADDR=:443 \
#     -e SESSIONKEY=$SESSIONKEY \
#     -e REDISADDR=$REDISADDR \
#     -e DSN=$DSN \
#     -p 443:443 \
#     --name DOTAgateway \
#     --network DOTANetwork \
#     --restart unless-stopped \
#     keldenl/dotagateway