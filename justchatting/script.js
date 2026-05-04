/* ============================================================
   CozyGamingFish — Just Chatting Immersif
============================================================ */

const TWITCH_CHANNEL = 'CozyGamingFish';
const MAX_MESSAGES   = 12;

const USER_COLORS = [
    '#2087B5','#FF7B00','#00C9A7','#FF6B9D',
    '#A855F7','#F59E0B','#10B981','#3B82F6',
];

// ============================================================
//  CANVAS AQUARIUM (désactivé — géré par OBS en source séparée)
// ============================================================

function initAquarium() {
    return; // Le fond aquarium est une source vidéo OBS distincte
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = 1920;
    canvas.height = 1080;

    // --- Bulles ---
    const bubbles = Array.from({ length: 120 }, () => ({
        x:      Math.random() * 1920,
        y:      Math.random() * 1080 + 1080,
        r:      Math.random() * 9 + 1.5,
        speed:  Math.random() * 0.5 + 0.12,
        wob:    Math.random() * Math.PI * 2,
        wobSpd: Math.random() * 0.018 + 0.005,
        wobAmp: Math.random() * 22 + 4,
        alpha:  Math.random() * 0.22 + 0.04,
    }));

    // --- Rayons lumineux ---
    const rays = Array.from({ length: 9 }, () => ({
        x:     Math.random() * 1920,
        angle: -Math.PI / 2 + (Math.random() - 0.5) * 0.7,
        w:     Math.random() * 140 + 30,
        alpha: Math.random() * 0.045 + 0.01,
        phase: Math.random() * Math.PI * 2,
        spd:   Math.random() * 0.0004 + 0.0001,
    }));

    // --- Particules flottantes ---
    const particles = Array.from({ length: 60 }, () => ({
        x:     Math.random() * 1920,
        y:     Math.random() * 1080,
        r:     Math.random() * 2 + 0.5,
        vx:    (Math.random() - 0.5) * 0.15,
        vy:    -(Math.random() * 0.2 + 0.05),
        alpha: Math.random() * 0.3 + 0.05,
    }));

    // --- Poissons ambiants ---
    const fishEmoji = ['🐟','🐠','🐡','🐬','🐙'];
    const fishes = Array.from({ length: 6 }, () => {
        const dir = Math.random() > 0.5 ? 1 : -1;
        return {
            x:     Math.random() * 1920,
            y:     80 + Math.random() * 900,
            spd:   (Math.random() * 0.35 + 0.1) * dir,
            emoji: fishEmoji[Math.floor(Math.random() * fishEmoji.length)],
            size:  16 + Math.random() * 18,
            bob:   Math.random() * Math.PI * 2,
            bobSpd: Math.random() * 0.018 + 0.008,
            alpha: 0.08 + Math.random() * 0.1,
        };
    });

    let t = 0;

    function frame() {
        t++;
        ctx.clearRect(0, 0, 1920, 1080);

        // Fond dégradé profond
        const bg = ctx.createLinearGradient(0, 0, 0, 1080);
        bg.addColorStop(0,    '#03101c');
        bg.addColorStop(0.35, '#051929');
        bg.addColorStop(0.7,  '#072035');
        bg.addColorStop(1,    '#040f1a');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 1920, 1080);

        // Lueur de surface (haut)
        const surf = ctx.createLinearGradient(0, 0, 0, 260);
        surf.addColorStop(0, 'rgba(0,180,255,0.08)');
        surf.addColorStop(1, 'rgba(0,180,255,0)');
        ctx.fillStyle = surf;
        ctx.fillRect(0, 0, 1920, 260);

        // Lueur chaude au fond (reflet sable)
        const sand = ctx.createLinearGradient(0, 820, 0, 1080);
        sand.addColorStop(0, 'rgba(0,0,0,0)');
        sand.addColorStop(1, 'rgba(255,100,0,0.04)');
        ctx.fillStyle = sand;
        ctx.fillRect(0, 820, 1920, 260);

        // Vagues de profondeur subtiles
        for (let l = 0; l < 4; l++) {
            const baseY = 200 + l * 220;
            const amp   = 22 - l * 4;
            const speed = 0.006 - l * 0.001;
            ctx.beginPath();
            for (let x = 0; x <= 1920; x += 3) {
                const y = baseY + Math.sin(x * 0.0025 + t * speed + l * 1.5) * amp;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.lineTo(1920, 1080);
            ctx.lineTo(0, 1080);
            ctx.closePath();
            ctx.fillStyle = `rgba(10,100,160,${0.018 - l * 0.003})`;
            ctx.fill();
        }

        // Rayons lumineux (caustiques)
        rays.forEach(r => {
            r.phase += r.spd;
            const a = r.alpha * (0.5 + 0.5 * Math.sin(r.phase));
            const len = 850 + Math.sin(r.phase * 1.4) * 80;

            ctx.save();
            ctx.translate(r.x, -60);
            ctx.rotate(r.angle);

            const rg = ctx.createLinearGradient(0, 0, 0, len);
            rg.addColorStop(0,   `rgba(80,200,255,${a})`);
            rg.addColorStop(0.4, `rgba(32,135,181,${a * 0.5})`);
            rg.addColorStop(1,   `rgba(0,80,140,0)`);

            ctx.beginPath();
            ctx.moveTo(-r.w / 2, 0);
            ctx.lineTo(r.w / 2, 0);
            ctx.lineTo(r.w * 0.75, len);
            ctx.lineTo(-r.w * 0.75, len);
            ctx.closePath();
            ctx.fillStyle = rg;
            ctx.fill();
            ctx.restore();
        });

        // Particules flottantes
        particles.forEach(p => {
            p.x += p.vx + Math.sin(t * 0.01 + p.y * 0.005) * 0.08;
            p.y += p.vy;
            if (p.y < -5)   p.y = 1085;
            if (p.x < -5)   p.x = 1925;
            if (p.x > 1925) p.x = -5;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(100,200,255,${p.alpha})`;
            ctx.fill();
        });

        // Bulles
        bubbles.forEach(b => {
            b.y   -= b.speed;
            b.wob += b.wobSpd;
            const bx = b.x + Math.sin(b.wob) * b.wobAmp;

            if (b.y < -15) {
                b.y = 1095 + Math.random() * 100;
                b.x = Math.random() * 1920;
            }

            ctx.save();
            ctx.globalAlpha = b.alpha;

            const bg2 = ctx.createRadialGradient(bx - b.r * 0.3, b.y - b.r * 0.3, 0, bx, b.y, b.r);
            bg2.addColorStop(0,   'rgba(200,240,255,0.7)');
            bg2.addColorStop(0.4, 'rgba(80,180,220,0.15)');
            bg2.addColorStop(1,   'rgba(10,80,140,0.05)');

            ctx.beginPath();
            ctx.arc(bx, b.y, b.r, 0, Math.PI * 2);
            ctx.fillStyle = bg2;
            ctx.fill();
            ctx.strokeStyle = 'rgba(180,230,255,0.3)';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Reflet
            ctx.beginPath();
            ctx.arc(bx - b.r * 0.32, b.y - b.r * 0.32, b.r * 0.22, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.75)';
            ctx.fill();

            ctx.restore();
        });

        // Poissons ambiants
        fishes.forEach(f => {
            f.x   += f.spd;
            f.bob += f.bobSpd;
            const fy = f.y + Math.sin(f.bob) * 7;

            if (f.x > 1980)  f.x = -60;
            if (f.x < -60)   f.x = 1980;

            ctx.save();
            ctx.globalAlpha = f.alpha;
            ctx.font = `${f.size}px serif`;
            ctx.textBaseline = 'middle';

            if (f.spd < 0) {
                ctx.save();
                ctx.scale(-1, 1);
                ctx.fillText(f.emoji, -f.x, fy);
                ctx.restore();
            } else {
                ctx.fillText(f.emoji, f.x, fy);
            }
            ctx.restore();
        });

        requestAnimationFrame(frame);
    }

    frame();
}

// ============================================================
//  CHATBOX
// ============================================================

const chatEl = document.getElementById('chat-messages');

function getUserColor(username) {
    let h = 0;
    for (let i = 0; i < username.length; i++) h = username.charCodeAt(i) + ((h << 5) - h);
    return USER_COLORS[Math.abs(h) % USER_COLORS.length];
}

function addMessage(user, message, flags) {
    const isMod = flags?.mod;
    const isSub = flags?.subscriber;
    const isVip = flags?.vip;
    const color    = user.color || getUserColor(user.username || 'anon');
    const username = user.displayName || user.username || 'Anon';

    const el = document.createElement('div');
    el.classList.add('chat-message');
    if (isSub) el.classList.add('is-sub');
    el.style.setProperty('--user-color', color);

    let badges = '';
    if (isMod) badges += '<span class="chat-badge mod">MOD</span>';
    if (isSub) badges += '<span class="chat-badge sub">SUB</span>';
    if (isVip) badges += '<span class="chat-badge vip">VIP</span>';

    const safe = message
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;');

    el.innerHTML = `
        <div class="chat-avatar" style="background:${color}">${username[0].toUpperCase()}</div>
        <div class="chat-content">
            <div class="chat-username">${badges}${username}</div>
            <div class="chat-text">${safe}</div>
        </div>`;

    chatEl.appendChild(el);

    const all = chatEl.querySelectorAll('.chat-message');
    if (all.length > MAX_MESSAGES) {
        const old = all[0];
        old.style.transition = 'opacity 0.25s, transform 0.25s';
        old.style.opacity = '0';
        old.style.transform = 'translateX(-10px)';
        setTimeout(() => old.remove(), 260);
    }

    if (isSub) spawnGoldBubbles();
}

// ============================================================
//  ALERTES FLUIDES
// ============================================================

let alertTimeout = null;

function showAlert(icon, text) {
    const zone   = document.getElementById('alert-zone');
    const iconEl = document.getElementById('alert-icon');
    const textEl = document.getElementById('alert-text');

    if (!zone) return;

    if (alertTimeout) {
        clearTimeout(alertTimeout);
        zone.style.display = 'none';
    }

    iconEl.textContent = icon;
    textEl.textContent = text;
    zone.style.display = 'block';

    const bubble = document.getElementById('alert-bubble');
    bubble.style.animation = 'none';
    void bubble.offsetWidth;
    bubble.style.animation = 'alertPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';

    alertTimeout = setTimeout(() => {
        bubble.style.animation = 'alertFade 0.5s ease forwards';
        setTimeout(() => { zone.style.display = 'none'; }, 500);
    }, 5000);
}

// ============================================================
//  BULLES DORÉES (subs)
// ============================================================

function spawnGoldBubbles() {
    const container = document.getElementById('gold-bubbles-container');
    if (!container) return;
    let count = 0;
    const iv = setInterval(() => {
        for (let i = 0; i < 4; i++) {
            const b = document.createElement('div');
            b.classList.add('gold-bubble');
            const size = Math.random() * 22 + 8;
            const dur  = Math.random() * 3 + 2.5;
            b.style.cssText = `
                width:${size}px; height:${size}px;
                left:${30 + Math.random() * 280}px;
                bottom:80px;
                animation-duration:${dur}s;
                animation-delay:${Math.random() * 0.3}s;
            `;
            container.appendChild(b);
            setTimeout(() => b.remove(), (dur + 0.5) * 1000);
        }
        count++;
        if (count > 18) clearInterval(iv);
    }, 55);
}

// ============================================================
//  COMFY.JS
// ============================================================

ComfyJS.onChat = (user, message, flags, self, extra) => {
    addMessage(
        { username: user, displayName: extra?.displayName || user, color: extra?.userColor },
        message, flags
    );
};

ComfyJS.onCommand = (user, command, message, flags, extra) => {
    addMessage(
        { username: user, displayName: extra?.displayName || user, color: extra?.userColor },
        `!${command} ${message}`, flags
    );
};

ComfyJS.Init(TWITCH_CHANNEL);

// ============================================================
//  STREAMELEMENTS EVENTS
// ============================================================

window.addEventListener('onEventReceived', function (obj) {
    if (!obj.detail?.event) return;
    const listener = obj.detail.listener;
    const name = obj.detail.event.name || 'Quelqu\'un';

    if (listener === 'follower-latest') {
        document.getElementById('last-follower').textContent = name;
        showAlert('🎣', `${name} vient de follow ! Bienvenue 🐟`);
    }

    if (listener === 'subscriber-latest') {
        document.getElementById('last-sub').textContent = name;
        showAlert('⭐', `${name} vient de sub ! Merci du fond de l'aquarium 🐠`);
        spawnGoldBubbles();
    }
});

// ============================================================
//  LOTTIE COINS
// ============================================================

function initLottieCorners() {
    ['lottie-corner-tr', 'lottie-corner-br'].forEach(id => {
        const el = document.getElementById(id);
        if (el && window.lottieOceanData) {
            bodymovin.loadAnimation({
                container: el,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                animationData: window.lottieOceanData
            });
        }
    });
}

// ============================================================
//  INIT
// ============================================================

function init() {
    initAquarium();
    initLottieCorners();
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('onWidgetLoad', init);
