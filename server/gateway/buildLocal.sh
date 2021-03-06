export TLSKEY="/user/test/privkey.pem"
export TLSCERT="/user/test/fullchain.pem"
export SESSIONKEY="xxxxxx"
export REDISADDR="redisServer:6379"
export MYSQL_ROOT_PASSWORD="dating123"
export MYSQL_DATABASE="usersdb"
export DSN="root:$MYSQL_ROOT_PASSWORD@tcp(DOTADB:3306)/$MYSQL_DATABASE"

docker rm -f redisServer
docker rm -f DOTADB
docker rm -f DOTAgateway
docker network rm DOTANetwork

docker pull treymichaels7/db

docker network create DOTANetwork

docker run -d --name redisServer --network DOTANetwork redis

docker run -d \
--network DOTANetwork \
--name DOTADB \
-e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
-e MYSQL_DATABASE=$MYSQL_DATABASE \
treymichaels7/db

GOOS=linux go build
docker build --no-cache -t treymichaels7/gateway .

sleep 10s

docker run \
    -d \
    -e ADDR=:443 \
    -e SESSIONKEY=$SESSIONKEY \
    -e REDISADDR=$REDISADDR \
    -e DSN=$DSN \
    -p 443:443 \
    --name DOTAgateway \
    --network DOTANetwork \
    --restart unless-stopped \
    treymichaels7/gateway

