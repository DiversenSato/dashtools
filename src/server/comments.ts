import { genericRequest, GenericRequestOptions } from "./generic.js";
import * as constants from "../constants.js";
import * as utils from "../utils.js";
import { GDClient } from "../index.js";
import { AxiosRequestConfig } from "axios";

export interface CommentResult {
    comments: utils.Comment[];
    total: number;
    offset: number;
    pageSize: number;
}

export function getLevelComments(levelID: number, count: number, mode: number, page: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: CommentResult) => void, options?: AxiosRequestConfig) {
    genericRequest("getComments", { levelID, count, mode, page }, function (data) {
        if (Number(data) < 0) {
            callback({
                comments: [],
                total: 0,
                offset: 0,
                pageSize: 0
            });
        } else {
            const segments = data.split("#");
            const comments = segments[0].split("|").map(u => utils.parseComment(u));
            const pages = segments[1].split(":");
            callback({
                comments,
                total: Number(pages[0]),
                offset: Number(pages[1]),
                pageSize: Number(pages[2]),
            });
        }
    }, instance, params, options);
}
export function getCommentHistory(playerID: number, count: number, mode: number, page: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: CommentResult) => void, options?: AxiosRequestConfig) {
    genericRequest("getCommentHistory", { userID: playerID, count, mode, page }, function (data) {
        const segments = data.split("#");
        const comments = segments[0].split("|").map(u => utils.parseComment(u));
        const pages = segments[1].split(":");
        console.log(data);
        callback({
            comments,
            total: Number(pages[0]),
            offset: Number(pages[1]),
            pageSize: Number(pages[2]),
        });
    }, instance, params, options);
}
export function uploadProfilePost(content: string, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig) {
    genericRequest("uploadAccountComment", {
        comment: utils.base64Encode(content),
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        cType: 1,
        ...(instance.account.username ? {
            userName: instance.account.username,
            chk: utils.chk([instance.account.username, utils.base64Encode(content), 0, 0, 1], constants.KEYS.COMMENT, constants.SALTS.COMMENT),
        } : {}),
    }, function (data) {
        callback(data);
    }, instance, params, options);
}
export function deleteProfilePost(id: number, accountID: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string | true) => void, options?: AxiosRequestConfig) {
    genericRequest("deleteAccountComment", {
        commentID: id,
        targetAccountID: (accountID || instance.account.accountID),
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password)
    }, function (data) {
        if (data == "1") {
            callback(true);
        } else {
            callback(data);
        }
    }, instance, params, options);
}
export function uploadComment(levelID: number, content: string, percentage: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string | true) => void, options?: AxiosRequestConfig) {
    if (!instance.account.username) throw new Error("Must specify account username");
    const chk = utils.chk([instance.account.username, utils.base64Encode(content), levelID, percentage, 0], constants.KEYS.COMMENT, constants.SALTS.COMMENT);
    genericRequest("uploadComment", {
        levelID,
        comment: utils.base64Encode(content),
        percent: Number(percentage),
        gjp2: utils.gjp2(instance.account.password),
        accountID: instance.account.accountID,
        chk,
        userName: instance.account.username
    }, function (data) {
        callback(data);
    }, instance, params, options);
}

export function deleteComment(levelID: number, commentID: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string | true) => void, options?: AxiosRequestConfig) {
    genericRequest("deleteComment", {
        levelID,
        commentID,
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password)
    }, function (data) {
        if (data == "1") {
            callback(true);
        } else {
            callback(data);
        }
    }, instance, params, options);
}