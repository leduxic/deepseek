document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('maze-canvas');
    const ctx = canvas.getContext('2d');
    const startOverlay = document.getElementById('maze-start-overlay');
    const startBtn = document.getElementById('maze-start-btn');
    const winOverlay = document.getElementById('maze-win-overlay');
    const homeBtn = document.getElementById('maze-home-btn');
    const restartBtn = document.getElementById('restart-button');

    // Mobile controls
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');

    // Set homeBtn.onclick only once!
    homeBtn.onclick = function() {
        window.location.href = '/'; // change if your home page is different
    };

    // Game config
    const config = {
        gridSize: 20,
        get cellSize() {
            // Responsive: always square grid
            return Math.floor(Math.min(canvas.width, canvas.height) / this.gridSize);
        },
        playerColor: '#3B82F6',
        bitcoinColor: '#F7931A',
        wallColor: '#1E3A8A',
        speed: 120 // ms
    };

    // Game state
    let player = null,
        bitcoin = null,
        walls = [],
        score = 0,
        direction = 'right',
        nextDirection = 'right',
        gameOver = false,
        gameInterval = null;

    // Track TRY AGAIN? clickable area
    let tryAgainArea = null;

    function generateWalls() {
        walls = [];
        // Border walls
        for (let i = 0; i < config.gridSize; i++) {
            walls.push({x: i, y: 0});
            walls.push({x: i, y: config.gridSize - 1});
            if (i > 0 && i < config.gridSize - 1) {
                walls.push({x: 0, y: i});
                walls.push({x: config.gridSize - 1, y: i});
            }
        }
        // Some inner walls (example pattern, can be expanded)
        for (let i = 2; i < config.gridSize - 2; i += 4) {
            walls.push({x: i, y: 5});
            walls.push({x: i + 1, y: 5});
            walls.push({x: i + 2, y: 10});
            walls.push({x: i + 1, y: 10});
        }
    }

    function placeBitcoin() {
        let validPosition = false;
        while (!validPosition) {
            bitcoin.x = Math.floor(Math.random() * (config.gridSize - 2)) + 1;
            bitcoin.y = Math.floor(Math.random() * (config.gridSize - 2)) + 1;
            validPosition = true;
            if (bitcoin.x === player.x && bitcoin.y === player.y) validPosition = false;
            for (const wall of walls) {
                if (bitcoin.x === wall.x && bitcoin.y === wall.y) {
                    validPosition = false;
                    break;
                }
            }
        }
    }

    function draw() {
        if (!Array.isArray(walls) || !player || !bitcoin) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw walls
        ctx.fillStyle = config.wallColor;
        for (const wall of walls) {
            ctx.fillRect(
                wall.x * config.cellSize,
                wall.y * config.cellSize,
                config.cellSize,
                config.cellSize
            );
        }
        // Draw bitcoin
        ctx.fillStyle = config.bitcoinColor;
        ctx.font = `${config.cellSize}px monospace`;
        ctx.textBaseline = "alphabetic";
        ctx.fillText('₿', bitcoin.x * config.cellSize + config.cellSize/10, (bitcoin.y+1) * config.cellSize - config.cellSize/6);

        // Draw player
        ctx.fillStyle = config.playerColor;
        ctx.fillRect(
            player.x * config.cellSize,
            player.y * config.cellSize,
            config.cellSize,
            config.cellSize
        );

        // Draw trail
        ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
        for (const segment of player.trail) {
            ctx.fillRect(
                segment.x * config.cellSize,
                segment.y * config.cellSize,
                config.cellSize,
                config.cellSize
            );
        }

        // Draw score
        ctx.fillStyle = '#FFF';
        ctx.font = '16px monospace';
        ctx.textAlign = "left";
        ctx.fillText(`SCORE: ${score}`, 10, 20);
        ctx.textAlign = "start";
    }

    function update() {
        if (gameOver) return;
        direction = nextDirection;

        player.trail.push({x: player.x, y: player.y});
        if (player.trail.length > 5) player.trail.shift();

        switch (direction) {
            case 'up':    player.y--; break;
            case 'down':  player.y++; break;
            case 'left':  player.x--; break;
            case 'right': player.x++; break;
        }

        for (const wall of walls) {
            if (player.x === wall.x && player.y === wall.y) return endGame(false);
        }
        for (const segment of player.trail) {
            if (player.x === segment.x && player.y === segment.y) return endGame(false);
        }
        if (player.x < 0 || player.x >= config.gridSize || player.y < 0 || player.y >= config.gridSize) {
            return endGame(false);
        }
        if (player.x === bitcoin.x && player.y === bitcoin.y) {
            score++;
            setTimeout(() => {}, 50);
            if (score >= 2) {
                return endGame(true);
            }
            placeBitcoin();
        }
        draw();
    }

    function endGame(escaped) {
        clearInterval(gameInterval);
        gameOver = true;

        if (escaped) {
            canvas.style.opacity = 0.1;
            winOverlay.style.display = 'flex';
            tryAgainArea = null;
        } else {
            // Game over screen with TRY AGAIN? clickable
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#EF4444';
            ctx.font = '24px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 20);

            // Draw TRY AGAIN? and store clickable area
            const tryText = 'TRY AGAIN?';
            const x = canvas.width/2;
            const y = canvas.height/2 + 20;
            ctx.fillText(tryText, x, y);

            // Calculate clickable area for TRY AGAIN?
            const metrics = ctx.measureText(tryText);
            const width = metrics.width;
            const height = 28; // approx height for 24px font
            tryAgainArea = {
                x: x - width/2,
                y: y - height/2,
                width: width,
                height: height
            };

            ctx.textAlign = 'left';
        }
    }

    // Click on TRY AGAIN? to restart
    canvas.addEventListener('click', function(e) {
        if (gameOver && tryAgainArea) {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            if (
                clickX >= tryAgainArea.x &&
                clickX <= tryAgainArea.x + tryAgainArea.width &&
                clickY >= tryAgainArea.y &&
                clickY <= tryAgainArea.y + tryAgainArea.height
            ) {
                initGame();
            }
        }
    });

    // Cursor pointer on TRY AGAIN? hover
    canvas.addEventListener('mousemove', function(e) {
        if (gameOver && tryAgainArea) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            if (
                mouseX >= tryAgainArea.x &&
                mouseX <= tryAgainArea.x + tryAgainArea.width &&
                mouseY >= tryAgainArea.y &&
                mouseY <= tryAgainArea.y + tryAgainArea.height
            ) {
                canvas.style.cursor = 'pointer';
            } else {
                canvas.style.cursor = 'default';
            }
        } else {
            canvas.style.cursor = 'default';
        }
    });

    // Input handling
    const directions = {
        'ArrowUp': 'up', 'w': 'up', 'W': 'up',
        'ArrowDown': 'down', 's': 'down', 'S': 'down',
        'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
        'ArrowRight': 'right', 'd': 'right', 'D': 'right'
    };
    function handleKeyDown(e) {
        if (gameOver) return;
        const dir = directions[e.key];
        if (!dir) return;
        if ((dir === 'up' && direction === 'down') ||
            (dir === 'down' && direction === 'up') ||
            (dir === 'left' && direction === 'right') ||
            (dir === 'right' && direction === 'left')) return;
        nextDirection = dir;
        e.preventDefault();
    }

    function handleControl(dir) {
        if ((dir === 'up' && direction === 'down') ||
            (dir === 'down' && direction === 'up') ||
            (dir === 'left' && direction === 'right') ||
            (dir === 'right' && direction === 'left')) return;
        nextDirection = dir;
    }
    btnUp.addEventListener('click', () => handleControl('up'));
    btnDown.addEventListener('click', () => handleControl('down'));
    btnLeft.addEventListener('click', () => handleControl('left'));
    btnRight.addEventListener('click', () => handleControl('right'));

    // Swipe support
    let touchStartX = null, touchStartY = null;
    canvas.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
    });
    canvas.addEventListener('touchend', (e) => {
        if (touchStartX === null || touchStartY === null) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 20) handleControl('right');
            else if (dx < -20) handleControl('left');
        } else {
            if (dy > 20) handleControl('down');
            else if (dy < -20) handleControl('up');
        }
        touchStartX = touchStartY = null;
    });

    // Focus canvas for keyboard accessibility
    canvas.addEventListener('click', () => canvas.focus());
    canvas.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleKeyDown);

    // Init & restart logic
    function initGame() {
        winOverlay.style.display = 'none';
        canvas.style.opacity = 1;
        player = { x: 1, y: 1, trail: [] };
        bitcoin = { x: 0, y: 0 };
        score = 0;
        direction = 'right';
        nextDirection = 'right';
        gameOver = false;
        tryAgainArea = null;
        generateWalls();
        placeBitcoin();
        draw();
        clearInterval(gameInterval);
        gameInterval = setInterval(update, config.speed);
    }

    restartBtn.addEventListener('click', () => {
        initGame();
    });

    // Responsive canvas
    function resizeCanvas() {
        const size = Math.min(window.innerWidth * 0.9, 400);
        canvas.width = size;
        canvas.height = size;
        draw();
    }
    window.addEventListener('resize', resizeCanvas);

    // Start game on load
    resizeCanvas();
    startOverlay.style.display = 'flex';
    canvas.style.opacity = 1;
    winOverlay.style.display = 'none';

    startBtn.focus();

    startBtn.onclick = function() {
        startOverlay.style.display = 'none';
        canvas.style.opacity = 1;
        initGame();
    };
});
