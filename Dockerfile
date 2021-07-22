FROM node:alpine

WORKDIR /opt/aliyun-ddns-updater
COPY aliyun-ddns-updater package.json ./

RUN npm install
CMD ["./aliyun-ddns-updater"]
