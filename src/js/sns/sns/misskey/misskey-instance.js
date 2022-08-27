class MisskeyInstance {
    static async get() {
        const domain = this.prompt()
        return await this.#get(domain)
        //const [domain, json] = await this.isExist(domain)
    }
    static prompt() {
        const domain = window.prompt('インスタンスのURLかドメイン名を入力してください。');
        return this.#getDomain(domain)
    }
    static #getDomain(domain) {
        try { return new URL(domain).hostname }
        catch (e) { return domain }
    }
    static async #get(domain) {
        // 入力したドメインが存在するか（リンク切れでないか）
        // 入力したドメインはマストドンのインスタンスか（どうやってそれを判定するか）
        const client = new MisskeyApiClient(domain)
        //const json = await client.meta().catch(e=>null)
        const json = await this.request(domain)
        if (! await this.#isMisskey(json)) { return [null, null] }
        console.debug(json.version)
        //if (!json || !json.hasOwnProperty('version')) { throw new Error(`指定したURLやドメイン ${domain} はmisskeyのインスタンスでない可能性があります。api/v1/instanceリクエストをしても想定した応答が返ってこなかったためです。\n入力したURLやドメイン名がmisskeyのインスタンスであるか確認してください。あるいはmisskeyの仕様変更が起きたのかもしれません。対応したソースコードを書き換えるしかないでしょう。`) }
        console.debug(`----- ${domain} は正常なmisskeyサーバです -----`)
        return [domain, json]
    }
    static async request(domain) {
        const client = new MisskeyApiClient(domain)
        try {
            return await client.meta().catch(e=>null)
        } catch(error) {
            console.error(error)
            return null
        }
    }
    static async isExist(domain) {
        domain = this.#getDomain(domain)
        const json = await this.request(domain)
        //const is = await this.#isMisskey(json)
        //if (!is) { return false }
        if (await !this.#isMisskey(json)) { return false }
        return true
    }
    static async #isMisskey(json) {
        if (!json) { return false }
        if (!json.hasOwnProperty('version')) { return false; }
        return true
    }
    /*
    async getAuthorizerFromDomain(domain) { // ミスキーv12.39以降はMiAuth、それ以前ならOAuthで認証する
        console.debug(`----- getAuthorizer() -----: ${this.domain}`)
        if (!domain) { return null }
        const client = new MisskeyApiClient(domain) 
        const json = await client.meta()
        console.debug(json)
        console.debug(json.version)
        const v = json.version.split('.')
        const isMiAuth= (12 <= parseInt(v[0]) && 39 <= parseInt(v[1])) 
        console.debug(`${domain}: ${v}`)
        console.debug('認証方法:', (isMiAuth) ? 'MiAuth' : 'OAuth')
        return (isMiAuth) ? new MisskeyAuthorizerV12(domain) : new MisskeyAuthorizerV11(domain)
    }
    */

}
