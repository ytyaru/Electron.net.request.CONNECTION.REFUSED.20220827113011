class MpurseSendButton extends HTMLElement {
    constructor(options) {
        super();
        try {
            window.mpurse.updateEmitter.removeAllListeners()
              .on('stateChanged', isUnlocked => this.stateChanged(isUnlocked))
              .on('addressChanged', address => this.addressChanged(address));
        } catch(e) { console.debug(e) }
        this.to = 'MEHCqJbgiNERCH3bRAtNSSD9uxPViEX1nu'
        this.amount = '0.11411400'
        this.asset = 'MONA'
        this.memo = ''
        this.ok = '投げモナしました！\nありがとうございます！（ ´∀｀）'
        this.cancel = 'キャンセルしました(´・ω・｀)'
        this.baseUrl = './src/asset/image/monacoin/'
        this.party = 'confetti'
        this.partySrc = null
        this.partySrcId = 'monar'
        this.partySize = '32'
        this.format = 'svg'
        this.src = null
        this.srcId = 'coin-monar'
        this.size = 64
        this.title = '投げモナする'
        this.alt = '投げモナする'
        if (!this.baseUrl.endsWith('/')) { this.baseUrl += '/' }
        if (PartySparkleHart) { PartySparkleHart.setup() }
        if (PartySparkleImage) { PartySparkleImage.setup(this.format, this.partySize) }
    }
    static get observedAttributes() {
        return ['to', 'asset', 'amount', 'memo', 'src', 'size', 'title', 'ok', 'cancel', 'src-id', 'base-url', 'format', 'party', 'party-src', 'party-src-id', 'party-size'];
    }
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) { return; }
        const isChainCase = property.includes('-')
        const nums = ['size', 'party-size']
        const name = (isChainCase) ? property.split('-').map((s,i)=>(0===i) ? s.toLowerCase() : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join('') : property
        const value = (nums.includes(property)) ? Number(newValue) : newValue
        this[name] = value
        if ('base-url' === property) {
            if (!this.baseUrl.endsWith('/')) { this.baseUrl += '/' }
        }
        else if ('party-size' === property || 'format' === property) {
            if (PartySparkleImage) { PartySparkleImage.setup(this.format, this.partySize) }
        }
    }
    async connectedCallback() {
        const shadow = this.attachShadow({ mode: 'open' }); // マウスイベント登録に必要だった。CSS的にはclosedにしたいのに。
        const button = await this.#make()
        await this.#makeClickEvent()
        shadow.innerHTML = `<style>${this.#cssBase()}${this.#cssAnimation()}</style>${button.outerHTML}` 
        this.shadowRoot.querySelector('img,object').addEventListener('animationend', (e)=>{ e.target.classList.remove('jump'); }, false);
    }
    #cssBase() { return `a{display:inline-block;cursor:pointer;}object{pointer-events:none;}img,object{text-align:center; vertical-align:middle; user-select:none;}` }
    #cssAnimation() { return `
@keyframes jump {
  from {
    position:relative;
    bottom:0;
    transform: rotateY(0);
  }
  45% {
    position:relative;
    bottom: ${this.size*2}px;
  }
  55% {
    position:relative;
    bottom: ${this.size*2}px;
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
`; }
    stateChanged(isUnlocked) {
        console.debug(`Mpurseのロック状態が変更されました：${isUnlocked}`)
    }
    addressChanged(address) {
        console.debug(`Mpurseのログイン中アドレスが変更されました：${address}`)
        this.to = address
        this.#make().then(
            result=>{this.innerHTML = ''; this.appendChild(result); }, 
            error=>{console.debug('アドレス変更に伴いボタン更新を試みましたが失敗しました。', e);})
    }
    async #make() {
        const a = await this.#makeSendButtonA()
        const img = this.#makeImgObj()
        a.appendChild(img)
        return a
    }
    #makeImgObj() {
        if (this.src) {
            if (this.src.endsWith('svg')) { return this.#makeSendButtonObject() }
            return this.#makeSendButtonImg()
        }
        if (this.format) {
            if ('svg'===this.format) { return this.#makeSendButtonObject() }
        }
        return this.#makeSendButtonImg()
    }
    #makeSendButtonA() {
        const a = document.createElement('a')
        a.setAttribute('title', this.title)
        return a
    }
    #makeSendButtonImg() {
        const img = document.createElement('img')
        img.setAttribute('width', `${this.size}`)
        img.setAttribute('height', `${this.size}`)
        img.setAttribute('src', `${this.#getImgSrc()}`)
        img.setAttribute('alt', `${this.alt}`)
        return img
    }
    // https://qiita.com/manabuyasuda/items/01a76204f97cd73ffc4e#object%E3%82%BF%E3%82%B0%E3%81%A7%E3%83%95%E3%82%A9%E3%83%BC%E3%83%AB%E3%83%90%E3%83%83%E3%82%AF%E3%81%99%E3%82%8B
    #makeSendButtonObject() { // SVG内のCSSを有効化するためにはimgでなくobjectを使う必要がある
        const object = document.createElement('object')
        object.setAttribute('type', `image/svg+xml`)
        object.setAttribute('data', `${this.#getImgSrc()}`)
        object.setAttribute('width', `${this.size}`)
        object.setAttribute('height', `${this.size}`)
        // PNGでフォールバックする（SVGが表示できなければPNGで表示する）
        const png = document.createElement('object')
        png.setAttribute('type', `image/png`)
        png.setAttribute('data', `${this.baseUrl}png/${((64 < this.size) ? 256 : 64)}/${this.srcId}.png`)
        png.setAttribute('width', `${this.size}`)
        png.setAttribute('height', `${this.size}`)
        object.appendChild(png)
        return object
    }
    #getImgSrc() {
        if (this.src) { return this.src }
        return `${this.baseUrl}${this.format}${('svg'==this.format) ? '' : '/' + ((64 < this.size) ? 256 : 64)}/${this.srcId}.${this.format}`
    }
    async #makeClickEvent() {
        const to = this.to
        const asset = this.asset
        const amount = Number(this.amount)
        const memoType = (this.memo) ? 'plain' : 'no' // 'no', 'hex', 'plain'
        const memo = this.memo
        this.addEventListener('pointerdown', async(event) => {
            console.debug(`クリックしました。\n宛先：${to}\n金額：${amount} ${asset}\nメモ：${memo}`)
            event.target.shadowRoot.querySelector('img,object').classList.add('jump')
            //this.#party()
            const txHash = await window.mpurse.sendAsset(to, asset, amount, memoType, memo).catch((e) => null);
            if (!txHash) { Toaster.toast(this.cancel); }
            else {
                console.debug(`送金しました。\ntxHash: ${txHash}\n宛先：${to}\n金額：${amount} ${asset}\nメモ：${memo}`)
                this.#party()
                Toaster.toast(this.okMsg);
            }
        });
    }
    #party() {
        if (!party) { return }
        const target = this.shadowRoot.querySelector('img')
        switch(this.party) {
            case 'no':
            case 'none':
            case 'off': break;
            case 'on':
            case 'confetti':
            case 'confetti-square':
                this.#confetti(target, ['square']); break;
            case 'confetti-star':
                this.#confetti(target, ['star']); break;
            case 'confetti-hart':
                this.#confetti(target, ['hart']); break;
            case 'confetti-img':
                this.#confetti(target, [this.partySrc]); break;
            case 'confetti-mix':
                this.#confetti(target, ['star','hart',this.partySrc]); break;
            case 'sparkle':
            case 'sparkle-star':
                party.sparkles(target,{
                    lifetime: party.variation.range(2, 3),
                    count: party.variation.range(30, 40),
                    speed: party.variation.range(100, 500),
                    //size: party.variation.range(1, 3),
                }); break;
            case 'sparkle-hart': PartySparkleHart.animate(target); break;
            case 'sparkle-img': PartySparkleImage.animate(target, {src:this.#getPartySrcUrl() || this.src, size:this.partySize}); break;
            default: this.#confetti(target, ['square']); break;
        }
    }
    #confetti(target, shapes) {
        party.confetti(target,{
            shapes: shapes,
            lifetime: party.variation.range(5, 7),
            count: party.variation.range(80, 100),
            speed: party.variation.range(100, 700),
        })
    }
    #getPartySrcUrl() {
        if(this.partySrc) { return this.partySrc }
        return `${this.baseUrl}${this.format}${('svg'==this.format) ? '' : '/' + ((64 < this.size) ? 256 : 64)}/${this.partySrcId}.${this.format}`
    }
}
window.addEventListener('DOMContentLoaded', (event) => {
    customElements.define('mpurse-send-button', MpurseSendButton);
});

