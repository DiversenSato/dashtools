import { genericRequest, accountRequest, GenericRequestOptions, AccountRequestOptions } from "./generic.js";
import * as constants from "../constants.js";
import * as utils from "../utils.js";
import { GDClient } from "../index.js";
import { AxiosRequestConfig } from "axios";

export function registerAccount(username: string, email: string, password: string, instance: GDClient, params: GenericRequestOptions = {}, callback: (isSuccess: boolean) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest<number>("registerAccount", { userName: username, email, password }, function (data) {
        switch (data) {
            case 1:
                callback(true);
                break;
            case -1:
                throw new Error("-1");
            case -2:
                throw new Error("Username is taken");
            case -3:
                throw new Error("Email is taken");
            case -4:
                throw new Error("Username is too long");
            case -5:
                throw new Error("Invalid password");
            case -6:
                throw new Error("Invalid email");
            case -8:
                throw new Error("Username is too short");
            case -9:
                throw new Error("Password is too short");
            default:
                throw new Error(data.toString());
        }
    }, instance, params, options, secret || constants.SECRETS.ACCOUNT);
}

export interface LoginAccountResult {
    accountID: number;
    playerID: number;
}

export function loginAccount(username: string, password: string, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: LoginAccountResult) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("loginAccount", { userName: username, password, udid: instance.account.udid }, function (data) {
        if (Number(data) < 0) {
            switch (data) {
                case "-1":
                    throw new Error("-1");
                case "-8":
                    throw new Error("Username is too short");
                case "-9":
                    throw new Error("Password is too short");
                case "-11":
                    throw new Error("Login or password is incorrect");
                case "-12":
                    throw new Error("Account is disabled");
                default:
                    throw new Error(data);
            }
        } else {
            callback({
                accountID: Number(data.split(",")[0]),
                playerID: Number(data.split(",")[1])
            });
        }
    }, instance, params, options, secret || constants.SECRETS.ACCOUNT);
}
export function requestModAccess(instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string | false) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("requestModAccess", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password)
    }, function (data) {
        if (data == "-1") callback(false);
        else callback(data);
    }, instance, params, options, secret || constants.SECRETS.ACCOUNT);
}

export interface SaveData {
    gameManager: string;
    localLevels: string;
    gameVersion: number;
    binaryVersion: number;
    ratedLevels: Record<string, number>;
    mappacks: utils.MapPack[];
}

export function loadSaveData(instance: GDClient, params: GenericRequestOptions = {}, callback: (data: SaveData) => void, options?: AxiosRequestConfig, secret?: string) {
    if (!instance.account) throw new Error("You must authenticate in order to load your save data");
    accountRequest("loadSaveData", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        uuid: instance.account.playerID,
        udid: instance.account.udid
    }, function (data) {
        const elements = data.split(";");
        const ratedLevels = utils.robTopSplitDict(utils.tryUnzip(utils.base64DecodeBuffer(elements[4].slice(20, elements[4].length - 20))).toString("utf8"), ",");
        const parsedRatedLevels: Record<string, number> = {};
        for (const i of Object.keys(ratedLevels)) {
            parsedRatedLevels[i] = Number(ratedLevels[i]);
        }
        const mappacks = elements[5];
        callback({
            gameManager: elements[0],
            localLevels: elements[1],
            gameVersion: Number(elements[2]),
            binaryVersion: Number(elements[3]),
            ratedLevels: parsedRatedLevels,
            mappacks: utils
                .tryUnzip(utils.base64DecodeBuffer(mappacks.slice(20, mappacks.length - 20)))
                .toString("utf8")
                .split("|")
                .map(m => utils.parseMapPack(m))
        });
    }, instance, params, options, secret || constants.SECRETS.ACCOUNT);
}
export function backupSaveData(gameManager: string, localLevels: string, instance: GDClient, params: AccountRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig, secret?: string) {
    if (!instance.account) throw new Error("You must authenticate in order to backup save data");
    accountRequest("backupSaveData", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        uuid: instance.account.playerID,
        udid: instance.account.udid,
        saveData: `${gameManager};${localLevels}`
    }, function (data) {
        if (Number(data) < 0) throw new Error(data);
        callback(data);
    }, instance, params, options, secret || constants.SECRETS.ACCOUNT);
}

export function getAccountURL(type: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string | false) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("getAccountURL", {
        accountID: (instance.account && instance.account.accountID ? instance.account.accountID : 71), // any valid account ID works, so RobTop's account ID is used as a placeholder
        type
    }, function (data) {
        if (data == "-1") callback(false);
        else callback(data);
    }, instance, params, options, secret || constants.SECRETS.ACCOUNT);
}