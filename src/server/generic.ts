import * as axios from "axios";
import * as constants from "../constants.js";
import * as utils from "../utils.js";
import { GDClient } from "../index.js";

export interface GenericRequestOptions {
    levelID?: number;
    increment?: number;
    gameVersion?: number;
    binaryVersion?: number;
    gdw?: number;
    accountID?: number;
    gjp2?: string;
    weekly?: number;
}

export function genericRequest<T = string>(endpoint: string, paramsInternal: Record<string, string | number> = {}, callbackInternal: (data: T) => void, instance: GDClient, params: GenericRequestOptions, options?: axios.AxiosRequestConfig, secret?: string) {
    const requestData = {
        secret: secret || constants.SECRETS.COMMON,
        ...paramsInternal,
        ...params,
    };
    if (!constants.VERSIONLESS_ENDPOINTS.includes(endpoint)) {
        requestData.gameVersion = instance.versions.gameVersion;
        requestData.binaryVersion = instance.versions.binaryVersion;
    }
    // if (instance.gdWorld) requestData.gdw = 1;
    // else if (requestData.gameVersion == 21) requestData.gdw = 0;
    requestData.gdw = 0;

    const hostElem = instance.server.replace("https://", "").replace("http://", "").split("/")[0];

    // console.log(opts)
    axios.default.post<T>(`${instance.server}/${instance.endpoints[endpoint]}`, requestData, {
        headers: {
            ...instance.headers,
            Host: hostElem,
        },
        ...options,
    }).then(data => {
        // if (data.data < 0) throw new Error(data.data) 
        callbackInternal(data.data);
    }).catch(e => {
        throw e;
    });
}

export interface AccountRequestOptions {
    gameVersion?: number;
    binaryVersion?: number;
    gdw?: number;
}

export function accountRequest<T = string>(endpoint: string, paramsInternal: Record<string, string | number> = {}, callbackInternal: (data: T) => void, instance: GDClient, params?: AccountRequestOptions, options?: axios.AxiosRequestConfig, secret?: string) {
    const opts = {
        secret: secret || constants.SECRETS.COMMON,
        ...paramsInternal,
        ...params,
    };
    if (!constants.VERSIONLESS_ENDPOINTS.includes(endpoint)) {
        opts.gameVersion = instance.versions.gameVersion;
        opts.binaryVersion = instance.versions.binaryVersion;
    }
    // if (instance.gdWorld) requestData.gdw = 1;
    // else if (requestData.gameVersion == 21) requestData.gdw = 0;
    opts.gdw = 0;

    const hostElem = instance.accountServer.replace("https://", "").replace("http://", "").split("/")[0];

    // console.log(opts)
    axios.default.post<T>(`${instance.accountServer}/${instance.endpoints[endpoint]}`, opts, {
        headers: {
            ...instance.headers,
            Host: hostElem
        },
        ...options
    }).then(data => {
        // if (data.data < 0) throw new Error(data.data) 
        callbackInternal(data.data);
    }).catch(e => {
        throw e;
    });
}

export interface ContentRequestOptions {
    gameVersion?: number;
    binaryVersion?: number;
    gdw?: number;
}

export function contentRequest<T = string>(endpoint: string, paramsInternal = {}, callbackInternal: (data: T) => void, instance: GDClient, params?: Omit<ContentRequestOptions, "secret">, options?: axios.AxiosRequestConfig) {
    const expires = Math.floor(Date.now() / 1000) + 3600;
    const opts = {
        expires,
        token: utils.generateCDNToken("/" + endpoint.replace(/$\//, ""), expires),
        ...paramsInternal,
        ...params
    };
    const hostElem = instance.contentServer.replace("https://", "").replace("http://", "").split("/")[0];
    let path = instance.endpoints[endpoint];
    if (!path) path = endpoint;

    // console.log(opts)
    axios.default.get<T>(`${instance.contentServer}/${path}`, {
        headers: {
            "User-Agent": "",
            Host: hostElem
        },
        params: opts,
        ...options
    }).then(res => {
        callbackInternal(res.data);
    }).catch(e => {
        throw e;
    });
}