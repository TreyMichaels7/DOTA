export MYSQL_ROOT_PASSWORD="treydb"

docker build -t treymichaels7/db .
 
docker rm -f UsersDB

docker run -d \
-p 3306:3306 \
--name UsersDB \
-e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
-e MYSQL_DATABASE=DOTAdb \
treymichaels7/db

docker push treymichaels7/db

# docker run -it --rm mysql sh -c "mysql -hUsersDB -uroot -ptreydb"