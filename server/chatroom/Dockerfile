FROM node
# Create app directory
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 443
ENTRYPOINT ["node", "src/index.js"]


# export TLSCERT=/etc/letsencrypt/live/chatroom.kelden.me/fullchain.pem
# export TLSKEY=/etc/letsencrypt/live/chatroom.kelden.me/privkey.pem

# docker run --name chatroom -d -p 443:443 -v /etc/letsencrypt:/etc/letsencrypt:ro  -e TLSCERT=$TLSCERT -e TLSKEY=$TLSKEY keldenl/dotachatroom