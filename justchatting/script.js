/* ============================================================
   CozyGamingFish - Just Chatting Scene - Script
============================================================ */

// ---- CONFIG ----
const TWITCH_CHANNEL = 'CozyGamingFish'; // Ton nom de channel Twitch (sensible à la casse)
const MAX_MESSAGES   = 12;               // Nombre max de messages affichés en même temps

// Palette de couleurs pour les usernames sans couleur définie
const USER_COLORS = [
    '#2087B5', '#FF7B00', '#00C9A7', '#FF6B9D',
    '#A855F7', '#F59E0B', '#10B981', '#3B82F6',
];

// ============================================================
//  CHATBOX
// ============================================================

const chatMessages = document.getElementById('chat-messages');

function getUserColor(username) {
    // Génère une couleur cohérente par username
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

function getInitial(username) {
    return username.charAt(0).toUpperCase();
}

function addChatMessage(user, message, flags) {
    const isMod = flags && flags.mod;
    const isSub = flags && flags.subscriber;
    const isVip = flags && (flags.vip || (user.badges && user.badges.vip));

    const color = (user && user.color) ? user.color : getUserColor(user.username || user.displayName || 'anon');
    const username = user.displayName || user.username || 'Anon';

    // Création de l'élément message
    const msgEl = document.createElement('div');
    msgEl.classList.add('chat-message');
    if (isSub) msgEl.classList.add('is-sub');
    if (isMod) msgEl.classList.add('is-mod');
    msgEl.style.setProperty('--user-color', color);

    // Badges
    let badgesHTML = '';
    if (isMod) badgesHTML += '<span class="chat-badge mod">MOD</span>';
    if (isSub) badgesHTML += '<span class="chat-badge sub">SUB</span>';
    if (isVip) badgesHTML += '<span class="chat-badge vip">VIP</span>';

    // Sanitize message (évite l'injection HTML)
    const safeMessage = message
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    msgEl.innerHTML = `
        <div class="chat-avatar" style="background: ${color};">${getInitial(username)}</div>
        <div class="chat-content">
            <div class="chat-username">${badgesHTML}${username}</div>
            <div class="chat-text">${safeMessage}</div>
        </div>
    `;

    chatMessages.appendChild(msgEl);

    // Limiter le nombre de messages
    const allMessages = chatMessages.querySelectorAll('.chat-message');
    if (allMessages.length > MAX_MESSAGES) {
        // Fade out + supprime le plus vieux
        const oldest = allMessages[0];
        oldest.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        oldest.style.opacity = '0';
        oldest.style.transform = 'translateX(-20px)';
        setTimeout(() => oldest.remove(), 300);
    }

    // Effet bulle dorée pour les subs
    if (isSub) {
        spawnSubBubbles();
    }
}

// ============================================================
//  COMFY.JS — Connexion au chat Twitch
// ============================================================

ComfyJS.onChat = (user, message, flags, self, extra) => {
    addChatMessage(
        { username: user, displayName: extra?.displayName || user, color: extra?.userColor },
        message,
        flags
    );
};

ComfyJS.onCommand = (user, command, message, flags, extra) => {
    // Les commandes !commande sont aussi des messages
    addChatMessage(
        { username: user, displayName: extra?.displayName || user, color: extra?.userColor },
        `!${command} ${message}`,
        flags
    );
};

ComfyJS.Init(TWITCH_CHANNEL);

// ============================================================
//  BULLES DE FOND (ambient)
// ============================================================

function initBgBubbles() {
    const container = document.getElementById('bg-bubbles');
    if (!container) return;

    function createBgBubble() {
        const bubble = document.createElement('div');
        bubble.classList.add('bg-bubble');
        const size = Math.random() * 60 + 10;
        bubble.style.width  = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left   = `${Math.random() * 100}%`;
        const duration = Math.random() * 20 + 15;
        const delay    = Math.random() * 10;
        bubble.style.animationDuration = `${duration}s`;
        bubble.style.animationDelay    = `${delay}s`;
        container.appendChild(bubble);
        setTimeout(() => bubble.remove(), (duration + delay + 2) * 1000);
    }

    // Lance des bulles régulièrement
    setInterval(createBgBubble, 800);
    // Pré-remplit un peu
    for (let i = 0; i < 8; i++) createBgBubble();
}

// ============================================================
//  BULLES WEBCAM (identique à l'overlay principal)
// ============================================================

function initWebcamBubbles() {
    const bubblesContainer = document.getElementById('bubbles-container');
    if (!bubblesContainer) return;

    if (window.bubbleInterval) clearInterval(window.bubbleInterval);

    function createBubble() {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        const size = Math.random() * 25 + 8;
        bubble.style.width  = `${size}px`;
        bubble.style.height = `${size}px`;

        let leftPosition = 5 + (Math.random() * 85);
        if (leftPosition > 25 && leftPosition < 75) {
            leftPosition = Math.random() > 0.5 ? 5 + (Math.random() * 20) : 75 + (Math.random() * 15);
        }
        bubble.style.left = `${leftPosition}%`;

        const animDuration  = Math.random() * 4 + 3;
        const delay         = Math.random() * 2;
        const wobbleDuration = Math.random() * 2 + 2;
        bubble.style.animation = `floatUp ${animDuration}s ease-in forwards ${delay}s, wobble ${wobbleDuration}s ease-in-out infinite alternate ${delay}s`;

        bubblesContainer.appendChild(bubble);
        setTimeout(() => bubble.remove(), (animDuration + 2) * 1000);
    }

    window.bubbleInterval = setInterval(createBubble, 200);
}

// ============================================================
//  BULLES DORÉES (sub)
// ============================================================

function spawnSubBubbles() {
    const goldContainer = document.getElementById('gold-bubbles-container');
    if (!goldContainer) return;

    let count = 0;
    const interval = setInterval(() => {
        for (let i = 0; i < 3; i++) {
            const bubble = document.createElement('div');
            bubble.classList.add('bubble', 'gold');
            const size = Math.random() * 20 + 10;
            bubble.style.width  = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left   = `${45 + Math.random() * 10}%`;
            bubble.style.bottom = '10px';
            const animDuration   = Math.random() * 2 + 2;
            const delay          = Math.random() * 0.5;
            const wobbleDuration = Math.random() * 1 + 1;
            bubble.style.animation = `floatUp ${animDuration}s ease-out forwards ${delay}s, wobble ${wobbleDuration}s ease-in-out infinite alternate ${delay}s`;
            goldContainer.appendChild(bubble);
            setTimeout(() => bubble.remove(), (animDuration + 2) * 1000);
        }
        count++;
        if (count > 15) clearInterval(interval);
    }, 60);
}

// ============================================================
//  ÉVÉNEMENTS STREAMELEMENTS (Follow / Sub)
// ============================================================

window.addEventListener('onEventReceived', function (obj) {
    if (!obj.detail || !obj.detail.event) return;
    const listener = obj.detail.listener;

    if (listener === 'follower-latest') {
        const name = obj.detail.event.name || 'Someone';
        addChatMessage(
            { username: '🎣 Nouveau Follow !', displayName: '🎣 Nouveau Follow !', color: '#2087B5' },
            `${name} vient de follow ! Bienvenue dans l'aquarium 🐟`,
            {}
        );
    }

    if (listener === 'subscriber-latest') {
        const name = obj.detail.event.name || 'Someone';
        addChatMessage(
            { username: '⭐ Nouveau Sub !', displayName: '⭐ Nouveau Sub !', color: '#FFD700' },
            `${name} vient de sub ! Merci pour le poisson 🐠✨`,
            { subscriber: true }
        );
        spawnSubBubbles();
    }
});

// ============================================================
//  INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initBgBubbles();
    initWebcamBubbles();
});

window.addEventListener('onWidgetLoad', () => {
    initBgBubbles();
    initWebcamBubbles();
});
