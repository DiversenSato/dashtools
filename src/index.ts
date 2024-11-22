import * as c from "./constants.js";
import * as accounts from "./server/accounts.js";
import * as comments from "./server/comments.js";
import * as levels from "./server/levels.js";
import * as lists from "./server/lists.js";
import * as likes from "./server/like.js";
import * as users from "./server/users.js";
import * as songs from "./server/songs.js";
import * as socials from "./server/socials.js";
import * as u from "./utils.js";
import * as rewards from "./server/rewards.js";
import * as scores from "./server/leaderboards.js";
import { GenericRequestOptions } from "./server/generic.js";
import { AxiosRequestConfig } from "axios";

export const constants = c;

export class GDAccount {
    playerID: number;
    accountID: number;
    password: string;
    udid: string;
    uuid: string | number;
    username: string;
    constructor(playerID?: number, accountID?: number, password?: string, username?: string, udid?: string) {
        const digits = "1234567890".split("");

        this.playerID = playerID || 0;
        this.accountID = accountID || 0;
        this.password = password || "";
        this.udid = udid || `S15${utils.rs(25, digits)}1000`;
        this.uuid = playerID || utils.generateRandomUUID();
        this.username = username || "Player";
    }
}

interface Versions {
    gameVersion: number;
    binaryVersion: number;
}

export class GDClient {
    server: string;
    accountServer: string;
    contentServer: string;
    endpoints: Record<string, string>;
    headers: object;
    versions: Versions;
    account: GDAccount;
    constructor(account?: GDAccount, server?: string, endpoints?: Record<string, string>, versions?: Versions, headers?: object, accountServer?: string, contentServer?: string) {
        this.server = server ? server.replace(/\/$/, "") : c.DEFAULT_SERVER;
        this.accountServer = accountServer ? accountServer.replace(/\/$/, "") : this.server;
        this.contentServer = contentServer ? contentServer.replace(/\/$/, "") : this.server;
        if (this.accountServer == c.DEFAULT_SERVER) this.accountServer = c.DEFAULT_ACCOUNT_URL;
        if (this.contentServer == c.DEFAULT_SERVER) this.contentServer = c.DEFAULT_CONTENT_URL;
        this.endpoints = endpoints || c.DEFAULT_ENDPOINTS;
        this.headers = headers || c.DEFAULT_HEADERS_22;
        this.versions = versions || c.VERSIONS;
        this.account = account || new GDAccount();
    }
    likeItem(itemID: number, special: number, type: likes.ContentType, like: 0 | 1, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        likes.likeItem(itemID, special, type, like, this, params, callback, options);
    }
    likeLevel(levelID: number, like: boolean, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        likes.likeItem(levelID, 0, 1, like ? 1 : 0, this, params, callback, options);
    }
    likeComment(commentID: number, levelID: number, like: boolean, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        likes.likeItem(commentID, levelID, 2, like ? 1 : 0, this, params, callback, options);
    }
    likeAccountPost(postID: number, accountID: number, like: boolean, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        likes.likeItem(postID, accountID, 3, like ? 1 : 0, this, params, callback, options);
    }
    likeList(listID: number, like: boolean, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        likes.likeItem(listID, 0, 4, like ? 1 : 0, this, params, callback, options);
    }
    rateLevel(levelID: number, stars: number, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.rateLevel(levelID, stars, this, params, callback, options);
    }
    rateDemon(levelID: number, rating: number, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.rateDemon(levelID, rating, this, params, callback, options);
    }
    getLevelComments(levelID: number, count: number, mode: number, page: number, callback: (data: comments.CommentResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        comments.getLevelComments(levelID, count, mode, page, this, params, callback, options);
    }
    getCommentHistory(playerID: number, count: number, mode: number, page: number, callback: (data: comments.CommentResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        comments.getCommentHistory(playerID, count, mode, page, this, params, callback, options);
    }
    uploadComment(levelID: number, content: string, percentage: number, callback: (data: string | true) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        comments.uploadComment(levelID, content, percentage, this, params, callback, options);
    }
    deleteComment(levelID: number, commentID: number, callback: (data: string | true) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        comments.deleteComment(levelID, commentID, this, params, callback, options);
    }
    // getProfilePosts(accountID: number, page: number, total: number, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
    //     comments.getProfilePosts(accountID, page, total, this, params, callback, options);
    // }
    uploadProfilePost(content: string, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        comments.uploadProfilePost(content, this, params, callback, options);
    }
    deleteProfilePost(id: number, accountID: number, callback: (data: string | true) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        comments.deleteProfilePost(id, accountID, this, params, callback, options);
    }
    getLevels(opts: levels.GetLevelsOptions, callback: () => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels(opts, this, params, callback, options);
    }
    getLevelLists(opts: lists.GetLevelListsOptions, callback: (data: lists.GetLevelListsResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        lists.getLevelLists(opts, this, params, callback, options);
    }
    getMostDownloadedLevels(opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({ type: 1, ...opts }, this, params, callback, options);
    }
    getMostDownloadedLevelLists(opts: lists.GetLevelListsOptions, callback: (data: lists.GetLevelListsResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        lists.getLevelLists({ type: 1, ...opts }, this, params, callback, options);
    }
    getMostLikedLevels(opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({ type: 2, ...opts }, this, params, callback, options);
    }
    getMostLikedLevelLists(opts: lists.GetLevelListsOptions, callback: (data: lists.GetLevelListsResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        lists.getLevelLists({ type: 2, ...opts }, this, params, callback, options);
    }
    getTrendingLevels(opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({ type: 3, ...opts }, this, params, callback, options);
    }
    getTrendingLevelLists(opts: lists.GetLevelListsOptions, callback: (data: lists.GetLevelListsResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        lists.getLevelLists({ type: 3, ...opts }, this, params, callback, options);
    }
    getRecentLevels(opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({ type: 4, ...opts }, this, params, callback, options);
    }
    getRecentLevelLists(opts: lists.GetLevelListsOptions, callback: (data: lists.GetLevelListsResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        lists.getLevelLists({ type: 4, ...opts }, this, params, callback, options);
    }
    getFeaturedLevels(opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({ type: 6, ...opts }, this, params, callback, options);
    }
    getTopLevelLists(opts: lists.GetLevelListsOptions, callback: (data: lists.GetLevelListsResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        lists.getLevelLists({ type: 6, ...opts }, this, params, callback, options);
    }
    getMagicLevels(opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({ type: 7, ...opts }, this, params, callback, options);
    }
    getMagicLevelLists(opts: lists.GetLevelListsOptions, callback: (data: lists.GetLevelListsResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        lists.getLevelLists({ type: 7, ...opts }, this, params, callback, options);
    }
    getSentLevelsOld(opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({ type: 8, ...opts }, this, params, callback, options);
    }
    getAwardedLevels(opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({ type: 11, ...opts }, this, params, callback, options);
    }
    getAwardedLevelLists(callback: (data: lists.GetLevelListsResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        lists.getLevelLists({ type: 11 }, this, params, callback, options);
    }
    getFriendLevels(opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({ type: 13, ...opts }, this, params, callback, options);
    }
    getFriendLevelLists(opts: lists.GetLevelListsOptions, callback: (data: lists.GetLevelListsResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        lists.getLevelLists({ type: 13, ...opts }, this, params, callback, options);
    }
    getMostLikedWorldLevels(opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({ type: 15, ...opts }, this, params, callback, options);
    }
    getHallOfFameLevels(opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({ type: 16, ...opts }, this, params, callback, options);
    }
    getFeaturedWorldLevels(opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({ type: 17, ...opts }, this, params, callback, options);
    }
    getOldDailyLevels(opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({ type: 21, ...opts }, this, params, callback, options);
    }
    getOldWeeklyLevels(opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({ type: 22, ...opts }, this, params, callback, options);
    }
    getLevelsFromList(listID: number, opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({ type: 25, listID, ...opts }, this, params, callback, options);
    }
    getSentLevels(opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({ type: 27, ...opts }, this, params, callback, options);
    }
    getSentLevelLists(callback: (data: lists.GetLevelListsResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        lists.getLevelLists({ type: 27 }, this, params, callback, options);
    }
    getDailyLevel(callback: (data: levels.GetDailyLevelResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getDailyLevel(this, params, callback, options);
    }
    getWeeklyLevel(callback: (data: levels.GetDailyLevelResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getDailyLevel(this, { weekly: 1, ...params }, callback, options);
    }
    reportLevel(levelID: number, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.reportLevel(levelID, this, params, callback, options);
    }
    searchLevels(query: string, opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({
            type: 0,
            query,
            ...opts
        }, this, params, callback, options);
    }
    searchLevelLists(query: string, opts: lists.GetLevelListsOptions, callback: (data: lists.GetLevelListsResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        lists.getLevelLists({ type: 0, query, ...opts }, this, params, callback, options);
    }
    getRatedLevelsByID(levelIDs: number[], opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({
            type: 10,
            levelIDs,
            ...opts
        }, this, params, callback, options);
    }
    getLevelsByAccountIDs(accountIDs: number[], opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({
            type: 12,
            accountIDs,
            ...opts
        }, this, params, callback, options);
    }
    getLevelListsByAccountIDs(accountIDs: string[], opts: lists.GetLevelListsOptions, callback: (data: lists.GetLevelListsResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        lists.getLevelLists({ type: 12, accountIDs, ...opts }, this, params, callback, options);
    }
    getLevelsByPlayerID(playerID: number, opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({
            type: 5,
            playerID,
            ...opts
        }, this, params, callback, options);
    }
    getLevelListsByAccountID(accountID: number, opts: lists.GetLevelListsOptions, callback: (data: lists.GetLevelListsResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        lists.getLevelLists({ type: 5, accountID, ...opts }, this, params, callback, options);
    }
    getLevelsByID(levelIDs: number[], opts: levels.GetLevelsOptions, callback: (data: levels.GetLevelsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getLevels({
            type: 19,
            levelIDs,
            ...opts
        }, this, params, callback, options);
    }
    getMapPacks(page: number, callback: (data: levels.GetMapPacksResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getMapPacks(this, { page, ...params }, callback, options);
    }
    getGauntlets(callback: (data: levels.GetGauntlesResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.getGauntlets(this, { ...params }, callback, options);
    }
    downloadLevel(id: number, callback: (data: levels.DownloadLevelResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.downloadLevel(id, this, { ...params }, callback, options);
    }
    downloadDailyLevel(callback: (data: levels.DownloadLevelResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.downloadLevel(-1, this, { ...params }, callback, options);
    }
    downloadWeeklyLevel(callback: (data: levels.DownloadLevelResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.downloadLevel(-2, this, { ...params }, callback, options);
    }
    downloadEventLevel(callback: (data: levels.DownloadLevelResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.downloadLevel(-3, this, { ...params }, callback, options);
    }
    getSongInfo(songID: number, callback: (data: u.Song) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        songs.getSongInfo(songID, this, params, callback, options);
    }
    getTopArtists(page: number, callback: (data: songs.ArtisResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        songs.getTopArtists(page, this, params, callback, options);
    }
    searchUsers(query: string, callback: () => void, params: GenericRequestOptions, options: AxiosRequestConfig) {
        users.searchUsers(query, this, params, callback, options);
    }
    getUserByAccountID(accountID: number, logout: boolean, callback: (data: u.User) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        users.getUserByAccountID(accountID, logout, this, params, callback, options);
    }
    registerAccount(username: string, email: string, password: string, callback: (isSuccess: boolean) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        accounts.registerAccount(username, email, password, this, params, callback, options);
    }
    loginAccount(username: string, password: string, callback: (data: accounts.LoginAccountResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        accounts.loginAccount(username, password, this, params, callback, options);
    }
    getGlobalStarLeaderboards(callback: (data: scores.LeaderboardResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        scores.getLeaderboards(constants.SCORES.TOP, this, params, callback, options);
    }
    getRelativeLeaderboards(accountID: number, callback: (data: scores.LeaderboardResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        scores.getLeaderboards(constants.SCORES.RELATIVE, this, {
            accountID,
            ...params
        }, callback, options);
    }
    getFriendLeaderboards(callback: (data: scores.LeaderboardResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        scores.getLeaderboards(constants.SCORES.FRIENDS, this, params, callback, options);
    }
    getGlobalCreatorLeaderboards(callback: (data: scores.LeaderboardResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        scores.getLeaderboards(constants.SCORES.CREATORS, this, params, callback, options);
    }
    /**
     * Updates your account stats.
     *
     * @param {object} opt The options
     * @param {number} opt.stars Your star count
     * @param {number} opt.moons Your moon count
     * @param {number} opt.demons Your demon count. If left out, defaults to the length of the completedDemons array
     * @param {number} opt.diamonds Your diamond count
     * @param {number} opt.secretCoins Your secret coin count
     * @param {number} opt.userCoins Your user coin count
     * @param {number} opt.iconType Your selected icon type
     * @param {number} opt.cubeID Your cube's ID
     * @param {number} opt.shipID Your ship's ID
     * @param {number} opt.ballID Your ball's ID
     * @param {number} opt.ufoID Your UFO's ID
     * @param {number} opt.waveID Your wave's ID
     * @param {number} opt.robotID Your robot's ID
     * @param {number} opt.spiderID Your spider's ID
     * @param {number} opt.swingID Your swing's ID
     * @param {number} opt.jetpackID Your jetpack's ID
     * @param {number} opt.deathEffectID Your death effect ID
     * @param {number} opt.color1 Your primary color
     * @param {number} opt.color2 Your secondary color
     * @param {number} opt.glowColor Your glow color. Will default to secondary if left out
     * @param {boolean} opt.glow Whether glow is enabled
     * @param {Array[number]} opt.completedDemons Array of all the IDs of your completed demons
     * @param {object} opt.classic Amounts of completed classic levels
     * @param {number} opt.classic.auto Amount of completed classic auto levels
     * @param {number} opt.classic.easy Amount of completed classic easy levels
     * @param {number} opt.classic.normal Amount of completed classic normal levels
     * @param {number} opt.classic.hard Amount of completed classic hard levels
     * @param {number} opt.classic.harder Amount of completed classic harder levels
     * @param {number} opt.classic.insane Amount of completed classic insane levels
     * @param {object} opt.platformer Amounts of completed platformer levels
     * @param {number} opt.platformer.auto Amount of completed platformer auto levels
     * @param {number} opt.platformer.easy Amount of completed platformer easy levels
     * @param {number} opt.platformer.normal Amount of completed platformer normal levels
     * @param {number} opt.platformer.hard Amount of completed platformer hard levels
     * @param {number} opt.platformer.harder Amount of completed platformer harder levels
     * @param {number} opt.platformer.insane Amount of completed platformer insane levels
     * @param {number} opt.completedGauntletDemons Amount of completed gauntlet demons
     * @param {number} opt.completedGauntletNonDemons Amount of completed gauntlet non-demons
     * @param {number} opt.completedDailies Amount of completed dailies
     * @param {number} opt.completedWeeklies Amount of completed weeklies
     * @param {function} callback Function callback
     * @param {object} params Extra parameters
     * @param {object} options Axios options
     * @param {string} secret The `secret` parameter (uses the correct one for the GD servers by default)
     * @returns {number}
     */
    updateUserScore(opt: users.UpdateUserOptions, callback: (data: number) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        users.updateUserScore(opt, this, params, callback, options);
    }
    getDailyChests(callback: (data: rewards.GetRewardResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        rewards.getRewards(0, this, params, callback, options);
    }
    getQuests(callback: (data: rewards.GetChallengesResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        rewards.getChallenges(this, params, callback, options);
    }
    requestModAccess(callback: (data: string | false) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        accounts.requestModAccess(this, params, callback, options);
    }
    updateDescription(levelID: number, desc: string, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.updateDescription(levelID, desc, this, params, callback, options);
    }
    uploadLevel(opts: levels.UploadLevelOptions, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.uploadLevel(opts, this, params, callback, options);
    }
    deleteLevel(levelID: number, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        levels.deleteLevel(levelID, this, params, callback, options);
    }
    getUserList(type: number, callback: (data: u.User[]) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.getUserList(type, this, params, callback, options);
    }
    getFriendsList(callback: (data: u.User[]) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.getUserList(0, this, params, callback, options);
    }
    getBlockList(callback: (data: u.User[]) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.getUserList(1, this, params, callback, options);
    }
    loadSaveData(callback: (data: accounts.SaveData) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        accounts.loadSaveData(this, params, callback, options);
    }
    backupSaveData(gameManager: string, localLevels: string, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        accounts.backupSaveData(gameManager, localLevels, this, params, callback, options);
    }
    updateAccountSettings(messagePermissions: string, friendPermissions: string, commentHistoryPermissions: string, youtube: string, twitter: string, twitch: string, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        users.updateAccountSettings(messagePermissions, friendPermissions, commentHistoryPermissions, youtube, twitter, twitch, this, params, callback, options);
    }
    getMessages(page: number, type: number, callback: (data: socials.GetMessagesResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.getMessages(page, type, this, params, callback, options);
    }
    getIncomingMessages(page: number, callback: (data: socials.GetMessagesResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.getMessages(page, 0, this, params, callback, options);
    }
    getOutgoingMessages(page: number, callback: (data: socials.GetMessagesResult) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.getMessages(page, 1, this, params, callback, options);
    }
    readMessage(id: number, isSender: boolean, callback: (data: u.Message) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.readMessage(id, isSender, this, params, callback, options);
    }
    sendMessage(accountID: number, subject: string, body: string, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.sendMessage(accountID, subject, body, this, params, callback, options);
    }
    deleteMessage(id: number, isSender: boolean, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.deleteMessage(id, isSender, this, params, callback, options);
    }
    blockUser(accountID: number, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.blockUser(accountID, this, params, callback, options);
    }
    unblockUser(accountID: number, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.unblockUser(accountID, this, params, callback, options);
    }
    getFriendRequests(page: number, type: number, callback: (data: socials.GetFriendRequestsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.getFriendRequests(page, type, this, params, callback, options);
    }
    getIncomingFriendRequests(page: number, callback: (data: socials.GetFriendRequestsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.getFriendRequests(page, 0, this, params, callback, options);
    }
    getOutgoingFriendRequests(page: number, callback: (data: socials.GetFriendRequestsResponse) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.getFriendRequests(page, 1, this, params, callback, options);
    }
    deleteFriendRequests(accountIDs: number[], isSender: boolean, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.deleteFriendRequests(accountIDs, isSender, this, params, callback, options);
    }
    sendFriendRequest(accountID: number, comment: string, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.sendFriendRequest(accountID, comment, this, params, callback, options);
    }
    readFriendRequest(requestID: number, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.readFriendRequest(requestID, this, params, callback, options);
    }
    acceptFriendRequest(targetAccountID: number, requestID: number, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.acceptFriendRequest(requestID, targetAccountID, this, params, callback, options);
    }
    removeFriend(targetAccountID: number, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        socials.removeFriend(targetAccountID, this, params, callback, options);
    }
    uploadLevelList(opts: lists.UploadLevelListOptions, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        lists.uploadLevelList(opts, this, params, callback, options);
    }
    deleteLevelList(id: number, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        lists.deleteLevelList(id, this, params, callback, options);
    }
    getAccountURL(type: number, callback: (data: string | false) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        accounts.getAccountURL(type, this, params, callback, options);
    }
    getBackupAccountURL(callback: (data: string | false) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        accounts.getAccountURL(1, this, params, callback, options);
    }
    getSyncAccountURL(callback: (data: string | false) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        accounts.getAccountURL(2, this, params, callback, options);
    }
    getLevelScores(levelID: number, type: number, opts: scores.GetLevelScoresOptions, callback: (data: (u.User & { percentage?: number })[]) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        scores.getLevelScores(levelID, type, opts, this, params, callback, options);
    }
    getPlatformerLevelScores(levelID: number, type: string, mode: number, opts: scores.GetPlatformerLevelScoresOptions, callback: (data: (u.User & { time?: number, points?: number })[]) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        scores.getPlatformerLevelScores(levelID, type, mode, opts, this, params, callback, options);
    }
    getContentURL(callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        songs.getContentURL(this, params, callback, options);
    }
    getMusicLibraryVersion(callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        songs.getMusicLibraryVersion(this, params, callback, options);
    }
    getOldMusicLibraryVersion(callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        songs.getOldMusicLibraryVersion(this, params, callback, options);
    }
    getSFXLibraryVersion(callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        songs.getSFXLibraryVersion(this, params, callback, options);
    }
    getMusicLibrary(callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        songs.getMusicLibrary(this, params, callback, options);
    }
    getOldMusicLibrary(callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        songs.getOldMusicLibrary(this, params, callback, options);
    }
    downloadLibrarySong(id: number, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        songs.downloadLibrarySong(id, this, callback ,params, options);
    }
    downloadSoundEffect(id: number, callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        songs.downloadSoundEffect(id, this, callback, params, options);
    }
    getSFXLibrary(callback: (data: string) => void, params?: GenericRequestOptions, options?: AxiosRequestConfig) {
        songs.getSFXLibrary(this, params, callback, options);
    }
}
export const utils = u;
