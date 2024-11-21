import { genericRequest } from "./generic.js"
import * as constants from "../constants.js"
import * as utils from "../utils.js"

export function getUserList(type, instance, params, callback, options, secret) {
    genericRequest("getUserList", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        type
    }, function(data) {
        if (data == -1) throw new Error(-1)
        callback(data.split("|").map(e => utils.parseUser(e)))
    }, instance, params, options, secret)
}
export function getMessages(page, type, instance, params, callback, options, secret) {
    genericRequest("getMessages", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        page,
        getSent: type,
        total: 0
    }, function(data) {
        if (data == -1) throw new Error(-1)
        let segments = data.split("#")
        let messages = segments[0].split("|").map(m => utils.parseMessage(m))
        let pages = segments[1].split(":")
        callback({
            messages,
            total: Number(pages[0]),
            offset: Number(pages[1]),
            pageSize: Number(pages[2])
        })
    }, instance, params, options, secret)
}
export function readMessage(messageID, isSender, instance, params, callback, options, secret) {
    genericRequest("readMessage", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        messageID,
        isSender: Number(!!isSender)
    }, function(data) {
        if (data == -1) throw new Error(-1)
        callback(utils.parseMessage(data))
    }, instance, params, options, secret)
}
export function sendMessage(accountID, subject, body, instance, params, callback, options, secret) {
    genericRequest("sendMessage", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        toAccountID: accountID,
        subject: utils.base64Encode(subject),
        body: utils.base64Encode(utils.xor(body, constants.KEYS.MESSAGES)),
    }, function(data) {
        if (data == -1) throw new Error(-1)
        callback(data)
    }, instance, params, options, secret)
}
export function deleteMessage(id, isSender, instance, params, callback, options, secret) {
    genericRequest("deleteMessage", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        messageID: id,
        isSender: Number(!!isSender)
    }, function(data) {
        if (data == -1) throw new Error(-1)
        callback(data)
    }, instance, params, options, secret)
}
export function blockUser(accountID, instance, params, callback, options, secret) {
    genericRequest("blockUser", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        targetAccountID: accountID
    }, function(data) {
        if (data == -1) throw new Error(-1)
        callback(data)
    }, instance, params, options, secret)
}
export function unblockUser(accountID, instance, params, callback, options, secret) {
    genericRequest("unblockUser", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        targetAccountID: accountID
    }, function(data) {
        if (data == -1) throw new Error(-1)
        callback(data)
    }, instance, params, options, secret)
}
export function deleteFriendRequests(accountIDs, isSender, instance, params, callback, options, secret) {
    genericRequest("deleteFriendRequests", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        targetAccountID: (typeof accountIDs == "number" ? accountIDs : 0),
        accounts: (typeof accountIDs == "number" ? undefined : accountIDs.join(",")),
        isSender: Number(!!isSender)
    }, function(data) {
        if (data == -1) throw new Error(-1)
        callback(data)
    }, instance, params, options, secret)
}
export function sendFriendRequest(accountID, comment, instance, params, callback, options, secret) {
    genericRequest("sendFriendRequest", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        toAccountID: accountID,
        comment: utils.base64Encode(comment)
    }, function(data) {
        if (data == -1) throw new Error(-1)
        callback(data)
    }, instance, params, options, secret)
}
export function getFriendRequests(page, type, instance, params, callback, options, secret) {
    genericRequest("getFriendRequests", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        page,
        getSent: type,
        total: 0
    }, function(data) {
        if (data == -1) throw new Error(-1)
        let segments = data.split("#")
        let friendRequests = segments[0].split("|").map(m => utils.parseUser(m))
        let pages = segments[1].split(":")
        callback({
            friendRequests,
            total: Number(pages[0]),
            offset: Number(pages[1]),
            pageSize: Number(pages[2])
        })
    }, instance, params, options, secret)
}
export function readFriendRequest(requestID, instance, params, callback, options, secret) {
    genericRequest("readFriendRequest", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        requestID
    }, function(data) {
        if (data == -1) throw new Error(-1)
        callback(data)
    }, instance, params, options, secret)
}
export function acceptFriendRequest(requestID, targetAccountID, instance, params, callback, options, secret) {
    genericRequest("acceptFriendRequest", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        requestID,
        targetAccountID
    }, function(data) {
        if (data == -1) throw new Error(-1)
        callback(data)
    }, instance, params, options, secret)
}
export function removeFriend(targetAccountID, instance, params, callback, options, secret) {
    genericRequest("removeFriend", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        targetAccountID
    }, function(data) {
        if (data == -1) throw new Error(-1)
        callback(data)
    }, instance, params, options, secret)
}