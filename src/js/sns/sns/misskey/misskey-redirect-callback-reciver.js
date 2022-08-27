class MisskeyRedirectCallbackReciver {
    constructor() {
        this.url = new URL(location.href)
        this.domain = sessionStorage.getItem('misskey-domain')
        this.version = sessionStorage.getItem(`misskey-${this.domain}-version`)
        this.auth = sessionStorage.getItem(`misskey-${this.domain}-auth-method`)
        this.permission = sessionStorage.getItem(`misskey-${this.domain}-permission`)
    }
    async recive() {
        const res = this.#isRedirectType()
        console.debug(`----- recive -----: ${res}`)
        if (res == 'approved') { await this.#ApprovedEvent() }
        if (res == 'rejected') { this.#RejectedEvent() }
        // 上記以外はリダイレクトでないと判断して何もしない
        console.debug(`${res}`)
    }
    // マストドンからの承認リダイレクトコールバックである
    #isMisskey() { (sessionStorage.getItem('misskey-domain')) ? true : false }
    #isRedirectType() {
        if (!this.domain) { return 'not-misskey-domain' }
        if (!this.version) { return 'not-misskey-version' }
        if (!this.#hasScopeKey()) { return 'not-permission' }
        if (this.url.searchParams.has('session') || this.url.searchParams.has('token')) { return 'approved' }
        if (this.url.searchParams.has('error')) { return 'rejected' }
        //if (!url.searchParams.has('code') && url.searchParams.has('error')) { return 1 }
        return 'not-redirect'
    }
    #hasScopeKey() {
        for (let i=0; i<sessionStorage.length; i++) {
            if (`misskey-${this.domain}-permission` ==  sessionStorage.key(i)) { return true }
        }
        return false
    }
    async #ApprovedEvent() {
        //const authorizer = new MisskeyAuthorizer(this.domain, this.permission)
        //const accessToken = await authorizer.redirectCallback()
        const accessToken = await this.#makeAccessToken() 
        console.debug('----- 認証リダイレクト後 -----')
        if (accessToken) { 
            const client = new MisskeyApiClient(this.domain, accessToken)
            const params = {
                domain: this.domain,
                permission: this.permission,
                client: client,
            }
            const action = sessionStorage.getItem(`misskey-${this.domain}-callback-action`)
            console.debug('action:', action)
            if (action) {
                const callbackParams = JSON.parse(sessionStorage.getItem(`misskey-${this.domain}-callback-action-params`))
                console.debug('callbackParams:', callbackParams)
                const actions = action.split('\n')
                params.actions = sessionStorage.getItem(`misskey-${this.domain}-callback-action`).split('\n')
                params.params = callbackParams
                console.debug('params.params:', params.params)
                const results = []
                for (let i=0; i<actions.length; i++) {
                    console.debug('actions:', actions[i])
                    const p = (params.params) ? ((Array.isArray(params.params)) ? params.params[i] : params.params) : null
                    console.debug('params:', p)
                    results.push(await client[actions[i]](p))
                }
                params.results = results
            }
            console.debug('イベント発行：misskey-redirect-approved')
            console.debug(params)
            document.dispatchEvent(new CustomEvent('misskey_redirect_approved', {detail: params}));
            this.#clearSession()
        }
    }
    #RejectedEvent() {
        this.url.searchParams.delete('error');
        this.url.searchParams.delete('error_description');
        history.replaceState('', '', this.url.pathname);
        const params = {
            domain: this.domain,
            permission: this.permission,
            error: this.url.searchParams.has('error'),
            error_description: this.url.searchParams.has('error_description'),
        }
        this.dispatchEvent(new CustomEvent('misskey_redirect_rejected', {detail: params}));
        this.#clearSession()
    }
    async #makeAccessToken() {
        const authorizer = MisskeyAuthorizer.getAuthorizerFromVersion(this.domain, this.permissions, this.version)
        return authorizer.redirectCallback()
        /*
        const auth = sessionStorage.setItem(`misskey-${domain}-auth-method`, auth)
        console.debug(`----- #makeAccessToken(): ${auth} -----`)
        if ('MiAuth' == auth) { return this.#makeAccessTokenMiAuth() }
        else if ('OAuth' == auth) { return this.#makeAccessTokenOAuth() }
        else { console.error(`想定外の認証方法です: ${auth}`); }
        */
    }
    #clearSession() {
        console.debug('----- clearSession -----', this.domain)
        sessionStorage.removeItem(`misskey-domain`);
        sessionStorage.removeItem(`misskey-${this.domain}-version`);
        sessionStorage.removeItem(`misskey-${this.domain}-auth-method`);
        sessionStorage.removeItem(`misskey-${this.domain}-permission`);
        sessionStorage.removeItem(`misskey-${this.domain}-callback-action`)
        sessionStorage.removeItem(`misskey-${this.domain}-callback-action-params`)
        sessionStorage.removeItem(`misskey-${this.domain}-oauth-secret`);
        sessionStorage.removeItem(`misskey-${this.domain}-oauth-token`);
        sessionStorage.removeItem(`misskey-${this.domain}-oauth-accessToken`);
        sessionStorage.removeItem(`misskey-${this.domain}-i`);
        sessionStorage.removeItem(`misskey-${this.domain}-miauth-session`);
        sessionStorage.removeItem(`misskey-${this.domain}-miauth-token`);
        sessionStorage.removeItem(`misskey-${this.domain}-miauth-user`);
    }
    /*
    async #makeAccessTokenMiAuth() {
        console.debug('----- #makeAccessTokenMiAuth() -----')
        console.debug(this.url.href)
        console.debug(this.url.searchParams.has('session'), sessionStorage.getItem(`misskey-domain`))
        if (url.searchParams.has('session')) {
            const domain = sessionStorage.getItem(`misskey-domain`);
            const session = sessionStorage.getItem(`misskey-${domain}-miauth-session`);
            url.searchParams.delete('session');
            history.replaceState('', '', url.pathname);
            const client = new MisskeyRestClient(domain)
            const json = await client.post(`miauth/${session}/check`, null, null)
            sessionStorage.setItem(`misskey-${domain}-miauth-token`, json.token)
            sessionStorage.setItem(`misskey-${domain}-miauth-user`, json.user)
            //sessionStorage.setItem(`${domain}-i`, json.token)
            return json.token
        }
    }
    async #makeAccessTokenOAuth() {
        console.debug('----- #makeAccessTokenOAuth() -----')
        console.debug(this.url.href)
        console.debug(this.url.searchParams.has('token'), sessionStorage.getItem(`misskey-domain`))
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
            // トークンを取得して返す
            const secret = sessionStorage.getItem(`misskey-${domain}-oauth-secret`)
            console.debug('----- authorized -----')
            console.debug('secret:', secret)
            console.debug('token:', token)
            const authorizer = MisskeyAuthorizerOAuth(domain, permission) 
            const json = await this.getToken(secret, token)
            console.debug('accessToken:', json.accessToken)
            sessionStorage.setItem(`misskey-${domain}-accessToken`, json.accessToken);
            const accessToken = json.accessToken
            const i = await this.#getI(json.accessToken, sessionStorage.getItem(`misskey-${domain}-oauth-secret`))
            sessionStorage.setItem(`misskey-${domain}-i`, i)
            return i
        }
    }
    */
}
