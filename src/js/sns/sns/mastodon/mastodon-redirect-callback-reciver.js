class MastodonRedirectCallbackReciver {
    constructor() {
        this.url = new URL(location.href)
        this.domain = sessionStorage.getItem('mastodon-domain')
        this.scope = sessionStorage.getItem(`mastodon-${this.domain}-oauth-scope`)
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
    #isMastodon() { (sessionStorage.getItem('mastodon-domain')) ? true : false }
    #isRedirectType() {
        if (!this.domain) { return 'not-mastodon-domain' }
        if (!this.#hasScopeKey()) { return 'not-scope' }
        if (this.url.searchParams.has('code')) { return 'approved' }
        if (this.url.searchParams.has('error')) { return 'rejected' }
        return 'not-redirect'
    }
    #hasScopeKey() {
        for (let i=0; i<sessionStorage.length; i++) {
            if (`mastodon-${this.domain}-oauth-scope` ==  sessionStorage.key(i)) { return true }
        }
        return false
    }
    async #ApprovedEvent() {
        const accessToken = await this.#makeAccessToken() 
        console.debug('----- 認証リダイレクト後 -----')
        if (accessToken) { 
            const client = new MastodonApiClient(this.domain, accessToken)
            const params = {
                domain: this.domain,
                scope: this.scope,
                client: client,
            }
            const action = sessionStorage.getItem(`mastodon-${this.domain}-callback-action`)
            console.debug('action:', action)
            if (action) {
                const callbackParams = JSON.parse(sessionStorage.getItem(`mastodon-${this.domain}-callback-action-params`))
                console.debug('callbackParams:', callbackParams)
                const actions = action.split('\n')
                params.actions = sessionStorage.getItem(`mastodon-${this.domain}-callback-action`).split('\n')
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
            console.debug('イベント発行：mastodon-redirect-approved')
            console.debug(params)
            document.dispatchEvent(new CustomEvent('mastodon_redirect_approved', {detail: params}));
            this.#clearSession()
        }
    }
    #RejectedEvent() {
        this.url.searchParams.delete('error');
        this.url.searchParams.delete('error_description');
        history.replaceState('', '', this.url.pathname);
        const params = {
            domain: this.domain,
            scope: this.scope,
            error: this.url.searchParams.has('error'),
            error_description: this.url.searchParams.has('error_description'),
        }
        document.dispatchEvent(new CustomEvent('mastodon_redirect_rejected', {detail: params}));
        this.#clearSession()
    }
    async #makeAccessToken() {
        const code = this.url.searchParams.get('code')
        sessionStorage.setItem(`mastodon-${this.domain}-oauth-code`, code);
        // 認証コード(code)をURLパラメータから削除する
        this.url.searchParams.delete('code');
        history.replaceState('', '', this.url.pathname);
        // トークンを取得して返す
        const client_id = sessionStorage.getItem(`mastodon-${this.domain}-oauth-client_id`)
        const client_secret = sessionStorage.getItem(`mastodon-${this.domain}-oauth-client_secret`)
        console.debug('----- authorized getToken -----')
        console.debug('domain:', this.domain)
        console.debug('scope:', this.scope)
        console.debug('client_id:', client_id)
        console.debug('client_secret:', client_secret)
        console.debug('認証コード', code)
        const authorizer = new MastodonAuthorizer(this.domain, this.scope)
        const json = await authorizer.getToken(client_id, client_secret, code)
        console.debug('access_token:', json.access_token)
        sessionStorage.setItem(`mastodon-${this.domain}-oauth-access_token`, json.access_token);
        return json.access_token
    }
    #clearSession() {
        console.debug('----- clearSession -----', this.domain)
        sessionStorage.removeItem(`mastodon-${this.domain}-oauth-app`);
        sessionStorage.removeItem(`mastodon-${this.domain}-oauth-client_id`);
        sessionStorage.removeItem(`mastodon-${this.domain}-oauth-client_secret`);
        sessionStorage.removeItem(`mastodon-${this.domain}-oauth-code`);
        sessionStorage.removeItem(`mastodon-${this.domain}-oauth-access_token`);
        sessionStorage.removeItem(`mastodon-${this.domain}-callback-action`)
        sessionStorage.removeItem(`mastodon-${this.domain}-callback-action-params`)
    }
}
