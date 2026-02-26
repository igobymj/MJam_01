# Drone — How It Works
### MJam_01 / Tone.js Sound System
*February 26, 2026*

---

## Step 1: Pick a Key

```javascript
const masterScale = getRandomScaleType();  // e.g. { type: "Dorian", intervals: [2,1,2,2,2,1] }
const root        = getRandomRootNote();   // e.g. "G"
const rootFreq    = Tone.Frequency(root + "0"); // "G0" — very low, ~24.5 Hz
```

`rootFreq` is the fundamental pitch everything is built from. It is placed in octave 0 (sub-bass) so that the oscillators layered on top occupy octaves 2–4.

---

## Step 2: Build the Scale Note Array

```javascript
const oscScale = actualNotesFromScale(rootFreq.toNote(), masterScale.intervals, 2, 3);
```

`actualNotesFromScale` walks the interval array across octaves 2 and 3, producing an array of frequencies. For G Dorian, that looks like:

```
oscScale[0]  = G2
oscScale[1]  = A2
oscScale[2]  = Bb2
oscScale[3]  = C3
oscScale[4]  = D3
oscScale[5]  = Eb3
oscScale[6]  = F3
oscScale[7]  = G3
...           (continues through octave 3)
oscScale[13] = F4
```

This gives ~14 entries that the oscillator stack indexes into by scale degree.

---

## Step 3: Instantiate the Oscillator Stack

Ten FM oscillators are created simultaneously, each locked to a specific scale degree:

| Variable | Pitch | Volume | Description |
|---|---|---|---|
| `oscRoot` | Root (G0) | 0 dB | The fundamental anchor |
| `oscRootO2` | Root +12 st | 0 dB | One octave up |
| `oscRootO3` | Root +24 st | 0 dB | Two octaves up |
| `osc3` | oscScale[2] — 3rd | −50 dB | Starts silent |
| `osc5` | oscScale[4] — 5th | −50 dB | Starts silent |
| `osc7` | oscScale[6] — 7th | −50 dB | Starts silent |
| `osc9` | oscScale[8] — 9th | −50 dB | Starts silent |
| `osc11` | oscScale[10] — 11th | −50 dB | Starts silent |
| `osc13` | oscScale[12] — 13th | −50 dB | Starts silent |
| `harmonyOscillator` | Root (roaming) | −50 dB | Drifting melody voice |

The `3rd`, `5th`, `7th` etc. are jazz chord extension names. Together these oscillators form a complete **13th chord** spread across multiple octaves.

The `−50 dB` starting volume means the extension oscillators are essentially inaudible at first. They are faded in progressively by the loops described below.

`fmOscillator()` uses **frequency modulation** synthesis — a carrier wave (sine or square4, chosen randomly) is modulated by a secondary oscillator, generating rich harmonic overtones. This gives the drone its characteristic shimmer rather than sounding like a plain tone.

---

## Step 4: The Loops Animate the Stack

Four independent loops run on the Tone.js Transport timeline. Their cycle lengths are deliberately **coprime** — they never align the same way twice for a very long time, ensuring the texture is always slowly evolving.

### Frequency Drift Loop — every 4 bars (`"4m"`)
Picks a random oscillator from the stack and micro-detunes it by `±0.125` semitones, then reverses direction next cycle. Creates a slow, organic wavering across the chord — similar to a chorus effect but arising structurally rather than from an effect unit.

### Volume Swell Loop — every 3 bars (`"3m"`)
Fades all the "primary" oscillators (`oscRoot`, `oscRootO2`, `oscRootO3`, `osc3`) toward 0 dB (full presence), then selects one to dip to −6 dB. Creates a slow breathing motion in the body of the chord.

### Extra Oscillator Spotlight — every 6 bars (`"6m"`)
Fades all the upper extension oscillators (`osc5` through `osc13`) down to −50 dB, then picks one to fade back up to 0 dB over 1 bar. At any given moment only **one extension voice** is audible at a time, rotating through them. This gives the impression of color slowly shifting inside the chord.

### Harmony Loop — every 7 bars (`"7m"`)
The `harmonyOscillator` cycles through a **shuffled** array of the scale notes in octave 3. Each cycle it fades in to −4 dB over 1 bar, holds for roughly 2 bars, then fades back to −50 dB. Sounds like a slow, ghostly melodic line drifting over the pad.

---

## Step 5: Bass Pattern

```javascript
const bassPattern = new Tone.Pattern(callback, bassNotes, "randomWalk");
bassPattern.interval = "4m"; // fires every 4 bars
```

`"randomWalk"` means each trigger steps to an **adjacent** note in the array rather than jumping randomly — so the bass moves in smooth stepwise motion through the scale. One note is played every 4 bars using the `FastAttackSquare` synth — a square4 oscillator with a fast attack (0.02s), hard sustain, and a compressor. Sits underneath the pad texture.

---

## Step 6: Noise Bed

```javascript
const noise = new Tone.Noise("pink").start();
const noiseFilter = new Tone.AutoFilter({ frequency: "8m", ... }).start();
```

Pink noise is passed through an auto-filter (sweeping from ~800 Hz to ~4 kHz over 8-bar cycles). A slow LFO also modulates the noise volume. The result is a soft, airy texture that fills space between the oscillators and glues the pad sound together.

---

## Step 7: Effects Chain

All oscillators are connected to:

| Effect | Purpose |
|---|---|
| `Tone.Chorus` | Adds gentle detuning and width |
| `Tone.Phaser` | Slow spectral sweeping (0.2 Hz) |
| `Tone.Reverb` | Space and tail — core of the pad character |

The reverb's wet amount is also modulated by a slow LFO, so the sense of space itself breathes.

---

## Summary

The drone is a **slowly rotating chord cluster** where:

- The root and its octaves provide the harmonic anchor
- Extension oscillators rotate in and out, shifting the colour of the chord
- The harmony voice drifts melodically over the top
- The bass walks stepwise underneath
- Pink noise via auto-filter adds air and texture
- Chorus, phaser, and reverb glue everything together

No element repeats on a fixed cycle. The coprime loop lengths (`3m`, `4m`, `6m`, `7m`) mean the combination of states takes an extremely long time before it ever revisits the same configuration.

---

*Source: adapted from [wheelibin/synaesthesia](https://github.com/wheelibin/synaesthesia) (MIT License)*
