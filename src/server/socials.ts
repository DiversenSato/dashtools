import { genericRequest, GenericRequestOptions } from "./generic.js";
import * as constants from "../constants.js";
import * as utils from "../utils.js";
import { GDClient } from "../index.js";
import { AxiosRequestConfig } from "axios";

export function getUserList(type: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: utils.User[]) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("getUserList", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        type,
    }, function(data) {
        if (data == "-1") throw new Error("-1");
        callback(data.split("|").map(e => utils.parseUser(e)));
    }, instance, params, options, secret);
}

export interface GetMessagesResult {
    messages: utils.Message[];
    total: number;
    offset: number;
    pageSize: number;
}

export function getMessages(page: number, type: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: GetMessagesResult) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("getMessages", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        page,
        getSent: type,
        total: 0,
    }, function(data) {
        if (data == "-1") throw new Error("-1");
        const segments = data.split("#");
        const messages = segments[0].split("|").map(m => utils.parseMessage(m));
        const pages = segments[1].split(":");
        callback({
            messages,
            total: Number(pages[0]),
            offset: Number(pages[1]),
            pageSize: Number(pages[2])
        });
    }, instance, params, options, secret);
}

export function readMessage(messageID: number, isSender: boolean, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: utils.Message) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("readMessage", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        messageID,
        isSender: Number(!!isSender)
    }, function(data) {
        if (data == "-1") throw new Error("-1");
        callback(utils.parseMessage(data));
    }, instance, params, options, secret);
}

export function sendMessage(accountID: number, subject: string, body: string, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("sendMessage", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        toAccountID: accountID,
        subject: utils.base64Encode(subject),
        body: utils.base64Encode(utils.xor(body, constants.KEYS.MESSAGES)),
    }, function(data) {
        if (data == "-1") throw new Error("-1");
        callback(data);
    }, instance, params, options, secret);
}
export function deleteMessage(id: number, isSender: boolean, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("deleteMessage", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        messageID: id,
        isSender: Number(!!isSender)
    }, function(data) {
        if (data == "-1") throw new Error("-1");
        callback(data);
    }, instance, params, options, secret);
}
export function blockUser(accountID: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("blockUser", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        targetAccountID: accountID
    }, function(data) {
        if (data == "-1") throw new Error("-1");
        callback(data);
    }, instance, params, options, secret);
}
export function unblockUser(accountID: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("unblockUser", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        targetAccountID: accountID
    }, function(data) {
        if (data == "-1") throw new Error("-1");
        callback(data);
    }, instance, params, options, secret);
}
export function deleteFriendRequests(accountIDs: number | number[], isSender: boolean, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("deleteFriendRequests", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        targetAccountID: (typeof accountIDs == "number" ? accountIDs : 0),
        ...(Array.isArray(accountIDs) ? { accounts: accountIDs.join(",") } : {}),
        isSender: Number(!!isSender)
    }, function(data) {
        if (data == "-1") throw new Error("-1");
        callback(data);
    }, instance, params, options, secret);
}
export function sendFriendRequest(accountID: number, comment: string, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("sendFriendRequest", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        toAccountID: accountID,
        comment: utils.base64Encode(comment)
    }, function(data) {
        if (data == "-1") throw new Error("-1");
        callback(data);
    }, instance, params, options, secret);
}

export interface GetFriendRequestsResponse {
    friendRequests: utils.User[];
    total: number;
    offset: number;
    pageSize: number;
}

export function getFriendRequests(page: number, type: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: GetFriendRequestsResponse) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("getFriendRequests", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        page,
        getSent: type,
        total: 0
    }, function(data) {
        if (data == "-1") throw new Error("-1");
        const segments = data.split("#");
        const friendRequests = segments[0].split("|").map(m => utils.parseUser(m));
        const pages = segments[1].split(":");
        callback({
            friendRequests,
            total: Number(pages[0]),
            offset: Number(pages[1]),
            pageSize: Number(pages[2])
        });
    }, instance, params, options, secret);
}
export function readFriendRequest(requestID: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("readFriendRequest", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        requestID
    }, function(data) {
        if (data == "-1") throw new Error("-1");
        callback(data);
    }, instance, params, options, secret);
}
export function acceptFriendRequest(requestID: number, targetAccountID: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("acceptFriendRequest", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        requestID,
        targetAccountID
    }, function(data) {
        if (data == "-1") throw new Error("-1");
        callback(data);
    }, instance, params, options, secret);
}
export function removeFriend(targetAccountID: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("removeFriend", {
        accountID: instance.account.accountID,
        gjp2: utils.gjp2(instance.account.password),
        targetAccountID
    }, function(data) {
        if (data == "-1") throw new Error("-1");
        callback(data);
    }, instance, params, options, secret);
}