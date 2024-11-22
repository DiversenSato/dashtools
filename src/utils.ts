import * as constants from "./constants";
import crypto from "node:crypto";
import * as zlib from "node:zlib";
import { GauntletPack } from "./server/levels";

/**
 * Generates a SHA-1 hash of the given string.
 *
 * @param {string} str - The input string to hash.
 * @param {crypto.BinaryToTextEncoding} [digestType="hex"] - The encoding of the output hash. Defaults to "hex".
 * @returns {string} The SHA-1 hash of the input string in the specified encoding.
 */
export function sha1(str: string, digestType: crypto.BinaryToTextEncoding = "hex"): string {
    const hash = crypto.createHash("sha1");
    hash.update(str);
    return hash.digest(digestType);
}

export function md5(str: string, digestType: crypto.BinaryToTextEncoding = "hex") {
    const hash = crypto.createHash("md5");
    hash.update(str);
    return hash.digest(digestType);
}

export function getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function md5Buffer(str: string) {
    const hash = crypto.createHash("md5");
    hash.update(str);
    return hash.digest();
}

export function gjp(str: string) {
    return base64Encode(xor(str, constants.KEYS.ACCOUNT_PASSWORD));
}

export function gjp2(str: string) {
    return sha1(str + constants.SALTS.GJP2);
}

export function xor(str: string, key: string) {
    return str.split("").map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join("");
}

/**
 * Converts a string array of key value pairs seperated by a character into a map
 * @param {string} str The string to split
 * @param {string} sep The character to seperate the string by
 * @returns {Map<string, string>} The map of key value pairs
 */
export function robTopSplit(str: string, sep: string): Map<string, string> {
    const map = new Map<string, string>();
    const arr = str.split(sep);
    for (let i = 0; i < arr.length; i += 2) {
        map.set(arr[i], arr[i + 1]);
    }
    return map;
}

/**
 * Similar to {@link robTopSplit} but returns an object instead of a map
 * @param {string} str The string to split
 * @param {string} sep The character to seperate the string by
 * @returns {Record<string, string>} The object of keys and their values
 */
export function robTopSplitDict(str: string, sep: string): Record<string, string> {
    const object: Record<string, string> = {};
    const arr = str.split(sep);
    for (let i = 0; i < arr.length; i += 2) {
        object[arr[i]] = arr[i + 1];
    }
    return object;
}

/**
 * Generates a random string of a specified length using the provided character set.
 * If no character set is provided, a default set of characters is used.
 *
 * @param {number} n - The length of the random string to generate.
 * @param {string[]} [charset] - An optional array of characters to use for generating the random string.
 * @returns {string} A random string of length `n` composed of characters from the `charset`.
 */
export function rs(n: number, charset?: string[]): string {
    if (!charset) charset = constants.RS_CHARACTERS;
    return new Array(n).fill("0").map(_ => charset[Math.floor(Math.random() * charset.length)]).join("");
}

export function base64Encode(str: string) {
    return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
}

export function base64EncodeBuffer(str: Buffer): string {
    return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
}

export function base64Decode(str: string) {
    return Buffer.from(str.replace(/\+/g, "-").replace(/\//g, "_"), "base64url").toString("ascii");
}

export function base64DecodeBuffer(str: string) {
    return Buffer.from(str.replace(/\+/g, "-").replace(/\//g, "_"), "base64url");
}

export function generateCDNToken(endpoint: string, expires: number) {
    return base64EncodeBuffer(md5Buffer(`${constants.LIBRARY_SECRET}${endpoint}${expires}`)).replace(/=/g, "");
}

export function generateHSV(h: number, s: number, v: number, s_checked: boolean, v_checked: boolean) {
    return `${h}a${s}a${v}a${s_checked ? 1 : 0}a${v_checked ? 1 : 0}`;
}

export function chk(values: (string | number)[], key: string, salt = "") {
    const str = values.join("") + salt;
    return base64Encode(xor(sha1(str), key));
}

export interface Song {
    name: string;
    artistID: number;
    artistName: string;
    size: number;
    isVerified: boolean;
    link?: string;
    videoID?: string;
    artistYoutubeURL?: string;
    priority?: number;
    nongType?: number;
    extraArtistIDs?: number[];
    newButtonType?: number;
    extraArtistNames?: string;
    new: boolean;
}

export function parseSongs(str: string) {
    const songs: Record<string, Song> = {};

    for (const i of str.split("~:~")) {
        const responseMap = robTopSplit(i, "~|~");
        const songID = responseMap.get("1");
        if (!songID) continue;

        const name = responseMap.get("2");
        if (!name) throw new Error("Parsing error: Song name is missing.");
        const artistName = responseMap.get("4");
        if (!artistName) throw new Error("Parsing error: Artist name is missing.");

        const song: Song = {
            name,
            artistID: Number(responseMap.get("3")),
            artistName,
            size: Number(responseMap.get("5")),
            isVerified: !!Number(responseMap.get("8")),
            new: !!Number(responseMap.get("13"))
        };
        if (responseMap.get("6")) song.videoID = responseMap.get("6");
        if (responseMap.get("7")) song.artistYoutubeURL = responseMap.get("7");
        if (responseMap.get("9")) song.priority = Number(responseMap.get("9"));
        if (responseMap.get("10")) song.link = decodeURIComponent(responseMap.get("10")!);
        if (responseMap.get("11") != undefined) song.nongType = Number(responseMap.get("11"));
        if (responseMap.get("12")) song.extraArtistIDs = responseMap.get("12")!.split(".").map(e => Number(e));
        if (responseMap.get("14")) song.newButtonType = Number(responseMap.get("14"));
        if (responseMap.get("15")) song.extraArtistNames = responseMap.get("15");

        // for (const i of responseMap.keys()) {
        //     if (!(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"].includes(i))) {
        //         json[`unk_${i}`] = responseMap.get(i);
        //     }
        // }

        songs[songID] = song;
    }

    delete songs["undefined"];
    return songs;
}

export interface Artist {
    name: string;
    youtube?: string;
    [key: string]: string | undefined;
}

export function parseArtists(str: string): Artist[] {
    const artists: Artist[] = [];
    for (const i of str.split("|")) {
        const responseMap = robTopSplit(i, ":");
        const name = responseMap.get("4");
        if (!name) continue;

        const artist: Artist = { name };
        if (responseMap.get("7")) artist.youtube = responseMap.get("7");
        for (const i of responseMap.keys()) {
            if (i != "4" && i != "7") {
                artist[`unk_${i}`] = responseMap.get(i);
            }
        }
        artists.push(artist);
    }
    return artists;
}

export function xorDecode(str: string, key: string) {
    return xor(base64Decode(str), key);
}

export interface TinyUser {
    username: string;
    accountID: number;
}

export function parseUsers(str: string) {
    const raw = str.split("|");
    const users: Record<string, TinyUser> = {};
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

export function generateLevelsHash(levels: Level[]) {
    let hash = "";
    for (const level of levels) {
        const id = level.metadata.id?.toString();
        if (!id || !level.metadata.stars) throw new Error("Invalid level data. Missing ID or stars.");
        hash += id[0] + id[id.length - 1] + level.metadata.stars.toString() + Number(level.metadata.verifiedCoins).toString();
    }
    return sha1(hash + constants.SALTS.LEVEL);
}

export function generateMapPacksHash(packs: MapPack[]) {
    let hash = "";
    for (const pack of packs) {
        const id = pack.id.toString();
        hash += id[0] + id[id.length - 1] + pack.stars.toString() + pack.coins.toString();
    }
    return sha1(hash + constants.SALTS.LEVEL);
}

export function generateGauntletsHash(packs: GauntletPack[]) {
    let hash = "";
    for (const pack of packs) {
        hash += pack.id + pack.levels.join(",");
    }
    return sha1(hash + constants.SALTS.LEVEL);
}

export function generateDownloadHash2(level: { password: string, playerID: number, stars: number, demon: boolean, id: number, verifiedCoins: boolean, featureScore: number, dailyNumber?: number }) {
    let password = level.password || 0;
    if (password && password != 1 && password != 0) password = Number(password) + 1000000;
    const hash = `${level.playerID},${level.stars},${Number(!!level.demon)},${level.id},${Number(!!level.verifiedCoins)},${level.featureScore},${password},${level.dailyNumber || 0}${constants.SALTS.LEVEL}`;
    return sha1(hash);
}

export function generateDownloadHash(levelString: string) {
    if (levelString.length < 41) return sha1(`${levelString}${constants.SALTS.LEVEL}`);
    let hash = `????????????????????????????????????????${constants.SALTS.LEVEL}`;
    const m = Math.floor(levelString.length / 40);
    let i = 40;
    while (i) {
        hash = hash.slice(0, --i) + levelString[i * m] + hash.slice(i + 1);
    }
    return sha1(hash);
}

export function generateUploadSeed2(levelString: string) {
    if (levelString.length < 51) return chk([levelString], constants.KEYS.LEVEL, constants.SALTS.LEVEL);
    let hash = "??????????????????????????????????????????????????";
    const m = Math.floor(levelString.length / 50);
    let i = 50;
    while (i) {
        hash = hash.slice(0, --i) + levelString[i * m] + hash.slice(i + 1);
    }
    return chk([hash], constants.KEYS.LEVEL, constants.SALTS.LEVEL);
}
export function generateUploadListSeed(listLevels: string, accountID: string, seed2: string) {
    if (listLevels.length < 51) return chk([listLevels], seed2, accountID);
    let hash = "??????????????????????????????????????????????????";
    const m = Math.floor(listLevels.length / 50);
    let i = 50;

    while (i) {
        hash = hash.slice(0, --i) + listLevels[i * m] + hash.slice(i + 1);
    }

    return chk([hash], seed2, accountID);
}

export interface MapPack {
    id: number;
    levels?: number[];
    stars: number;
    coins: number;
    name?: string;
    difficulty?: number;
    textColor?: { r: number, g: number, b: number };
    barColor?: { r: number, g: number, b: number };
}

export function parseMapPack(str: string): MapPack {
    const raw = robTopSplit(str, ":");
    const mp: MapPack = {
        id: Number(raw.get("1")),
        levels: raw.get("3")?.split(",").map(i => Number(i)),
        stars: Number(raw.get("4")),
        coins: Number(raw.get("5")),
    };
    if (raw.get("2")) mp.name = raw.get("2");
    if (raw.get("6")) mp.difficulty = Number(raw.get("6"));
    if (raw.get("7")) {
        const txtCol = raw.get("7")!.split(",").map(c => Number(c));
        mp.textColor = { r: txtCol[0], g: txtCol[1], b: txtCol[2] };
    }
    if (raw.get("8")) {
        const barCol = raw.get("8")!.split(",").map(c => Number(c));
        mp.barColor = { r: barCol[0], g: barCol[1], b: barCol[2] };
    }

    // for (const i of raw.keys()) {
    //     if (!(["1", "2", "3", "4", "5", "6", "7", "8"].includes(i))) {
    //         json[`unk_${i}`] = raw.get(i);
    //     }
    // }

    return mp;
}

const levelNumberKeys = {
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
} as const;
const levelStringKeys = {
    2: "name",
    26: "recordString",
    28: "uploadDate",
    29: "updateDate",
    36: "extraString",
    48: "settingsString"
} as const;
const levelBoolKeys = {
    17: "demon",
    25: "auto",
    31: "twoPlayer",
    38: "verifiedCoins",
    40: "lowDetailMode",
    44: "isGauntlet"
} as const;

export interface Level {
    metadata: LevelMetaData;
    parsedAt: number;
    levelString?: string;
}

interface LevelMetaData extends
    Record<typeof levelNumberKeys[keyof typeof levelNumberKeys], number | undefined>,
    Record<typeof levelStringKeys[keyof typeof levelStringKeys], string | undefined>,
    Record<typeof levelBoolKeys[keyof typeof levelBoolKeys], boolean | undefined> {
    description?: string;
    password?: string;
    songIDs?: string[];
    sfxIDs?: string[];
}

export function parseLevel(str: string): Level {
    const json: Partial<LevelMetaData> = {};
    const raw = robTopSplit(str, ":");  // "1:22:5:1:10:1000" -> { 1: "22", 5: "1", 10: "1000" } -> { id: 22, version: 1, downloads: 1000 }
    const levelString = raw.get("4");
    for (const [keyID, key] of Object.entries(levelNumberKeys)) {
        const value = raw.get(keyID);
        if (value === undefined) continue;
        json[key] = Number(value) || 0;
    }
    for (const [keyID, key] of Object.entries(levelStringKeys)) {
        const value = raw.get(keyID);
        if (value == undefined) continue;
        json[key] = value;
    }
    for (const i of Object.entries(levelBoolKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            json[i[1]] = raw.get(i[0].toString()) ? !!Number(raw.get(i[0].toString())) : false;
    }
    if (raw.get("3")) {
        json.description = base64Decode(raw.get("3")!).toString();
        // eslint-disable-next-line no-control-regex
        if (json.description.match(/[\x00-\x1f]/)) {
            json.description = raw.get("3");
        }
    }
    if (Number(raw.get("8")) && json.difficulty) {
        json.difficulty /= Number(raw.get("8"));
    }
    if (raw.get("27")) {
        const password = xor(base64Decode(raw.get("27")!).toString(), constants.KEYS.LEVEL_PASSWORD);
        if (password.toString().length != 1)
            json.password = password.slice(1);
        else
            json.password = password;
    }
    if (raw.get("52")) {
        json.songIDs = raw.get("52")!.split(",");
    }
    if (raw.get("53")) {
        json.sfxIDs = raw.get("53")!.split(",");
    }

    // Add unknown keys to the metadata
    // for (const i of raw.keys()) {
    //     if (!levelBoolKeys[i] && !levelStringKeys[i] && !levelNumberKeys[i] && !(["3", "4", "8", "27", "52", "53"].includes(i))) {
    //         json[`unk_${i}`] = raw.get(i);
    //     }
    // }

    const date = Date.now();
    const value: Level = {
        metadata: json as LevelMetaData,
        parsedAt: date
    };
    if (levelString) value.levelString = levelString;
    return value;
}

const levelOldNumberKeys = {
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
    30: "copiedFromID",
    35: "customSongID",
} as const;
const levelOldStringKeys = {
    2: "name",
    26: "recordString",
    27: "password",
    28: "uploadDate",
    29: "updateDate",
    36: "extraString",
} as const;
const levelOldBoolKeys = {
    17: "demon",
    25: "auto",
    31: "twoPlayer",
} as const;

export interface LevelOldMetaData extends
    Record<typeof levelOldNumberKeys[keyof typeof levelOldNumberKeys], number | undefined>,
    Record<typeof levelOldStringKeys[keyof typeof levelOldStringKeys], string | undefined>,
    Record<typeof levelOldBoolKeys[keyof typeof levelOldBoolKeys], boolean | undefined> {
    description?: string;
    verifiedCoins?: boolean;
    lowDetailMode?: boolean;
    isGauntlet?: boolean;
    songIDs?: string[];
    sfxIDs?: string[];
}

export interface LevelOld {
    metadata: LevelOldMetaData;
    parsedAt: number;
    levelString?: string;
}

export function parseLevelOld(str: string) {
    const level: Partial<LevelOldMetaData> = {};

    const raw = robTopSplit(str, ":");
    const levelString = raw.get("4");
    for (const i of Object.entries(levelOldNumberKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            level[i[1]] = Number(raw.get(i[0].toString())) || 0;
    }
    for (const i of Object.entries(levelOldStringKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            level[i[1]] = raw.get(i[0].toString()) || "";
    }
    for (const i of Object.entries(levelOldBoolKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            level[i[1]] = raw.get(i[0].toString()) ? !!Number(raw.get(i[0].toString())) : false;
    }
    if (raw.get("3")) {
        level.description = base64Decode(raw.get("3")!).toString();
        // eslint-disable-next-line no-control-regex
        if (level.description.match(/[\x00-\x1f]/)) {
            level.description = raw.get("3");
        }
    }
    if (Number(raw.get("8")) && level.difficulty) {
        level.difficulty /= Number(raw.get("8"));
    }

    // for (const i of raw.keys()) {
    //     if (!levelOldBoolKeys[i] && !levelOldStringKeys[i] && !levelOldNumberKeys[i] && !(["3", "4", "8"].includes(i))) {
    //         level[`unk_${i}`] = raw.get(i);
    //     }
    // }

    const date = Date.now();
    const value: {
        metadata: LevelOldMetaData;
        parsedAt: number;
        levelString?: string;
    } = {
        metadata: level as LevelOldMetaData,
        parsedAt: date,
    };
    if (levelString) value.levelString = levelString;
    return value as LevelOld;
}

const listNumberKeys = {
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
} as const;
const listStringKeys = {
    2: "name",
    50: "username"
} as const;
const listBoolKeys = {
    19: "featured"
} as const;

export interface List extends
    Record<typeof listNumberKeys[keyof typeof listNumberKeys], number | undefined>,
    Record<typeof listStringKeys[keyof typeof listStringKeys], string | undefined>,
    Record<typeof listBoolKeys[keyof typeof listBoolKeys], boolean | undefined> {
    levels?: string[];
}

export function parseList(str: string): List {
    const list: Partial<List> = {};
    const raw = robTopSplit(str, ":");
    for (const i of Object.entries(listNumberKeys)) {
        const value = raw.get(i[0].toString());
        if (value != undefined && value != null)
            list[i[1]] = Number(value) || 0;
    }
    for (const i of Object.entries(listStringKeys)) {
        const value = raw.get(i[0].toString());
        if (value != undefined && value != null)
            list[i[1]] = value || "";
    }
    for (const i of Object.entries(listBoolKeys)) {
        const value = raw.get(i[0].toString());
        if (value != undefined && value != null)
            list[i[1]] = value ? !!Number(value) : false;
    }
    if (raw.get("51")) {
        list.levels = raw.get("51")!.split(",");
    }

    // for (const i of raw.keys()) {
    //     if (!listBoolKeys[i] && !listStringKeys[i] && !listNumberKeys[i] && i != "51") {
    //         list[`unk_${i}`] = raw.get(i);
    //     }
    // }

    return list as List;
}

const userNumberKeys = {
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
} as const;
const userStringKeys = {
    1: "username",
    20: "youtube",
    37: "friendRequestAge",
    42: "scoreAge",
    44: "twitter",
    45: "twitch"
} as const;
const userBoolKeys = {
    29: "isRegistered",
    41: "newFriendRequest"
} as const;

export interface User extends
    Record<typeof userNumberKeys[keyof typeof userNumberKeys], number | undefined>,
    Record<typeof userStringKeys[keyof typeof userStringKeys], string | undefined>,
    Record<typeof userBoolKeys[keyof typeof userBoolKeys], boolean | undefined> {
    comment?: string;
    demonCounts?: {
        classic: {
            easy: number;
            medium: number;
            hard: number;
            insane: number;
            extreme: number;
        };
        platformer: {
            easy: number;
            medium: number;
            hard: number;
            insane: number;
            extreme: number;
        };
        weekly: number;
        gauntlet: number;
    };
    levelCounts?: {
        classic?: {
            auto: number;
            easy: number;
            normal: number;
            hard: number;
            harder: number;
            insane: number;
        };
        platformer?: {
            auto: number;
            easy: number;
            normal: number;
            hard: number;
            harder: number;
            insane: number;
        };
        daily?: number;
        gauntlet?: number;
    }
}

export function parseUser(str: string, sep = ":"): User {
    const user: Partial<User> = {};
    const raw = robTopSplit(str, sep);
    for (const i of Object.entries(userNumberKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            user[i[1]] = Number(raw.get(i[0].toString())) || 0;
    }
    for (const i of Object.entries(userStringKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            user[i[1]] = raw.get(i[0].toString()) || "";
    }
    for (const i of Object.entries(userBoolKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            user[i[1]] = raw.get(i[0].toString()) ? !!Number(raw.get(i[0].toString())) : false;
    }
    if (raw.get("55")) {
        const dc = raw.get("55")!.split(",");
        user.demonCounts = {
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
        const lc = raw.get("56")!.split(",");
        user.levelCounts = {
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
        const lcP = raw.get("57")!.split(",");
        if (!user.levelCounts) user.levelCounts = {};
        user.levelCounts.platformer = {
            auto: Number(lcP[0]),
            easy: Number(lcP[1]),
            normal: Number(lcP[2]),
            hard: Number(lcP[3]),
            harder: Number(lcP[4]),
            insane: Number(lcP[5])
        };
    }
    if (raw.get("35")) user.comment = base64Decode(raw.get("35")!);

    // for (const i of raw.keys()) {
    //     if (!userBoolKeys[i] && !userStringKeys[i] && !userNumberKeys[i] && !(["55", "56", "57"]).includes(i)) {
    //         user[`unk_${i}`] = raw.get(i);
    //     }
    // }

    return user as User;
}
const commentNumberKeys = {
    1: "levelID",
    3: "playerID",
    4: "likes",
    6: "id",
    8: "accountID",
    10: "percent",
    11: "modBadge"
} as const;
const commentStringKeys = {
    9: "age"
} as const;
const commentBoolKeys = {
    7: "spam"
} as const;

export interface Comment extends
    Record<typeof commentNumberKeys[keyof typeof commentNumberKeys], number | undefined>,
    Record<typeof commentStringKeys[keyof typeof commentStringKeys], string | undefined>,
    Record<typeof commentBoolKeys[keyof typeof commentBoolKeys], boolean | undefined> {
    user?: User;
    content?: string;
    textColor?: { r: string, g: string, b: string };
}

export function parseComment(str: string): Comment {
    const comment: Partial<Comment> = {};
    const segments = str.split(":");
    const rawComment = robTopSplit(segments[0], "~");
    if (segments[1]) {
        const rawUser = parseUser(segments[1], "~");
        comment.user = rawUser;
    }
    for (const i of Object.entries(commentNumberKeys)) {
        if (rawComment.get(i[0].toString()) != undefined && rawComment.get(i[0].toString()) != null)
            comment[i[1]] = Number(rawComment.get(i[0].toString())) || 0;
    }
    for (const i of Object.entries(commentStringKeys)) {
        if (rawComment.get(i[0].toString()) != undefined && rawComment.get(i[0].toString()) != null)
            comment[i[1]] = rawComment.get(i[0].toString()) || "";
    }
    for (const i of Object.entries(commentBoolKeys)) {
        if (rawComment.get(i[0].toString()) != undefined && rawComment.get(i[0].toString()) != null)
            comment[i[1]] = rawComment.get(i[0].toString()) ? !!Number(rawComment.get(i[0].toString())) : false;
    }
    if (rawComment.get("2")) {
        comment.content = base64Decode(rawComment.get("2")!);
    }
    if (rawComment.get("12")) {
        const rgb = rawComment.get("12")!.split(",");
        comment.textColor = { r: rgb[0], g: rgb[1], b: rgb[2] };
    }

    // for (const i of rawComment.keys()) {
    //     if (!commentBoolKeys[i] && !commentStringKeys[i] && !commentNumberKeys[i]) {
    //         comment[`unk_${i}`] = rawComment.get(i);
    //     }
    // }

    return comment as Comment;
}

const messageNumberKeys = {
    1: "id",
    2: "accountID",
    3: "playerID"
} as const;
const messageStringKeys = {
    4: "title",
    5: "content",
    6: "username",
    7: "age"
} as const;
const messageBoolKeys = {
    8: "read",
    9: "outgoing"
} as const;

export interface Message extends
    Record<typeof messageNumberKeys[keyof typeof messageNumberKeys], number | undefined>,
    Record<typeof messageStringKeys[keyof typeof messageStringKeys], string | undefined>,
    Record<typeof messageBoolKeys[keyof typeof messageBoolKeys], boolean | undefined> {
}

export function parseMessage(str: string): Message {
    const message: Partial<Message> = {};
    const raw = robTopSplit(str, ":");

    for (const i of Object.entries(messageNumberKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            message[i[1]] = Number(raw.get(i[0].toString())) || 0;
    }
    for (const i of Object.entries(messageStringKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            message[i[1]] = raw.get(i[0].toString()) || "";
    }
    for (const i of Object.entries(messageBoolKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            message[i[1]] = raw.get(i[0].toString()) ? !!Number(raw.get(i[0].toString())) : false;
    }
    if (raw.get("4")) message.title = base64Decode(raw.get("4")!);
    if (raw.get("5")) message.content = xor(base64Decode(raw.get("5")!), constants.KEYS.MESSAGES);

    // for (const i of raw.keys()) {
    //     if (!messageBoolKeys[i] && !messageStringKeys[i] && !messageNumberKeys[i]) {
    //         message[`unk_${i}`] = raw.get(i);
    //     }
    // }

    return message as Message;
}

export function tryUnzip(data: Buffer): Buffer {
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
    return unzipped;
}

export function getDefaultSavePath(os: string) {
    if (!os) os = process.platform;
    switch (os) {
        case "win32":
            return "%LOCALAPPDATA%\\GeometryDash";
        case "linux":
            return process.env.HOME + "/.steam/steam/steamapps/compatdata/322170/pfx/drive_c/users/steamuser/AppData/Local/GeometryDash";
    }
    return "";
}

export function generateLeaderboardSeed(clicks: number, percentage: number, seconds: number, hasPlayed?: number) {
    if (hasPlayed == undefined) hasPlayed = 1;
    return (
        1482 * hasPlayed
        + (clicks + 3991) * (percentage + 8354)
        + ((seconds + 4085) ** 2) - 50028039
    );
}

export function generatePlatformerLeaderboardSeed(bestTime: number, bestPoints: number) {
    return (((((bestTime + 7890) % 34567) * 601 + ((Math.abs(bestPoints) + 3456) % 78901) * 967 + 94819) % 94433) * 829) % 77849;
}

export function decodeAudioLibrary(library: string) {
    return tryUnzip(base64DecodeBuffer(library));
}

interface MusicLibrarySong {
    id: number;
    name: string;
    primaryArtistID: number;
    filesize: number;
    duration: number;
    tags: number[];
    musicPlatform?: number;
    extraArtists?: number[];
    externalLink?: string;
    newButton?: boolean;
    priorityOrder?: number;
    songNumber?: number;
}

export function parseMusicLibrary(library: string) {
    const decoded = decodeAudioLibrary(library).toString("utf8").split("|");

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

    const songs = decoded[2].split(";").map(s => s.split(","));
    const parsedSongs: MusicLibrarySong[] = [];
    if (songs[0]) {
        if (songs[0].length == 6) { // 2.200
            parsedSongs.push(...songs.map(segments => {
                if (segments[0] == "") return null;
                return {
                    id: Number(segments[0]),
                    name: segments[1],
                    primaryArtistID: Number(segments[2]),
                    filesize: Number(segments[3]),
                    duration: Number(segments[4]),
                    tags: segments[5].split(".").map(t => Number(t))
                };
            }).filter(s => !!s));
        } else if (songs[0].length == 12) { // 2.206
            parsedSongs.push(...songs.map(segments => {
                if (segments[0] == "") return null;
                return {
                    id: Number(segments[0]),
                    name: segments[1],
                    primaryArtistID: Number(segments[2]),
                    filesize: Number(segments[3]),
                    duration: Number(segments[4]),
                    tags: segments[5].split(".").map(t => Number(t)),
                    musicPlatform: Number(segments[6]),
                    extraArtists: segments[7].split(".").map(a => Number(a)),
                    externalLink: decodeURIComponent(segments[8]),
                    newButton: !!Number(segments[9]),
                    priorityOrder: Number(segments[10]),
                    songNumber: Number(segments[11])
                };
            }).filter(s => !!s));
        } else throw new Error("Unsupported music library format");
    }

    const tagsUnparsed = decoded[3].split(";").map(t => t.split(","));
    const tags: Record<number, string> = {};
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
export function parseSFXLibrary(library: string, directoryTree = false) {
    const decoded = decodeAudioLibrary(library).toString("ascii").split("|");
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
    const files: Record<string, {
        id: number;
        name: string;
        isFolder?: boolean;
        parentFolder?: number;
        fileSize?: number;
        duration?: number;
        files?: object[];
        moved?: boolean;
    }> = {};

    for (const i of objects) {
        const properties = i.split(",");
        const obj: {
            id: number;
            name: string;
            isFolder?: boolean;
            parentFolder?: number;
            fileSize?: number;
            duration?: number;
            files?: object[];
            moved?: boolean;
        } = {
            id: Number(properties[0]),
            name: properties[1],
        };
        if (Number(properties[2])) {
            if (!obj.files) obj.files = [];
            obj.isFolder = true;
            obj.parentFolder = Number(properties[3]);
            files[properties[0]] = obj;
        } else {
            obj.fileSize = Number(properties[4]);
            obj.duration = Number(properties[5]);
            if (!files[properties[3]]) {
                files[properties[3]] = {
                    id: Number(properties[3]),
                    name: "",
                    files: []
                };
            }
            files[properties[3]].files?.push(obj);
        }
    }
    for (const i of Object.values(files)) {
        if (i.isFolder) {
            files[i.parentFolder!.toString()].files?.push(i);
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
