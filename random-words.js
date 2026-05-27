import { getDifficultyPreset } from "./difficulty.js";

const url = "https://random-words-api.kushcreates.com/api";

const isAlphabeticWord = (word) => /^[a-z]+$/i.test(word);

function filterWords(words) {
  return [...new Set(words.filter(isAlphabeticWord))];
}

async function fetchWords(apiParams) {
  const params = new URLSearchParams(
    Object.entries(apiParams).map(([key, value]) => [key, String(value)])
  );
  const response = await fetch(`${url}?${params}`);
  if (!response.ok) throw new Error("Failed to fetch words");
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return filterWords(data.map((item) => item.word));
}

async function getWords(difficulty = "medium") {
  const preset = getDifficultyPreset(difficulty);

  try {
    let words = await fetchWords(preset.apiParams);

    if (words.length < 50 && difficulty === "hard") {
      const retryWords = await fetchWords({ language: "en", length: 9, words: 300 });
      if (retryWords.length > words.length) words = retryWords;
    }

    if (words.length > 0) return words;
  } catch (error) {
    console.error("Error:", error);
  }

  return [...preset.fallbackWords];
}

export default getWords;
