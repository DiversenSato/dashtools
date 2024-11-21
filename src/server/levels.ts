import { genericRequest } from "./generic.js";
import * as constants from "../constants.js";
import * as utils from "../utils.js";

/**
 * Gets levels from a Geometry Dash server.
 * @param {GDServer} instance The Geometry Dash server instance
 * @param {object} params The parameters
 * @param {function} callback The callback function
 * @param {object} options Extra Axios parameters
 * @param {string} secret The secret parameter
 */
export function getLevels(params, instance, opts, callback, options, secret) {
    
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
    };

    let len = "-";
    if (params.length) {
        if (!isNaN(parseInt(params.length))) len = parseInt(params.length);
        else len = constants.LENGTHS[params.length];
    }

    const diff = {};
    if (params.difficulties && params.difficulties.length > 0) {
        const diffs = params.difficulties.map(d => diffMap[d] || 0);
        if (params.difficulties.length > 1) {
            if (diffs.includes(-2)) throw new Error("Only one demon difficulty can be searched at a time");
            diff.diff = Array.from(new Set(diffs)).join(",");
        } else if (diffs[0] == -2) {
            params.demonFilter = params.difficulties[0] - 5;
        } else {
            diff.diff = Number(diffs[0]);
        }
    }

    let str = params.query || "";
    if (params.type == 5) str = params.playerID;
    else if (params.type == 10 || params.type == 19) str = params.levelIDs.join(",");
    else if (params.type == 25) str = params.listID;

    const auth = {};
    if (params.type == 13) {
        if (!instance.account) throw new Error("Must be authorized to get friend levels");
        auth.accountID = instance.account.accountID;
        auth.gjp2 = utils.gjp2(instance.account.password);
    }
    params = {
        page: params.page || 0,
        type: params.type || 2,
        str,
        len,
        noStar: Number(!!params.unrated) || 0,
        star: Number(!!params.rated) || 0,
        featured: Number(!!params.featured) || 0,
        epic: Number(!!params.epic) || 0,
        legendary: Number(!!params.legendary) || 0,
        mythic: Number(!!params.mythic) || 0,
        coins: Number(!!params.coins) || 0,
        twoPlayer: Number(!!params.twoPlayer) || 0,
        original: Number(!!params.original) || 0,
        followed: params.accountIDs ? params.accountIDs.join(",") : "",
        uncompleted: !!params.uncompleted || 0,
        onlyCompleted: !!params.completed || 0,
        completedLevels: params.uncompleted || params.completed ? `(${params.levelIDs.join(",")})` : "",
        diff: diff.diff || undefined,
        customSong: params.customSong || 0,
        song: params.songID || 0,
        demonFilter: diff.demonFilter || 0,
        ...auth
    };
    genericRequest("getLevels", params, function(data) {
        const date = Date.now();
        const segments = data.split("#");
        const levels = segments[0].split("|").map(l => utils.parseLevel(l));
        let songs;
        let users;
        let pages;
        let hash = "";
        if (instance.versions.gameVersion >= 19) {
            users = segments[1];
            songs = segments[2];
            pages = segments[3];
            hash = segments[4];
        } else {
            users = segments[1];
            pages = segments[2];
            hash = segments[3];
        }
        songs = utils.parseSongs(songs);
        users = utils.parseUsers(users);
        pages = pages.split(":");
        callback({
            levels,
            songs,
            users,
            total: Number(pages[0]),
            offset: Number(pages[1]),
            pageSize: Number(pages[2]),
            hash,
            isHashValid: utils.generateLevelsHash(levels) == hash,
            date
        });
    }, instance, opts, options, secret);
}

export function getDailyLevel(instance, params, callback, options, secret) {
    genericRequest("getDailyLevel", {}, function(data) {
        callback({
            dailyID: Number(data.split("|")[0]),
            timeLeft: Number(data.split("|")[1])
        });
    }, instance, params, options, secret);
}
export function getMapPacks(instance, params, callback, options, secret) {
    genericRequest("getMapPacks", {}, function(data) {
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
    }, instance, params, options, secret);
}
export function getGauntlets(instance, params, callback, options, secret) {
    genericRequest("getGauntlets", {special: 1}, function(data) {
        const segments = data.split("#");
        const packsRaw = segments[0].split("|");
        const hash = segments[1];
        const packs = [];
        for (let pack of packsRaw) {
            pack = utils.robTopSplit(pack, ":");
            packs.push({
                id: Number(pack.get("1")),
                levels: pack.get("3").split(",")
            });
        }
        callback({
            packs,
            hash,
            isHashValid: utils.generateGauntletsHash(packs) == hash
        });
    }, instance, params, options, secret);
}
export function downloadLevel(levelID, instance, params, callback, options, secret) {
    const creds = {};
    let opt = {
        levelID
    };
    
    delete params.levelID;
    creds.rs = utils.rs(10);
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

    } else if (params.inc) throw new Error("Must authenticate with an account to increment");
    opt = {
        ...opt,
        ...creds
    };
    genericRequest("downloadLevel", opt, function(data) {
        const segments = data.split("#");
        let func = utils.parseLevel;
        if (instance.versions.gameVersion < 20) func = utils.parseLevelOld;
        const level = func(segments[0]);
        const hashes = segments.slice(1, 3);
        const json = {
            level,
            hashes,
            isHash1Valid: utils.generateDownloadHash(level.levelString) == hashes[0],
            isHash2Valid: utils.generateDownloadHash2(level.metadata) == hashes[1]
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
    }, instance, params, options, secret);
}
export function reportLevel(levelID, instance, params, callback, options, secret) {
    genericRequest("reportLevel", {levelID}, function(data) {
        if (data > 0) callback(data);
        else throw new Error(data);
    }, instance, params, options, secret);
}
// export function deleteLevel(levelID, instance, params, callback, options, secret) {
//     genericRequest("deleteLevel", {levelID, accountID: instance.account.accountID, gjp2: utils.gjp2(instance.account.password)}, function(data) {
//         if (data > 0) callback(data)
//         else throw new Error(data)
//     }, instance, params, options, (secret || constants.SECRETS.DELETE))
// }
export function rateLevel(levelID, stars, instance, params, callback, options, secret) {
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
    }, function(data) {
        callback(data);
    }, instance, params, options, secret);
}
export function rateDemon(levelID, rating, instance, params, callback, options, secret) {
    if (!instance.account) throw new Error("You must authenticate in order to send rate suggestions for levels");
    genericRequest("rateDemon", {levelID, rating, accountID: instance.account.accountID, gjp2: utils.gjp2(instance.account.password)}, function(data) {
        callback(data);
    }, instance, params, options, secret || constants.SECRETS.MOD);
}
export function updateDescription(levelID, description, instance, params, callback, options, secret) {
    if (!instance.account) throw new Error("You must authenticate in order to update a level's description");
    genericRequest("updateDescription", {levelID, levelDesc: utils.base64Encode(description), accountID: instance.account.accountID, gjp2: utils.gjp2(instance.account.password)}, function(data) {
        callback(data);
    }, instance, params, options, secret);
}
export function uploadLevel(opts, instance, params, callback, options, secret) {
    if (!instance.account) throw new Error("You must authenticate in order to upload a level");
    const seed2 = utils.generateUploadSeed2(opts.levelString);
    const song = {};
    if (opts.songIDs) song.songIDs = opts.songIDs.join(",");
    if (opts.sfxIDs) song.sfxIDs = opts.sfxIDs.join(",");
    opts = {
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
        password: opts.password != null && opts.password != undefined ? Number(opts.password) : (instance.binaryVersion > 37 ? 1 : 0), // free to copy by default on 2.201+, no copy by default on 2.200-
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
    genericRequest("uploadLevel", opts, function(id) {
        if (id == -1) throw new Error(-1);
        callback(id);
    }, instance, params, options, secret);
}
export function deleteLevel(levelID, instance, params, callback, options, secret) {
    if (!instance.account) throw new Error("You must authenticate in order to delete a level");
    genericRequest("deleteLevel", {levelID, accountID: instance.account.accountID, gjp2: utils.gjp2(instance.account.password)}, (d) => {
        if (d == -1) throw new Error("-1");
        callback(data);
    }, instance, params, options, secret || constants.SECRETS.DELETE);
}
