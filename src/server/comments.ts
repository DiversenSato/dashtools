import { genericRequest } from "./generic.js"
import * as constants from "../constants.js"
import * as utils from "../utils.js"

export function getLevelComments(levelID, count, mode, page, instance, params, callback, options, secret) {
    genericRequest("getComments", {levelID, count, mode, page}, function(data) {
        if (data < 0) {
            callback({
                comments: [],
                total: 0,
                offset: 0,
                pageSize: 0
            })
        } else {
            const segments = data.split("#")
            const comments = segments[0].split("|").map(u => utils.parseComment(u))
            const pages = segments[1].split(":")
            callback({
                comments,
                total: Number(pages[0]),
                offset: Number(pages[1]),
                pageSize: Number(pages[2]),
            })
        }
    }, instance, params, options, secret)
}
export function getCommentHistory(playerID, count, mode, page, instance, params, callback, options, secret) {
    genericRequest("getCommentHistory", {userID: playerID, count, mode, page}, function(data) {
        const segments = data.split("#")
        const comments = segments[0].split("|").map(u => utils.parseComment(u))
        const pages = segments[1].split(":")
        console.log(data)
        callback({
            comments,
            total: Number(pages[0]),
            offset: Number(pages[1]),
            pageSize: Number(pages[2]),
        })
    }, instance, params, options, secret)
}
export function uploadProfilePost(content, instance, params, callback, options, secret) {
    const extras = {}
    if (instance.account.username) {
        extras.userName = instance.account.username
        extras.chk = utils.chk([extras.userName, utils.base64Encode(content), 0, 0, 1], constants.KEYS.COMMENT, constants.SALTS.COMMENT)
    }
    genericRequest("uploadAccountComment", {
        comment: utils.base64Encode(content), 
        accountID: instance.account.accountID, 
        gjp2: utils.gjp2(instance.account.password), 
        cType: 1,
        ...extras
    }, function(data) {
        callback(data)
    }, instance, params, options, secret)
}
export function deleteProfilePost(id, accountID, instance, params, callback, options, secret) {
    genericRequest("deleteAccountComment", {
        commentID: id, 
        targetAccountID: (accountID || instance.account.accountID), 
        accountID: instance.account.accountID, 
        gjp2: utils.gjp2(instance.account.password)
    }, function(data) {
        if (data == 1) {
            callback(true)
        } else {
            callback(data)
        }
    }, instance, params, options, secret)
}
export function uploadComment(levelID, content, percentage, instance, params, callback, options, secret) {
    if (!instance.account.username) throw new Error("Must specify account username")
    const chk = utils.chk([instance.account.username, utils.base64Encode(content), levelID, percentage, 0], constants.KEYS.COMMENT, constants.SALTS.COMMENT)
    genericRequest("uploadComment", {
        levelID, 
        comment: utils.base64Encode(content), 
        percent: Number(percentage), 
        gjp2: utils.gjp2(instance.account.password),
        accountID: instance.account.accountID,
        chk,
        userName: instance.account.username
    }, function(data) {
        callback(data)
    }, instance, params, options, secret)
}

export function deleteComment(levelID, commentID, instance, params, callback, options, secret) {
    genericRequest("deleteComment", {
        levelID,
        commentID,
        accountID: instance.account.accountID, 
        gjp2: utils.gjp2(instance.account.password)
    }, function(data) {
        if (data == 1) {
            callback(true)
        } else {
            callback(data)
        }
    }, instance, params, options, secret)
}