
import {
  playNote,
  setVolume,
  setInstrument
} from "./audioEngine.js";

const keyboard = document.getElementById("keyboard");
const instrumentSelect = document.getElementById("instrument");
const volumeSlider = document.getElementById("volume");
const volumeValue = document.getElementById("volumeValue");
const audioStatus = document.getElementById("audioStatus");
const musicalKey = document.getElementById("musicalKey");
const scaleSelect = document.getElementById("scale");

let activeNotes = new Map();

setVolume(Number(volumeSlider.value) / 100);
setInstrument(instrumentSelect.value);

instrumentSelect.addEventListener("change", () => {
  setInstrument(instrumentSelect.value);
  audioStatus.textContent =
    "Instrument changed to " +
    instrumentSelect.options[instrumentSelect.selectedIndex].text + ".";
});

volumeSlider.addEventListener("input", () => {
  const value = Number(volumeSlider.value);

  setVolume(value / 100);
  volumeValue.textContent = value + "%";
});

musicalKey.addEventListener("change", () => {
  audioStatus.textContent =
    "Musical key set to " + musicalKey.value +
    ". The test keys currently play their labeled notes.";
});

scaleSelect.addEventListener("change", () => {
  audioStatus.textContent =
    "Scale set to " + scaleSelect.value +
    ". Scale-based gesture mapping will be added next.";
});

keyboard.querySelectorAll(".key").forEach((key) => {
  key.addEventListener("click", async () => {
    const note = key.dataset.note;

    try {
      if (activeNotes.has(key)) {
        activeNotes.get(key)();
      }

      const stopNote = await playNote(note);

      activeNotes.set(key, stopNote);
      key.classList.add("active");
      audioStatus.textContent = "Playing note " + note;

      window.setTimeout(() => {
        stopNote();
        key.classList.remove("active");
        activeNotes.delete(key);
      }, 450);
    } catch (error) {
      console.error("Could not play note:", error);
      audioStatus.textContent =
        "Audio could not start. Try clicking a key again.";
    }
  });
});

console.log("GestureSynth audio controls initialized.");
