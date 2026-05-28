import getWords from "./random-words.js";
import {
  getSelectedDifficulty,
  loadSavedDifficulty,
  saveDifficulty,
} from "./difficulty.js";

// Global variables
const wordsToType = document.getElementById("words-to-type");
const typingContainer = document.querySelector(".typing-container");
const cursor = document.querySelector(".blinking-cursor");
const letters = [];
let currentIndex = 0;
const duration = document.querySelector("#duration");
const difficultyChooser = document.querySelector("#difficulty-chooser");
const timeRemainingText = document.querySelector("#time-remaining-text");


class TypingTest {
  constructor(data) {
    this.data = data;
    this.timeRemainingText = timeRemainingText;
    this.timeRemaining = 0;
    this.testStarted = false;
    this.testEnded = false;
    this.timeRemainingInterval = null;
    this.lineTops = [];
    this.firstVisibleLineIndex = 0;
  }

  updateLineTops() {
    const tops = letters.map(span => span.offsetTop);
    this.lineTops = [...new Set(tops)].sort((a, b) => a - b);
  }

  clampContainerHeight() {
    const N = 4;
    if (this.lineTops.length < 2) return;
    // Calculate pixel-accurate line height from actual rendered positions
    const lineHeight = this.lineTops[1] - this.lineTops[0];
    const lastVisibleLine = this.lineTops[Math.min(N - 1, this.lineTops.length - 1)];
    // Container height = top of Nth line + one line height (clips right at bottom of line N)
    typingContainer.style.height = (lastVisibleLine + lineHeight) + "px";
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

  updateSettingsControls() {
    const locked = this.testStarted && !this.testEnded;
    if (difficultyChooser) difficultyChooser.disabled = locked;
  }

  onDurationChange() {
    if (!this.testStarted && !this.testEnded) {
      this.updateTimerDisplay();
    }
  }

  onDifficultyChange() {
    if (this.testStarted || this.testEnded) return;
    saveDifficulty(difficultyChooser.value);
    this.reloadWords(difficultyChooser.value);
  }

  clearLetters() {
    letters.length = 0;
    currentIndex = 0;
    this.firstVisibleLineIndex = 0;
    this.lineTops = [];
    wordsToType.style.transform = "";
    wordsToType.querySelectorAll(".letter").forEach((el) => el.remove());
  }

  async reloadWords(difficulty) {
    if (this.testStarted || this.testEnded) return;

    wordsToType.classList.add("is-loading");
    try {
      const words = await getWords(difficulty);
      this.clearLetters();
      this.data = words;
      words.forEach((word, wordIndex) => this.makeLettersSpans(word, wordIndex));
      this.updateLineTops();
      this.clampContainerHeight();
      this.moveCursorTo(0);
      this.updateTimerDisplay();
    } finally {
      wordsToType.classList.remove("is-loading");
    }
  }

  beginTimer() {
    if (this.testStarted || this.testEnded) return;
    this.testStarted = true;
    this.updateSettingsControls();
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

    if (!this.lineTops || this.lineTops.length === 0) {
      this.updateLineTops();
    }

    const containerRect = wordsToType.getBoundingClientRect();
    let letterRect;
    let currentLetter;

    if (index < letters.length) {
      currentLetter = letters[index];
      letterRect = currentLetter.getBoundingClientRect();
      cursor.style.left = letterRect.left - containerRect.left + "px";
      cursor.style.top = letterRect.top - containerRect.top + "px";
      cursor.style.height = letterRect.height + "px";
    } else {
      currentLetter = letters[letters.length - 1];
      const lastRect = currentLetter.getBoundingClientRect();
      cursor.style.left = lastRect.right - containerRect.left + "px";
      cursor.style.top = lastRect.top - containerRect.top + "px";
      cursor.style.height = lastRect.height + "px";
      letterRect = lastRect;
    }

    // Handle line-by-line scrolling using offsetTop
    const currentTop = currentLetter.offsetTop;
    const L = this.lineTops.indexOf(currentTop);

    if (L !== -1) {
      const N = 4; // Number of visible lines
      if (L >= this.firstVisibleLineIndex + N) {
        this.firstVisibleLineIndex = L - N + 1;
      } else if (L < this.firstVisibleLineIndex) {
        this.firstVisibleLineIndex = L;
      }

      const offset = this.lineTops[this.firstVisibleLineIndex] - this.lineTops[0];
      wordsToType.style.transform = `translateY(-${offset}px)`;
    }
  }

  handleKeyPress(e) {
    if (this.testEnded) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    // Block any selection keys (shift + arrow, etc.)
    if (e.shiftKey) return;

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

    const currentLetter = letters[currentIndex];
    const expected = currentLetter.textContent;
    const isSpace = currentLetter.classList.contains("space");

    if (isSpace) {
      // On a space: only advance on actual space key, silently skip on any other key
      if (e.key !== " ") return;
      currentLetter.classList.add("typed");
    } else if (e.key === expected) {
      currentLetter.classList.add("typed");
    } else {
      currentLetter.classList.add("incorrect");
    }

    currentIndex++;
    this.moveCursorTo(currentIndex);
  }

  init() {
    this.updateTimerDisplay();
    this.updateSettingsControls();
    duration.addEventListener("change", () => this.onDurationChange());
    if (difficultyChooser) {
      difficultyChooser.addEventListener("change", () => this.onDifficultyChange());
    }
    this.keydownHandler = (e) => this.handleKeyPress(e);
    document.addEventListener("keydown", this.keydownHandler);

    this.resizeHandler = () => {
      this.updateLineTops();
      this.clampContainerHeight();
      this.moveCursorTo(currentIndex);
    };
    window.addEventListener("resize", this.resizeHandler);

    // Globally prevent any text selection via mouse or keyboard
    this.selectstartHandler = (e) => e.preventDefault();
    document.addEventListener("selectstart", this.selectstartHandler);
  }

  endTest() {
    if (this.testEnded) return;
    this.testEnded = true;
    this.updateSettingsControls();
    clearInterval(this.timeRemainingInterval);
    document.removeEventListener("keydown", this.keydownHandler);
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
    }
    if (this.selectstartHandler) {
      document.removeEventListener("selectstart", this.selectstartHandler);
    }
    this.timeRemaining = 0;
    this.updateTimerDisplay();
    // Calculate statistics
    const totalTyped = letters.filter(l => l.classList.contains("typed") || l.classList.contains("incorrect")).length;
    const correctTyped = letters.filter(l => l.classList.contains("typed")).length;
    const accuracy = totalTyped === 0 ? 0 : Math.round((correctTyped / totalTyped) * 100);
    const minutes = this.getDurationSeconds() / 60;
    const wpm = minutes > 0 ? Math.round((correctTyped / 5) / minutes) : 0;

    // Update stats UI
    const testTimeEl = document.getElementById("test-time");
    const wpmEl = document.getElementById("wpm-count");
    const accuracyEl = document.getElementById("accuracy-count");
    if (testTimeEl) testTimeEl.textContent = this.formatTime(this.getDurationSeconds());
    if (wpmEl) wpmEl.textContent = wpm;
    if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;

    // Hide typing container and show stats
    if (typingContainer) typingContainer.style.display = "none";
    const statsSection = document.querySelector('.test-stats');
    if (statsSection) statsSection.classList.add('active');
  }
}

loadSavedDifficulty();
const typingTest = new TypingTest([]); /* Initializing the typing test object*/
await typingTest.reloadWords(getSelectedDifficulty());
typingTest.init();

// Retake button logic
const retakeBtn = document.getElementById('retake-button');
if (retakeBtn) {
  retakeBtn.addEventListener('click', async () => {
    // Reset UI
    const statsSection = document.querySelector('.test-stats');
    if (statsSection) statsSection.classList.remove('active');
    if (typingContainer) typingContainer.style.display = '';

    // Reset test state
    typingTest.testStarted = false;
    typingTest.testEnded = false;
    typingTest.timeRemaining = 0;
    typingTest.updateTimerDisplay();
    typingTest.clearLetters();
    await typingTest.reloadWords(getSelectedDifficulty());
    // Re‑initialize listeners
    typingTest.init();
  });
}
