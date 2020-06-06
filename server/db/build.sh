# export MYSQL_ROOT_PASSWORD="dating123"
# export MYSQL_DATABASE="usersdb"

# docker build -t treymichaels7/db .
 
# docker rm -f DOTADB

# docker run -d \
# -p 3306:3306 \
# --name DOTADB \
# -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
# -e MYSQL_DATABASE=$MYSQL_DATABASE \
# treymichaels7/db

docker build -t keldenl/dotadb .
docker push keldenl/dotadb