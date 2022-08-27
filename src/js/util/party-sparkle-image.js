class PartySparkleImage {
    static setup(format='png', size=32) {
        const ids = [
            'monar',
            'monar-transparent',
            'monar-no-face',
            'monar-mouth-red',
            'monar-mark',
            'monar-mark-white',
            'mark',
            'mark-outline',
            'coin-monar',
            'coin-monar-mouth-red',
            'coin-mini-monar',
            'coin-mini-monar-mouth-red',
            'coin-mark',
            'coin-mark-black',
        ]
        for (const id of ids) {
           // const url = `./asset/image/monacoin/png/64/${id}.png`
            const url = `./asset/image/monacoin/${format}${('png'==format) ? '/' + ((64 < size) ? 256 : 64) : ''}/${id}.${format}`
            //console.debug(url)
            party.resolvableShapes[id] = this.img(url, size).outerHTML
            //console.debug(id, party.resolvableShapes[id])
        }
    }
    static img(src, size=32) {
        const img = document.createElement("img")
        img.setAttribute('src', src)
        img.setAttribute('width', size)
        img.setAttribute('height', size)
        return img
    }
    static async svgText() {
        const res = await fetch(`./asset/image/monacoin/svg/monar.svg`)
        const svg = await res.text()
        const shape = document.createElement("span")
        shape.innerHTML = svg
        return shape.innerHTML
        //return shape.querySelector(`svg`)
    }
    static async animate(runButton, options) {
        const img = document.createElement("img")
        img.setAttribute('src', options.src)
        img.setAttribute('width', options.size)
        img.setAttribute('height', options.size)
        party.scene.current.createEmitter({
            emitterOptions: {
                loops: 1,
                useGravity: false,
                modules: [
                    new party.ModuleBuilder()
                        .drive("rotation")
                        .by((t) => new party.Vector(0, 0, 100).scale(t))
                        .relative()
                        .build(),
                    new party.ModuleBuilder()
                        .drive("opacity")
                        .by(
                            new party.NumericSpline(
                            { time: 0, value: 1 },
                            { time: 0.5, value: 1 },
                            { time: 1, value: 0 },
                            )
                        )
                        .through("relativeLifetime")
                        .build(),
                ],
            },
            emissionOptions: {
                rate: 0,
                bursts: [{ time: 0, count: party.variation.range(30, 40), }],
                sourceSampler: party.sources.dynamicSource(runButton),
                angle: party.variation.range(0, 360),
                initialLifetime: party.variation.range(1, 4), 
                initialSpeed: party.variation.range(100, 700),
                initialRotation: new party.Vector(0, 0, party.random.randomRange(0, 360)),
                initialColor: party.variation.gradientSample(
                    party.Gradient.simple(party.Color.fromHex("#ffa68d"), party.Color.fromHex("#fd3a84"))
                ),
            },

            rendererOptions: {
                shapeFactory: img,
                applyLighting: undefined,
            },
        });
    }
}
