go install
GOOS=linux go build
docker build --no-cache -t keldenl/dotagateway .
docker push keldenl/dotagateway
go clean

ssh -T ec2-user@ec2-52-4-6-159.compute-1.amazonaws.com < deploy.sh