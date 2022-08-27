class Git {
    constructor(opt=null) {
        this.dir = `dst`
        this.username = opt?.username
        this.token = opt?.token
        this.repo = opt?.repo
        this.branch = `master`
        console.log(opt)
    }
    async init(repo) {
        console.log('Git.init()')
        this.repo = repo
        const exists = await window.myApi.exists(`${this.dir}/${this.repo}/.git`)
        console.log(exists)
        if(!exists) {
            await window.myApi.mkdir(`${this.dir}/${this.repo}`)
            let res = await window.myApi.shell(`cd "${this.dir}/${this.repo}/"; git init;`)
            //let res = await window.myApi.shell(`cd "${this.dir}/"; mkdir "${this.repo}"; cd "${this.repo}"; git init;`)
            // Initialized empty Git repository in /tmp/work/Electron.GitHub.API.20220816131521/dst/mytestrepo/.git/
            console.log(res.stdout)
            console.log(`ローカルリポジトリを作成しました。`)
            await this.#remoteAddOrigin()
        } else {
            console.log(`${this.dir}/${this.repo}/.git は既存のためgit initしません。`)
        }
        return exists
    }
    async #add() {
        await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git add .;`)
    }
    async #addList() {
        await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git add -n .;`)
    }
    async #commit(message) {
        await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git commit -m '${message}';`)
    }
    async #remoteAddOrigin() {
        await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git remote add origin "https://${this.username}:${this.token}@github.com/${this.username}/${this.repo}.git";`)
    }
    async #remoteSetUrlOrigin() {
        await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git remote set-url origin "https://${this.username}:${this.token}@github.com/${this.username}/${this.repo}.git";`)
    }
    async #push() {
        await window.myApi.shell(`git push origin ${this.branch}`)
    }

    /*
    async push(options) {
        // リポジトリがなければ作成する(init)
        // add, commit, push
        let res = await window.myApi.shell(`cd ./repo/${options.repository}`)
        console.debug(res.stdout)
        this.#init()
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
