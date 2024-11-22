import { genericRequest, GenericRequestOptions } from "./generic.js";
import * as constants from "../constants.js";
import * as utils from "../utils.js";
import { GDClient } from "../index.js";
import { AxiosRequestConfig } from "axios";

export enum ContentType {
    LEVEL = 1,
    COMMENT = 2,
    ACCOUNT = 3,
    LIST = 4,
}

export function likeItem(itemID: number, special: number, type: ContentType, like: 0 | 1, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig) {
    if (!instance.account) throw new Error("You must authenticate in order to like/dislike items");
    const rs = utils.rs(10);
    const chk = utils.chk([
        (special || 0),
        itemID,
        like,
        type,
        rs,
        (instance.account.accountID || 0),
        (instance.account.udid || ""),
        (instance.account.playerID || 0)
    ], constants.KEYS.RATE, constants.SALTS.LIKE_OR_RATE);

    genericRequest("likeItem", {
        itemID,
        special,
        type,
        like,
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