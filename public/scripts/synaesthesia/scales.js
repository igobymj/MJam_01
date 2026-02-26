/**
 * scales.js
 * Ported from wheelibin/synaesthesia (MIT License)
 * Adapted for ES module / browser use — Tone accessed via window global (CDN build).
 */

import { randomIntBetween, isNumeric, randomFromArray } from "./utils.js";

// prettier-ignore
const roots = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

export const scales = {
    Major: [2, 2, 1, 2, 2, 2],
    Minor: [2, 1, 2, 2, 1, 2],
    HarmonicMinor: [2, 1, 2, 2, 1, 3],
    Dorian: [2, 1, 2, 2, 2, 1],
    Mixolydian: [2, 2, 1, 2, 2, 1],
    Phrygian: [1, 2, 2, 2, 1, 2],
    Lydian: [2, 2, 2, 1, 2, 2],
    PentatonicMinor: [3, 2, 2, 3],
    Blues: [3, 2, 1, 1, 3],
};

export const getRandomRootNote = () => {
    return roots[randomIntBetween(0, roots.length - 1)];
};

export const getRandomScaleType = () => {
    const keys = Object.keys(scales);
    const randomType = keys[(keys.length * Math.random()) << 0];
    return { type: randomType, intervals: scales[randomType] };
};

/**
 * Returns an array of note strings (e.g. "C3", "D3", ...) spanning lowOctave to highOctave.
 */
export const actualNotesFromScale = (tonic, scale, lowOctave, highOctave) => {
    let notes = [];
    if (!isNumeric(tonic)) {
        tonic = tonic.replace(/[0-9]/g, "");
    } else {
        tonic = Tone.Frequency(tonic).toNote().replace(/[0-9]/g, "");
    }
    for (let octave = lowOctave; octave <= highOctave; octave++) {
        const octaveScale = scaleFromTonic(tonic + octave, scale);
        notes = [...notes, ...octaveScale];
    }
    return notes;
};

/**
 * Returns an array of frequencies/note strings for one octave starting from tonic.
 */
export const scaleFromTonic = (tonic, intervals) => {
    const scale = [];
    let note = Tone.Frequency(tonic);
    scale.push(tonic);
    for (const interval of intervals) {
        note = note.transpose(interval);
        scale.push(note.toFrequency());
    }
    return scale;
};
