// https://misskey.m544.net/docs/ja-JP/api
// 12.39.1以降の認証はOAuthでなくMiAuthという独自手法を使うらしい。互換性皆無。
class MisskeyAuthorizer { // https://forum.misskey.io/d/6-miauth
    static async get(domain='misskey.io', permissions=null) {
        console.debug(`----- MisskeyAuthorizer.get() -----: ${domain}`)
        if (!domain) { return null }
        const client = new MisskeyApiClient(domain) 
        const json = await client.meta()
        console.debug(json)
        console.debug(json.version)
        return this.getAuthorizerFromVersion(domain, permissions, json.version)
    }
    static getAuthorizerFromVersion(domain, permissions, version) { // ミスキーv12.39以降はMiAuth、それ以前ならOAuthで認証する
        const v = version.split('.')
        const isMiAuth= (12 <= parseInt(v[0]) && 39 <= parseInt(v[1])) 
        const auth = (isMiAuth) ? 'MiAuth' : 'OAuth'
        console.debug('認証方法:', auth)
        sessionStorage.setItem(`misskey-domain`, domain)
        sessionStorage.setItem(`misskey-${domain}-version`, version)
        sessionStorage.setItem(`misskey-${domain}-auth-method`, auth)
        sessionStorage.setItem(`misskey-${domain}-permission`, permissions)
        return (isMiAuth) ? new MisskeyAuthorizerMiAuth(domain, permissions) : new MisskeyAuthorizerOAuth(domain, permissions)
    }
}

