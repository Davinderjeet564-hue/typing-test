// Global variables
const wordsToType = document.getElementById('words-to-type');
const cursor = document.querySelector('.blinking-cursor');
const data = await loadData();
// Build letter spans — one <span> per character (letters + spaces between words)
const letters = [];
let currentIndex = 0;


async function loadData() {
  try {
    const response = await fetch('./random-words.json');
    if (!response.ok) throw new Error('File not found');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}


function makeLettersSpans(word, wordIndex){
  // Create a span per letter in the word
  for (const char of word) {
    const span = document.createElement('span');
    span.textContent = char;
    span.classList.add('letter');
    wordsToType.appendChild(span);
    letters.push(span);
  }

  // Add a space span between words (not after the last word)
  if (wordIndex < data.length - 1) {
    const space = document.createElement('span');
    space.textContent = ' ';
    space.classList.add('letter', 'space');
    wordsToType.appendChild(space);
    letters.push(space);
  }
}

data.forEach((word, wordIndex) => makeLettersSpans(word, wordIndex));


// Position the cursor before a given letter span
function moveCursorTo(index) {
  if (letters.length === 0) return;

  const containerRect = wordsToType.getBoundingClientRect();

  if (index < letters.length) {
    // Place cursor just before the target letter
    const letterRect = letters[index].getBoundingClientRect();
    cursor.style.left = (letterRect.left - containerRect.left) + 'px';
    cursor.style.top  = (letterRect.top  - containerRect.top)  + 'px';
    cursor.style.height = letterRect.height + 'px';
  } else {
    // Cursor is past the last letter — place it after the final letter
    const lastRect = letters[letters.length - 1].getBoundingClientRect();
    cursor.style.left = (lastRect.right - containerRect.left) + 'px';
    cursor.style.top  = (lastRect.top   - containerRect.top)  + 'px';
    cursor.style.height = lastRect.height + 'px';
  }
}

// Set the initial cursor position
moveCursorTo(0);

function handleKeyPress(e) {
  // Ignore modifier-only keypresses
  if (e.ctrlKey || e.altKey || e.metaKey) return;

  if (e.key === 'Backspace') {
    if (currentIndex > 0) {
      currentIndex--;
      letters[currentIndex].classList.remove('typed', 'incorrect');
      moveCursorTo(currentIndex);
    }
    return;
  }

  // Only handle printable single characters
  if (e.key.length !== 1) return;
  if (currentIndex >= letters.length) return;

  const expected = letters[currentIndex].textContent;
  if (e.key === expected) {
    letters[currentIndex].classList.add('typed');
  } else {
    letters[currentIndex].classList.add('incorrect');
  }

  currentIndex++;
  moveCursorTo(currentIndex);
}

document.addEventListener('keydown', handleKeyPress);