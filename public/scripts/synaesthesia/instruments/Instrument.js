/**
 * instruments/Instrument.js
 * Ported from wheelibin/synaesthesia (MIT License)
 * Adapted for Tone.js v14 (toDestination instead of toMaster).
 */

export class Instrument {
    constructor(synth, volume = 0, destinationNode = null) {
        this.synth = synth;
        if (destinationNode) {
            this.synth.connect(destinationNode);
        } else {
            this.synth.toDestination();
        }
        this.synth.volume.value = volume;
    }

    triggerAttackRelease(note, duration, time) {
        if (note) {
            this.synth.triggerAttackRelease(note, duration, time);
        } else {
            this.synth.triggerAttackRelease(duration, time);
        }
    }
}
