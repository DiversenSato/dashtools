import { accountRequest, genericRequest, GenericRequestOptions } from "./generic.js";
import * as constants from "../constants.js";
import * as utils from "../utils.js";
import { GDClient } from "../index.js";
import { AxiosRequestConfig } from "axios";

export function searchUsers(username: string, instance: GDClient, params: GenericRequestOptions, callback: (data: object) => void, options: AxiosRequestConfig) {
    genericRequest<string>("getUsers", { str: username }, function (data) {
        const segments = data.split("#");
        const users = segments[0].split("|").map(u => utils.parseUser(u));
        const pages = segments[1].split(":");
        callback({
            users,
            total: Number(pages[0]),
            offset: Number(pages[1]),
            pageSize: Number(pages[2]),
        });
    }, instance, params, options);
}

export function getUserByAccountID(targetAccountID: number, logout: boolean, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: utils.User) => void, options?: AxiosRequestConfig) {
    const auth: {
        accountID?: number;
        gjp2?: string;
    } = {};
    if (instance.account && !logout) {
        auth.accountID = instance.account.accountID;
        auth.gjp2 = utils.gjp2(instance.account.password);
    }
    genericRequest("getUserInfo", { targetAccountID, ...auth }, function (data) {
        callback(utils.parseUser(data));
    }, instance, params, options);
}

export interface UpdateUserOptions {
    stars: number;
    demons: number;
    moons: number;
    diamonds: number;
    secretCoins: number;
    userCoins: number;
    cubeID: number;
    shipID: number;
    ballID: number;
    ufoID: number;
    waveID: number;
    robotID: number;
    glow: boolean;
    spiderID: number;
    deathEffectID: number;
    swingID: number;
    jetpackID: number;
    color1: number;
    color2: number;
    glowColor: number;
    iconType: number;
    completedDemons: number[];
    completedWeeklies: number;
    completedGauntletDemons: number;
    completedGauntletNonDemons: number;
    completedDailies: number;
    classic: {
        auto: number;
        easy: number;
        normal: number;
        hard: number;
        harder: number;
        insane: number;
    };
    platformer: {
        auto: number;
        easy: number;
        normal: number;
        hard: number;
        harder: number;
        insane: number;
    };
}

export function updateUserScore(opt: UpdateUserOptions, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: number) => void, options?: AxiosRequestConfig) {
    if (!instance.account && (!params.accountID || !params.gjp2)) throw new Error("Must authenticate with account");
    const demons = opt.demons || opt.completedDemons.length;
    const dinfo = opt.completedDemons.join(",");
    const sinfo = `${opt.classic.auto},${opt.classic.easy},${opt.classic.normal},${opt.classic.hard},${opt.classic.harder},${opt.classic.insane},${opt.platformer.auto},${opt.platformer.easy},${opt.platformer.normal},${opt.platformer.hard},${opt.platformer.harder},${opt.platformer.insane}`;
    let icon = opt.cubeID;
    switch (opt.iconType) {
        case 1:
            icon = opt.shipID;
            break;
        case 2:
            icon = opt.ballID;
            break;
        case 3:
            icon = opt.ufoID;
            break;
        case 4:
            icon = opt.waveID;
            break;
        case 5:
            icon = opt.robotID;
            break;
        case 6:
            icon = opt.spiderID;
            break;
        case 7:
            icon = opt.swingID;
            break;
        case 8:
            icon = opt.jetpackID;
            break;
    }
    genericRequest("updateUserScore", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        stars: opt.stars,
        demons,
        moons: opt.moons,
        diamonds: opt.diamonds,
        coins: opt.secretCoins,
        userCoins: opt.userCoins,
        icon,
        iconType: opt.iconType,
        accIcon: opt.cubeID,
        accShip: opt.shipID,
        accBall: opt.ballID,
        accBird: opt.ufoID,
        accDart: opt.waveID,
        accRobot: opt.robotID,
        accGlow: Number(opt.glow),
        accSpider: opt.spiderID,
        accExplosion: opt.deathEffectID,
        accSwing: opt.swingID,
        accJetpack: opt.jetpackID,
        color1: opt.color1,
        color2: opt.color2,
        color3: opt.glowColor || -1,
        special: opt.glow ? 2 : 0,
        dinfo,
        dinfow: opt.completedWeeklies,
        dinfog: opt.completedGauntletDemons,
        sinfo,
        sinfod: opt.completedDailies,
        sinfog: opt.completedGauntletNonDemons,
        seed: utils.rs(10),
        // accountID, userCoins, demons, stars, coins, iconType, icon, diamonds, cube, ship, ball, ufo, wave, robot, glow, spider, deathEffect
        seed2: utils.chk([
            instance.account.accountID,
            opt.userCoins,
            demons,
            opt.stars,
            opt.secretCoins,
            opt.iconType,
            icon,
            opt.diamonds,
            opt.cubeID,
            opt.shipID,
            opt.ballID,
            opt.ufoID,
            opt.waveID,
            opt.robotID,
            Number(opt.glow),
            opt.spiderID,
            opt.deathEffectID,
            dinfo.length,
            opt.completedWeeklies,
            opt.completedGauntletDemons,
            sinfo,
            opt.completedDailies,
            opt.completedGauntletNonDemons
        ], constants.KEYS.STAT_SUBMISSION, constants.SALTS.STAT_SUBMISSION)
    }, function (data) {
        callback(Number(data));
    }, instance, params, options);
}

export function updateAccountSettings(mS: string, frS: string, cS: string, youtube: string, twitch: string, twitter: string, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig) {
    accountRequest("updateAccountSettings", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        mS, frS, cS,
        yt: youtube,
        twitter,
        twitch
    }, function (data) {
        if (data == "-1") throw new Error("-1");
        else callback(data);
    }, instance, params, options);
}