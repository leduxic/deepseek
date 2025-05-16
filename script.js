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

const TYPING_CONFIG = {
    delayBetween: 300,                 // Delay between typing elements (ms)
    charInterval: 30,                  // Typing speed per character (ms)
    initialDelay: 800                 // Delay before typing starts (ms)
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

// ===== TYPING ANIMATION =====
function typeTextSequentially() {
    const elements = document.querySelectorAll('.typing-text');
    if (!elements.length) return;

    function typeOne(element, text, done) {
        element.textContent = '';
        element.style.borderRight = '2px solid'; // Optional: blinking cursor effect

        let i = 0;
        const typingInterval = element.getAttribute('data-speed')
            ? parseInt(element.getAttribute('data-speed'), 10)
            : TYPING_CONFIG.charInterval;

        const typing = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typing);
                element.style.borderRight = 'none';
                if (done) done();
            }
        }, typingInterval);
    }

    function typeNext(index) {
        if (index >= elements.length) return;
        const element = elements[index];
        const text = element.getAttribute('data-text') || element.textContent || '';
        typeOne(element, text, () => {
            setTimeout(() => typeNext(index + 1), TYPING_CONFIG.delayBetween);
        });
    }

    typeNext(0);
}

// ===== INITIALIZATION =====
window.addEventListener('DOMContentLoaded', () => {
    initMatrixRain();
    setTimeout(typeTextSequentially, TYPING_CONFIG.initialDelay);
});
