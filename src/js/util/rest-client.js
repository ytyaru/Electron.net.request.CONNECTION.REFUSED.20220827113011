class RestClient {
    getDefaultJsonHeaders() { return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }}
    getJsonHeaders(headers=null) { return (headers) ? {...this.getDefaultJsonHeaders(), ...headers} : this.getDefaultJsonHeaders() }
    async sleep(ms=1000) { return new Promise(resolve => setTimeout(resolve, ms)); }
    async get(url, headers) {
        const data = {
            method: 'GET',
            //mode: 'no-cors', // Google Apps Script で CORS エラーになったので追加したが、HTTPステータス0で返りやがる
            headers: this.getJsonHeaders(headers),
        }
        console.debug(url)
        console.debug(data)
        const res = await fetch(url, data)
        console.debug(res)
        const json = await res.json()
        console.debug(json)
        console.debug(JSON.stringify(json))
        return json
    }
    async post(url, headers, params) {
        const body = JSON.stringify(params);
        console.debug(url)
        const data = {}
        data.method = 'POST'
        //data.mode = 'no-cors' // Google Apps Script で CORS エラーになったので追加したが、HTTPステータス0で返りやがる
        data.headers = this.getJsonHeaders(headers)
        if (params) { data.body = body }
        console.debug(params)
        console.debug(data)
        const res = await fetch(url, data)
        console.debug(res)
        const json = await res.json()
        console.debug(json)
        console.debug(JSON.stringify(json))
        return json
    }
}
