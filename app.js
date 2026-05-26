import getWords from "./random-words.js";

// Global variables
const wordsToType = document.getElementById("words-to-type");
const cursor = document.querySelector(".blinking-cursor");
const letters = [];
let currentIndex = 0;
const duration = document.querySelector("#duration");
const timeRemainingText = document.querySelector("#time-remaining-text");


class TypingTest {
  constructor(data) {
    this.data = data;
    this.timeRemainingText = timeRemainingText;
    this.timeRemaining = 0;
    this.testStarted = false;
    this.testEnded = false;
    this.timeRemainingInterval = null;
  }

  getDurationSeconds() {
    return parseInt(duration.value, 10);
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  updateTimerDisplay() {
    const seconds = this.testStarted
      ? this.timeRemaining
      : this.getDurationSeconds();
    this.timeRemainingText.textContent = this.formatTime(seconds);
  }

  onDurationChange() {
    if (!this.testStarted && !this.testEnded) {
      this.updateTimerDisplay();
    }
  }

  beginTimer() {
    if (this.testStarted || this.testEnded) return;
    this.testStarted = true;
    this.timeRemaining = this.getDurationSeconds();
    this.updateTimerDisplay();
    this.timeRemainingInterval = setInterval(() => this.tick(), 1000);
  }

  tick() {
    this.timeRemaining--;
    this.updateTimerDisplay();
    if (this.timeRemaining <= 0) {
      this.endTest();
    }
  }

  makeLettersSpans(word, wordIndex) {
    for (const char of word) {
      const span = document.createElement("span");
      span.textContent = char;
      span.classList.add("letter");
      wordsToType.appendChild(span);
      letters.push(span);
    }

    if (wordIndex < this.data.length - 1) {
      const space = document.createElement("span");
      space.textContent = " ";
      space.classList.add("letter", "space");
      wordsToType.appendChild(space);
      letters.push(space);
    }
  }

  moveCursorTo(index) {
    if (letters.length === 0) return;

    const containerRect = wordsToType.getBoundingClientRect();

    if (index < letters.length) {
      const letterRect = letters[index].getBoundingClientRect();
      cursor.style.left = letterRect.left - containerRect.left + "px";
      cursor.style.top = letterRect.top - containerRect.top + "px";
      cursor.style.height = letterRect.height + "px";
    } else {
      const lastRect = letters[letters.length - 1].getBoundingClientRect();
      cursor.style.left = lastRect.right - containerRect.left + "px";
      cursor.style.top = lastRect.top - containerRect.top + "px";
      cursor.style.height = lastRect.height + "px";
    }
  }

  handleKeyPress(e) {
    if (this.testEnded) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    if (e.key === "Backspace") {
      if (currentIndex > 0) {
        currentIndex--;
        letters[currentIndex].classList.remove("typed", "incorrect");
        this.moveCursorTo(currentIndex);
      }
      return;
    }

    if (e.key.length !== 1) return;
    if (currentIndex >= letters.length) return;

    if (!this.testStarted) {
      this.beginTimer();
    }

    const expected = letters[currentIndex].textContent;
    if (e.key === expected) {
      letters[currentIndex].classList.add("typed");
    } else {
      letters[currentIndex].classList.add("incorrect");
    }

    currentIndex++;
    this.moveCursorTo(currentIndex);
  }

  init() {
    this.updateTimerDisplay();
    duration.addEventListener("change", () => this.onDurationChange());
    this.keydownHandler = (e) => this.handleKeyPress(e);
    document.addEventListener("keydown", this.keydownHandler);
  }

  endTest() {
    if (this.testEnded) return;
    this.testEnded = true;
    clearInterval(this.timeRemainingInterval);
    document.removeEventListener("keydown", this.keydownHandler);
    this.timeRemaining = 0;
    this.updateTimerDisplay();
  }
}

const data = await getWords();
console.log(data)
const typingTest = new TypingTest(data);

data.forEach((word, wordIndex) => typingTest.makeLettersSpans(word, wordIndex));
typingTest.moveCursorTo(0);
typingTest.init();
