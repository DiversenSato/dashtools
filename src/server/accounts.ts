import { genericRequest, accountRequest } from "./generic.js"
import * as constants from "../constants.js"
import * as utils from "../utils.js"

export function registerAccount(username, email, password, instance, params, callback, options, secret) {
    genericRequest("registerAccount", {userName: username, email, password}, function(data) {
        switch (data) {
            case 1:
                callback(true)
                break
            case -1:
                throw new Error("-1")
            case -2:
                throw new Error("Username is taken")
            case -3:
                throw new Error("Email is taken")
            case -4:
                throw new Error("Username is too long")
            case -5:
                throw new Error("Invalid password")
            case -6:
                throw new Error("Invalid email")
            case -8:
                throw new Error("Username is too short")
            case -9:
                throw new Error("Password is too short")
            default:
                throw new Error(data)
        }
    }, instance, params, options, secret || constants.SECRETS.ACCOUNT)
}
export function loginAccount(username, password, instance, params, callback, options, secret) {
    genericRequest("loginAccount", {userName: username, password, udid: instance.account.udid}, function(data) {
        if (data < 0) {
            switch (data) {
                case -1:
                    throw new Error("-1")
                case -8:
                    throw new Error("Username is too short")
                case -9:
                    throw new Error("Password is too short")
                case -11:
                    throw new Error("Login or password is incorrect")
                case -12:
                    throw new Error("Account is disabled")   
                default:
                    throw new Error(data)
            }
        } else {
            callback({
                accountID: Number(data.split(",")[0]),
                playerID: Number(data.split(",")[1])
            })
        }
    }, instance, params, options, secret || constants.SECRETS.ACCOUNT)
}
export function requestModAccess(instance, params, callback, options, secret) {
    genericRequest("requestModAccess", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password)
    }, function(data) {
        if (data == -1) callback(false)
        else callback(data)
    }, instance, params, options, secret || constants.SECRETS.ACCOUNT)
}
export function loadSaveData(instance, params, callback, options, secret) {
    if (!instance.account) throw new Error("You must authenticate in order to load your save data")
    accountRequest("loadSaveData", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        uuid: instance.account.playerID,
        udid: instance.account.udid
    }, function(data) {
        const elements = data.split(";")
        const ratedLevels = utils.robTopSplitDict(utils.tryUnzip(utils.base64DecodeBuffer(elements[4].slice(20, elements[4].length - 20))), ",")
        for (const i of Object.keys(ratedLevels)) {
            ratedLevels[i] = Number(ratedLevels[i])
        }
        const mappacks = elements[5]
        callback({
            gameManager: elements[0],
            localLevels: elements[1],
            gameVersion: Number(elements[2]),
            binaryVersion: Number(elements[3]),
            ratedLevels,
            mappacks: utils.tryUnzip(utils.base64DecodeBuffer(mappacks.slice(20, mappacks.length - 20))).split("|").map(m => utils.parseMapPack(m))
        })
    }, instance, params, options, secret || constants.SECRETS.ACCOUNT)
}
export function backupSaveData(gameManager, localLevels, instance, params, callback, options, secret) {
    if (!instance.account) throw new Error("You must authenticate in order to backup save data")
    accountRequest("backupSaveData", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        uuid: instance.account.playerID,
        udid: instance.account.udid,
        saveData: `${gameManager};${localLevels}`
    }, function(data) {
        if (data < 0) throw new Error(data)
        callback(data)
    }, instance, params, options, secret || constants.SECRETS.ACCOUNT)
}
export function getAccountURL(type, instance, params, callback, options, secret) {
    genericRequest("getAccountURL", {
        accountID: (instance.account && instance.account.accountID ? instance.account.accountID : 71), // any valid account ID works, so RobTop's account ID is used as a placeholder
        type
    }, function(data) {
        if (data == -1) callback(false)
        else callback(data)
    }, instance, params, options, secret || constants.SECRETS.ACCOUNT)
}