#!/usr/bin/bash

# install systemd service
sudo cp ./alexandria.service /usr/lib/systemd/system/
sudo cp ./nats-server.service /usr/lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable alexandria
sudo systemctl enable nats-server

# required external software
sudo apt-get install nvm && \
curl -l https://github.com/nats-io/nats-server/releases/download/v2.1.8/nats-server-v2.1.8-arm7.deb -o nats-server-v2.1.8-arm7.deb && \
sudo dpkg -i nats-server-v2.1.8-arm7.deb

#setup
nvm install 13 && \
cd .. && \
npm install && \
npm build:frontend
