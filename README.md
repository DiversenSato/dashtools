# DashTools

Node.js library for interacting with Geometry Dash servers. Every single endpoint is implemented, but currently not tested very well.

This library is a work in progress. In the future it will also include tools for level string creation and save file reading/writing.

Support for versions below 2.2 is very limited at the moment. Support for GDPSes is provided, but certain GDPSes also may not work out of the box.

## How to use

Example (getting the first page of auto levels):

```js
import * as gd from "dashtools";

// Only the first 3 are required for most endpoints, however some need the username and/or UDID too
const client = new gd.GDClient(new gd.GDAccount(playerID, accountID, password, username, udid));

client.getLevels({
    difficulties: [gd.constants.DIFFICULTIES.AUTO]
}, (data) => {
    console.log(data.levels)
})
```

## Documentation

### GDAccount

This class represents a logged into GD account.

```js
new gd.GDAccount(playerID, accountID, password, username, udid);
```

All parameters can be left blank if you don't wish to log in. The `username` and `udid` fields are not required for most endpoints.

`playerID` - Your player/user ID. You can find this ID on GDBrowser.

`accountID` - Your account ID. You can find this ID on GDBrowser.

`password` - Your account password.

`username` - Your username.

`udid` - Your UDID. This can be found in your save file.

### GDClient

This class represents a GD server client.

```js
new gd.GDClient(new gd.GDAccount(playerID, accountID, password, username, udid), serverURL, );
```

### constants

This object contains all the constants.

#### DEFAULT_ENDPOINTS

Default values for every endpoint.

```js
export const DEFAULT_ENDPOINTS = {
    "getLevels": "getGJLevels21.php",
    "getDailyLevel": "getGJDailyLevel.php",
    "getMapPacks": "getGJMapPacks21.php",
    "getGauntlets": "getGJGauntlets21.php",
    "downloadLevel": "downloadGJLevel22.php",
    "reportLevel": "reportGJLevel.php",
    "getUsers": "getGJUsers20.php",
    "getUserInfo": "getGJUserInfo20.php",
    "getAccountComments": "getGJAccountComments20.php",
    "getComments": "getGJComments21.php",
    "registerAccount": "accounts/registerGJAccount.php",
    "loginAccount": "accounts/loginGJAccount.php",
    "getCommentHistory": "getGJCommentHistory.php",
    "getSongInfo": "getGJSongInfo.php",
    "updateUserScore": "updateGJUserScore22.php",
    "getRewards": "getGJRewards.php",
    "requestModAccess": "requestUserAccess.php",
    "getLeaderboards": "getGJScores20.php",
    "deleteLevel": "deleteGJLevelUser20.php",
    "uploadAccountComment": "uploadGJAccComment20.php",
    "deleteAccountComment": "deleteGJAccComment20.php",
    "uploadComment": "uploadGJComment21.php",
    "deleteComment": "deleteGJComment20.php",
    "getTopArtists": "getGJTopArtists.php",
    "getLists": "getGJLevelLists.php",
    "likeItem": "likeGJItem211.php",
    "rateLevel": "rateGJStars211.php",
    "rateDemon": "rateGJDemon21.php",
    "updateDescription": "updateGJDesc20.php",
    "uploadLevel": "uploadGJLevel21.php",
    "deleteLevel": "deleteGJLevelUser20.php",
    "getUserList": "getGJUserList20.php",
    "loadSaveData": "accounts/syncGJAccountNew.php",
    "updateAccountSettings": "updateGJAccSettings20.php",
    "getMessages": "getGJMessages20.php",
    "readMessage": "downloadGJMessage20.php",
    "sendMessage": "uploadGJMessage20.php",
    "deleteMessage": "deleteGJMessages20.php",
    "blockUser": "blockGJUser20.php",
    "unblockUser": "unblockGJUser20.php",
    "deleteFriendRequests": "deleteGJFriendRequests20.php",
    "sendFriendRequest": "uploadFriendRequest20.php",
    "getFriendRequests": "getGJFriendRequests20.php",
    "readFriendRequest": "readGJFriendRequest20.php",
    "acceptFriendRequest": "acceptGJFriendRequest20.php",
    "removeFriend": "removeGJFriend20.php",
    "uploadList": "uploadGJLevelList.php",
    "deleteList": "deleteGJLevelList.php",
    "getAccountURL": "getAccountURL.php",
    "getLevelLeaderboards": "getGJLevelScores211.php",
    "getPlatformerLevelLeaderboards": "getGJLevelScoresPlat.php",
    "backupSaveData": "backupGJAccountNew.php",
    "getContentURL": "getCustomContentURL.php",
    "musicLibraryVersion": "music/musiclibrary_version_02.txt",
    "musicLibraryVersionOld": "music/musiclibrary_version.txt",
    "sfxLibraryVersion": "sfx/sfxlibrary_version.txt",
    "musicLibrary": "music/musiclibrary_02.dat",
    "musicLibraryOld": "music/musiclibrary.dat",
    "sfxLibrary": "sfx/sfxlibrary.dat",
    "getChallenges": "getGJChallenges.php"
}
```

#### DEFAULT_HEADERS_21

Default request headers for 2.1.

```js
export const DEFAULT_HEADERS_21 = {
    "User-Agent": "",
    "Accept": "*/*",
    "Content-Type": "application/x-www-form-urlencoded"
}
```

#### DEFAULT_HEADERS_22

Default request headers for 2.2.

```js
export const DEFAULT_HEADERS_22 = {
    "User-Agent": "",
    "Accept": "*/*",
    "Content-Type": "application/x-www-form-urlencoded",
    "Cookie": "gd=1;",
    "Host": "www.boomlings.com"
}
```

#### DEFAULT_ACCOUNT_URL

Default URL for account management endpoints.

`https://www.robtopgames.org/database`

#### DEFAULT_CONTENT_URL

Default URL for the Music & SFX libraries.

`https://geometrydashfiles.b-cdn.net`

#### DEFAULT_SERVER

Default URL for most endpoints.

`https://www.boomlings.com/database`

#### DEFAULT_SERVER_21

Default URL for most endpoints (2.1).

`http://www.boomlings.com/database`

#### DIFFICULTIES

All possible difficulty values for levels and lists.

```
AUTO = -1
NA = 0
EASY = 1
NORMAL = 2
HARD = 3
HARDER = 4
INSANE = 5
EASY_DEMON = 6
MEDIUM_DEMON = 7
HARD_DEMON = 8
INSANE_DEMON = 9
EXTREME_DEMON = 10
```

#### ENDPOINTS_2_100

Default endpoints for 2.100.

#### ENDPOINTS_2_113

Default endpoints for 2.113.

#### ENDPOINTS_2_205

Default endpoints for 2.205.

#### HEX_CHARACTERS

Character set for hexadecimal values.

`"abcdef1234567890".split("")`

#### ICON_TYPES

All icon types.

```
CUBE = 0
ICON = 0
SHIP = 1
BALL = 2
BIRD = 3
UFO = 3
WAVE = 4
DART = 4
ROBOT = 5
SPIDER = 6
SWING = 7
SWINGCOPTER = 7
JETPACK = 8
```

#### ITEMS

All possible chest reward items.

```
FIRE = 1
ICE = 2
POISON = 3
SHADOW = 4
LAVA = 5
KEY = 6
EARTH = 10
BLOOD = 11
METAL = 12
LIGHT = 13
SOUL = 14
```

#### KEYS

All XOR keys used throughout Geometry Dash.

```js
export const KEYS = {
    SAVE_DATA: "\x0B",
    MESSAGES: "14251",
    VAULT_CODES: "19283",
    CHALLENGES: "19847",
    LEVEL_PASSWORD: "26364",
    COMMENT: "29481",
    ACCOUNT_PASSWORD: "37526",
    LEVEL_LEADERBOARD: "39673",
    LEVEL: "41274",
    LOAD_DATA: "48291",
    RATE: "58281",
    CHEST_REWARDS: "59182",
    STAT_SUBMISSION: "85271"
}
```

#### LENGTHS

All possible level lengths.

```
TINY = 0
SHORT = 1
MEDIUM = 2
LONG = 3
XL = 4
PLATFORMER = 5
```

#### LISTS_HASH
The hash that is always returned by the getGJLevelLists endpoint (as of 2.206).

`"f5da5823d94bbe7208dd83a30ff427c7d88fdb99"`

#### RS_CHARACTERS

Character set for RS (random string) values.

`"QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890".split("")`

#### SALTS
All salts used in various SHA1 operations.

```
LEVEL = "xI25fpAapCQg"
COMMENT = "xPT6iUrtws0J"
GJP2 = "mI29fmAnxgTs"
STAT_SUBMISSION = "xI35fsAapCRg"
LIKE_OR_RATE = "ysg6pUrtjn0J"
LEVEL_LEADERBOARDS = "yPg6pUrtWn0J"
REWARDS = "pC26fpYaQCtg"
CHALLENGES = "oC36fpYaPtdg"
```

#### SECRETS

All values for the `secret` parameter, which is sent in almost every request.

```
COMMON = "Wmfd2893gb7"
ACCOUNT = "Wmfv3899gc9"
DELETE = "Wmfv2898gc9"
MOD = "Wmfp3879gc3"
ADMIN = "Wmfx2878gb9"
```

#### SCORES

Possible leaderboard types for `getLeaderboards`.

```
TOP = "top"
RELATIVE = "relative"
FRIENDS = "friends"
CREATORS = "creators"
```

#### VERSIONS

Various version values.

```js
export const VERSIONS = {
    gameVersion: 22,
    binaryVersion: 42
}
export const VERSIONS_2_205 = {
    gameVersion: 22,
    binaryVersion: 41
}
export const VERSIONS_2_204 = {
    gameVersion: 22,
    binaryVersion: 40
}
export const VERSIONS_2_200 = {
    gameVersion: 22,
    binaryVersion: 37
}
export const VERSIONS_2_113 = {
    gameVersion: 21,
    binaryVersion: 35
}
export const VERSIONS_2_111 = {
    gameVersion: 21,
    binaryVersion: 34
}
export const VERSIONS_2_100 = {
    gameVersion: 21,
    binaryVersion: 33
}
export const VERSIONS_2_011 = {
    gameVersion: 20,
    binaryVersion: 29
}
export const VERSIONS_2_000 = {
    gameVersion: 20,
    binaryVersion: 27
}
export const VERSIONS_1_930 = {
    gameVersion: 19,
    binaryVersion: 25
}
```

### utils

Various utility functions for Geometry Dash.

#### getRandomNumber(min, max)

Returns a random number between `min` and `max`.

#### gjp(password)

Encodes a string as a GJP. (outdated as of 2.2)

#### gjp2(password)

Encrypts a string with GJP2 encryption.

#### md5(string, digestType = "hex")

Returns the MD5 hash for the `string`.

#### md5Buffer(string)

Returns the MD5 hash for the `string` as a Buffer.

#### robTopSplit(string, separator)

Splits a string on every second instance of the `separator`, and then the split strings get converted into a Map, where the first value is the key, and the second is the value.

#### robTopSplitDict(string, separator)

Same as `robTopSplit`, but generates an Object.

#### sha1(string, digestType = "hex")

Returns the SHA-1 hash for the `string`.

#### xor(string, key)

XOR's the `string` using the `key`.
