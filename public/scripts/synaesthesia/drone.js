/**
 * drone.js
 * Ported and adapted from wheelibin/synaesthesia (MIT License)
 * https://github.com/wheelibin/synaesthesia
 *
 * Simplified for MJam_01: one continuous drone loop, no root-change pattern.
 * Tone.js v14 API (toDestination, Tone.getDestination, etc.)
 */

import { randomFromArray, shuffleArray } from "./utils.js";
import { getRandomRootNote, getRandomScaleType, actualNotesFromScale } from "./scales.js";
import { FastAttackSquare } from "./instruments/FastAttackSquare.js";

// ------------------------------------------------------------------
// Helper: create an FM oscillator connected to the droneBus
// ------------------------------------------------------------------
const fmOscillator = (note, volume = 0, bus) => {
    const oscType = randomFromArray(["sine", "square4"]);
    const osc = new Tone.FMOscillator(note, oscType, "square");
    osc.volume.value = volume;
    osc.connect(bus);
    osc.start();
    return osc;
};

const transpose = (freq, semitones) => {
    return Tone.Frequency(freq).transpose(semitones);
};

// ------------------------------------------------------------------
// play() — starts the drone, returns a stop() function
// ------------------------------------------------------------------
export const play = () => {
    // Start silent and fade in over 2 seconds
    const droneBus = new Tone.Volume(-100).toDestination();
    droneBus.volume.rampTo(-32, 2);

    const config = {
        lowestOscVolume: -50,
        changeFrequencyInterval: "4m",
        changeVolumeInterval: "3m",
        bassInterval: "4m",
        harmonyInterval: "7m",
        harmonyFadeOutTime: "+2:0:0",
        harmonyOscVolume: -4,
        extraOscillatorInterval: "6m",
        extraOscillatorFadeOutTime: "+2:2:0",
    };

    // --- Music theory setup ---
    const masterScale = getRandomScaleType();
    const root = getRandomRootNote();
    const rootFreq = Tone.Frequency(root + "0");
    const oscScale = actualNotesFromScale(rootFreq.toNote(), masterScale.intervals, 2, 3);
    const harmonyNotes = shuffleArray(actualNotesFromScale(rootFreq.toNote(), masterScale.intervals, 3, 3));

    console.log(`[drone] Root: ${root}  Scale: ${masterScale.type}`);

    // --- Oscillator stack ---
    const harmonyOscillator = fmOscillator(rootFreq, config.lowestOscVolume, droneBus);
    const oscRoot = fmOscillator(rootFreq, 0, droneBus);
    const oscRootO2 = fmOscillator(transpose(rootFreq, 12), 0, droneBus);
    const oscRootO3 = fmOscillator(transpose(rootFreq, 24), 0, droneBus);
    const osc3 = fmOscillator(oscScale[2], config.lowestOscVolume, droneBus);
    const osc5 = fmOscillator(oscScale[4], config.lowestOscVolume, droneBus);
    const osc7 = fmOscillator(oscScale[6], config.lowestOscVolume, droneBus);
    const osc9 = fmOscillator(oscScale[8], config.lowestOscVolume, droneBus);
    const osc11 = fmOscillator(oscScale[10], config.lowestOscVolume, droneBus);
    const osc13 = fmOscillator(oscScale[12], config.lowestOscVolume, droneBus);

    const oscillatorsWithEffects = [harmonyOscillator, oscRoot, oscRootO2, oscRootO3, osc3, osc5, osc7, osc9, osc11, osc13];
    const oscillatorsWithFrequencyChange = [...oscillatorsWithEffects];
    const oscillatorsWithVolumeChange = [oscRoot, oscRootO2, oscRootO3, osc3];
    const extraOscillators = [osc5, osc7, osc9, osc11, osc13];

    // --- Effects chain ---
    const chorus = new Tone.Chorus(2, 2.5, 0.5).connect(droneBus);
    const reverb = new Tone.Reverb().connect(droneBus);
    const phaser = new Tone.Phaser({ frequency: 0.2 }).connect(droneBus);

    oscillatorsWithEffects.forEach(osc => {
        osc.connect(chorus);
        osc.connect(phaser);
        osc.connect(reverb);
        osc.frequencyChangeActive = true;
        osc.volumeChangeActive = true;
    });

    // --- Bass pattern ---
    const bassInstrument = new FastAttackSquare(droneBus);
    const bassNotes = actualNotesFromScale(rootFreq.toNote(), masterScale.intervals, 1, 2);
    const bassPattern = new Tone.Pattern(
        (time, note) => {
            bassInstrument.triggerAttackRelease(note, config.bassInterval, time);
        },
        bassNotes,
        "randomWalk"
    );
    bassPattern.interval = config.bassInterval;
    bassPattern.start();

    // --- Frequency drift loop ---
    const frequencyChangeLoop = new Tone.Loop(() => {
        const osc = randomFromArray(oscillatorsWithFrequencyChange);
        const amount = osc.frequencyChangeActive ? 0.125 : -0.125;
        osc.frequency.exponentialRampTo(
            Tone.Frequency(osc.frequency.value).transpose(amount),
            "+0:2:0"
        );
        osc.frequencyChangeActive = !osc.frequencyChangeActive;
    }, config.changeFrequencyInterval);
    frequencyChangeLoop.start(config.changeFrequencyInterval);

    // --- Volume swell loop ---
    const volumeChangeLoop = new Tone.Loop(() => {
        oscillatorsWithVolumeChange.forEach(osc => {
            osc.volume.exponentialRampTo(0, "+1:0:0");
        });
        const osc = randomFromArray(oscillatorsWithVolumeChange);
        osc.volume.exponentialRampTo(-6, "+1:0:0");
    }, config.changeVolumeInterval);
    volumeChangeLoop.start(config.changeVolumeInterval);

    // --- Pink noise bed ---
    const noise = new Tone.Noise("pink").start();
    noise.volume.value = -20;
    const noiseFilter = new Tone.AutoFilter({ frequency: "8m", baseFrequency: 800, octaves: 4 }).connect(droneBus).start();
    noise.connect(noiseFilter);

    const noiseVolumeLfo = new Tone.LFO("9m", -22, -18).start();
    noiseVolumeLfo.connect(noise.volume);

    // --- Reverb modulation ---
    const reverbRoomSizeLfo = new Tone.LFO("7m", 0.7, 0.9).start();
    // Tone v14: reverb doesn't expose roomSize signal directly — modulate wet instead
    reverbRoomSizeLfo.connect(reverb.wet);

    // --- Extra oscillator fade loop ---
    const extraOscillatorLoop = new Tone.Loop(() => {
        const featured = randomFromArray([...extraOscillators]);
        extraOscillators.forEach(osc => {
            if (osc !== featured) osc.volume.rampTo(config.lowestOscVolume, "1m");
        });
        Tone.Transport.scheduleOnce(time => {
            featured.volume.rampTo(0, "1m", time);
        }, config.extraOscillatorFadeOutTime);
    }, config.extraOscillatorInterval);
    extraOscillatorLoop.start(config.extraOscillatorInterval);

    // --- Harmony oscillator loop ---
    const harmonyOscillatorLoop = new Tone.Loop(time => {
        const note = harmonyNotes.shift();
        harmonyOscillator.frequency.value = note;
        harmonyOscillator.volume.rampTo(config.harmonyOscVolume, "1m", time);
        Tone.Transport.scheduleOnce(t => {
            harmonyOscillator.volume.rampTo(config.lowestOscVolume, "1m", t);
        }, config.harmonyFadeOutTime);
        harmonyNotes.push(note);
    }, config.harmonyInterval);
    harmonyOscillatorLoop.start(config.harmonyInterval);

    // --- Start Transport ---
    Tone.Transport.bpm.value = 70;
    Tone.Transport.swing = 0;
    Tone.Transport.start();

    // --- Return stop function ---
    let isStopping = false;
    return () => {
        if (isStopping) return;
        isStopping = true;

        // 1. Stop all generative loops from scheduling new notes
        bassPattern.stop();
        frequencyChangeLoop.stop();
        volumeChangeLoop.stop();
        extraOscillatorLoop.stop();
        harmonyOscillatorLoop.stop();

        // 2. Fade out the entire drone bus gently over 3 seconds
        droneBus.volume.rampTo(-100, 3);

        // 3. Teardown everything after the fade completes
        setTimeout(() => {
            oscillatorsWithEffects.forEach(osc => {
                try { if (osc.state === "started") osc.stop(); } catch (e) { }
                try { osc.dispose(); } catch (e) { }
            });
            [noise, noiseFilter, noiseVolumeLfo, reverbRoomSizeLfo,
                frequencyChangeLoop, volumeChangeLoop,
                extraOscillatorLoop, harmonyOscillatorLoop, bassPattern,
                chorus, reverb, phaser].forEach(node => {
                    try { if (node) node.dispose(); } catch (e) { }
                });
            try { if (bassInstrument.synth) bassInstrument.synth.dispose(); } catch (e) { }
            try { if (bassInstrument.comp) bassInstrument.comp.dispose(); } catch (e) { }
            try { if (droneBus) droneBus.dispose(); } catch (e) { }
        }, 3200); // Wait slightly longer than the fade
    };
};
