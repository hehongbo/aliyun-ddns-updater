#!/usr/bin/env node

import cron from "node-cron";

import {verifyUpdate} from "./lib/record.mjs";
import {log} from "./lib/log.mjs";

import {
    timezone,
    cronExpression,
    cronEnabled,
    updateType
} from "./lib/config.mjs"

if (cronEnabled) {
    updateType.forEach(type => cron.schedule(cronExpression, () => {
        verifyUpdate(type);
    }, {
        scheduled: true,
        timezone: timezone
    }));
    log(`Cron task scheduled at "${cronExpression}".`);
}

updateType.forEach(verifyUpdate);
