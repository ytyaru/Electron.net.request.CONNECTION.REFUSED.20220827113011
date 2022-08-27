class MastodonInstance {
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
        const client = new MastodonApiClient(domain)
        const json = await client.instance().catch(e=>null)
        if (!json) { return false }
        if (!json.hasOwnProperty('version')) { return [null, null]; }
        console.debug(json.version)
        //if (!json || !json.hasOwnProperty('version')) { throw new Error(`指定したURLやドメイン ${domain} はmastodonのインスタンスでない可能性があります。api/v1/instanceリクエストをしても想定した応答が返ってこなかったためです。\n入力したURLやドメイン名がmastodonのインスタンスであるか確認してください。あるいはmastodonの仕様変更が起きたのかもしれません。対応したソースコードを書き換えるしかないでしょう。`) }
        console.debug(`----- ${domain} は正常なmastodonサーバです -----`)
        return [domain, json]
    }
    static async request(domain) {
        const client = new MastodonApiClient(domain)
        try {
            return await client.instance().catch(e=>null)
        } catch(error) {
            console.error(error)
            return null
        }
    }
    static async isExist(domain) {
        domain = this.#getDomain(domain)
        const json = await this.request(domain)
        if (!json) { return false }
        if (!json.hasOwnProperty('version')) { return false; }
        return true
    }
}
