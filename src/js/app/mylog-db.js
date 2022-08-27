class MyLogDb {
    constructor() {
        /*
        this.version = 1
        this.name = `mylog-${this.version}.db`
        this.dexie = new Dexie(this.name)
        */
        this.now = new Date()
        //this.create()
        this.LENGTH = 140
        this.LINE = 15
    }
    /*
    create() {
        this.dexie.version(this.version).stores({
            comments: `++id`,
        })
    }
    */
    //async clear() { await this.dexie.comments.clear() }
    async clear() { await window.myApi.clear() }
    async delete(ids) {
        console.debug(ids)
        const isAll = (0===ids.length)
        const msg = ((isAll) ? `つぶやきをすべて削除します。` : `選択したつぶやきを削除します。`) + `\n本当によろしいですか？`
        if (confirm(msg)) {
            console.debug('削除します。')
            if (isAll) { console.debug('全件削除します。'); await window.myApi.clear() }
            else { console.debug('選択削除します。'); await window.myApi.delete(ids) }
            //if (isAll) { console.debug('全件削除します。'); await this.dexie.comments.clear() }
            //else { console.debug('選択削除します。'); for (const id of ids) { await this.dexie.comments.delete(id) } }
            //console.debug(await this.dexie.comments.toArray())
        }
    }
    async insert(content, address=null) {
        //const content = document.getElementById('content').value
        if (!content) { alert('つぶやく内容をテキストエリアに入力してください。'); return; }
        if (this.LENGTH < content.length) { alert(`つぶやく内容は${this.LENGTH}字以内にしてください。`); return; }
        const match = content.match(/\r\n|\n/g)
        if (match && this.LINE < match.length) { alert(`つぶやく内容は${this.LINE}行以内にしてください。`); return; }
        const now = Math.floor(new Date().getTime() / 1000)
        const r = window.myApi.insert({content:content, created:now});
        return TextToHtml.toHtml(r.id, r.content, r.created, address)
        //return this.#insertHtml(r.id, r.content, r.created)
    }
    /*
    async insert(content, now) {
        console.debug(`挿入`, content, now)
        const id = await this.dexie.comments.put({
            content: content,
            created: now,
        })
        console.debug(id, content, now)
        const address = (window.mpurse) ? await window.mpurse.getAddress() : null
        //return this.#insertHtml(id, content, now)
        return TextToHtml.toHtml(id, content, now, address) 
    }
    */
    #insertHtml(id, content, created) { return `<p>${this.#toContent(content)}<br>${this.#toTime(created)}${this.#toDeleteCheckbox(id)}</p>` }
    async toHtml(address=null) {
        const cms = await window.myApi.get()
        //cms.sort((a,b)=>b[0] - a[0])
        //cms.sort((a,b)=>b.created - a.created)
        //const address = (window.mpurse) ? await window.mpurse.getAddress() : null
        //return cms.map(c=>TextToHtml.toHtml(c.id, c.content, c.created, address)).join('')
        //return cms.map(c=>TextToHtml.toHtml(c.id, c.content, c.created)).join('')
        return cms.map(c=>TextToHtml.toHtml(c[0], c[1], c[2], address)).join('')
    }
    /*
    async toHtml() {
        const cms = await this.dexie.comments.toArray()
        cms.sort((a,b)=>b.created - a.created)
        //return cms.map(c=>this.#insertHtml(c.id, c.content, c.created)).join('')
        const address = (window.mpurse) ? await window.mpurse.getAddress() : null
        return cms.map(c=>TextToHtml.toHtml(c.id, c.content, c.created, address)).join('')
    }
    */
    #toTime(created) {
        const d = new Date(created * 1000)
        const u = d.toISOString()
        //const l = d.toLocaleString({ timeZone: 'Asia/Tokyo' }).replace(/\//g, '-')
        const l = this.#toElapsedTime(created)
        return `<time datetime="${u}" title="${u}">${l}</time>`
    }
    #toElapsedTime(created) { // 年、月、日が現在と同じなら省略する
        // 同じ日なら時間だけ表示
        // 同じ年なら月日だけ表示
        // それ以降なら年月日表示
        const d = new Date(created * 1000)
        console.debug(this.now.getTime() - created)
        console.debug(this.now.getYear()===d.getYear(), this.now.getMonth()===d.getMonth(), d.getDate() < this.now.getDate())
        console.debug(this.now.getYear(), d.getYear(), this.now.getMonth(), d.getMonth(), d.getDate(), this.now.getDate())
        if (d.getYear() < this.now.getYear()) { return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}` } // 一年間以上
        else if (this.now.getYear()===d.getYear() && this.now.getMonth()===d.getMonth() && d.getDate() < this.now.getDate()) {
            return `${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
        }
        else { return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}` } // 同じ日
    }
    #toContent(content) { return TextToHtml.toHtml(content) } 
    //#toContent(content) {
    //    return content.replace(/\r\n|\n/g, '<br>')
    //}
    #toDeleteCheckbox(id) {
        return `<label><input type="checkbox" name="delete" value="${id}">❌<label>`
    }
}
