import cron from "node-cron";
import {log} from "./log.mjs";

export const ipLookupService = process.env.IP_LOOKUP_SERVICE || "https://bot.whatismyipaddress.com";
export const ipLookupTimeout = parseInt(process.env.IP_LOOKUP_TIMEOUT) || 3000;
export const domain = process.env.DOMAIN;
export const subDomain = process.env.SUB_DOMAIN;
export const timezone = process.env.TIMEZONE || "Etc/UTC";
export const cronExpression = process.env.CRON;
export const cronEnabled = typeof cronExpression !== "undefined" || cron.validate(cronExpression);

export const popCoreConfig = {
    /** @see https://help.aliyun.com/document_detail/124923.html#title-fbv-si0-ict */
    accessKeyId: process.env.AK_ID,
    accessKeySecret: process.env.AK_SECRET,
    endpoint: "https://alidns.aliyuncs.com",
    apiVersion: "2015-01-09"
};

export const updateType = !process.env.UPDATE_V6 ? ["A"] :
    process.env.UPDATE_V6.toUpperCase() === "ENABLED" ? ["A", "AAAA"] :
        process.env.UPDATE_V6.toUpperCase() === "ONLY" ? ["AAAA"] : ["A"];

if (typeof domain === "undefined" || domain === "") {
    log("Domain not provided.");
    process.exit(1);
}

["accessKeyId", "accessKeySecret"].forEach(item => {
    if (typeof popCoreConfig[item] === "undefined" || popCoreConfig[item] === "") {
        log(`${item} not provided.`);
        process.exit(1);
    }
});
