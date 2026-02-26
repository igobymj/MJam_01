/**
 * instruments/FastAttackSquare.js
 * Ported from wheelibin/synaesthesia bass.js (MIT License)
 * Adapted for Tone.js v14.
 */

import { Instrument } from "./Instrument.js";

export class FastAttackSquare extends Instrument {
    constructor(destinationBus) {
        super(
            new Tone.Synth({
                oscillator: { type: "square4" },
                envelope: {
                    attack: 0.02,
                    decay: 0,
                    sustain: 1,
                    release: 1
                }
            }),
            -22
        );
        // Connect the compressor to the bus, and the synth to the compressor
        this.comp = new Tone.Compressor(-30, 12);
        if (destinationBus) {
            this.comp.connect(destinationBus);
        } else {
            this.comp.toDestination();
        }

        // Instrument super() connected synth to destinationBus, but we want it to go through compressor.
        this.synth.disconnect();
        this.synth.connect(this.comp);
    }
}
