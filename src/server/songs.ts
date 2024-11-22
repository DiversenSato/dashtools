import { genericRequest, contentRequest, GenericRequestOptions, ContentRequestOptions } from "./generic.js";
import * as utils from "../utils.js";
import { GDClient } from "../index.js";
import { AxiosRequestConfig } from "axios";

export function getSongInfo(songID: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (song: utils.Song) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("getSongInfo", { songID }, function (data) {
        if (data == "-1") throw new Error("Song not found");
        const d = utils.parseSongs(data);
        callback(d[songID] || d);
    }, instance, params, options, secret);
}

export interface ArtisResult {
    artists: utils.Artist[];
    total: number;
    offset: number;
    pageSize: number;
}

export function getTopArtists(page: number, instance: GDClient, params: GenericRequestOptions = {}, callback: (data: ArtisResult) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("getTopArtists", { page }, function (d) {
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
export function getContentURL(instance: GDClient, params: GenericRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig, secret?: string) {
    genericRequest("getContentURL", {}, function (data) {
        callback(data);
    }, instance, params, options, secret);
}
export function getMusicLibraryVersion(instance: GDClient, params: ContentRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig) {
    contentRequest("musicLibraryVersion", {}, function (data) {
        callback(data);
    }, instance, params, options);
}
export function getOldMusicLibraryVersion(instance: GDClient, params: ContentRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig) {
    contentRequest("musicLibraryVersionOld", {}, function (data) {
        callback(data);
    }, instance, params, options);
}
export function getSFXLibraryVersion(instance: GDClient, params: ContentRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig) {
    contentRequest("sfxLibraryVersion", {}, function (data) {
        callback(data);
    }, instance, params, options);
}
export function getMusicLibrary(instance: GDClient, params: ContentRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig) {
    contentRequest("musicLibrary", {}, function (data) {
        callback(data);
    }, instance, params, options);
}
export function getOldMusicLibrary(instance: GDClient, params: ContentRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig) {
    contentRequest("musicLibraryOld", {}, function (data) {
        callback(data);
    }, instance, params, options);
}
export function downloadLibrarySong(id: number, instance: GDClient, callback: (data: string) => void, params: ContentRequestOptions = {}, options?: AxiosRequestConfig) {
    contentRequest(`music/${id}.ogg`, {}, function (data) {
        callback(data);
    }, instance, params, { responseType: "arraybuffer", ...options });
}
export function downloadSoundEffect(id: number, instance: GDClient, callback: (data: string) => void, params: ContentRequestOptions = {}, options?: AxiosRequestConfig) {
    contentRequest(`sfx/s${id}.ogg`, {}, function (data) {
        callback(data);
    }, instance, params, { responseType: "arraybuffer", ...options });
}
export function getSFXLibrary(instance: GDClient, params: ContentRequestOptions = {}, callback: (data: string) => void, options?: AxiosRequestConfig) {
    contentRequest("sfxLibrary", {}, function (data) {
        callback(data);
    }, instance, params, options);
}