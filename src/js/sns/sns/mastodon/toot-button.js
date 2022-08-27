class TootButton extends HTMLElement {
    constructor(domain) {
        super();
        this.domain = domain
        this.status = ''
        this.imgSrc = null
        this.imgSize = '64'
        this.title = 'トゥートする'
        this.okMsg = 'トゥートしました！'
        this.ngMsg = 'キャンセルしました。'
        this._authorizer = null
        this._client = null
    }
    static get observedAttributes() {
        return ['domain', 'status', 'img-src', 'img-size', 'title', 'ok-msg', 'ng-msg'];
    }
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) { return; }
        if ('img-src' === property) { this.imgSrc = newValue}
        else if ('img-size' === property) { this.imgSize = newValue}
        else if ('ok-msg' === property) { this.okMsg = newValue}
        else if ('ng-msg' === property) { this.ngMsg = newValue}
        else { this[property] = newValue; }
    }
    async connectedCallback() {
        //const shadow = this.attachShadow({ mode: 'closed' });
        const shadow = this.attachShadow({ mode: 'open' }); // マウスイベント登録に必要だった。CSS的にはclosedにしたいのに。
        const gen = new TootButtonGenerator(this.domain, this.imgSrc, this.imgSize, this.title)
        shadow.innerHTML = await gen.generate()
        this.shadowRoot.querySelector('img').addEventListener('animationend', (e)=>{ e.target.classList.remove('jump'); e.target.classList.remove('flip'); }, false);
        this.#addListenerEvent()
    }
    #tootEvent(json) { 
        const params = {
            domain: this.domain,
            json: json,
        }
        console.log(json.url)
        if (WebmentionRequester) {
            new WebmentionRequester().request(json.url)
        }
        this.dispatchEvent(new CustomEvent('toot', {detail: params}));
    }
    #addListenerEvent() { // トゥートボタンを押したときの動作を実装する
        //this.addEventListener('pointerdown', async(event) => {
        this.addEventListener('click', async(event) => { console.debug('click toot-button'); await this.#toot(event.target) });
        // clickとあわせて２回発行されてしまう！　もうスマホ側は知らん。
        //this.addEventListener('pointerdown', async(event) => { console.debug('pointer-down toot-button'); this.dispatchEvent(new Event('click')) });
        //this.addEventListener('pointerdown', async(event) => { this.#toot() });
    }
    #getStatus() {
        if (this.status) { return this.status }
        // toot-dialogのtoot-status要素から取得しようと思ったが、shadow要素のためか取得できなかった。
    }
    async #toot(target) {
        console.debug('トゥートボタンを押しました。')
        const status = this.#getStatus()
        console.debug(status)
        if (!status || 0 === status.trim().length) {
            Toaster.toast('トゥート内容を入れてください。', true)
            return
        }
        //event.target.classList.add('jump');
        target.classList.add('jump');
        const [domain, json] = (this.domain) ? [this.domain, MastodonInstance.request(this.domain)] : await MastodonInstance.get()
        if (!domain || !json) { Toaster.toast(`指定したURLやドメイン ${domain} はmastodonのインスタンスでない可能性があります。\napi/v1/instanceリクエストをしても想定した応答が返ってこなかったためです。\n入力したURLやドメイン名がmastodonのインスタンスであるか確認してください。あるいはmastodonの仕様変更が起きたのかもしれません。対応したソースコードを書き換えるしかないでしょう。`, true); return; }
        this.domain = domain
        console.debug(domain)
        const authorizer = new MastodonAuthorizer(domain, 'write:statuses')
        authorizer.authorize(['status'], [{status:status}])
    }
}
window.addEventListener('DOMContentLoaded', (event) => {
    customElements.define('toot-button', TootButton);
});
class TootButtonGenerator {
    constructor(domain, imgSrc, imgSize, title) {
        this.domain = domain
        this.imgSrc = imgSrc
        this.imgSize = imgSize
        this.title = title
    }
    async generate() {
        const button = await this.#make()
        return `<style>${this.#cssBase()}${this.#cssButton()}${this.#cssAnimation()}${this.#cssFocsAnimation()}</style>${button.outerHTML}` 
    }
    #cssBase() { return `img{cursor:pointer; text-align:center; vertical-align:middle; user-select:none;}` }
    #cssButton() { return `
button {
    width: auto;
    padding: 0;
    margin: 0;
    background: none;
    border: 0;
    font-size: 0;
    line-height: 0;
    overflow: visible;
    cursor: pointer;
}`
}
    #cssAnimation() { return `
@keyframes jump {
  from {
    position:relative;
    bottom:0;
    transform: rotateY(0);
  }
  45% {
    position:relative;
    bottom: ${this.imgSize*2}px;
  }
  55% {
    position:relative;
    bottom: ${this.imgSize*2}px;
  }
  to {
    position:relative;
    bottom: 0;
    transform: rotateY(720deg);
  }
}
.jump {
  transform-origin: 50% 50%;
  animation: jump .5s linear alternate;
}
@keyframes flip {
  from {
    transform: rotateY(0);
  }
  to {
    transform: rotateY(180deg);
  }
}
.flip {
  transform-origin: 50% 50%;
  animation: flip .20s linear alternate;
}`; }
    #cssFocsAnimation() { return `
button {
  width: ${this.imgSize}px;
  height: ${this.imgSize}px;
}
/* アニメが完了するまでクリックできなくなる
button:focus {
  transform-origin: 50% 50%;
  animation: flip .20s linear alternate;
}
*/
button, button img {
  width: ${this.imgSize}px;
  height: ${this.imgSize}px;
  z-index: 1;
}
button:focus, button:focus img {
  width: ${this.imgSize * 1.5}px;
  height: ${this.imgSize * 1.5}px;
  z-index: 9999;
  vertical-align:bottom;
}
`
    }
    async #make() {
        const button = await this.#makeSendButton()
        const img = this.#makeSendButtonImg()
        button.appendChild(img)
        return button
    }
    #makeSendButtonA() {
        const a = document.createElement('a')
        a.setAttribute('title', this.title)
        a.setAttribute('class', `vov swivel-horizontal-double`) // アニメーション用
        return a
    }
    #makeSendButton() {
        const button = document.createElement('button')
        button.setAttribute('type', 'button')
        button.setAttribute('title', (this.domain) ? `${this.domain}へトゥートする` : `任意のインスタンスへトゥートする`)
        return button
    }
    #makeSendButtonImg() {
        const img = document.createElement('img')
        const size = this.#parseImgSize()
        const [width, height] = this.#parseImgSize()
        img.setAttribute('width', `${width}`)
        img.setAttribute('height', `${height}`)
        img.setAttribute('src', `${this.#getImgSrc()}`)
        //img.classList.add('flip'); // 初回アニメーション用
        return img
    }
    #getImgWidth() { return parseInt( (0 <= this.imgSize.indexOf('x')) ? this.imgSize.split('x')[0] : this.imgSize) }
    #getImgHeight() { return parseInt( (0 <= this.imgSize.indexOf('x')) ? this.imgSize.split('x')[1] : this.imgSize) }
    #parseImgSize() {
        if (0 <= this.imgSize.indexOf('x')) { return this.imgSize.split('x').map(v=>(parseInt(v)) ? parseInt(v) : 64) }
        else { return (parseInt(this.imgSize)) ? [parseInt(this.imgSize), parseInt(this.imgSize)] : [64, 64] }
    }
    #getImgSrc() {
        console.debug(this.domain, this.imgSize)
        if (this.imgSrc) { return this.imgSrc }
        //return `http://www.google.com/s2/favicons?domain=${this.domain}`
        if (this.domain) { return `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${this.domain}&size=${this.imgSize}` }
        return `./asset/image/mastodon_mascot.svg`
    }
}
