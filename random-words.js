/* ["hi", "hello", "world", "how", "are", "you", "today", "apple", "box"] */

const url = "https://random-words-api.kushcreates.com/api";

async function getWords() {
  try {
    const response = await fetch(`${url}?language=en&category=wordle&length=5&words=300`);
    if (!response.ok) throw new Error("Failed to fetch words");
    const data = await response.json();
    return data.map(item => item.word);
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

export default getWords;