class MonaTransactionClient extends RestClient {
    constructor() { super() }
    async get(address) {
        const url = 'https://mpchain.info/api/cb/'
        const params = {
            "id": 0,
            "jsonrpc": "2.0",
            "method": "proxy_to_counterpartyd",
            "params": {
                "method": "search_raw_transactions", 
                "params": {
                    "address": address,
                }
            }
        }
        return await super.post(url, null, params)
    }
}
