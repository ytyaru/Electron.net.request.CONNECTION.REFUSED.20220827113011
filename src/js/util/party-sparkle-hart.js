class PartySparkleHart {
    static setup() {
        party.resolvableShapes['hart'] = this.svg().outerHTML
        //console.debug(party.resolvableShapes['hart'])
    }
    static svg() { 
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute(
            "d",
            "M316.722,29.761c66.852,0,121.053,54.202,121.053,121.041c0,110.478-218.893,257.212-218.893,257.212S0,266.569,0,150.801 C0,67.584,54.202,29.761,121.041,29.761c40.262,0,75.827,19.745,97.841,49.976C240.899,49.506,276.47,29.761,316.722,29.761z"
        );
        const shape = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        shape.setAttribute("viewBox", "0 0 512 512");
        shape.setAttribute("height", "20");
        shape.setAttribute("width", "20");
        shape.appendChild(path);
        return shape
    }
    static animate(runButton) {
        party.scene.current.createEmitter({
            emitterOptions: {
                loops: 1,
                useGravity: false,
                modules: [
                    new party.ModuleBuilder()
                        .drive("size")
                        .by((t) => 0.5 + 0.3 * (Math.cos(t * 10) + 1))
                        .build(),
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
                //bursts: [{ time: 0, count: party.variation.skew(20, 10) }],
                bursts: [{ time: 0, count: party.variation.range(40, 50) }],
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
                shapeFactory: this.svg(),
                applyLighting: undefined,
            },
        });
    }
}
