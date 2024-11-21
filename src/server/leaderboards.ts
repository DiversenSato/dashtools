import { genericRequest } from "./generic.js";
import * as constants from "../constants.js";
import * as utils from "../utils.js";

export function getLeaderboards(type, instance, params, callback, options, secret) {
    genericRequest("getLeaderboards", {type}, function(data) {
        const dr = data.split("|");
        const d = dr.filter(e => !!e);
        const users = d.map(u => utils.parseUser(u));
        callback({
            users,
            emptyUsers: dr.length - d.length
        });
    }, instance, params, options, secret);
}
export function getLevelScores(levelID, type, opts, instance, params, callback, options, secret) {
    const s1 = (opts.attempts || 0) + 8354;
    const s2 = (opts.bestAttemptClicks || 0) + 3991;
    const s3 = (opts.bestAttemptTime || 0) + 4085;
    const s4 = utils.generateLeaderboardSeed((opts.bestAttemptClicks || 0), (opts.percentage || 0), (opts.bestAttemptTime || 0), 1);
    let s6 = "0";
    if (opts.percentages)
        s6 = opts.percentages.map((v, i, a) => {
            let prev = a[i - 1];
            if (!prev) prev = 0;
            return v - prev;
        }).join(",");
    console.log(s6);
    const s7 = utils.rs(10);
    const s9 = (opts.coins || 0) + 5819;

    // accountID,levelID,percentage,bestAttemptTime,bestAttemptClicks,attempts,levelSeed,pbDiffs,1,coins,timelyID
    const values = [
        instance.account.accountID, 
        levelID, 
        (opts.percentage || 0),
        (opts.bestAttemptTime || 0),
        (opts.bestAttemptClicks || 0), 
        (opts.attempts || 0),
        s4,
        s6,
        1,
        (opts.coins || 0), 
        (opts.timelyID || 0)
    ];
    const chk = utils.chk(values, constants.KEYS.LEVEL_LEADERBOARD, constants.SALTS.LEVEL_LEADERBOARDS + s7);
    const percentage = opts.percentage;
    opts = {
        time: 0,
        points: 0,
        plat: 0,
        mode: 1,
        type,
        s1, s2, s3, s4: s4 + 1482,
        s5: 2000 + Math.floor(Math.random() * 1999),
        s6: utils.base64Encode(utils.xor(s6, constants.KEYS.LEVEL)),
        s7,
        s8: opts.attempts || 0,
        s9,
        s10: opts.timelyID || 0,
        levelID,
        chk,
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        uuid: instance.account.playerID,
        udid: instance.account.udid
    };
    if (percentage) opts.percent = percentage;
    genericRequest("getLevelLeaderboards", opts, function(data) {
        if (data == -1 || data == "-01") throw new Error(data);
            const scores = data.split("|").map(u => utils.parseUser(u));
            for (let i = 0; i < scores.length; i++) {
                scores[i].percentage = scores[i].stars;
                delete scores[i].stars;
            }
            callback(scores);
    }, instance, params, options, secret);
}

export function getPlatformerLevelScores(levelID, type, mode, opts, instance, params, callback, options, secret) {
    let bestAttemptTime = opts.bestAttemptTime;
    if (!bestAttemptTime) {
        if (opts.time)
            bestAttemptTime = Math.floor(opts.time / 1000);
        else
            bestAttemptTime = 0;
    }
    const s1 = (opts.attempts || 0) + 8354;
    const s2 = (opts.bestAttemptClicks || 0) + 3991;
    const s3 = bestAttemptTime + 4085;
    const s4 = utils.generatePlatformerLeaderboardSeed((opts.time || 0), (opts.points || 0));
    let s6 = "0";
    if (opts.percentages)
        s6 = opts.percentages.map((v, i, a) => {
            let prev = a[i - 1];
            if (!prev) prev = 0;
            return v - prev;
        }).join(",");
    console.log(s6);
    const s7 = utils.rs(10);
    const s9 = (opts.coins || 0) + 5819;

    // accountID,levelID,percentage,bestAttemptTime,bestAttemptClicks,attempts,levelSeed,pbDiffs,1,coins,timelyID
    const values = [
        instance.account.accountID, 
        levelID, 
        (opts.percentage || 0),
        bestAttemptTime,
        (opts.bestAttemptClicks || 0), 
        (opts.attempts || 0),
        s4,
        s6,
        1,
        (opts.coins || 0), 
        (opts.timelyID || 0)
    ];
    const chk = utils.chk(values, constants.KEYS.LEVEL_LEADERBOARD, constants.SALTS.LEVEL_LEADERBOARDS + s7);
    const percentage = opts.percentage || 0;
    if (s6 == "0") s6 = percentage;
    opts = {
        time: (opts.time || 0),
        points: (opts.points || 0),
        plat: 1,
        mode,
        type,
        s1, s2, s3, s4: s4 + 1482,
        s5: 2000 + Math.floor(Math.random() * 1999),
        s6: utils.base64Encode(utils.xor(s6, constants.KEYS.LEVEL)),
        s7,
        s8: opts.attempts || 0,
        s9,
        s10: opts.timelyID || 0,
        levelID,
        chk,
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        uuid: instance.account.playerID,
        udid: instance.account.udid
    };
    if (percentage) opts.percent = percentage;
    genericRequest("getPlatformerLevelLeaderboards", opts, function(data) {
        if (data == -1 || data == "-01") throw new Error(data);
        const scores = data.split("|").map(u => utils.parseUser(u));
        for (let i = 0; i < scores.length; i++) {
            if (mode == 0) scores[i].time = scores[i].stars;
            else scores[i].points = scores[i].stars;
            delete scores[i].stars;
        }
        callback(scores);
    }, instance, params, options, secret);
}