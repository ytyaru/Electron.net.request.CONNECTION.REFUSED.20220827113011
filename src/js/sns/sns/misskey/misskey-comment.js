class MisskeyComment extends Comment {
    constructor() { super() }
    make(json, domain) {
        console.debug(domain, json)
        console.debug(JSON.stringify(json))
        const j = json.createdNote
        console.debug(j)
        const author = super.author(
            `https://${domain}/@${j.user.username}`,
            j.user.name || j.user.username,
            j.user.avatarUrl,
            32,
        )
        const url = `https://${domain}/notes/${j.id}`
        const content = document.createElement('div')
        content.innerHTML = j.text
        const publishedDate = new Date(Date.parse(j.createdAt))
        return super.comment(
            content.innerText,
            author,
            DateDiff.toIso(publishedDate),
            DateDiff.toElapsed(publishedDate),
            '言及', '＠', 
            url,
            this.getAddressFromNote(j), 
        )
    }
    getAddressFromNote(json) { // json: {root}.createdNote
        let founds = json.text.match(super._addressRegExp)
        console.debug(founds)
        if (founds) { return founds[0] }
        // マストドンと違い、jsonの中にプロフィール情報がない
        return null
    }
}
