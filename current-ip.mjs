import http from "http";
import https from "https";
import net from "net";

import {
    ipLookupService,
    ipLookupTimeout
} from "./config.mjs";

export function currentIp(v6 = false) {
    return new Promise((resolve, reject) => {
        let request = (() => {
            switch (new URL(ipLookupService).protocol) {
                case "http:":
                    return http;
                case "https:":
                    return https;
            }
        })().get(ipLookupService, {
            family: v6 ? 6 : 4,
            timeout: ipLookupTimeout
        }, response => {
            let responseData = "";
            response.on("data", chunk => responseData += chunk);
            response.on("end", () => {
                let address = responseData.trim();
                if ((!v6 && net.isIPv4(address)) || (v6 && net.isIPv6(address))) {
                    resolve(address);
                } else {
                    reject();
                }
            });
        });
        request.on("error", err => reject(err));
        request.on("timeout", request.destroy);
    });
}
