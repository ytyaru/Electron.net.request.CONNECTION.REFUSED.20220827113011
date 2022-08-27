# net error

　GitHub APIでリモートリポジトリを発行しようとしたら突然以下のエラーダイアログが出た。

```
A JavaScript error occurred in the main process

Uncaught Exception:
Error: net:ERR_CONNECTION_REFUSED
  at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/browser_init:101:7169)
  at SimpleURLLoaderWrapper.emit (node:events:527:28)
```

　画面キャプチャしたが一応テキストもここに残す。コピーできなかったので手書きした。

　原因不明。対処不明。

## 再挑戦するも同じエラー

* [Electronのnet.requestで謎エラー（net:ERR_CONNECTION_REFUSED）][]

　上記のときに`net:ERR_CONNECTION_REFUSED`ダイアログエラーが出た。

　その後、以下のとき、[createRepo][]するときは[User agent の必要性][]があると判明した。

* [ElectronでNode.jsのhttps.requestを試す][]

　なら、`User-Agent`をつければイケるのでは？

　そこで今回、改めて`User-Agent`をセットした上で[net.request][]を試してみた。結果は同じ`net:ERR_CONNECTION_REFUSED`エラーだった。ちなみに`Content-Type`はつけても外しても同様のエラーだった。

[Electronのnet.requestで謎エラー（net:ERR_CONNECTION_REFUSED）]:https://monaledge.com/article/498
[ElectronでNode.jsのhttps.requestを試す]:https://monaledge.com/article/500
[createRepo]:https://docs.github.com/ja/rest/repos/repos#create-a-repository-for-the-authenticated-user
[User agent の必要性]:https://docs.github.com/ja/rest/overview/resources-in-the-rest-api#user-agent-required

## src/js/app/github/github.js

　コード抜粋。

```javascript
await window.myApi.request({
    'method': 'POST',
    url: 'https://api.github.com/user/repos',
    headers: {
        'Authorization': `token ${this.token}`,
        'User-Agent': `${this.username}`,
        'Content-Type': 'application/json',
    },
    "body": params,
},(json, res)=>{
    console.debug(res)
    console.debug(json)
},(res)=>{
    console.debug(res)
})
```

　[Electronのnet.requestで謎エラー（net:ERR_CONNECTION_REFUSED）][]のときと比べて`User-Agent`と`Content-Type`を追加した。でも結果は変わらなかった。

　さらに、念の為`"body": params,`を`"body": JSON.stringify(params)`に変えて文字列化してみたが、同じエラーだった。

