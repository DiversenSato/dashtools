import { genericRequest } from "./generic.js"
import * as constants from "../constants.js"
import * as utils from "../utils.js"

export function getLevelLists(opts, instance, params, callback, options, secret) {
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
    }
    
    const auth = {}
    const diff = {}
    if (opts.difficulty) {
        diff.difficulty = diffMap[opts.difficulty]
        if (opts.difficulty > 5) {
            diff.demonFilter = opts.difficulty - 5
        }
    }

    let str = opts.query || ""
    if (opts.type == 5) str = opts.accountID

    let star = 0
    if (opts.rated) star = 1

    if (opts.type == 13) {
        if (!instance.account) throw new Error("Must be authorized to get friend levels")
        auth.accountID = instance.account.accountID
        auth.gjp2 = utils.gjp2(instance.account.password)
    }

    opts = {
        str,
        star,
        page: opts.page || 0,
        type: opts.type || 2,
        followed: opts.accountIDs ? opts.accountIDs.join(",") : "",
        ...diff,
        ...auth
    }
    
    genericRequest("getLists", opts, function(data) {
        const segments = data.split("#")
        const lists = segments[0].split("|").map(e => utils.parseList(e))
        const users = utils.parseUsers(segments[1])
        const pageInfo = segments[2].split(":")
        const hash = segments[3]
        callback({
            lists, 
            users,
            total: Number(pageInfo[0]),
            offset: Number(pageInfo[1]),
            pageSize: Number(pageInfo[2]),
            hash,
            isHashValid: true
        })
    }, instance, params, options, secret)
}
export function uploadLevelList(opts, instance, params, callback, options, secret) {
    const seed2 = utils.rs(5)
    opts = {
        listID: opts.id || 0,
        listName: opts.name,
        listDesc: opts.description ? utils.base64Encode(opts.description) : "",
        listLevels: opts.levels.join(","),
        difficulty: opts.difficulty || -1,
        original: opts.originalID || 0,
        unlisted: opts.unlistedMode || 0,
        listVersion: opts.version || 0,
        seed: utils.generateUploadListSeed(opts.levels.join(","), instance.account.accountID, seed2),
        seed2,
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password)
    }
    genericRequest("uploadList", opts, function(data) {
        if (data < 0) {
            switch (data) {
                case -4:
                    throw new Error("invalid name")
                case -5:
                    throw new Error("missing name")
                case -6:
                    throw new Error("invalid level list")
                case -9:
                    throw new Error("invalid account ID")
                case -10:
                    throw new Error("invalid seed")
                case -11:
                    throw new Error("incorrect password")
                case -12:
                    throw new Error("ratelimited")
                case -100:
                    throw new Error("incorrect secret")
                default:
                    throw new Error(data)
            }
        }
        callback(data)
    }, instance, params, options, secret)
}
export function deleteLevelList(id, instance, params, callback, options, secret) {
    genericRequest("deleteList", {listID: id, accountID: instance.account.accountID, gjp2: utils.gjp2(instance.account.password)}, function(data) {
        if (data == -1) throw new Error(-1)
        callback(data)
    }, instance, params, options, secret || constants.SECRETS.DELETE)
}