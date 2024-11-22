import { genericRequest, GenericRequestOptions } from "./generic.js";
import * as constants from "../constants.js";
import * as utils from "../utils.js";
import { GDClient } from "../index.js";
import { AxiosRequestConfig } from "axios";

export interface GetLevelListsOptions {
    query?: string;
    type?: number;
    page?: number;
    difficulty?: number;
    accountID?: number;
    accountIDs?: string[];
    rated?: boolean;
    str?: string;
    star?: number;
    followed?: string;
}

export interface GetLevelListsResult {
    lists: utils.List[];
    users: Record<string, utils.TinyUser>;
    total: number;
    offset: number;
    pageSize: number;
    hash: string;
    isHashValid: boolean;
}

export function getLevelLists(opts: GetLevelListsOptions, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: GetLevelListsResult) => void, options?: AxiosRequestConfig, secret?: string) {
    const diffMap: Record<string, number> = {
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

    const diff: {
        difficulty?: number;
        demonFilter?: number;
    } = {};
    if (opts.difficulty) {
        diff.difficulty = diffMap[opts.difficulty];
        if (opts.difficulty > 5) {
            diff.demonFilter = opts.difficulty - 5;
        }
    }

    let str = opts.query || "";
    if (opts.type == 5 && opts.accountID) str = opts.accountID.toString();

    let star = 0;
    if (opts.rated) star = 1;

    if (opts.type == 13) {
        if (!instance.account) throw new Error("Must be authorized to get friend levels");
    }

    opts = {
        str,
        star,
        page: opts.page || 0,
        type: opts.type || 2,
        followed: opts.accountIDs ? opts.accountIDs.join(",") : "",
        ...diff,
        ...(opts.type == 13 ? {
            accountID: instance.account.accountID,
            gjp2: utils.gjp2(instance.account.password),
        } : {}),
    };

    genericRequest("getLists", opts as Record<string, string>, function (data) {
        const segments = data.split("#");
        const lists = segments[0].split("|").map(e => utils.parseList(e));
        const users = utils.parseUsers(segments[1]);
        const pageInfo = segments[2].split(":");
        const hash = segments[3];
        callback({
            lists,
            users,
            total: Number(pageInfo[0]),
            offset: Number(pageInfo[1]),
            pageSize: Number(pageInfo[2]),
            hash,
            isHashValid: true
        });
    }, instance, params, options, secret);
}

export interface UploadLevelListOptions {
    id?: number;
    name: string;
    description?: string;
    levels: string[];
    difficulty?: number;
    originalID?: number;
    unlistedMode?: number;
    version?: number;
}

export function uploadLevelList(opts: UploadLevelListOptions, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig, secret?: string) {
    const seed2 = utils.rs(5);
    const translatedOptions = {
        listID: opts.id || 0,
        listName: opts.name,
        listDesc: opts.description ? utils.base64Encode(opts.description) : "",
        listLevels: opts.levels.join(","),
        difficulty: opts.difficulty || -1,
        original: opts.originalID || 0,
        unlisted: opts.unlistedMode || 0,
        listVersion: opts.version || 0,
        seed: utils.generateUploadListSeed(opts.levels.join(","), instance.account.accountID.toString(), seed2),
        seed2,
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password)
    };
    genericRequest("uploadList", translatedOptions, function (data) {
        if (Number(data) < 0) {
            switch (data) {
                case "-4":
                    throw new Error("invalid name");
                case "-5":
                    throw new Error("missing name");
                case "-6":
                    throw new Error("invalid level list");
                case "-9":
                    throw new Error("invalid account ID");
                case "-10":
                    throw new Error("invalid seed");
                case "-11":
                    throw new Error("incorrect password");
                case "-12":
                    throw new Error("ratelimited");
                case "-100":
                    throw new Error("incorrect secret");
                default:
                    throw new Error(data);
            }
        }
        callback(data);
    }, instance, params, options, secret);
}

export function deleteLevelList(id: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("deleteList", { listID: id, accountID: instance.account.accountID, gjp2: utils.gjp2(instance.account.password) }, function (data) {
        if (data == "-1") throw new Error("-1");
        callback(data);
    }, instance, params, options, secret || constants.SECRETS.DELETE);
}