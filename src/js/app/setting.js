class Setting {
    static PATH = `src/db/setting.json`
    static async load() {
        const isExist = await window.myApi.exists(this.PATH)
        if (!isExist) { await window.myApi.writeFile(this.PATH, JSON.stringify(
            {mona:{address:""},github:{username:"",token:"",repo:""}}
        )) }
        return JSON.parse(await window.myApi.readTextFile(this.PATH))
    }
    static async save(obj) { return await window.myApi.writeFile(this.PATH, JSON.stringify(obj)) }
}
