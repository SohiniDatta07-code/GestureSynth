
let audioContext;
let masterGain;
let currentVolume = 0.5;
let currentInstrument = "synth";

function initializeAudio() {
  if (!audioContext) {
    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    masterGain.gain.value = currentVolume;
    masterGain.connect(audioContext.destination);
  }

  if (audioContext.state === "suspended") {
    return audioContext.resume();
  }

  return Promise.resolve();
}

export function setVolume(value) {
  currentVolume = Math.max(0, Math.min(1, value));

  if (audioContext && masterGain) {
    masterGain.gain.setTargetAtTime(
      currentVolume,
      audioContext.currentTime,
      0.02
    );
  }
}

export function setInstrument(instrument) {
  currentInstrument = instrument;
}

export async function playNote(note) {
  await initializeAudio();

  const match = note.match(/^([A-G])(#?)(-?\d+)$/);

  if (!match) {
    throw new Error("Invalid musical note: " + note);
  }

  const [, letter, sharp, octaveText] = match;
  const octave = Number(octaveText);

  const semitones = {
    C: 0, "C#": 1, D: 2, "D#": 3,
    E: 4, F: 5, "F#": 6, G: 7,
    "G#": 8, A: 9, "A#": 10, B: 11
  };

  const midi =
    (octave + 1) * 12 + semitones[letter + sharp];

  const frequency = 440 * Math.pow(2, (midi - 69) / 12);

  const oscillator = audioContext.createOscillator();
  const noteGain = audioContext.createGain();

  const waveforms = {
    synth: "sawtooth",
    soft: "sine",
    bass: "triangle"
  };

  oscillator.type = waveforms[currentInstrument] || "sawtooth";
  oscillator.frequency.value = frequency;

  const now = audioContext.currentTime;

  noteGain.gain.setValueAtTime(0.0001, now);
  noteGain.gain.exponentialRampToValueAtTime(0.35, now + 0.025);

  oscillator.connect(noteGain);
  noteGain.connect(masterGain);

  oscillator.start(now);

  let stopped = false;

  return function stopNote() {
    if (stopped) return;
    stopped = true;

    const stopTime = audioContext.currentTime;

    noteGain.gain.cancelScheduledValues(stopTime);
    noteGain.gain.setTargetAtTime(0.0001, stopTime, 0.04);

    oscillator.stop(stopTime + 0.2);
    oscillator.onended = () => {
      oscillator.disconnect();
      noteGain.disconnect();
    };
  };
}
