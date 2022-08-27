// https://misskey.m544.net/docs/ja-JP/api
class MisskeyAuthorizerOAuth {
    constructor(domain='misskey.dev', permissions=null) {
        const url = new URL(location.href)
        url.searchParams.delete('code');
        this.callbackUrl = url.href
        this.domain = domain
        //this.permission = (permissions) ? permissions : ['write:notes'] // https://misskey.m544.net/api-doc/#section/Permissions
        this.permission = (Array.isArray(permissions)) ? permissions: ((typeof permissions === 'string' || permissions instanceof String)) ? permissions.split(',') : [''] //カンマ区切り。'write:notes' https://misskey.m544.net/api-doc/#section/Permissions
        this.client = new MisskeyRestClient(this.domain)
    }
    //async authorize(text) {
    async authorize(action=null, params=null) {
        this.#createApp()
        const app = await this.#createApp().catch(e=>alert(e))
        console.debug(app)
        sessionStorage.setItem(`misskey-domain`, this.domain);
        //sessionStorage.setItem(`misskey-text`, text);
        if (action) {
            sessionStorage.setItem(`misskey-${this.domain}-callback-action`, (Array.isArray(action)) ? action.join('\n') : action)
        }
        if (params) {
            sessionStorage.setItem(`misskey-${this.domain}-callback-action-params`, (Array.isArray(params)) ? params.map(p=>JSON.stringify(p)).join('\n') : JSON.stringify(params))
        }
        sessionStorage.setItem(`misskey-${this.domain}-oauth-secret`, app.secret);
        //sessionStorage.setItem(`${domain}-app`, JSON.stringify(app));
        //sessionStorage.setItem(`${domain}-id`, app.id);
        this.#authorize(app.secret)
    }
    async #createApp() {
        console.debug('----- apps(app/create) -----')
        const params = {
            name: `note requester`,
            description: `request note`,
            permission: this.permission,
            callbackUrl: this.callbackUrl,
        };
        return await this.client.post('app/create', null, params)
    }
    async #authorize(appSecret) {
        console.debug('----- authorize(auth/session/generate) -----')
        const params = {appSecret:appSecret}
        const res = await this.client.post('auth/session/generate', null, params)
        console.debug(res)
        sessionStorage.setItem(`misskey-${this.domain}-oauth-token`, res.token);
        //const sleep = (second) => new Promise(resolve => setTimeout(resolve, second * 1000))
        //await sleep(2)
        window.location.href = res.url
    }
    async redirectCallback() {
        const url = new URL(location.href)
        console.debug('----- OAuth #redirectCallback() -----')
        console.debug(url, url.href)
        console.debug(url.searchParams.has('token'), sessionStorage.getItem(`misskey-domain`))
        // misskey API auth/session/generate でリダイレクトされた場合（認証に成功した場合）
        if (url.searchParams.has('token')) {
            console.debug('------------- 認証に成功した（リダイレクトされた） -------------')
            const domain = sessionStorage.getItem(`misskey-domain`);
            const permission = sessionStorage.getItem(`misskey-${domain}-permission`);
            const token = url.searchParams.get('token')
            sessionStorage.setItem(`misskey-${domain}-oauth-token`, token)
            // 認証コード(token)をURLパラメータから削除する
            const params = url.searchParams;
            params.delete('token');
            history.replaceState('', '', url.pathname);
            // トークンを取得して有効であることを確認しノートする
            const secret = sessionStorage.getItem(`misskey-${domain}-oauth-secret`)
            console.debug('----- authorized -----')
            console.debug('secret:', secret)
            console.debug('token:', token)
            const json = await this.#getToken(sessionStorage.getItem(`misskey-${domain}-oauth-secret`), token)
            console.debug('accessToken:', json.accessToken)
            sessionStorage.setItem(`misskey-${domain}-oauth-accessToken`, json.accessToken);
            const accessToken = json.accessToken
            const i = await this.#getI(json.accessToken, sessionStorage.getItem(`misskey-${domain}-oauth-secret`))
            sessionStorage.setItem(`misskey-${domain}-i`, i)
            return i
        }
    }
    async #getToken(appSecret, token) {
        console.debug('----- token -----')
        const params = {
            appSecret: appSecret,
            token: token,
        };
        return await this.client.post('auth/session/userkey', null, params)
    }
    async #getI(accessToken, appSecret) { return await this.#sha256(accessToken + appSecret) }
    // https://scrapbox.io/nwtgck/SHA256%E3%81%AE%E3%83%8F%E3%83%83%E3%82%B7%E3%83%A5%E3%82%92JavaScript%E3%81%AEWeb%E6%A8%99%E6%BA%96%E3%81%AE%E3%83%A9%E3%82%A4%E3%83%96%E3%83%A9%E3%83%AA%E3%81%A0%E3%81%91%E3%81%A7%E8%A8%88%E7%AE%97%E3%81%99%E3%82%8B
    async #sha256(str) {// const digest = await sha256("hello"); 
        const buff = new Uint8Array([].map.call(str, (c) => c.charCodeAt(0))).buffer;
        const digest = await crypto.subtle.digest('SHA-256', buff);
        return [].map.call(new Uint8Array(digest), x => ('00' + x.toString(16)).slice(-2)).join('');
    }
    /*
    async redirectCallback() {
        const url = new URL(location.href)
        console.debug('----- #redirectCallback() -----')
        console.debug(url, url.href)
        console.debug(url.searchParams.has('token'), sessionStorage.getItem(`misskey-domain`))
        // misskey API auth/session/generate でリダイレクトされた場合（認証に成功した場合）
        if (url.searchParams.has('token')) {
            console.debug('------------- 認証に成功した（リダイレクトされた） -------------')
            const domain = sessionStorage.getItem(`misskey-domain`);
            //const client = new MisskeyNoteClient(domain)
            const token = url.searchParams.get('token')
            sessionStorage.setItem(`misskey-${domain}-oauth-token`, token)
            // 認証コード(token)をURLパラメータから削除する
            const params = url.searchParams;
            params.delete('token');
            history.replaceState('', '', url.pathname);
            // トークンを取得して有効であることを確認しノートする
            //const text = sessionStorage.getItem(`misskey-text`)
            console.debug('----- authorized -----')
            //console.debug('id:', sessionStorage.getItem(`${domain}-id`))
            console.debug('secret:', sessionStorage.getItem(`misskey-${domain}-oauth-secret`))
            console.debug('token:', token)
            // client_id, client_secretはsessionStorageに保存しておく必要がある
            //const json = await client.getToken(sessionStorage.getItem(`${domain}-secret`), token)
            const json = await this.#getToken(sessionStorage.getItem(`misskey-${domain}-oauth-secret`), token)
            //this.#errorApi(json)
            console.debug('accessToken:', json.accessToken)
            sessionStorage.setItem(`${domain}-accessToken`, json.accessToken);
            const accessToken = json.accessToken
            const i = await this.#getI(json.accessToken, sessionStorage.getItem(`misskey-${domain}-oauth-secret`))
            sessionStorage.setItem(`${domain}-i`, i)
            return i
        }
    }
    */
    /*
    async note(i, text) {
        console.debug('----- note -----')
        console.debug(i)
        console.debug(text)
        const params = {i:i, text:text};
        return await this.client.post('notes/create', null, params)
    }
    */
}

