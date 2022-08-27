// https://knmts.com/become-engineer-31/
// https://qiita.com/masakielastic/items/70516e074eadf2ce09dd
// GAS(GoogleAppsScript)はContent-Type:application/jsonだとCORSエラーになる。application/x-www-form-urlencodedまたはtext/plainでリクエストすべき。
class ProfileRegister {
    constructor() {
        //this.client = new RestClient()
        this.client = new GoogleAppsScriptClient()
    }
    #getUrl(address=null) {
        //const id = 'AKfycbwX4yM4sgjnsi7ImJA59bI2VQOGqsLDWpa8V8VgJOEBJGBJh1nhmRB3aBkyAbX46WtY' // doPostの引数eを確認する
        //const id = 'AKfycbwsoKbgKwuMUCsLXeVGifX2j5bDHyld3R7vfa78Qx3hTEhPtqq43ZgEdbg3UDUvRD4g8A' // application/json
        //const id = 'AKfycbyexo6zBrb9RbrUec1IHzpEE2rb5lyt6cihYDb3WcoqoGYF4KSJwzMMlWqzlrULh2UCmA' // application/x-www-form-urlencoded
        //const id = 'AKfycby5UbKTHwJEwi_TibDLFrK2eFvV4hHl4f2ka3CryFG-AXTzbMETsY4LZgtQf22O5KrI' // application/x-www-form-urlencoded
        //const id = 'AKfycbxvHdi488uV_z610g0B-ovXZfiFVZG3So2PaO9V5sZcSAbiLrUvw7laXlHCd85pxn6IoQ' // application/x-www-form-urlencoded
        //const id = 'AKfycbwNi0_gZlV2zwntsd7pjfh2eBKcFL4ceJ-mrD5_T4bGuAsD3Wgr-oMnaMqmt00PiJqQzA' // application/x-www-form-urlencoded
        //const id = 'AKfycbxBfQZ16WS9SQJVeVpoKMLGzWF8lakNuBXnad7-rbRRyOiRhkE_yDgCX6CxlbzrBpOGOQ' // GET method=count 追加
        //const id = 'AKfycby2S5NEH6QQSO1bT5cJieanUP7RumMI48QCkPhj3eROlaMtH6I4hIZ2yIYrdJkcZaAD4w' // POST 先頭行へ追加する
        const id = 'AKfycbySYK8TOQ4XtlkYb5_ayHMrPApvn-k1OoE6A5Tgw2mKQ2RhW1eATMPxVelXFHQyYsClrQ' // 枠線を引く
        const base = `https://script.google.com/macros/s/${id}/exec`
        if (address) { 
            const url = new URL(base)
            url.searchParams.set('address', address)
            return url.href
        }
        return base
    }
    //async get() { return await this.client.get(this.#getUrl()) }
    async get(address=null) { return await this.client.get(this.#getUrl(address)) }
    async getCount() {
        const url = new URL(this.#getUrl())
        url.searchParams.append('method', 'count')
        return await this.client.get(url.href)
    }
    #getPostData(address, profileJsonStr) { return {address: address, profile: profileJsonStr} }
    //post(data) { return this.client.post(url, null, data) }
    async post(address, profile) {
        //const body = JSON.stringify(params);
        //const body = url.searchParams.toString();
        const data = {}
        data.method = 'POST'
        //data.mode = 'no-cors' // Google Apps Script で CORS エラーになったので追加したが、HTTPステータス0で返りやがる
        //data.headers = this.getJsonHeaders(headers)
        //data.headers = this.getJsonHeaders()
        data.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        //if (params) { data.body = body }
        const params = new URLSearchParams();
        params.append('address', address)
        params.append('profile', JSON.stringify(profile))
        //data.body = params.toString();
        data.body = params;
        console.debug(this.#getUrl())
        console.debug(params)
        console.debug(data)
        //const res = await fetch(url, data)
        //const res = await fetch(url.href.split('?')[0], data)
        const res = await fetch(this.#getUrl(), data).catch(e=>console.error(e))
        console.debug(res)
        const json = await res.json()
        console.debug(json)
        console.debug(JSON.stringify(json))
        return json
        //return super.post(url, this.getJsonHeaders(headers), params)
    }
}
