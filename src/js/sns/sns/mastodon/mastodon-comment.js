class MastodonComment extends Comment {
    constructor() { super() }
    make(json) {
        const author = super.author(
            json.account.url,
            json.account.username,
            json.account.avatar,
            32,
        )
        const content = document.createElement('div')
        content.innerHTML = json.content
        const publishedDate = new Date(Date.parse(json.created_at))
        return super.comment(
            content.innerText,
            author,
            DateDiff.toIso(publishedDate),
            DateDiff.toElapsed(publishedDate),
            '言及', '＠', 
            json.url,
            this.getAddressFromToot(json),
        )
    }
    getAddressFromToot(json) {
        let founds = json.account.note.match(this._addressRegExp)
        console.debug(founds)
        if (founds) { return founds[0] }
        if (json.account.hasOwnProperty('fields')) {
            for (const field of json.account.fields) {
                if ('モナコイン' == field.name || 'MONACOIN' == field.name.toUpperCase()) {
                    founds = field.value.match(this._addressRegExp)
                    console.debug(founds)
                    if (founds) { return founds[0] }
                }
            }
        }
        founds = json.content.match(this._addressRegExp)
        console.debug(founds)
        if (founds) { return founds[0] }
        return null
    }
}
