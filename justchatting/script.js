/* ============================================================
   CozyGamingFish - Just Chatting Scene
============================================================ */

const TWITCH_CHANNEL = 'CozyGamingFish';
const MAX_MESSAGES   = 10;

const USER_COLORS = [
    '#2087B5', '#FF7B00', '#00C9A7', '#FF6B9D',
    '#A855F7', '#F59E0B', '#10B981', '#3B82F6',
];

// ============================================================
//  CANVAS FOND ANIMÉ — Aquarium profond
// ============================================================

function initBgCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = 1920;
    canvas.height = 1080;

    // --- Particules (bulles d'eau) ---
    const particles = [];
    for (let i = 0; i < 80; i++) {
        particles.push({
            x:    Math.random() * 1920,
            y:    Math.random() * 1080 + 1080, // start below screen
            r:    Math.random() * 8 + 2,
            speed: Math.random() * 0.4 + 0.15,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.015 + 0.005,
            wobbleAmp: Math.random() * 18 + 5,
            opacity: Math.random() * 0.25 + 0.05,
        });
    }

    // --- Rayons lumineux ---
    const rays = [];
    for (let i = 0; i < 7; i++) {
        rays.push({
            x:     200 + Math.random() * 1520,
            angle: -Math.PI / 2 + (Math.random() - 0.5) * 0.6,
            width: Math.random() * 120 + 40,
            opacity: Math.random() * 0.04 + 0.01,
            speed:  Math.random() * 0.0003 + 0.0001,
            phase:  Math.random() * Math.PI * 2,
        });
    }

    // --- Poissons ambiants ---
    const fishes = [];
    const fishEmojis = ['🐟', '🐠', '🐡', '🐬'];
    for (let i = 0; i < 4; i++) {
        fishes.push({
            x:      Math.random() * 1920,
            y:      100 + Math.random() * 880,
            speed:  (Math.random() * 0.4 + 0.2) * (Math.random() > 0.5 ? 1 : -1),
            emoji:  fishEmojis[Math.floor(Math.random() * fishEmojis.length)],
            size:   18 + Math.random() * 14,
            bob:    Math.random() * Math.PI * 2,
            bobSpeed: Math.random() * 0.02 + 0.01,
            opacity: 0.12 + Math.random() * 0.1,
        });
    }

    let t = 0;

    function draw() {
        t++;
        ctx.clearRect(0, 0, 1920, 1080);

        // --- Fond dégradé ocean ---
        const grad = ctx.createLinearGradient(0, 0, 0, 1080);
        grad.addColorStop(0,   '#04111E');
        grad.addColorStop(0.4, '#061828');
        grad.addColorStop(0.8, '#072035');
        grad.addColorStop(1,   '#04111E');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1920, 1080);

        // --- Couches de profondeur (vagues horizontales) ---
        for (let layer = 0; layer < 3; layer++) {
            const layerOpacity = 0.025 - layer * 0.006;
            const layerY = 300 + layer * 220;
            const amplitude = 30 - layer * 8;
            const freq = 0.003 + layer * 0.001;
            ctx.beginPath();
            ctx.moveTo(0, layerY);
            for (let x = 0; x <= 1920; x += 4) {
                const y = layerY + Math.sin(x * freq + t * 0.008 + layer * 1.2) * amplitude;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(1920, 1080);
            ctx.lineTo(0, 1080);
            ctx.closePath();
            ctx.fillStyle = `rgba(32,135,181,${layerOpacity})`;
            ctx.fill();
        }

        // --- Rayons lumineux (caustiques) ---
        rays.forEach(ray => {
            ray.phase += ray.speed;
            const alpha = ray.opacity * (0.6 + 0.4 * Math.sin(ray.phase));
            const len = 900 + Math.sin(ray.phase * 1.3) * 100;

            ctx.save();
            ctx.translate(ray.x, -50);
            ctx.rotate(ray.angle);

            const rayGrad = ctx.createLinearGradient(0, 0, 0, len);
            rayGrad.addColorStop(0,   `rgba(100,200,255,${alpha})`);
            rayGrad.addColorStop(0.5, `rgba(32,135,181,${alpha * 0.5})`);
            rayGrad.addColorStop(1,   `rgba(32,135,181,0)`);

            ctx.fillStyle = rayGrad;
            ctx.beginPath();
            ctx.moveTo(-ray.width / 2, 0);
            ctx.lineTo(ray.width / 2, 0);
            ctx.lineTo(ray.width * 0.8, len);
            ctx.lineTo(-ray.width * 0.8, len);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });

        // --- Lueur orange subtile en bas (reflet aquarium) ---
        const orangeGrad = ctx.createRadialGradient(960, 1100, 0, 960, 1100, 700);
        orangeGrad.addColorStop(0,   'rgba(255,123,0,0.06)');
        orangeGrad.addColorStop(0.5, 'rgba(255,123,0,0.02)');
        orangeGrad.addColorStop(1,   'rgba(255,123,0,0)');
        ctx.fillStyle = orangeGrad;
        ctx.fillRect(0, 0, 1920, 1080);

        // --- Lueur cyan en haut (surface de l'eau) ---
        const cyanGrad = ctx.createRadialGradient(960, -50, 0, 960, -50, 600);
        cyanGrad.addColorStop(0,   'rgba(32,135,181,0.08)');
        cyanGrad.addColorStop(0.6, 'rgba(32,135,181,0.02)');
        cyanGrad.addColorStop(1,   'rgba(32,135,181,0)');
        ctx.fillStyle = cyanGrad;
        ctx.fillRect(0, 0, 1920, 1080);

        // --- Bulles ---
        particles.forEach(p => {
            p.y     -= p.speed;
            p.wobble += p.wobbleSpeed;
            const x = p.x + Math.sin(p.wobble) * p.wobbleAmp;

            if (p.y < -20) {
                p.y = 1100 + Math.random() * 200;
                p.x = Math.random() * 1920;
            }

            ctx.save();
            ctx.globalAlpha = p.opacity;

            // Bulle
            const bubbleGrad = ctx.createRadialGradient(x - p.r * 0.3, p.y - p.r * 0.3, 0, x, p.y, p.r);
            bubbleGrad.addColorStop(0,   'rgba(255,255,255,0.6)');
            bubbleGrad.addColorStop(0.4, 'rgba(100,200,255,0.15)');
            bubbleGrad.addColorStop(1,   'rgba(32,135,181,0.05)');

            ctx.beginPath();
            ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = bubbleGrad;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Reflet sur la bulle
            ctx.beginPath();
            ctx.arc(x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fill();

            ctx.restore();
        });

        // --- Poissons ambiants ---
        fishes.forEach(f => {
            f.x    += f.speed;
            f.bob  += f.bobSpeed;
            const y = f.y + Math.sin(f.bob) * 8;

            if (f.x > 1960)  f.x = -60;
            if (f.x < -60)   f.x = 1960;

            ctx.save();
            ctx.globalAlpha = f.opacity;
            ctx.font = `${f.size}px serif`;
            ctx.textBaseline = 'middle';
            if (f.speed < 0) {
                ctx.scale(-1, 1);
                ctx.fillText(f.emoji, -f.x, y);
            } else {
                ctx.fillText(f.emoji, f.x, y);
            }
            ctx.restore();
        });

        requestAnimationFrame(draw);
    }

    draw();
}

// ============================================================
//  BULLES WEBCAM
// ============================================================

function initWebcamBubbles() {
    const container = document.getElementById('bubbles-container');
    if (!container) return;
    if (window.bubbleInterval) clearInterval(window.bubbleInterval);

    function createBubble() {
        const b = document.createElement('div');
        b.classList.add('bubble');
        const size = Math.random() * 22 + 6;
        b.style.width  = `${size}px`;
        b.style.height = `${size}px`;
        let left = 5 + Math.random() * 85;
        if (left > 25 && left < 75) left = Math.random() > 0.5 ? 5 + Math.random() * 20 : 75 + Math.random() * 15;
        b.style.left = `${left}%`;
        const dur  = Math.random() * 4 + 3;
        const del  = Math.random() * 2;
        const wob  = Math.random() * 2 + 2;
        b.style.animation = `floatUp ${dur}s ease-in forwards ${del}s, wobble ${wob}s ease-in-out infinite alternate ${del}s`;
        container.appendChild(b);
        setTimeout(() => b.remove(), (dur + 2) * 1000);
    }

    window.bubbleInterval = setInterval(createBubble, 220);
}

// ============================================================
//  BULLES DORÉES (sub)
// ============================================================

function spawnSubBubbles() {
    const container = document.getElementById('gold-bubbles-container');
    if (!container) return;
    let count = 0;
    const iv = setInterval(() => {
        for (let i = 0; i < 3; i++) {
            const b = document.createElement('div');
            b.classList.add('bubble', 'gold');
            const size = Math.random() * 18 + 8;
            b.style.width  = `${size}px`;
            b.style.height = `${size}px`;
            b.style.left   = `${45 + Math.random() * 10}%`;
            b.style.bottom = '10px';
            const dur = Math.random() * 2 + 2;
            const del = Math.random() * 0.4;
            const wob = Math.random() * 1 + 1;
            b.style.animation = `floatUp ${dur}s ease-out forwards ${del}s, wobble ${wob}s ease-in-out infinite alternate ${del}s`;
            container.appendChild(b);
            setTimeout(() => b.remove(), (dur + 2) * 1000);
        }
        count++;
        if (count > 15) clearInterval(iv);
    }, 60);
}

// ============================================================
//  CHATBOX
// ============================================================

const chatMessages = document.getElementById('chat-messages');

function getUserColor(username) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

function addChatMessage(user, message, flags) {
    const isMod = flags && flags.mod;
    const isSub = flags && flags.subscriber;
    const isVip = flags && flags.vip;
    const color    = (user.color) ? user.color : getUserColor(user.username || 'anon');
    const username = user.displayName || user.username || 'Anon';

    const el = document.createElement('div');
    el.classList.add('chat-message');
    if (isSub) el.classList.add('is-sub');
    if (isMod) el.classList.add('is-mod');
    el.style.setProperty('--user-color', color);

    let badges = '';
    if (isMod) badges += '<span class="chat-badge mod">MOD</span>';
    if (isSub) badges += '<span class="chat-badge sub">SUB</span>';
    if (isVip) badges += '<span class="chat-badge vip">VIP</span>';

    const safe = message.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    el.innerHTML = `
        <div class="chat-avatar" style="background:${color};">${username.charAt(0).toUpperCase()}</div>
        <div class="chat-content">
            <div class="chat-username">${badges}${username}</div>
            <div class="chat-text">${safe}</div>
        </div>`;

    chatMessages.appendChild(el);

    const all = chatMessages.querySelectorAll('.chat-message');
    if (all.length > MAX_MESSAGES) {
        const old = all[0];
        old.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        old.style.opacity = '0';
        old.style.transform = 'translateX(-15px)';
        setTimeout(() => old.remove(), 300);
    }

    if (isSub) spawnSubBubbles();
}

// ============================================================
//  COMFY.JS
// ============================================================

ComfyJS.onChat = (user, message, flags, self, extra) => {
    addChatMessage(
        { username: user, displayName: extra?.displayName || user, color: extra?.userColor },
        message, flags
    );
};

ComfyJS.onCommand = (user, command, message, flags, extra) => {
    addChatMessage(
        { username: user, displayName: extra?.displayName || user, color: extra?.userColor },
        `!${command} ${message}`, flags
    );
};

ComfyJS.Init(TWITCH_CHANNEL);

// ============================================================
//  STREAMELEMENTS EVENTS
// ============================================================

window.addEventListener('onEventReceived', function (obj) {
    if (!obj.detail || !obj.detail.event) return;
    const listener = obj.detail.listener;
    const name = obj.detail.event.name || 'Quelqu\'un';

    if (listener === 'follower-latest') {
        document.getElementById('last-follower').textContent = name;
        addChatMessage(
            { username: '🎣 Nouveau Follow !', color: '#2087B5' },
            `${name} vient de follow ! Bienvenue dans l'aquarium 🐟`, {}
        );
    }

    if (listener === 'subscriber-latest') {
        document.getElementById('last-sub').textContent = name;
        addChatMessage(
            { username: '⭐ Nouveau Sub !', color: '#FFD700' },
            `${name} vient de sub ! Merci pour le poisson 🐠✨`,
            { subscriber: true }
        );
        spawnSubBubbles();
    }
});

// ============================================================
//  INIT
// ============================================================

function init() {
    initBgCanvas();
    initWebcamBubbles();
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('onWidgetLoad', init);
