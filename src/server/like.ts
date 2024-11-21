import { genericRequest } from "./generic.js";
import * as constants from "../constants.js";
import * as utils from "../utils.js";

export function likeItem(itemID, special, type, like, instance, params, callback, options, secret) {
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
    }, function(data) {
        callback(data);
    }, instance, params, options, secret);
}