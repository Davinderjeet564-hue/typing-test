const STORAGE_KEY = "typing-test-difficulty";
const DEFAULT_DIFFICULTY = "medium";

export const DIFFICULTY_LEVELS = {
  easy: {
    apiParams: { language: "en", length: 4, words: 300 },
    fallbackWords: [
      "cat", "dog", "run", "sun", "hat", "box", "cup", "pen", "map", "key",
      "red", "big", "fun", "top", "win", "day", "boy", "air", "ice", "egg",
      "arm", "leg", "eye", "ear", "lip", "jaw", "toe", "rib", "hip", "jaw",
      "play", "jump", "walk", "talk", "read", "draw", "sing", "fish", "bird",
      "tree", "leaf", "rain", "snow", "wind", "fire", "rock", "sand", "gold",
      "book", "desk", "door", "wall", "room", "home", "food", "milk", "cake",
    ],
  },
  medium: {
    apiParams: { language: "en", category: "wordle", length: 5, words: 300 },
    fallbackWords: [
      "apple", "beach", "chair", "dance", "eagle", "flame", "grape", "house",
      "image", "jolly", "knife", "lemon", "mouse", "night", "ocean", "piano",
      "queen", "river", "stone", "table", "uncle", "voice", "water", "xenon",
      "yacht", "zebra", "brain", "cloud", "dream", "earth", "faith", "ghost",
      "heart", "ideal", "jewel", "kneel", "light", "magic", "noble", "olive",
      "plant", "quiet", "robin", "smile", "train", "unity", "vivid", "world",
      "youth", "zesty", "amber", "blaze", "crisp", "draft", "elite", "frost",
    ],
  },
  hard: {
    apiParams: { language: "en", length: 8, words: 300 },
    fallbackWords: [
      "keyboard", "algorithm", "mountain", "software", "database", "terminal",
      "function", "variable", "template", "protocol", "security", "platform",
      "document", "language", "computer", "internet", "download", "password",
      "firewall", "hardware", "firmware", "compiler", "debugger", "fragment",
      "gradient", "hospital", "industry", "junction", "kilogram", "landmark",
      "magazine", "national", "operator", "pavilion", "quantity", "register",
      "standard", "taxonomy", "umbrella", "vacation", "workflow", "xylophone",
      "yourself", "zeppelin", "abstract", "boundary", "catalyst", "dynamics",
      "economic", "festival", "geometry", "heritage", "identity", "junction",
    ],
  },
};

export function getSelectedDifficulty() {
  const chooser = document.querySelector("#difficulty-chooser");
  const value = chooser?.value;
  if (value && value in DIFFICULTY_LEVELS) return value;
  return DEFAULT_DIFFICULTY;
}

export function loadSavedDifficulty() {
  const chooser = document.querySelector("#difficulty-chooser");
  if (!chooser) return;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && saved in DIFFICULTY_LEVELS) {
    chooser.value = saved;
  }
}

export function saveDifficulty(level) {
  if (level in DIFFICULTY_LEVELS) {
    localStorage.setItem(STORAGE_KEY, level);
  }
}

export function getDifficultyPreset(difficulty) {
  return DIFFICULTY_LEVELS[difficulty] ?? DIFFICULTY_LEVELS[DEFAULT_DIFFICULTY];
}
