const woman = document.getElementById('woman');
const man = document.getElementById('man');
const tulip = document.getElementById('tulip');
const heart = document.getElementById('heart');
const instruction = document.getElementById('instruction');
const scene = document.querySelector('.scene');
const fireworksCanvas = document.getElementById('fireworks');
const ctx = fireworksCanvas.getContext('2d');

let gameState = 'start'; // start, walking_to_tulip, waiting_for_man, kissing, finale

// Initial Setup
function init() {
    // Resize canvas
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;

    // Woman walks in from left to a bit before center
    woman.style.left = '20%';
    woman.classList.add('walking');

    setTimeout(() => {
        woman.classList.remove('walking');
        // Wait for user interaction
    }, 3000);
}

tulip.addEventListener('click', () => {
    if (gameState !== 'start') return;
    gameState = 'walking_to_tulip';
    instruction.classList.add('hidden');

    // Woman walks to tulip
    woman.classList.add('walking');
    woman.style.left = '48%'; // Close to tulip (center is 50%)

    setTimeout(() => {
        // Pick up tulip
        woman.classList.remove('walking');
        tulip.classList.add('hidden'); // Simplified "picking up"
        // Ideally change woman sprite to "holding tulip"

        startManSequence();
    }, 3000);
});

function startManSequence() {
    gameState = 'waiting_for_man';

    // Man walks in from right
    man.classList.add('walking');
    man.style.right = '45%'; // Close to center

    setTimeout(() => {
        man.classList.remove('walking');
        performKiss();
    }, 4000); // Takes a bit longer to walk in
}

function performKiss() {
    gameState = 'kissing';

    // Move closer and Kiss
    woman.style.transform = `scale(4) translateX(4px)`; // Move right towards center
    man.style.transform = `scale(4) translateX(-4px)`; // Move left towards center

    // Show Heart
    heart.classList.remove('hidden');
    // Trigger reflow to ensure transition plays if we just removed hidden? 
    // Usually 'hidden' is display:none, so transitions need a moment or requesting offsetHeight.
    void heart.offsetWidth;

    heart.style.opacity = '1';
    heart.style.bottom = '350px'; // Float up
    heart.classList.add('visible'); // Trigger big scale

    setTimeout(() => {
        startFinale();
    }, 2000);
}

function startFinale() {
    gameState = 'finale';
    document.body.classList.add('camera-up'); // CSS can handle body or scene transform
    scene.style.transform = 'translateY(200px)'; // Pan camera up (move scene down)

    // Start Fireworks AFTER the pan (2 seconds transition)
    setTimeout(() => {
        const finaleText = document.getElementById('finale-text');
        finaleText.classList.remove('hidden');
        finaleText.style.top = '40%'; // Adjust position if needed
        loopFireworks();
    }, 2000);
}

// Enhanced Fireworks
const particles = [];
const rockets = [];

class Rocket {
    constructor(x, y, targetY) {
        this.x = x;
        this.y = y;
        this.targetY = targetY;
        this.vy = -Math.random() * 3 - 8; // upward speed
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.exploded = false;
    }

    update() {
        this.y += this.vy;
        if (this.vy < 0) this.vy += 0.1; // slow down as it goes up

        if (this.vy >= 0 || this.y <= this.targetY) {
            this.explode();
            return false; // remove rocket
        }
        return true; // keep rocket
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 4, 4);
    }

    explode() {
        // Create explosion particles
        for (let i = 0; i < 80; i++) {
            particles.push(new Particle(this.x, this.y, this.color));
        }
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 100;
        this.color = color;
        this.decay = Math.random() * 0.015 + 0.01;
        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95; // friction
        this.vy *= 0.95; // friction
        this.vy += 0.1; // gravity
        this.alpha -= this.decay;
        return this.alpha > 0;
    }

    draw(ctx) {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 3, 3);
        ctx.globalAlpha = 1;
    }
}

function loopFireworks() {
    requestAnimationFrame(loopFireworks);

    // Trail effect using destination-out to fade previous frame
    // This makes particles fade to transparency without blackening the background
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Fade speed
    ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    // Reset composite operation to draw new frame
    ctx.globalCompositeOperation = 'source-over';

    // Random launch
    if (Math.random() < 0.03) {
        const x = Math.random() * fireworksCanvas.width;
        const targetY = Math.random() * (fireworksCanvas.height * 0.6); // Top 60%
        rockets.push(new Rocket(x, fireworksCanvas.height, targetY));
    }

    // Update Rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        if (!r.update()) {
            rockets.splice(i, 1);
        } else {
            r.draw(ctx);
        }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p.update()) {
            particles.splice(i, 1);
        } else {
            p.draw(ctx);
        }
    }
}

// Start
window.onload = init;
window.onresize = () => {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
};
