import { genericRequest, contentRequest } from "./generic.js";
import * as constants from "../constants.js";
import * as utils from "../utils.js";

export function getSongInfo(songID, instance, params, callback, options, secret) {
    genericRequest("getSongInfo", {songID}, function(data) {
        if (data == -1) throw new Error("Song not found");
        const d = utils.parseSongs(data);
        callback(d[songID] || d);
    }, instance, params, options, secret);
}
export function getTopArtists(page, instance, params, callback, options, secret) {
    genericRequest("getTopArtists", {page}, function(d) {
        const data = d.split("#");
        const artists = utils.parseArtists(data[0]);
        const pageInfo = data[1].split(":");
        callback({
            artists,
            total: Number(pageInfo[0]),
            offset: Number(pageInfo[1]),
            pageSize: Number(pageInfo[2])
        });
    }, instance, params, options, secret);
}
export function getContentURL(instance, params, callback, options, secret) {
    genericRequest("getContentURL", {}, function(data) {
        callback(data);
    }, instance, params, options, secret);
}
export function getMusicLibraryVersion(instance, params, callback, options) {
    contentRequest("musicLibraryVersion", {}, function(data) {
        callback(data);
    }, instance, params, options);
}
export function getOldMusicLibraryVersion(instance, params, callback, options) {
    contentRequest("musicLibraryVersionOld", {}, function(data) {
        callback(data);
    }, instance, params, options);
}
export function getSFXLibraryVersion(instance, params, callback, options) {
    contentRequest("sfxLibraryVersion", {}, function(data) {
        callback(data);
    }, instance, params, options);
}
export function getMusicLibrary(instance, params, callback, options) {
    contentRequest("musicLibrary", {}, function(data) {
        callback(data);
    }, instance, params, options);
}
export function getOldMusicLibrary(instance, params, callback, options) {
    contentRequest("musicLibraryOld", {}, function(data) {
        callback(data);
    }, instance, params, options);
}
export function downloadLibrarySong(id, instance, params, callback, options) {
    contentRequest(`music/${id}.ogg`, {}, function(data) {
        callback(data);
    }, instance, params, {responseType: "arraybuffer", ...options});
}
export function downloadSoundEffect(id, instance, params, callback, options) {
    contentRequest(`sfx/s${id}.ogg`, {}, function(data) {
        callback(data);
    }, instance, params, {responseType: "arraybuffer", ...options});
}
export function getSFXLibrary(instance, params, callback, options) {
    contentRequest("sfxLibrary", {}, function(data) {
        callback(data);
    }, instance, params, options);
}