// https://knmts.com/become-engineer-31/
// https://qiita.com/masakielastic/items/70516e074eadf2ce09dd
// GAS(GoogleAppsScript)はContent-Type:application/jsonだとCORSエラーになる。application/x-www-form-urlencodedまたはtext/plainでリクエストすべき。
class GoogleAppsScriptClient extends RestClient {
    constructor() { super() }
    getDefaultJsonHeaders() { return {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
    }}
    getJsonHeaders(headers=null) { return (headers) ? {...this.getDefaultJsonHeaders(), ...headers} : this.getDefaultJsonHeaders() }
    async get(url, headers) { return super.get(url, this.getJsonHeaders(headers)) }
    async post(url, headers) {
        //const body = JSON.stringify(params);
        const body = url.searchParams.toString();
        console.debug(url)
        const data = {}
        data.method = 'POST'
        //data.mode = 'no-cors' // Google Apps Script で CORS エラーになったので追加したが、HTTPステータス0で返りやがる
        data.headers = this.getJsonHeaders(headers)
        if (params) { data.body = body }
        console.debug(params)
        console.debug(data)
        //const res = await fetch(url, data)
        const res = await fetch(url.href.split('?')[0], data).catch(e=>console.error(e))
        console.debug(res)
        const json = await res.json()
        console.debug(json)
        console.debug(JSON.stringify(json))
        return json

        return super.post(url, this.getJsonHeaders(headers), params)
    }
}
