import { genericRequest, GenericRequestOptions } from "./generic.js";
import * as constants from "../constants.js";
import * as utils from "../utils.js";
import { GDClient } from "../index.js";
import { AxiosRequestConfig } from "axios";

export interface GetRewardResult {
    randomString1: string;
    randomString2: string;
    playerID: number;
    chkNumber: number;
    udid: string;
    accountID: number;
    smallChestCooldown: number;
    smallChest: {
        orbs: number;
        diamonds: number;
        item1: number;
        item2: number;
    };
    claimedSmallChests: number;
    largeChestCooldown: number;
    largeChest: {
        orbs: number;
        diamonds: number;
        item1: number;
        item2: number;
    };
    claimedLargeChests: number;
    rewardType: number;
    hash: string;
    isHashValid: boolean;
}

export function getRewards(type: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: GetRewardResult) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("getRewards", {
        chk: `${utils.rs(5)}${utils.base64Encode(utils.xor(utils.getRandomNumber(10000, 1000000).toString(), constants.KEYS.CHEST_REWARDS))}`,
        rewardType: type,
        r1: utils.getRandomNumber(100, 99999),
        r2: utils.getRandomNumber(100, 99999),
        udid: instance.account.udid,
        uuid: instance.account.uuid,
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password)
    }, function(data) {
        if (data == "-1") throw new Error("-1");
        const segments = data.split("|");
        const infoRaw = segments[0].slice(5);
        const info = utils.xor(utils.base64Decode(infoRaw), constants.KEYS.CHEST_REWARDS).split(":");
        const startString = segments[0].slice(0, 5);
        const small = info[6].split(",");
        const big = info[9].split(",");
        const hash = segments[1];
        console.log(utils.xor(utils.base64Decode(infoRaw), constants.KEYS.CHEST_REWARDS));
        callback({
            randomString1: startString,
            randomString2: info[0],
            playerID: Number(info[1]),
            chkNumber: Number(info[2]),
            udid: info[3],
            accountID: Number(info[4]),
            smallChestCooldown: Number(info[5]),
            smallChest: {
                orbs: Number(small[0]),
                diamonds: Number(small[1]),
                item1: Number(small[2]),
                item2: Number(small[3])
            },
            claimedSmallChests: Number(info[7]),
            largeChestCooldown: Number(info[8]),
            largeChest: {
                orbs: Number(big[0]),
                diamonds: Number(big[1]),
                item1: Number(big[2]),
                item2: Number(big[3])
            },
            claimedLargeChests: Number(info[10]),
            rewardType: Number(info[11]),
            hash,
            isHashValid: utils.sha1(`${infoRaw}${constants.SALTS.REWARDS}`) == hash,
        });
    }, instance, params, options, secret);
}

export interface GetChallengesResult {
    randomString1: string;
    randomString2: string;
    playerID: number;
    chkNumber: number;
    udid: string;
    accountID: number;
    newQuestsCooldown: number;
    quests: {
        unknown: string;
        type: number;
        amount: number;
        reward: number;
        name: string;
    }[];
    hash: string;
    isHashValid: boolean;
}

export function getChallenges(instance: GDClient, params: GenericRequestOptions = {}, callback: (data: GetChallengesResult) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("getChallenges", {
        chk: `${utils.rs(5)}${utils.base64Encode(utils.xor(utils.getRandomNumber(10000, 1000000).toString(), constants.KEYS.CHALLENGES))}`,
        udid: instance.account.udid,
        uuid: instance.account.uuid,
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
    }, function(data) {
        if (data == "-1") throw new Error("-1");
        const segments = data.split("|");
        const infoRaw = segments[0].slice(5);
        const info = utils.xor(utils.base64Decode(infoRaw), constants.KEYS.CHALLENGES).split(":");
        const startString = segments[0].slice(0, 5);
        const quest1 = info[6].split(",");
        const quest2 = info[7].split(",");
        const quest3 = info[8].split(",");
        const hash = segments[1];
        callback({
            randomString1: startString,
            randomString2: info[0],
            playerID: Number(info[1]),
            chkNumber: Number(info[2]),
            udid: info[3],
            accountID: Number(info[4]),
            newQuestsCooldown: Number(info[5]),
            quests: [
                {
                    unknown: quest1[0], type: Number(quest1[1]), amount: Number(quest1[2]), reward: Number(quest1[3]), name: quest1[4]
                },
                {
                    unknown: quest2[0], type: Number(quest2[1]), amount: Number(quest2[2]), reward: Number(quest2[3]), name: quest2[4]
                },
                {
                    unknown: quest3[0], type: Number(quest3[1]), amount: Number(quest3[2]), reward: Number(quest3[3]), name: quest3[4]
                },
            ],
            hash,
            isHashValid: utils.sha1(`${infoRaw}${constants.SALTS.CHALLENGES}`) == hash
        });
    }, instance, params, options, secret);
}
