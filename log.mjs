import momentTimezone from "moment-timezone";

import {
    cronEnabled,
    timezone
} from "./config.mjs";

export function log(text = "") {
    if (cronEnabled) {
        console.log(`[${momentTimezone(new Date()).tz(timezone).format("YYYY-MM-DD HH:mm:ss")}] ${text}`);
    } else {
        console.log(text);
    }
}
