import { genericRequest, GenericRequestOptions } from "./generic.js";
import * as constants from "../constants.js";
import * as utils from "../utils.js";
import { GDClient } from "../index.js";
import { AxiosRequestConfig } from "axios";

export interface GetLevelsOptions {
    query?: string;
    type?: number;
    page?: number;
    difficulties?: number[];
    accountIDs?: number[];
    levelIDs?: number[];
    length?: string;
    unrated?: boolean;
    rated?: boolean;
    featured?: boolean;
    epic?: boolean;
    legendary?: boolean;
    mythic?: boolean;
    coins?: boolean;
    twoPlayer?: boolean;
    original?: boolean;
    uncompleted?: boolean;
    completed?: boolean;
    customSong?: number;
    songID?: number;
    demonFilter?: number;
    playerID?: number;
    listID?: number;
}

export interface GetLevelsResponse {
    levels: utils.Level[];
    songs?: Record<string, utils.Song>;
    users: Record<string, utils.TinyUser>;
    total: number;
    offset: number;
    pageSize: number;
    hash: string;
    isHashValid: boolean;
    date: number;
}

/**
 * Gets levels from a Geometry Dash server.
 * @param {GDClient} instance The Geometry Dash client instance
 * @param {object} opts The options for the request
 * @param {function} callback The callback function
 * @param {object} options Extra Axios parameters
 * @param {string} secret The secret parameter
 */
export function getLevels(opts: GetLevelsOptions, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: GetLevelsResponse) => void, options?: AxiosRequestConfig) {
    const diffMap = {
        "-1": -3,
        0: -1,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: -2,
        7: -2,
        8: -2,
        9: -2,
        10: -2
    } as const;

    let len: string | number = "-";
    if (opts.length) {
        if (!isNaN(parseInt(opts.length))) len = parseInt(opts.length);
        else len = constants.LENGTHS[opts.length as keyof typeof constants.LENGTHS] as number;
    }

    const diff: {
        diff?: number | string;
        demonFilter?: number;
    } = {};
    if (opts.difficulties && opts.difficulties.length > 0) {
        const diffs = opts.difficulties.map((d) => diffMap[d as keyof typeof diffMap] || 0);
        if (opts.difficulties.length > 1) {
            if (diffs.includes(-2)) throw new Error("Only one demon difficulty can be searched at a time");
            diff.diff = Array.from(new Set(diffs)).join(",");
        } else if (diffs[0] == -2) {
            opts.demonFilter = opts.difficulties[0] - 5;
        } else {
            diff.diff = Number(diffs[0]);
        }
    }

    let str = opts.query || "";
    if (opts.type == 5 && opts.playerID) str = opts.playerID.toString();
    else if ((opts.type == 10 || opts.type == 19) && opts.levelIDs) str = opts.levelIDs.join(",");
    else if (opts.type == 25 && opts.listID) str = opts.listID.toString();

    const auth: {
        accountID?: number;
        gjp2?: string;
    } = {};
    if (opts.type == 13) {
        if (!instance.account) throw new Error("Must be authorized to get friend levels");
        auth.accountID = instance.account.accountID;
        auth.gjp2 = utils.gjp2(instance.account.password);
    }

    const parsedOptions = {
        page: opts.page || 0,
        type: opts.type || 2,
        str,
        len,
        noStar: Number(!!opts.unrated) || 0,
        star: Number(!!opts.rated) || 0,
        featured: Number(!!opts.featured) || 0,
        epic: Number(!!opts.epic) || 0,
        legendary: Number(!!opts.legendary) || 0,
        mythic: Number(!!opts.mythic) || 0,
        coins: Number(!!opts.coins) || 0,
        twoPlayer: Number(!!opts.twoPlayer) || 0,
        original: Number(!!opts.original) || 0,
        followed: opts.accountIDs ? opts.accountIDs.join(",") : "",
        uncompleted: !!opts.uncompleted || 0,
        onlyCompleted: !!opts.completed || 0,
        completedLevels: opts.uncompleted || opts.completed ? `(${opts.levelIDs?.join(",")})` : "",
        diff: diff.diff || undefined,
        customSong: opts.customSong || 0,
        song: opts.songID || 0,
        demonFilter: diff.demonFilter || 0,
        ...auth
    };

    genericRequest("getLevels", parsedOptions as Record<string, string | number>, function (data) {
        const date = Date.now();
        const segments = data.split("#");
        const levels = segments[0]?.split("|").map(l => utils.parseLevel(l));
        let songs;
        let users;
        let pages;
        let hash = "";
        if (instance.versions.gameVersion >= 19) {
            users = segments[1];
            songs = utils.parseSongs(segments[2]);
            pages = segments[3];
            hash = segments[4];
        } else {
            users = segments[1];
            pages = segments[2];
            hash = segments[3];
        }
        pages = pages.split(":");
        callback({
            levels,
            songs,
            users: utils.parseUsers(users),
            total: Number(pages[0]),
            offset: Number(pages[1]),
            pageSize: Number(pages[2]),
            hash,
            isHashValid: utils.generateLevelsHash(levels) == hash,
            date
        });
    }, instance, params, options);
}

export interface GetDailyLevelResponse {
    dailyID: number;
    timeLeft: number;
}

export function getDailyLevel(instance: GDClient, params: GenericRequestOptions = {}, callback: (data: GetDailyLevelResponse) => void, options?: AxiosRequestConfig) {
    genericRequest<string>("getDailyLevel", {}, function (data) {
        callback({
            dailyID: Number(data.split("|")[0]),
            timeLeft: Number(data.split("|")[1])
        });
    }, instance, params, options);
}

export interface GetMapPacksResponse {
    packs: utils.MapPack[];
    total: number;
    offset: number;
    pageSize: number;
    hash: string;
    isHashValid: boolean;
}

export function getMapPacks(instance: GDClient, params: (GenericRequestOptions & { page?: number }) = {}, callback: (data: GetMapPacksResponse) => void, options?: AxiosRequestConfig) {
    genericRequest("getMapPacks", {}, function (data) {
        const segments = data.split("#");
        const packsRaw = segments[0].split("|");
        const pages = segments[1].split(":");
        const hash = segments[2];
        const packs = [];
        for (const pack of packsRaw) {
            packs.push(utils.parseMapPack(pack));
        }
        callback({
            packs,
            total: Number(pages[0]),
            offset: Number(pages[1]),
            pageSize: Number(pages[2]),
            hash,
            isHashValid: utils.generateMapPacksHash(packs) == hash
        });
    }, instance, params, options);
}

export interface GauntletPack {
    id: number;
    levels: string[];
}

export interface GetGauntlesResponse {
    packs: GauntletPack[];
    hash: string;
    isHashValid: boolean;
}

export function getGauntlets(instance: GDClient, params: GenericRequestOptions = {}, callback: (data: GetGauntlesResponse) => void, options?: AxiosRequestConfig) {
    genericRequest("getGauntlets", { special: 1 }, function (data) {
        const segments = data.split("#");
        const packsRaw = segments[0].split("|");
        const hash = segments[1];
        const packs = [];
        for (const pack of packsRaw) {
            const splitPack = utils.robTopSplit(pack, ":");
            packs.push({
                id: Number(splitPack.get("1")),
                levels: splitPack.get("3")!.split(",")
            });
        }
        callback({
            packs,
            hash,
            isHashValid: utils.generateGauntletsHash(packs) == hash,
        });
    }, instance, params, options);
}

export interface DownloadLevelResponse {
    level: utils.Level | utils.LevelOld;
    hashes: string[];
    isHash1Valid: boolean;
    isHash2Valid: boolean;
    unk_segment_4?: string;
    songs?: Record<string, utils.Song>;
    extraArtists?: Record<string, string>;
}

export function downloadLevel(levelID: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: DownloadLevelResponse) => void, options?: AxiosRequestConfig) {
    delete params.levelID;

    const opt = {
        levelID
    };

    const creds: {
        rs: string;
        udid?: string;
        uuid?: string | number;
        gjp2?: string;
        accountID?: number;
        inc?: number;
        chk?: string;
    } = {
        rs: utils.rs(10),
    };

    if (instance.account) {
        creds.udid = instance.account.udid;
        creds.uuid = instance.account.playerID;
        creds.gjp2 = utils.gjp2(instance.account.password);
        creds.accountID = instance.account.accountID;
        creds.inc = Number(!!params.increment);
        creds.chk = utils.chk([levelID, creds.inc, creds.rs, instance.account.accountID, creds.udid, creds.uuid], constants.KEYS.LEVEL, constants.SALTS.LEVEL);
        // delete params.udid
        // delete params.uuid
        // delete params.chk
        // delete params.inc
        // delete params.gjp2
        // delete params.rs
        // delete params.gjp
        // delete params.accountID
    } else if (params.increment) throw new Error("Must authenticate with an account to increment");
    const combinedOptions = {
        ...opt,
        ...creds
    };
    genericRequest("downloadLevel", combinedOptions, function (data) {
        const segments = data.split("#");

        const level = instance.versions.gameVersion < 20
            ? utils.parseLevelOld(segments[0])
            : utils.parseLevel(segments[0]);

        const hashes = segments.slice(1, 3);
        const json: DownloadLevelResponse = {
            level,
            hashes,
            isHash1Valid: (level.levelString !== undefined && utils.generateDownloadHash(level.levelString) == hashes[0]),
            isHash2Valid: utils.generateDownloadHash2({
                demon: level.metadata.demon ?? false,
                featureScore: level.metadata.featureScore ?? 0,
                id: level.metadata.id ?? -1,
                password: level.metadata.password ?? "",
                playerID: level.metadata.playerID ?? -1,
                stars: level.metadata.stars ?? 0,
                verifiedCoins: level.metadata.verifiedCoins ?? false,
            }) == hashes[1],
        };
        if (segments[3]) {
            json.unk_segment_4 = segments[3];
        }
        if (segments[4]) {
            json.songs = utils.parseSongs(segments[4]);
        }
        if (segments[5]) {
            json.extraArtists = utils.robTopSplitDict(segments[5], ",");
        }
        callback(json);
    }, instance, params, options);
}

export function reportLevel(levelID: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig) {
    genericRequest("reportLevel", { levelID }, function (data) {
        if (Number(data) > 0) callback(data);
        else throw new Error(data);
    }, instance, params, options);
}

// export function deleteLevel(levelID, instance, params, callback, options, secret) {
//     genericRequest("deleteLevel", {levelID, accountID: instance.account.accountID, gjp2: utils.gjp2(instance.account.password)}, function(data) {
//         if (data > 0) callback(data)
//         else throw new Error(data)
//     }, instance, params, options, (secret || constants.SECRETS.DELETE))
// }

export function rateLevel(levelID: number, stars: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig) {
    if (!instance.account) throw new Error("You must authenticate in order to send rate suggestions for levels");
    const rs = utils.rs(10);
    const chk = utils.chk([
        levelID,
        stars,
        rs,
        instance.account.accountID,
        instance.account.udid,
        instance.account.playerID
    ], constants.KEYS.RATE, constants.SALTS.LIKE_OR_RATE);

    genericRequest("rateLevel", {
        levelID,
        stars,
        chk,
        rs,
        udid: instance.account.udid,
        uuid: instance.account.playerID,
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password)
    }, function (data) {
        callback(data);
    }, instance, params, options);
}

export function rateDemon(levelID: number, rating: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig) {
    if (!instance.account) throw new Error("You must authenticate in order to send rate suggestions for levels");
    genericRequest("rateDemon", { levelID, rating, accountID: instance.account.accountID, gjp2: utils.gjp2(instance.account.password) }, function (data) {
        callback(data);
    }, instance, {
        secret: params.secret || constants.SECRETS.MOD,
        ...params,
    }, options);
}

export function updateDescription(levelID: number, description: string, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig) {
    if (!instance.account) throw new Error("You must authenticate in order to update a level's description");
    genericRequest("updateDescription", { levelID, levelDesc: utils.base64Encode(description), accountID: instance.account.accountID, gjp2: utils.gjp2(instance.account.password) }, function (data) {
        callback(data);
    }, instance, params, options);
}

export interface UploadLevelOptions {
    id?: number;
    name: string;
    description?: string;
    unlistedMode?: number;
    version?: number;
    requestedStars?: number;
    levelString: string;
    length?: number;
    originalID?: number;
    twoPlayer?: boolean;
    objects?: number;
    coins?: number;
    hasLowDetailMode?: boolean;
    password?: boolean;
    officialSongID?: number;
    songID?: number;
    verificationTime?: number;
    editorTime?: number;
    copiesEditorTime?: number;
    songIDs?: number[];
    sfxIDs?: number[];
}

export function uploadLevel(opts: UploadLevelOptions, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig) {
    if (!instance.account) throw new Error("You must authenticate in order to upload a level");
    const seed2 = utils.generateUploadSeed2(opts.levelString);
    const song: {
        songIDs?: string;
        sfxIDs?: string;
    } = {};
    if (opts.songIDs) song.songIDs = opts.songIDs.join(",");
    if (opts.sfxIDs) song.sfxIDs = opts.sfxIDs.join(",");
    const parsedOptions = {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        userName: instance.account.username,
        levelID: opts.id || 0,
        levelName: opts.name,
        levelDesc: (opts.description ? utils.base64Encode(opts.description) : ""),
        unlisted: opts.unlistedMode || 0,
        levelVersion: opts.version || 1,
        requestedStars: opts.requestedStars || 0,
        levelString: opts.levelString,
        levelLength: opts.length || 0,
        original: opts.originalID || 0,
        twoPlayer: Number(!!opts.twoPlayer),
        objects: opts.objects || 0,
        coins: opts.coins || 0,
        ldm: Number(!!opts.hasLowDetailMode),
        password: opts.password != null && opts.password != undefined ? Number(opts.password) : 0, /*(instance.binaryVersion > 37 ? 1 : 0)*/ // free to copy by default on 2.201+, no copy by default on 2.200-
        audioTrack: opts.officialSongID || 0,
        songID: opts.songID || 0,
        ts: opts.verificationTime || 0,
        ...song,
        auto: 0,
        wt: opts.editorTime || 0,
        wt2: opts.copiesEditorTime || 0,
        seed: utils.rs(10),
        seed2,
        uuid: instance.account.playerID,
        udid: instance.account.udid
    };
    genericRequest("uploadLevel", parsedOptions, function (id) {
        if (id == "-1") throw new Error("-1");
        callback(id);
    }, instance, params, options);
}

export function deleteLevel(levelID: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig) {
    if (!instance.account) throw new Error("You must authenticate in order to delete a level");
    genericRequest("deleteLevel", { levelID, accountID: instance.account.accountID, gjp2: utils.gjp2(instance.account.password) }, (data) => {
        if (data == "-1") throw new Error("-1");
        callback(data);
    }, instance, {
        secret: params.secret || constants.SECRETS.DELETE,
        ...params,
    }, options);
}
