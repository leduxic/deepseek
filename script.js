// ========== script.js ==========
// Matrix rain effect
const canvas = document.getElementById('matrix');
if (canvas) {
    const ctx = canvas.getContext('2d');

    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    setCanvasSize();

    const characters = "01";
    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    let drops = Array(columns).fill(1);

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#3B82F6';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }

            drops[i]++;
        }
    }

    function resizeMatrix() {
        setCanvasSize();
        columns = Math.floor(canvas.width / fontSize);
        drops = Array(columns).fill(1);
    }

    window.addEventListener('resize', () => {
        // Debounce for performance
        clearTimeout(window._matrixResizeTimeout);
        window._matrixResizeTimeout = setTimeout(resizeMatrix, 150);
    });

    // Use requestAnimationFrame for smoother animation
    function animate() {
        draw();
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

// Typing animation with sequential effect
function typeTextSequentially() {
    const elements = document.querySelectorAll('.typing-text');
    let delay = 0;
    const typeOne = (element, text, done) => {
        element.textContent = '';
        let i = 0;
        const typing = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typing);
                element.style.borderRight = 'none';
                if (done) done();
            }
        }, 50);
    };

    // Sequentially type out each element
    function typeNext(index) {
        if (index >= elements.length) return;
        const element = elements[index];
        const text = element.getAttribute('data-text') || '';
        typeOne(element, text, () => typeNext(index + 1));
    }
    typeNext(0);
}

window.addEventListener('load', () => {
    setTimeout(typeTextSequentially, 1000);
});
