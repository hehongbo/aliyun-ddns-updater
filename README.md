# Aliyun DDNS Updater

![npm version](https://img.shields.io/npm/v/aliyun-ddns-updater)

A DDNS client for Aliyun's DNS service. It will look for the device's public IP addresses and update the DNS record with Aliyun's API.

## Usage

Install:
```shell
npm install -g aliyun-ddns-updater
```

Then run:
```shell
DOMAIN=example.com \
SUB_DOMAIN=ddns \
AK_ID=(accessKeyId) \
AK_SECRET=(accessKeySecret) \
CRON="0 * * * *" \
aliyun-ddns-updater
```

Or, with Docker:
```shell
docker run -d \
    --name aliyun-ddns-updater \
    -e DOMAIN=example.com \
    -e SUB_DOMAIN=ddns \
    -e AK_ID=(accessKeyId) \
    -e AK_SECRET=(accessKeySecret) \
    -e CRON="0 * * * *" \
    --restart unless-stopped \
    hehongbo/aliyun-ddns-updater
```

The application will look for IP addresses through a public lookup service (by default is `https://bot.whatismyipaddress.com`), so you don't need to create the container with a host network.

## More Options

1. **IPv6**? \
   Yes, with environment variable `UPDATE_V6` set to `ENABLED`, or `ONLY` if you are using a single v6 stack and updates only `AAAA` record.
2. **Update top-level record**? \
   Just leave the `SUB_DOMAIN` environment variable **unset**. You don't need to pass an `@` to update the top-level record.
3. **Detecting IP address with a different lookup service**? \
   Specify it with an `IP_LOOKUP_SERVICE` environment variable. Note that the application expects a plain address without JSON enclosures or statements like "*Your IP address is:*", and assumes that the entire response body is the address.
4. **One-shot**? \
   Yes, just remove the `CRON` environment variable, and it will run only once. That would be helpful if you want to run the application with an external scheduler like Systemd timer. Also, remember to replace the restart policy with something like `--rm` if you want to run it with Docker before the Docker engine tries to restart it infinitely forever.
5. **Timezone**? \
   Could be set with a `TIMEZONE` environment. That would affect cron expressions with a specified hour or day. The log output's timestamp will also be affected by this. See [Moment Timezone](https://momentjs.com/timezone/) for more information.

## All Environment variables

| Variable            | Required | Description                                                                                               | Default                             |
|:--------------------|:---------|:----------------------------------------------------------------------------------------------------------|:------------------------------------|
| `DOMAIN`            | YES      | The domain (top-level part) to update.                                                                    |                                     |
| `SUB_DOMAIN`        |          | The subdomain to update. Leave **unset** to update the top-level domain.                                  |                                     |
| `AK_ID`             | YES      | Aliyun's accessKeyId.                                                                                     |                                     |
| `AK_SECRET`         | YES      | Aliyun's accessKeySecret.                                                                                 |                                     |
| `UPDATE_V6`         |          | Update the AAAA record with your IPv6 address. Set to `ENABLED` if needed, or `ONLY` to update only IPv6. |                                     |
| `CRON`              |          | Cron expression to control the timing of update tasks.                                                    |                                     |
| `TIMEZONE`          |          | In which timezone should the application executing the cron task.                                         | `Etc/UTC`                           |
| `IP_LOOKUP_SERVICE` |          | The URL of IP lookup service.                                                                             | `https://bot.whatismyipaddress.com` |
| `IP_LOOKUP_TIMEOUT` |          | Maximum time to wait (in millisecond) for the lookup service return an IP address.                        | `3000`                              |
