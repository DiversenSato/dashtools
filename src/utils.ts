import * as constants from "./constants";
import * as crypto from "node:crypto";
import * as zlib from "node:zlib";

export function sha1(str: string, digestType = "hex") {
    const hash = crypto.createHash("sha1");
    hash.update(str);
    return hash.digest(digestType);
}

export function md5(str, digestType = "hex") {
    const hash = crypto.createHash("md5");
    hash.update(str);
    return hash.digest(digestType);
}

export function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function md5Buffer(str) {
    const hash = crypto.createHash("md5");
    hash.update(str);
    return hash.digest();
}

export function gjp(str) {
    return base64Encode(xor(str, constants.KEYS.ACCOUNT_PASSWORD));
}

export function gjp2(str) {
    return sha1(str + constants.SALTS.GJP2);
}

export function xor(str, key) {
    return str.split("").map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join("");
}

export function robTopSplit(str, sep) {
    const map = new Map();
    const arr = str.split(sep);
    for (let i = 0; i < arr.length; i += 2) {
        map.set(arr[i], arr[i+1]);
    }
    return map;
}

export function robTopSplitDict(str, sep) {
    const object = {};
    const arr = str.split(sep);
    for (let i = 0; i < arr.length; i += 2) {
        object[arr[i]] = arr[i+1];
    }
    return object;
}

export function rs(n, charset) {
    if (!charset) charset = constants.RS_CHARACTERS;
    return new Array(n).fill("0").map(_ => charset[Math.floor(Math.random()*charset.length)]).join("");
}

export function base64Encode(str) {
    return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
}

export function base64EncodeBuffer(str) {
    return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
}

export function base64Decode(str) {
    return Buffer.from(str.replace(/\+/g, "-").replace(/\//g, "_"), "base64url").toString("ascii");
}

export function base64DecodeBuffer(str) {
    return Buffer.from(str.replace(/\+/g, "-").replace(/\//g, "_"), "base64url");
}

export function generateCDNToken(endpoint, expires) {
    return base64EncodeBuffer(md5Buffer(`${constants.LIBRARY_SECRET}${endpoint}${expires}`, "ascii")).replace(/=/g, "");
}

export function generateHSV(h, s, v, s_checked, v_checked) {
    return `${h}a${s}a${v}a${s_checked ? 1 : 0}a${v_checked ? 1 : 0}`;
}

export function chk(values, key, salt) {
    const str = values.join("") + (salt || "");
    return base64Encode(xor(sha1(str), key));
}

export function parseSongs(str) {
    const songs = {};
    for (const i of str.split("~:~")) {
        const responseMap = robTopSplit(i, "~|~");
        songs[responseMap.get("1")] = {
            name: responseMap.get("2"),
            artistID: Number(responseMap.get("3")),
            artistName: responseMap.get("4"),
            size: Number(responseMap.get("5")),
            isVerified: !!Number(responseMap.get("8")),
            link: decodeURIComponent(responseMap.get("10")),
            new: !!Number(responseMap.get("13"))
        };
        if (responseMap.get("6")) songs[responseMap.get("1")].videoID = responseMap.get("6");
        if (responseMap.get("7")) songs[responseMap.get("1")].artistYoutubeURL = responseMap.get("7");
        if (responseMap.get("9")) songs[responseMap.get("1")].priority = Number(responseMap.get("9"));
        if (responseMap.get("11") != undefined) songs[responseMap.get("1")].nongType = Number(responseMap.get("11"));
        if (responseMap.get("12")) songs[responseMap.get("1")].extraArtistIDs = responseMap.get("12").split(".").map(e => Number(e));
        if (responseMap.get("14")) songs[responseMap.get("1")].newButtonType = Number(responseMap.get("14"));
        if (responseMap.get("15")) songs[responseMap.get("1")].extraArtistNames = responseMap.get("15");
        for (const i of responseMap.keys()) {
            if (!(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"].includes(i))) {
                json[`unk_${i}`] = responseMap.get(i);
            }
        }
    }
    delete songs["undefined"];
    return songs;
}

export function parseArtists(str) {
    const artists = [];
    for (const i of str.split("|")) {
        const responseMap = robTopSplit(i, ":");
        const artist = {name: responseMap.get("4")};
        if (responseMap.get("7")) artist.youtube = responseMap.get("7");
        for (const i of responseMap.keys()) {
            if (i != "4" && i != "7") {
                json[`unk_${i}`] = responseMap.get(i);
            }
        }
        artists.push(artist);
    }
    return artists;
}

export function xorDecode(str, key) {
    return xor(base64Decode(str), key);
}

export function parseUsers(str)  {
    const raw = str.split("|");
    const users = {};
    for (const i of raw) {
        const user = i.split(":");
        users[user[0]] = {
            username: user[1],
            accountID: Number(user[2]) || 0
        };
    }
    delete users["undefined"];
    return users;
}

export function generateRandomUUID() {
    const hex = constants.HEX_CHARACTERS;
    return `${rs(8, hex)}-${rs(4, hex)}-4${rs(3, hex)}-${rs(4, hex)}-${rs(10, hex)}`;
}

export function generateLevelsHash(levels) {
    let hash = "";
    for (const level of levels) {
        const id = level.metadata.id.toString();
        hash += id[0] + id[id.length - 1] + level.metadata.stars.toString() + Number(level.metadata.verifiedCoins).toString();
    }
    return sha1(hash + constants.SALTS.LEVEL);
}

export function generateMapPacksHash(packs) {
    let hash = "";
    for (const pack of packs) {
        const id = pack.id.toString();
        hash += id[0] + id[id.length - 1] + pack.stars.toString() + pack.coins.toString();
    }
    return sha1(hash + constants.SALTS.LEVEL);
}

export function generateGauntletsHash(packs) {
    let hash = "";
    for (const pack of packs) {
        hash += pack.id + pack.levels.join(",");
    }
    return sha1(hash + constants.SALTS.LEVEL);
}

export function generateDownloadHash2(level) {
    let password = level.password || 0;
    if (password && password != 1 && password != 0) password = Number(password) + 1000000;
    const hash = `${level.playerID},${level.stars},${Number(!!level.demon)},${level.id},${Number(!!level.verifiedCoins)},${level.featureScore},${password},${level.dailyNumber || 0}${constants.SALTS.LEVEL}`;
    return sha1(hash);
}

export function generateDownloadHash(levelString) {
    if (levelString.length < 41) return sha1(`${levelString}${constants.SALTS.LEVEL}`);
    let hash = `????????????????????????????????????????${constants.SALTS.LEVEL}`;
    const m = Math.floor(levelString.length / 40);
    let i = 40;
    while (i) {
        hash = hash.slice(0, --i) + levelString[i*m] + hash.slice(i+1);
    }
    return sha1(hash);
}

export function generateUploadSeed2(levelString) {
    if (levelString.length < 51) return chk([levelString], constants.KEYS.LEVEL, constants.SALTS.LEVEL);
    let hash = "??????????????????????????????????????????????????";
    const m = Math.floor(levelString.length / 50);
    let i = 50;
    while (i) {
        hash = hash.slice(0, --i) + levelString[i*m] + hash.slice(i+1);
    }
    return chk([hash], constants.KEYS.LEVEL, constants.SALTS.LEVEL);
}
export function generateUploadListSeed(listLevels, accountID, seed2) {
    if (listLevels.length < 51) return chk([listLevels], seed2, accountID);
    let hash = "??????????????????????????????????????????????????";
    const m = Math.floor(listLevels.length / 50);
    let i = 50;
    while (i) {
        hash = hash.slice(0, --i) + levelString[i*m] + hash.slice(i+1);
    }
    return chk([hash], seed2, accountID);
}

export function parseMapPack(str) {
    const raw = robTopSplit(str, ":");
    const mp = {
        id: Number(raw.get("1")),
        levels: raw.get("3").split(",").map(i => Number(i)),
        stars: Number(raw.get("4")),
        coins: Number(raw.get("5")),
    };
    if (raw.get("2")) mp.name = raw.get("2");
    if (raw.get("6")) mp.difficulty = Number(raw.get("6"));
    if (raw.get("7")) {
        const txtCol = raw.get("7").split(",").map(c => Number(c));
        mp.textColor = {r: txtCol[0], g: txtCol[1], b: txtCol[2]};
    }
    if (raw.get("8")) {
        const barCol = raw.get("8").split(",").map(c => Number(c));
        mp.barColor = {r: barCol[0], g: barCol[1], b: barCol[2]};
    }
    for (const i of raw.keys()) {
        if (!(["1", "2", "3", "4", "5", "6", "7", "8"].includes(i))) {
            json[`unk_${i}`] = raw.get(i);
        }
    }
    return mp;
}

export function parseLevel(str) {
    const json = {};
    const numberKeys = {
        1: "id",
        5: "version",
        6: "playerID",
        9: "difficulty",
        10: "downloads",
        11: "completions",
        12: "officialSong",
        13: "gameVersion",
        14: "likes",
        15: "length",
        18: "stars",
        19: "featureScore",
        26: "recordString",
        30: "copiedFromID",
        35: "customSongID",
        37: "coins",
        39: "starsRequested",
        41: "dailyNumber",
        42: "epicRating",
        43: "demonDifficulty",
        45: "objects",
        46: "editorTimeSeconds",
        47: "editorTimeCopiesSeconds",
        57: "verificationTimeFrames"
    };
    const stringKeys = {
        2: "name",
        26: "recordString",
        28: "uploadDate",
        29: "updateDate",
        36: "extraString",
        48: "settingsString"
    };
    const boolKeys = {
        17: "demon",
        25: "auto",
        31: "twoPlayer",
        38: "verifiedCoins",
        40: "lowDetailMode",
        44: "isGauntlet"
    };
    const raw = robTopSplit(str, ":");
    const levelString = raw.get("4");
    for (const i of Object.entries(numberKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            json[i[1]] = Number(raw.get(i[0].toString())) || 0;
    }
    for (const i of Object.entries(stringKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            json[i[1]] = raw.get(i[0].toString()) || "";
    }
    for (const i of Object.entries(boolKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            json[i[1]] = raw.get(i[0].toString()) ? !!Number(raw.get(i[0].toString())) : false;
    }
    if (raw.get("3")) {
        json.description = base64Decode(raw.get("3")).toString();
        if (json.description.match(/[\x00-\x1f]/)) {
            json.description = raw.get("3");
        }
    }
    if (Number(raw.get("8"))) {
        json.difficulty /= Number(raw.get("8"));
    }
    if (raw.get("27")) {
        const password = xor(base64Decode(raw.get("27")).toString(), constants.KEYS.LEVEL_PASSWORD);
        if (password.toString().length != 1)
            json.password = password.slice(1);
        else
            json.password = password;
    }
    if (raw.get("52")) {
        json.songIDs = raw.get("52").split(",");
    }
    if (raw.get("53")) {
        json.sfxIDs = raw.get("53").split(",");
    }
    for (const i of raw.keys()) {
        if (!boolKeys[i] && !stringKeys[i] && !numberKeys[i] && !(["3", "4", "8", "27", "52", "53"].includes(i))) {
            json[`unk_${i}`] = raw.get(i);
        }
    }
    const date = Date.now();
    const value = {
        metadata: json,
        parsedAt: date
    };
    if (levelString) value.levelString = levelString;
    return value;
}
export function parseLevelOld(str) {
    const json = {};
    const numberKeys = {
        1: "id",
        5: "version",
        6: "playerID",
        9: "difficulty",
        10: "downloads",
        11: "completions",
        12: "officialSong",
        13: "gameVersion",
        14: "likes",
        15: "length",
        18: "stars",
        19: "featureScore",
        26: "recordString",
        30: "copiedFromID",
        35: "customSongID",
    };
    const stringKeys = {
        2: "name",
        26: "recordString",
        27: "password",
        28: "uploadDate",
        29: "updateDate",
        36: "extraString"
    };
    const boolKeys = {
        17: "demon",
        25: "auto",
        31: "twoPlayer"
    };
    const raw = robTopSplit(str, ":");
    const levelString = raw.get("4");
    for (const i of Object.entries(numberKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            json[i[1]] = Number(raw.get(i[0].toString())) || 0;
    }
    for (const i of Object.entries(stringKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            json[i[1]] = raw.get(i[0].toString()) || "";
    }
    for (const i of Object.entries(boolKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            json[i[1]] = raw.get(i[0].toString()) ? !!Number(raw.get(i[0].toString())) : false;
    }
    if (raw.get("3")) {
        json.description = base64Decode(raw.get("3")).toString();
        if (json.description.match(/[\x00-\x1f]/)) {
            json.description = raw.get("3");
        }
    }
    if (Number(raw.get("8"))) {
        json.difficulty /= Number(raw.get("8"));
    }
    for (const i of raw.keys()) {
        if (!boolKeys[i] && !stringKeys[i] && !numberKeys[i] && !(["3", "4", "8"].includes(i))) {
            json[`unk_${i}`] = raw.get(i);
        }
    }
    const date = Date.now();
    const value = {
        metadata: json,
        parsedAt: date
    };
    if (levelString) value.levelString = levelString;
    return value;
}

export function parseList(str) {
    const json = {};
    const numberKeys = {
        1: "id",
        5: "version",
        6: "playerID",
        7: "difficulty",
        10: "downloads",
        14: "likes",
        15: "length",
        18: "stars",
        28: "uploadDate",
        29: "updateDate",
        55: "listReward",
        56: "listRewardRequirement"
    };
    const stringKeys = {
        2: "name",
        50: "username"
    };
    const boolKeys = {
        19: "featured"
    };
    const raw = robTopSplit(str, ":");
    for (const i of Object.entries(numberKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            json[i[1]] = Number(raw.get(i[0].toString())) || 0;
    }
    for (const i of Object.entries(stringKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            json[i[1]] = raw.get(i[0].toString()) || "";
    }
    for (const i of Object.entries(boolKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            json[i[1]] = raw.get(i[0].toString()) ? !!Number(raw.get(i[0].toString())) : false;
    }
    if (raw.get("51")) {
        json.levels = raw.get("51").split(",");
    }
    for (const i of raw.keys()) {
        if (!boolKeys[i] && !stringKeys[i] && !numberKeys[i] && i != "51") {
            json[`unk_${i}`] = raw.get(i);
        }
    }
    return json;
}

export function parseUser(str, sep) {
    const json = {};
    const numberKeys = {
        2: "playerID",
        3: "stars",
        4: "demons",
        6: "rank",
        7: "accountHighlight",
        8: "creatorPoints",
        9: "iconID",
        10: "color1",
        11: "color2",
        13: "secretCoins",
        14: "iconType",
        15: "special",
        16: "accountID",
        17: "userCoins",
        18: "messagePermissions",
        19: "friendPermissions",
        21: "cube",
        22: "ship",
        23: "ball",
        24: "ufo",
        25: "wave",
        26: "robot",
        27: "trail",
        28: "glow",
        30: "globalRank",
        31: "friendState",
        32: "friendRequestID",
        38: "messages",
        39: "friendRequests",
        40: "newFriends",
        43: "spider",
        46: "diamonds",
        48: "deathEffect",
        49: "modLevel",
        50: "commentHistoryPermissions",
        51: "color3",
        52: "moons",
        53: "swing",
        54: "jetpack"
    };
    const stringKeys = {
        1: "username",
        20: "youtube",
        35: "comment",
        37: "friendRequestAge",
        42: "scoreAge",
        44: "twitter",
        45: "twitch"
    };
    const boolKeys = {
        29: "isRegistered",
        41: "newFriendRequest"
    };
    const raw = robTopSplit(str, sep || ":");
    for (const i of Object.entries(numberKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            json[i[1]] = Number(raw.get(i[0].toString())) || 0;
    }
    for (const i of Object.entries(stringKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            json[i[1]] = raw.get(i[0].toString()) || "";
    }
    for (const i of Object.entries(boolKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            json[i[1]] = raw.get(i[0].toString()) ? !!Number(raw.get(i[0].toString())) : false;
    }
    if (raw.get("55")) {
        const dc = raw.get("55").split(",");
        json.demonCounts = {
            classic: {
                easy: Number(dc[0]),
                medium: Number(dc[1]),
                hard: Number(dc[2]),
                insane: Number(dc[3]),
                extreme: Number(dc[4])
            },
            platformer: {
                easy: Number(dc[5]),
                medium: Number(dc[6]),
                hard: Number(dc[7]),
                insane: Number(dc[8]),
                extreme: Number(dc[9])
            },
            weekly: Number(dc[10]),
            gauntlet: Number(dc[11])
        };
    }
    if (raw.get("56")) {
        const lc = raw.get("56").split(",");
        json.levelCounts = {
            classic: {
                auto: Number(lc[0]),
                easy: Number(lc[1]),
                normal: Number(lc[2]),
                hard: Number(lc[3]),
                harder: Number(lc[4]),
                insane: Number(lc[5]),
            },
            daily: Number(lc[6]),
            gauntlet: Number(lc[7])
        };
    }
    if (raw.get("57")) {
        const lcP = raw.get("57").split(",");
        if (!json.levelCounts) json.levelCounts = {};
        json.levelCounts.platformer = {
            auto: Number(lcP[0]),
            easy: Number(lcP[1]),
            normal: Number(lcP[2]),
            hard: Number(lcP[3]),
            harder: Number(lcP[4]),
            insane: Number(lcP[5])
        };
    }
    if (raw.get("35")) json.comment = base64Decode(raw.get("35"));
    for (const i of raw.keys()) {
        if (!boolKeys[i] && !stringKeys[i] && !numberKeys[i] && !(["55", "56", "57"]).includes(i)) {
            json[`unk_${i}`] = raw.get(i);
        }
    }
    return json;
}
export function parseComment(str) {
    const json = {};
    const numberKeys = {
        1: "levelID",
        3: "playerID",
        4: "likes",
        6: "id",
        8: "accountID",
        10: "percent",
        11: "modBadge"
    };
    const stringKeys = {
        9: "age"
    };
    const boolKeys = {
        7: "spam"
    };
    const segments = str.split(":");
    const rawComment = robTopSplit(segments[0], "~");
    if (segments[1]) {
        const rawUser = parseUser(segments[1], "~");
        json.user = rawUser;
    }
    for (const i of Object.entries(numberKeys)) {
        if (rawComment.get(i[0].toString()) != undefined && rawComment.get(i[0].toString()) != null)
            json[i[1]] = Number(rawComment.get(i[0].toString())) || 0;
    }
    for (const i of Object.entries(stringKeys)) {
        if (rawComment.get(i[0].toString()) != undefined && rawComment.get(i[0].toString()) != null)
            json[i[1]] = rawComment.get(i[0].toString()) || "";
    }
    for (const i of Object.entries(boolKeys)) {
        if (rawComment.get(i[0].toString()) != undefined && rawComment.get(i[0].toString()) != null)
            json[i[1]] = rawComment.get(i[0].toString()) ? !!Number(rawComment.get(i[0].toString())) : false;
    }
    if (rawComment.get("2")) {
        json.content = base64Decode(rawComment.get("2"));
    }
    if (rawComment.get("12")) {
        const rgb = rawComment.get("12").split(",");
        json.textColor = {r: rgb[0], g: rgb[1], b: rgb[2]};
    }
    for (const i of raw.keys()) {
        if (!boolKeys[i] && !stringKeys[i] && !numberKeys[i]) {
            json[`unk_${i}`] = raw.get(i);
        }
    }
    return json;
}
export function parseMessage(str) {
    const json = {};
    const numberKeys = {
        1: "id",
        2: "accountID",
        3: "playerID"
    };
    const stringKeys = {
        4: "title",
        5: "content",
        6: "username",
        7: "age"
    };
    const boolKeys = {
        8: "read",
        9: "outgoing"
    };
    const raw = robTopSplit(str, ":");
    for (const i of Object.entries(numberKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            json[i[1]] = Number(raw.get(i[0].toString())) || 0;
    }
    for (const i of Object.entries(stringKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            json[i[1]] = raw.get(i[0].toString()) || "";
    }
    for (const i of Object.entries(boolKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            json[i[1]] = raw.get(i[0].toString()) ? !!Number(raw.get(i[0].toString())) : false;
    }
    if (raw.get("4")) json.title = base64Decode(raw.get("4"));
    if (raw.get("5")) json.content = xor(base64Decode(raw.get("5")), constants.KEYS.MESSAGES);
    for (const i of raw.keys()) {
        if (!boolKeys[i] && !stringKeys[i] && !numberKeys[i]) {
            json[`unk_${i}`] = raw.get(i);
        }
    }
    return json;
}

export function tryUnzip(data) {
    let unzipped;
    try {
        unzipped = zlib.inflateSync(data);
    } catch {
        try {
            unzipped = zlib.inflateRawSync(data);
        } catch {
            try {
                unzipped = zlib.gunzipSync(data);
            } catch {
                try {
                    unzipped = zlib.unzipSync(data);
                } catch {
                    return data;
                }
            }
        }
    }
    return unzipped.toString();
}

export function getDefaultSavePath(os) {
    if (!os) os = process.platform;
    switch (os) {
        case "win32":
            return "%LOCALAPPDATA%\\GeometryDash";
        case "linux":
            return process.env.HOME + "/.steam/steam/steamapps/compatdata/322170/pfx/drive_c/users/steamuser/AppData/Local/GeometryDash";
    }
    return "";
}
export function generateLeaderboardSeed(clicks, percentage, seconds, hasPlayed) {
    if (hasPlayed == undefined) hasPlayed = 1;
    return (
        1482 * hasPlayed
        + (clicks + 3991) * (percentage + 8354)
        + ((seconds + 4085) ** 2) - 50028039
    );
}
export function generatePlatformerLeaderboardSeed(bestTime, bestPoints) {
    return (((((bestTime + 7890) % 34567) * 601 + ((Math.abs(bestPoints) + 3456) % 78901) * 967 + 94819) % 94433) * 829) % 77849;
}
export function decodeAudioLibrary(library) {
    return tryUnzip(base64DecodeBuffer(library));
}
export function parseMusicLibrary(library) {
    const decoded = decodeAudioLibrary(library).split("|");
    const artists = decoded[1].split(";").map(a => {
        if (a == "") return null;
        const segments = a.split(",");
        return {
            id: Number(segments[0]),
            name: segments[1],
            website: decodeURIComponent(segments[2]),
            youtube: segments[3]
        };
    }).filter(a => !!a);
    let songs = decoded[2].split(";").map(s => s.split(","));
    if (songs[0]) {
        if (songs[0].length == 6) { // 2.200
            songs = songs.map(segments => {
                if (segments[0] == "") return null;
                return {
                    id: Number(segments[0]),
                    name: segments[1],
                    primaryArtistID: Number(segments[2]),
                    filesize: Number(segments[3]),
                    duration: Number(segments[4]),
                    tags: segments[5].split(".").map(t => Number(t))
                };
            }).filter(s => !!s);
        } else if (songs[0].length == 12) { // 2.206
            songs = songs.map(segments => {
                if (segments[0] == "") return null;
                return {
                    id: Number(segments[0]),
                    name: segments[1],
                    primaryArtistID: Number(segments[2]),
                    fileSize: Number(segments[3]),
                    duration: Number(segments[4]),
                    tags: segments[5].split(".").map(t => Number(t)),
                    musicPlatform: Number(segments[6]),
                    extraArtists: segments[7].split(".").map(a => Number(a)),
                    externalLink: decodeURIComponent(segments[8]),
                    newButton: !!Number(segments[9]),
                    priorityOrder: Number(segments[10]),
                    songNumber: Number(segments[11])
                };
            }).filter(s => !!s);
        } else throw new Error("Unsupported music library format");
    }
    const tagsUnparsed = decoded[3].split(";").map(t => t.split(","));
    const tags = {};
    for (const tag of tagsUnparsed) {
        if (tag[1]) tags[Number(tag[0])] = tag[1];
    }
    return {
        version: Number(decoded[0]),
        artists,
        songs,
        tags
    };
}
export function parseSFXLibrary(library, directoryTree) {
    const decoded = decodeAudioLibrary(library).split("|");
    const objects = decoded[0].split(";").filter(e => !!e);
    const credits = decoded[1].split(";").filter(e => !!e).map(d => {
        const c = d.split(",");
        return {
            name: c[0],
            link: c[1]
        };
    });
    
    const version = Number(objects[0].split(",")[1]);
    if (!directoryTree) {
        const files = objects.map(o => {
            const file = o.split(",");
            return {
                id: Number(file[0]),
                name: file[1],
                isFolder: !!Number(file[2]),
                parentFolder: Number(file[3]),
                fileSize: Number(file[4]),
                duration: Number(file[5])
            };
        });
        return {
            version,
            credits,
            files
        };
    }
    const files = {};
    
    for (const i of objects) {
        const properties = i.split(",");
        const obj = {
            id: Number(properties[0]),
            name: properties[1],
        };
        if (Number(properties[2])) {
            if (!obj.files) obj.files = [];
            obj.isFolder = true;
            obj.parentFolder = Number(properties[3]);
            files[properties[0]] = obj;
        } else {
            obj.fileSize = Number(properties[4]),
            obj.duration = Number(properties[5]);
            if (!files[properties[3]]) {
                files[properties[3]] = {
                    id: Number(properties[3]),
                    name: "",
                    files: []
                };
            }
            files[properties[3]].files.push(obj);
        }
    }
    for (const i of Object.values(files)) {
        if (i.isFolder) {
            files[i.parentFolder.toString()].files.push(i);
            files[i.id.toString()].moved = true;
        }
    }
    for (const i of Object.values(files)) {
        delete files[i.id.toString()].parentFolder;
        if (i.isFolder && i.moved) {
            delete files[i.id.toString()].moved;
            delete files[i.id.toString()];
            continue;
        }
        delete files[i.id.toString()].moved;
    }
    return {
        version,
        credits,
        files
    };
}
