class ProfileGenerator {
    constructor() {
        this._addressRegExp = /[a-zA-Z0-9]{34,}/g
    }
    generate(json) {
        console.debug(json)
        const address = this.#getAddress(json)
        const one = `<tr><th>${this.#makeAvatar(json)}</th><td>${this.#makeDescription(json, address)}</td></tr>`
        const two = `<tr><th>${this.#link(json.url, json.name)}</th><td>${this.#makeMpurseSendButton(address)}${address}</td></tr>`
        return `<table class="profile-card">${one}${two}</table>`
    }
    #makeAvatar(json) { return `<a href="${json.url}"><img src="${this.#getAvatarUrl(json)}" title="${json.name}" width="128" height="128"></a>` }
    #getAvatarUrl(json) {
        if (json.hasOwnProperty('avatar')) {
            if (json.avatar) { return json.avatar } // できればリンク切れしていないことも確認したい
        }
        return './asset/image/user/kkrn_icon_user_3.svg'
    }
    #makeName(json) { return `<a href="${json.url}">${json.name}</a>` }
    #makeMpurseSendButton(address) { // マストドンのプロフィール情報にアドレスらしき文字列があれば投げモナボタンを配置する
        return (address) ? `<mpurse-send-button img-size="32" amount="0.04649000" to="${address}"></mpurse-send-button>` : ''
    }
    #getAddress(json) {
        if (json.hasOwnProperty('address')) { return json.address }
        let address = this.#getAddressFirst(json.description)
        if (address) { return address }
        if (json.hasOwnProperty('fields')) {
            for (const field of json.fields) {
                console.debug(field)
                if ('モナコイン' == field.key || 'MONACOIN' == field.key.toUpperCase()) {
                    address = this.#getAddressFirst(field.value)
                    if (address) { return address }
                }
            }
        }
        return ''
    }
    #getAddressFirst(str) {
        if(typeof str === 'string' || str instanceof String) {
            const founds = str.match(this._addressRegExp)
            console.debug(founds)
            if (Array.isArray(founds) && 0 < founds.length) { return founds[0] }
        }
        return null
    }
    #makeDescription(json, address) { return this.#autoLink(json.description) + this.#makeFields(json, address) }
    #autoLink(text) {
        const html = []
        console.debug(text)
        if(typeof text === 'string' || text instanceof String) {
            for (const line of text.split('\n')) {
                if (line.startsWith('https://')) {
                    html.push(this.#link(line))
                } else { html.push(line) }
            }
            return html.join('<br>')
        } else { return '' }
    }
    #link(url, text=null) { return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text || url}</a>` }
    #makeFields(json, address) {
        if (!json.hasOwnProperty('fields')) { return '' }
        const tr = []
        for (const field of json.fields) {
            const value = (field.value.startsWith('https://')) ? this.#link(field.value) : (this.#getAddressFirst(field.value)) ? `${this.#makeMpurseSendButton(address)}${address}` : field.value
            tr.push(`<tr><th>${field.key}</th><td>${value}</td></tr>`)
        }
        return `<table class="profile-field-table">${tr.join('')}</table>`
    }
}

