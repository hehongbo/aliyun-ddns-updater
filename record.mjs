import popCore from "@alicloud/pop-core";
import {currentIp} from "./current-ip.mjs";
import {log} from "./log.mjs";

import {
    domain,
    subDomain,
    popCoreConfig
} from "./config.mjs"

function aliyunExceptionHandler(aliyunApiException) {
    /**
     * @external aliyunApiException.name
     * @see https://help.aliyun.com/document_detail/29809.htm
     */
    switch (aliyunApiException.name) {
        case "InvalidAccessKeyId.NotFoundError":
            log("Error from Aliyun's API endpoint: Invalid accessKeyId.");
            break;
        case "SignatureDoesNotMatchError":
            log("Error from Aliyun's API endpoint: Signature does not match (wrong AK secret).");
            break;
        default:
            /** @external aliyunApiException.data */
            /**
             * @member Message
             * @memberOf aliyunApiException.data
             */
            log(`Error from Aliyun's API endpoint. ${
                typeof aliyunApiException.data !== "undefined"
                && typeof aliyunApiException.data.Message !== "undefined" ?
                    `(Detail: ${aliyunApiException.data.Message})`
                    : ""
            }`);
    }
}

function add(type = "A", value) {
    return new Promise((resolve, reject) => {
        new popCore(popCoreConfig).request("AddDomainRecord", {
            DomainName: domain,
            RR: subDomain ? subDomain : "@",
            Type: type,
            Value: value
        }, {method: "POST"}).then(aliyunApiResult => {
            /**
             * @external aliyunApiResult.RecordId
             * @see https://help.aliyun.com/document_detail/29772.html
             */
            resolve(aliyunApiResult.RecordId);
        }, reject);
    });
}

function update(recordId = "", type = "A", value) {
    return new Promise((resolve, reject) => {
        new popCore(popCoreConfig).request("UpdateDomainRecord", {
            RR: subDomain ? subDomain : "@",
            RecordId: recordId,
            Type: type,
            Value: value
        }, {method: "POST"}).then(() => {
            resolve();
        }, reject);
    });
}

export function verifyUpdate(type = "A") {
    new popCore(popCoreConfig).request("DescribeSubDomainRecords", {
        DomainName: domain,
        SubDomain: `${subDomain ? subDomain + "." : ""}${domain}`,
        Type: type
    }, {method: "POST"}).then(async aliyunApiResult => {
        /**
         * @external aliyunApiResult.TotalCount
         * @see https://help.aliyun.com/document_detail/29778.html
         */
        switch (aliyunApiResult.TotalCount) {
            case 0:
                log(`No ${type} record is defined with subdomain "${subDomain ? subDomain : "@"}". Creating ...`);
                currentIp(type === "AAAA").then(currentIpAddr => {
                    log(`Current ${type === "AAAA" ? "IPv6" : "IPv4"} address is ${currentIpAddr}.`);
                    add(type, currentIpAddr)
                        .then(recordId => log(`Created record with RecordId = ${recordId}.`))
                        .catch(aliyunExceptionHandler);
                }).catch(() => {
                    switch (type) {
                        case "A":
                            log("Unable to lookup current IPv4 address. Failed to create A record.");
                            break;
                        case "AAAA":
                            log("Unable to lookup current IPv6 address. Failed to create AAAA record. " +
                                "(Do you have a working IPv6 stack?)");
                            break;
                    }
                });
                break;
            case 1:
                /** @external aliyunApiResult.DomainRecords */
                /**
                 * @member Record
                 * @memberOf aliyunApiResult.DomainRecords
                 * @see https://help.aliyun.com/document_detail/29778.html
                 */
                let recordId = aliyunApiResult.DomainRecords.Record[0].RecordId;
                let recordValue = aliyunApiResult.DomainRecords.Record[0].Value;
                log(
                    `Found current record with `
                    + `RecordId = ${recordId}, `
                    + `Type = ${type}, `
                    + `SubDomain = ${subDomain ? subDomain : "@"}, `
                    + `Value = ${recordValue}.`
                );
                currentIp(type === "AAAA").then(currentIpAddr => {
                    let needUpdate = recordValue !== currentIpAddr;
                    log(`Current ${
                        type === "AAAA" ? "IPv6" : "IPv4"
                    } address is ${currentIpAddr}, ${needUpdate ? "updating ..." : "do nothing."}`);
                    if (needUpdate) {
                        update(recordId, type, currentIpAddr)
                            .then(() => log(`Record updated from ${recordValue} to ${currentIpAddr}.`))
                            .catch(aliyunExceptionHandler);
                    }
                }).catch(() => {
                    switch (type) {
                        case "A":
                            log("Unable to lookup current IPv4 address. Failed to update A record.");
                            break;
                        case "AAAA":
                            log("Unable to lookup current IPv6 address. Failed to update AAAA record. " +
                                "(Do you have a working IPv6 stack?)");
                            break;
                    }
                });
                break;
            default:
                log(`More than one ${type} record is defined with subdomain "${subDomain ? subDomain : "@"}". `
                    + "Please check and keep only one or we won't know which one to update otherwise."
                );
                break;
        }
    }, aliyunExceptionHandler);
}
