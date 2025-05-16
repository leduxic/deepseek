// ========== script.js ==========

// ===== CONFIGURATION =====
const MATRIX_CONFIG = {
    characters: "₿",                  // Characters for Matrix effect
    fontSize: 16,                      // Font size in px
    color: "#3B82F6",                  // Matrix text color
    bgFade: "rgba(0, 0, 0, 0.03)", // Lower alpha for less fade, matrix trails last longer
    animationSpeed: 0.25,                 // Can be tuned for faster/slower rain
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

// Typing animation configuration
const TYPING_CONFIG = {
    charInterval: 32,        // typing speed per character in ms
    delayBetween: 350,       // delay between lines in ms
    initialDelay: 400,       // delay before starting animation
};

// Typing effect for staged (main + delayed) and normal lines
function typeTextSequentially() {
    const items = Array.from(document.querySelectorAll('.typing-text, .typing-step'));
    if (!items.length) return;

    function typeOne(element, text, done, speed) {
        element.textContent = '';
        let i = 0;
        const typing = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typing);
                if (done) done();
            }
        }, speed || TYPING_CONFIG.charInterval);
    }

    function typeStepGroup(stepDiv, done) {
        const main = stepDiv.querySelector('.typing-text');
        const delayed = stepDiv.querySelector('.delayed-typing');
        if (!main || !delayed) { done(); return; }
        // Type the main part
        typeOne(main, main.getAttribute('data-text'), () => {
            // Small pause, then type the delayed part
            setTimeout(() => {
                typeOne(delayed, delayed.getAttribute('data-text'), done);
            }, 350);
        });
    }

    function typeNext(index) {
        if (index >= items.length) {
            // After all typing, show blinking cursor
            const cursor = document.querySelector('.terminal-cursor');
            if (cursor) cursor.style.visibility = 'visible';
            return;
        }
        const el = items[index];
        if (el.classList.contains('typing-step')) {
            typeStepGroup(el, () => setTimeout(() => typeNext(index + 1), TYPING_CONFIG.delayBetween));
        } else {
            typeOne(el, el.getAttribute('data-text'), () => setTimeout(() => typeNext(index + 1), TYPING_CONFIG.delayBetween));
        }
    }

    // Hide blinking cursor initially
    const cursor = document.querySelector('.terminal-cursor');
    if (cursor) cursor.style.visibility = 'hidden';

    typeNext(0);
}

// ===== INITIALIZATION =====
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(typeTextSequentially, TYPING_CONFIG.initialDelay);
});
