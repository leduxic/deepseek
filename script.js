// ========== script.js ==========

// ===== CONFIGURATION =====
const MATRIX_CONFIG = {
    characters: "₿",                  // Characters for Matrix effect
    fontSize: 26,                      // Font size in px
    color: "#3B82F6",                  // Matrix text color
    bgFade: "rgba(0, 0, 0, 0.01)", // Lower alpha for less fade, matrix trails last longer
    animationSpeed: 0.2,                 // Can be tuned for faster/slower rain
    accessibilityToggle: true          // Set true to allow disabling animation
};

// ===== MATRIX RAIN EFFECT =====
function initMatrixRain() {
    const canvas = document.getElementById('matrix');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let fontSize = MATRIX_CONFIG.fontSize;
    let columns, drops;

    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        columns = Math.floor(canvas.width / fontSize);
        drops = Array(columns).fill(1);
    }
    setCanvasSize();

    function draw() {
        ctx.fillStyle = MATRIX_CONFIG.bgFade;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = MATRIX_CONFIG.color;
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = MATRIX_CONFIG.characters.charAt(
                Math.floor(Math.random() * MATRIX_CONFIG.characters.length)
            );
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i] += MATRIX_CONFIG.animationSpeed;
        }
    }

    let animationFrameId = null;
    function animate() {
        draw();
        animationFrameId = requestAnimationFrame(animate);
    }

    // Debounced resize
    let resizeTimeout;
    function onResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            setCanvasSize();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 150);
    }

    // Accessibility: allow users to disable animation (e.g., via keyboard)
    function setupAccessibility() {
        if (!MATRIX_CONFIG.accessibilityToggle) return;
        window.addEventListener('keydown', (e) => {
            if (e.key === "Escape") {
                cancelAnimationFrame(animationFrameId);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        });
    }

    window.addEventListener('resize', onResize);
    setupAccessibility();
    animationFrameId = requestAnimationFrame(animate);
}

function typeLinesSequentially() {
  const lines = document.querySelectorAll('#typing-sequence .typing-line');
  const charInterval = 32; // Typing speed (ms)
  const delayBetween = 350; // Delay after each line (ms)

  function typeLine(line, done) {
    const text = line.getAttribute('data-text');
    let i = 0;
    line.textContent = '';
    const typing = setInterval(() => {
      if (i < text.length) {
        line.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typing);
        if (done) done();
      }
    }, charInterval);
  }

  function typeNextLine(index) {
    if (index >= lines.length) return;
    typeLine(lines[index], () => setTimeout(() => typeNextLine(index + 1), delayBetween));
  }

  typeNextLine(0);
}

window.addEventListener('DOMContentLoaded', () => {
  typeLinesSequentially();
  initMatrixRain();
});
