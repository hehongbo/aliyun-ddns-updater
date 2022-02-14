#!/usr/bin/env node

import cron from "node-cron";

import {verifyUpdate} from "./record.mjs";
import {log} from "./log.mjs";

import {
    timezone,
    cronExpression,
    cronEnabled,
    updateType
} from "./config.mjs"

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
