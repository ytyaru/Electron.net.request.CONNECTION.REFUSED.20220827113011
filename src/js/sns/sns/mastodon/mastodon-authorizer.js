class MastodonAuthorizer {
    constructor(domain='mstdn.jp', scope='write:statuses') {
        const url = new URL(location.href)
        url.searchParams.delete('code');
        url.searchParams.delete('error');
        url.searchParams.delete('error_description');
        console.log(url.href)
        this.redirect_uri = url.href
        this.domain = domain
        //this.scope = 'read write follow push'
        this.scope = scope
        this.client = new MastodonRestClient(this.domain)
    }
    //async authorize(status) {
    async authorize(action=null, params=null) {
        const app = await this.#createApp()
        //sessionStorage.setItem(`${this.domain}-app`, JSON.stringify(app));
        sessionStorage.setItem(`mastodon-domain`, this.domain);
        sessionStorage.setItem(`mastodon-${this.domain}-oauth-scope`, this.scope);
        sessionStorage.setItem(`mastodon-${this.domain}-oauth-client_id`, app.client_id);
        sessionStorage.setItem(`mastodon-${this.domain}-oauth-client_secret`, app.client_secret);
        //sessionStorage.setItem(`status`, status);
        if (action) {
            sessionStorage.setItem(`mastodon-${this.domain}-callback-action`, (Array.isArray(action)) ? action.join('\n') : action)
            /*
            if (typeof action === "string" || action instanceof String) {
                sessionStorage.setItem(`mastodon-${this.domain}-callback-action`, action)
            }
            if (Array.isArray(action)) {
                sessionStorage.setItem(`mastodon-${this.domain}-callback-action`, action.join('\n'))
            }
            */
        }
        if (params) {
            sessionStorage.setItem(`mastodon-${this.domain}-callback-action-params`, (Array.isArray(params)) ? params.map(p=>JSON.stringify(p)).join('\n') : JSON.stringify(params))
            /*
            if (typeof params === "string" || params instanceof String) {
                sessionStorage.setItem(`mastodon-${this.domain}-callback-action-params`, JSON.stringify(params))
            }
            if (Array.isArray(params)) {
                sessionStorage.setItem(`mastodon-${this.domain}-callback-action-params`, params.map(p=>JSON.stringify(p)).join('\n'))
            }
            */
        }
        this.#authorize(app.client_id)
    }
    async #createApp() {
        console.debug('----- apps -----')
        const params = {
            client_name: this.#createClientName(),
            redirect_uris: `${this.redirect_uri}`,
            scopes: this.scope,
            website: `${this.redirect_uri}`,
        };
        sessionStorage.setItem(`mastodon-${this.domain}-oauth-redirect-url`, this.redirect_uri);
        return await this.client.post('api/v1/apps', null, params)
    }
    #createClientName() {
        // mstdn.jp では60字以下でないとエラーになる
        //    client_name: `Test Application by API redirect_uris=${this.redirect_uri}`,
        // {"error":"Validation failed: Application name is too long (maximum is 60 characters)"}
        return `toot requester`
    }
    #authorize(client_id) {
        console.debug('----- authorize -----')
        //const redirect_uri = new URL(this.redirect_uri)
        //redirect_uri.searchParams.set('domain', this.domain)
        //const url = new URL(`https://${this.domain}/oauth/authorize?response_type=code&client_id=${client_id}&scope=${this.scope}&redirect_uri=${redirect_uri.href}`).href
        const url = new URL(`https://${this.domain}/oauth/authorize?response_type=code&client_id=${client_id}&scope=${this.scope}&redirect_uri=${this.redirect_uri}`).href
        console.debug(url)
        sessionStorage.setItem(`mastodon-${this.domain}-oauth-authorize-url`, url);
        window.location.href = url
    }
    /*
    async redirectCallback() {
        const url = new URL(location.href)
        // マストドンAPI oauth/authorize でリダイレクトされた場合（認証を拒否した場合）
        if(url.searchParams.has('error') && url.searchParams.get('domain')) {
            console.debug(this.domain, url.searchParams.get('domain'))
            if (this.domain === url.searchParams.get('domain')) {
                console.debug((url.searchParams.has('error_description')) ? decodeURI(url.searchParams.get('error_description')) : '認証エラーです。')
                Toaster.toast('キャンセルしました')
                const params = url.searchParams;
                params.delete('error');
                params.delete('error_description');
                history.replaceState('', '', url.pathname);
            }
        }
        // マストドンAPI oauth/authorize でリダイレクトされた場合（認証に成功した場合）
        else if (url.searchParams.has('code') && url.searchParams.has('domain')) {
            const domain = url.searchParams.get('domain') // mstdn.jp, pawoo.net, ...
            this.domain = domain
            const client = new MastodonRestClient(domain)
            const code = url.searchParams.get('code')
            // 認証コード(code)をURLパラメータから削除する
            const params = url.searchParams;
            params.delete('code');
            history.replaceState('', '', url.pathname);
            // トークンを取得して有効であることを確認しトゥートする
            const status = sessionStorage.getItem(`status`)
            console.debug('----- authorized -----')
            console.debug('domain:', domain, this.domain)
            console.debug('client_id:', sessionStorage.getItem(`${domain}-client_id`))
            console.debug('client_secret:', sessionStorage.getItem(`${domain}-client_secret`))
            console.debug('認証コード', code)
            // client_id, client_secretはsessionStorageに保存しておく必要がある
            const json = await this.#getToken(sessionStorage.getItem(`${domain}-client_id`), sessionStorage.getItem(`${domain}-client_secret`), code)
            client.error(json)
            console.debug('access_token:', json.access_token)
            sessionStorage.setItem(`${domain}-access_token`, json.access_token);
            const accessToken = json.access_token
            return accessToken
        }
    }
    */
    async getToken(client_id, client_secret, code) {
        console.debug('----- token -----')
        console.debug('redirect_uri:', this.redirect_uri)
        const params = {
            grant_type: 'authorization_code',
            client_id: client_id,
            client_secret: client_secret,
            redirect_uri: this.redirect_uri,
            code: code,
        };
        return await this.client.post('oauth/token', null, params)
    }
}

