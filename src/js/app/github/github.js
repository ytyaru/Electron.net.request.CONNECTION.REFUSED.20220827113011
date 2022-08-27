class GitHub {
    constructor(opt=null) {
        this.username = opt?.username
        this.token = opt?.token
        this.branch = `master`
    }
    async createRepo(params) { // https://docs.github.com/ja/rest/repos/repos#create-a-repository-for-the-authenticated-user
        console.log(params)
        console.log(this.username)
        console.log(this.token)
        if (!params.hasOwnProperty('name')) {
            console.error(`引数paramsのプロパティにnameは必須です。`)
            return false
        }
        if (!this.#validRepoName(params.name)) {
            console.error(`引数params.nameの値が不正値です。英数字._-100字以内にしてください。`)
            return false
        }
        await window.myApi.request({
            'method': 'POST',
            url: 'https://api.github.com/user/repos',
            headers: {
                'Authorization': `token ${this.token}`,
                'User-Agent': `${this.username}`, // https://docs.github.com/ja/rest/overview/resources-in-the-rest-api#user-agent-required
                'Content-Type': 'application/json', // 有無関係なく同じエラー
            },
            // ↓文字列化しようが関係なく同じエラー
            "body": params,
            //"body": JSON.stringify(params),
        },(json, res)=>{
            console.debug(res)
            console.debug(json)
        },(res)=>{
            console.debug(res)
        })

        /*
        await window.myApi.request({
            params: {
                'method': 'POST',
                url: 'https://api.github.com/user/repos',
                headers: {
                    'Authorization': `token ${this.token}`,
                },
                "body": params,
            },
        },(json, res)=>{
            console.debug(res)
            console.debug(json)
        },(res)=>{
            console.debug(res)
        })
        */
        console.log(`リモートリポジトリを作成しました。`)
    }
    #validRepoName(name) { return name.match(/[a-zA-Z0-9\._\-]{1,100}/g) }
    /*
    async push(options) {
        // リポジトリがなければ作成する(init)
        // add, commit, push
        let res = await window.myApi.shell(`cd ./repo/${options.repository}`)
        console.debug(res.stdout)
        this.#init()
    }
    async #init() {
        const exists = await window.myApi.exists(`.git`)
        if(!exists) {
            let res = await window.myApi.shell(`git init`)
            console.debug(res.stdout)
        }
    }

    async #add() {
        await window.myApi.shell(`git add .`)
    }
    async #addList() {
        await window.myApi.shell(`git add -n .`)
    }
    async #commit(message) {
        await window.myApi.shell(`git commit -m '${message}'`)
    }
    async #remoteAddOrigin() {
        await window.myApi.shell(`git remote add origin "https://${username}:${token}@github.com/${username}/${repo}.git"`)
    }
    async #remoteSetUrlOrigin() {
        await window.myApi.shell(`git remote set-url origin "https://${username}:${token}@github.com/${username}/${repo}.git"`)
    }
    async #push() {
        await window.myApi.shell(`git push origin ${this.branch}`)
    }
    async #setUser(username, email, isLocal=false) {
        const opt = '--' + ((isLocal) ? 'global' : 'local')
        await window.myApi.shell(`git config ${opt} user.name '${username}'`)
        await window.myApi.shell(`git config ${opt} user.email '${email}'`)
    }
    */
}
