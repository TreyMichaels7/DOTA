docker build --no-cache -t keldenl/dotaclient .
docker push keldenl/dotaclient

ssh -T ec2-user@ec2-34-202-167-190.compute-1.amazonaws.com < deploy.sh