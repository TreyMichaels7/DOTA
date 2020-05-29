docker build -t keldenl/dotachatroom .
docker push keldenl/dotachatroom

ssh -T ec2-user@ec2-35-174-122-56.compute-1.amazonaws.com < deploy.sh