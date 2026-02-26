# Synaesthesia — Analysis & Design Notes
### MJam_01 / Tone.js Interactive Music System
*Analysis date: February 26, 2026*

---

## 1. What is Synaesthesia?

[Synaesthesia](https://github.com/wheelibin/synaesthesia) is a **fully generative, passive music system** built on Tone.js. A random seed determines every musical parameter at startup — key, scale, chord progression, BPM, swing, rhythm patterns, and instrument choices — and the composition plays itself autonomously with no further user input.

It is a useful reference project for Tone.js architecture and music theory primitives, but its passive nature is the opposite of the interactive system we are building.

---

## 2. Synaesthesia Architecture

### 2.1 Source Structure

| File / Folder | Responsibility |
|---|---|
| `src/synth/scales.js` | Scale intervals, chord types, Roman numeral progressions |
| `src/synth/rhythms.js` | Generative kick / snare / hi-hat patterns |
| `src/synth/instruments/` | Bass, Lead, Pad, Drums — each wraps one or more Tone.js synths |
| `src/synth/parts.js` | Schedules events via `Tone.Sequence` and `Tone.Loop` |
| `src/synth/synth.js` | Central controller — seeds RNG, picks parameters, starts Transport |
| `src/utils.js` | Seeded random number utilities, array helpers |

### 2.2 Tone.js Features Used

| Feature | How It Is Used |
|---|---|
| `Tone.Transport` | Global BPM, swing, master timeline clock |
| `Tone.Sequence` | Step sequencer for basslines and drum patterns |
| `Tone.Loop` | Long-form repeating callback for chord changes |
| `Tone.Draw` | Fires visual update callbacks synced to the audio timeline (audio-accurate, not `rAF`) |
| `Tone.Synth` / `PolySynth` | Leads, bass, pads |
| `Tone.MembraneSynth` | Kick drum |
| `Tone.NoiseSynth` | Snare, hi-hats |
| `Tone.Freeverb` | Reverb effect |
| `Tone.FeedbackDelay` | Delay effect |
| `Tone.Compressor` | Master bus compression |

### 2.3 Music Theory Implementation

All theory lives in `scales.js`:

- **Scales** — interval arrays for Major, Natural Minor, Dorian, Phrygian, Lydian, Mixolydian, Major/Minor Pentatonic, etc.
- **Chords** — semitone offset definitions for Major, Minor, Major 7th, Minor 7th, etc.
- **Progressions** — common Roman numeral sequences (e.g. `I–IV–V`, `ii–V–I`, `I–VI–IV–V`)

At startup one root note, one scale type, and one progression type are randomly selected and everything downstream is derived from that choice.

### 2.4 Randomness & Seeding

- Uses `Math.seedrandom` (David Bau's library) so a given seed always reproduces the same composition.
- The seed is encoded in the URL, making specific generations shareable.
- Randomness governs: root note, scale, rhythm pattern selection, velocity variation, and subtle timing humanisation.

---

## 3. Key Difference: Passive vs. Interactive

Synaesthesia is a **self-playing system**. MJam_01 is going to be **input-driven**. This is a fundamentally different architecture.

The central design question is:

> **How does player input map to sound?**

There are three broad models, which can be combined:

| Model | Description | Best Tone.js Primitive |
|---|---|---|
| **Trigger** | Player action fires a discrete musical event (a note, a hit, a phrase) | `synth.triggerAttackRelease()` |
| **Steer** | Player continuously deflects or guides an ongoing sequence | `Tone.Sequence` + parameter writes each step |
| **Sculpt** | Player modulates synthesis parameters in real-time (filter, pitch, reverb) | `Tone.Signal`, `AudioParam.rampTo()` |

These are not mutually exclusive. A common pattern is to run a **clock-locked sequence** (Steer) while also allowing the player to **fire one-shot events** on top (Trigger) and **shape the timbre** via controller axes (Sculpt).

---

## 4. Relevant Tone.js Primitives for Interactive Use

### `Tone.Transport`
The master clock. BPM and swing can be changed at any time and take effect on the next beat/bar. This makes it trivial to let player input modulate tempo.

```javascript
Tone.Transport.bpm.value = 120;
Tone.Transport.swing = 0.3;  // 0–1
```

### `Tone.Sequence`
A step sequencer. The callback fires on each step; you decide what to play there. The notes array can be mutated at runtime, so player input can change what the next step will play.

```javascript
const seq = new Tone.Sequence((time, note) => {
    synth.triggerAttackRelease(note, "8n", time);
}, ["C4", "E4", "G4", null], "8n");
```

### `Tone.Loop`
A repeating callback at a fixed musical interval. Good for chord changes or long-form harmonic movement.

### `Tone.Draw`
Schedules a callback to fire in the **draw thread**, precisely synced to when a note plays in the audio thread. Essential for keeping visuals frame-accurate with the music.

```javascript
Tone.Draw.schedule(() => {
    // update p5 visuals here
}, time);
```

### Real-time parameter control
All Tone.js audio nodes expose `AudioParam`-compatible signals that can be ramped smoothly:

```javascript
filter.frequency.rampTo(800, 0.1);   // glide to 800Hz over 100ms
synth.detune.rampTo(50, 0.05);
```

This is the correct way to drive synthesis from a gamepad axis — never set values abruptly inside an update loop.

---

## 5. Architecture Recommendation for MJam_01

Given the existing engine (p5 rendering, WASD + gamepad InputObject, game loop), a clean layered approach:

```
InputObject  (left/right stick, buttons)
     │
     ▼
MJamSoundSystem  (reads InputObject each frame, drives Tone.js)
     │
     ├── Tone.Transport  (BPM, swing — can be steered by right stick Y)
     ├── Tone.Sequence   (melodic/rhythmic sequence — notes chosen from scale)
     ├── Tone.PolySynth  (harmony / pads)
     └── Effects chain   (filter cutoff / reverb mix — steered by axes)
```

The `MJamSoundSystem` would be registered as an **update system** in `MJamGameLoop` (alongside `playerSquare`) so it runs every frame in priority order.

### Suggested axis→sound mappings (starting point)

| Input | Sound Parameter |
|---|---|
| Left stick X/Y | Player movement (already done) |
| Right stick Y | Tempo (BPM) — push up = faster |
| Right stick X | Filter cutoff / brightness |
| Left trigger | Reverb mix (wet/dry) |
| Right trigger | Note density / sequence subdivision |
| A button | Trigger one-shot melodic hit |
| B button | Change chord / advance progression |

---

## 6. Music Theory Primitives to Implement

The following are the minimum theory building blocks needed, mirroring synaesthesia's `scales.js`:

- **Scale table** — map of scale name → interval array (semitones from root)
- **Chord builder** — given a root + scale, return the notes of chord `n`
- **Progression** — ordered list of Roman numeral degrees (e.g. `[I, IV, V, I]`)
- **Note quantiser** — snap a freely generated pitch to the nearest scale degree

These can live in a single `MJamMusicTheory.js` module.

---

## 7. Important Implementation Notes

1. **Tone.js AudioContext must be resumed on user gesture** — already handled in `index.js` via `Tone.start()` on click/keydown.
2. **Never write audio parameters directly in the p5 draw loop** — use `rampTo()` or schedule via `Tone.Transport` callbacks to avoid audio glitches.
3. **`Tone.Draw` for visuals** — if visuals need to react to notes (flash, pulse), use `Tone.Draw.schedule()` inside sequence callbacks, not a polling check in `p.draw()`.
4. **Quantise player-driven notes to the current scale** — raw input values mapped to pitches without quantisation will sound dissonant. Always snap to the nearest scale degree.
5. **BPM changes should be gradual** — use `Tone.Transport.bpm.rampTo(target, rampTime)` rather than instant assignment.

---

*End of document*
