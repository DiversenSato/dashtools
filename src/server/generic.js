import * as axios from "axios"
import * as constants from "../constants.js"
import * as utils from "../utils.js"

export function genericRequest(endpoint, paramsInternal, callbackInternal, instance, params, options, secret) {
    let opts = {
        secret: secret || constants.SECRETS.COMMON
    }
    if (!constants.VERSIONLESS_ENDPOINTS.includes(endpoint)) {
        opts.gameVersion = instance.versions.gameVersion
        opts.binaryVersion = instance.versions.binaryVersion
    }
    if (instance.gdWorld) opts.gdw = 1
    else if (opts.gameVersion == 21) opts.gdw = 0
    opts = {
        ...opts,
        ...paramsInternal,
        ...params
    }
    let hostElem = instance.server.replace("https://", "").replace("http://", "").split("/")[0]

    // console.log(opts)
    axios.default.post(`${instance.server}/${instance.endpoints[endpoint]}`, opts, {
        headers: {
            ...instance.headers,
            Host: hostElem
        },
        ...options
    }).then(data => {
        // if (data.data < 0) throw new Error(data.data) 
        callbackInternal(data.data)
    }).catch(e => {
        throw e
    })
}
export function accountRequest(endpoint, paramsInternal, callbackInternal, instance, params, options, secret) {
    let opts = {
        secret: secret || constants.SECRETS.COMMON
    }
    if (!constants.VERSIONLESS_ENDPOINTS.includes(endpoint)) {
        opts.gameVersion = instance.versions.gameVersion
        opts.binaryVersion = instance.versions.binaryVersion
    }
    if (instance.gdWorld) opts.gdw = 1
    else if (opts.gameVersion == 21) opts.gdw = 0
    opts = {
        ...opts,
        ...paramsInternal,
        ...params
    }
    let hostElem = instance.accountServer.replace("https://", "").replace("http://", "").split("/")[0]

    // console.log(opts)
    axios.default.post(`${instance.accountServer}/${instance.endpoints[endpoint]}`, opts, {
        headers: {
            ...instance.headers,
            Host: hostElem
        },
        ...options
    }).then(data => {
        // if (data.data < 0) throw new Error(data.data) 
        callbackInternal(data.data)
    }).catch(e => {
        throw e
    })
}
export function contentRequest(endpoint, paramsInternal, callbackInternal, instance, params, options) {
    let expires = Math.floor(Date.now() / 1000) + 3600
    let opts = {
        expires,
        token: utils.generateCDNToken("/" + endpoint.replace(/$\//, ""), expires),
        ...paramsInternal,
        ...params
    }
    let hostElem = instance.contentServer.replace("https://", "").replace("http://", "").split("/")[0]
    let path = instance.endpoints[endpoint]
    if (!path) path = endpoint

    // console.log(opts)
    axios.default.get(`${instance.contentServer}/${path}`, {
        headers: {
            "User-Agent": "",
            Host: hostElem
        },
        params: opts,
        ...options
    }).then(data => {
        callbackInternal(data.data)
    }).catch(e => {
        throw e
    })
}