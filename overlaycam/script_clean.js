

function initOverlay() {
    const bubblesContainer = document.getElementById('bubbles-container');
    if (!bubblesContainer) return;

    // Pour éviter de lancer plusieurs fois l'intervalle si appelé en double
    if (window.bubbleInterval) clearInterval(window.bubbleInterval);

    function createBubble() {
        if (!bubblesContainer) return;
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');

        // Taille de la bulle (plus grandes)
        const size = Math.random() * 25 + 8;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;

        // Position (on s'assure qu'elles restent dans les limites : entre 5% et 90% du conteneur)
        let leftPosition = 5 + (Math.random() * 85);
        
        // On réduit fortement la probabilité qu'elles apparaissent au centre exact
        // pour ne pas gêner constamment ton visage
        if (leftPosition > 25 && leftPosition < 75) {
            leftPosition = Math.random() > 0.5 ? 5 + (Math.random() * 20) : 75 + (Math.random() * 15);
        }
        bubble.style.left = `${leftPosition}%`;

        // Vitesse d'animation et délai
        const animationDuration = Math.random() * 4 + 3;
        const delay = Math.random() * 2;
        
        // Vitesse d'ondulation (wobble)
        const wobbleDuration = Math.random() * 2 + 2;

        bubble.style.animation = `floatUp ${animationDuration}s ease-in forwards ${delay}s, wobble ${wobbleDuration}s ease-in-out infinite alternate ${delay}s`;

        bubblesContainer.appendChild(bubble);

        // Suppression de la bulle une fois en haut
        setTimeout(() => {
            bubble.remove();
        }, (animationDuration + 2) * 1000);
    }

    // Plus de bulles : on réduit l'intervalle (200ms au lieu de 400ms)
    window.bubbleInterval = setInterval(createBubble, 200);

    // --- EFFET FONTAINE DE BULLES (JET SUR LES CÔTÉS) ---
    function createFountainBubble(side) {
        if (!bubblesContainer) return;
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');

        // Tailles très variées pour un effet jet/remous d'eau
        const size = Math.random() * 20 + 5;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;

        // Position sur les extrémités gauche (0-15%) ou droite (85-100%)
        let leftPosition = side === 'left' ? Math.random() * 15 : 85 + (Math.random() * 15);
        bubble.style.left = `${leftPosition}%`;

        // Très rapide, remonte fort (1.5s à 2.5s)
        const animationDuration = Math.random() * 1 + 1.5; 
        const delay = Math.random() * 0.2; 
        const wobbleDuration = Math.random() * 1 + 1;

        bubble.style.animation = `floatUp ${animationDuration}s ease-out forwards ${delay}s, wobble ${wobbleDuration}s ease-in-out infinite alternate ${delay}s`;

        bubblesContainer.appendChild(bubble);

        setTimeout(() => {
            bubble.remove();
        }, (animationDuration + 2) * 1000);
    }

    // --- PRECHARGEMENT DES SONS ---
    // Le navigateur va charger les sons en mémoire dès le lancement de l'overlay, 
    // ça évite qu'ils soient bloqués quand on essaie de les lire plus tard dans un "setTimeout"
    const audioCache = {
    };

    // On force le chargement des fichiers
    Object.values(audioCache).forEach(a => a.load());

    function playSound(type, volume) {
        if (audioCache[type]) {
            // Le fait de cloner permet de jouer le même son plusieurs fois en même temps (ex: fontaine)
            const son = audioCache[type].cloneNode();
            son.volume = volume;
            son.play().catch(e => console.log("L'audio a été bloqué par le navigateur", e));
        }
    }

    // --- LECTURE DU SON DES BULLES ---
    function playBubbleSound() {
        playSound('bubble', 0.5);
    }

    // --- LECTURE DES SONS DE COFFRE ---
    function playUnlockSound() {
        playSound('unlock', 0.4); // Volume baissé (était à 0.8)
    }

    function playCoinSound() {
        playSound('coin', 0.3); // Volume baissé (était à 0.6)
    }

    function playChestBubblesSound() {
        playSound('chestBubbles', 0.2); // Volume ajustable pour les bulles du coffre
    }

    // On rend la fonction globale pour pouvoir l'appeler depuis l'événement StreamElements
    window.triggerBubbleFountain = function() {
        // --- JOUER LE SON ---
        playBubbleSound();

        let count = 0;
        // Déclenche une salve de bulles toutes les 50ms pendant ~1.5 secondes (30 itérations)
        const fountainInterval = setInterval(() => {
            // 3 bulles à gauche et 3 à droite par salve pour un effet dense (fontaine)
            for(let i=0; i<3; i++) {
                createFountainBubble('left');
                createFountainBubble('right');
            }
            count++;
            if (count > 30) { 
                clearInterval(fountainInterval);
            }
        }, 50);
    };

    // --- ANIMATION COFFRE AU TRÉSOR (SUBS) ---
    window.triggerTreasureChest = function() {
        const lottieContainer = document.getElementById('lottie-chest');
        const lottieCoralsContainer = document.getElementById('lottie-corals');
        if (!lottieContainer) return;

        // On affiche et on prépare le coffre avec l'animation de slide
        lottieContainer.style.display = 'block';
        lottieContainer.classList.remove('hide');
        lottieContainer.classList.add('show');
        
        // On prépare les coraux avec une belle animation d'arrivée
        if (lottieCoralsContainer) {
            lottieCoralsContainer.style.display = 'block';
            lottieCoralsContainer.classList.remove('hide');
            lottieCoralsContainer.classList.add('show');
        }

        // Si l'animation existe déjà, on la détruit pour la recommencer proprement
        if (window.chestAnimation) {
            window.chestAnimation.destroy();
        }
        if (window.coralsAnimation) {
            window.coralsAnimation.destroy();
        }

        // On charge et lance l'animation Lottie du coffre
            window.chestAnimation = bodymovin.loadAnimation({
                container: lottieContainer, 
                renderer: 'svg',
                loop: false, // Ne joue qu'une fois
                autoplay: true,
                animationData: window.lottieAnimationData // Variable globale provenant de animationData.js
            });

            // GESTION SÉCURISÉE DU Z-INDEX: On force le passage au premier plan après le slideUp
            lottieContainer.style.zIndex = '9'; // Part de derrière
            setTimeout(() => {
                lottieContainer.style.zIndex = '15'; // Passe par-dessus au moment du bounce (1.15s)
            }, 1150);
            
                // On charge et lance l'animation Lottie des coraux (si elle existe)
                if (lottieCoralsContainer && window.lottieCoralsData) {
                    window.coralsAnimation = bodymovin.loadAnimation({
                        container: lottieCoralsContainer, 
                        renderer: 'svg',
                        loop: false, // Ne joue qu'une fois
                        autoplay: true,
                        animationData: window.lottieCoralsData
                    });
                }

                // On joue les sons du coffre
                setTimeout(() => {
                    playUnlockSound(); // Bruit de déverrouillage au début
                    
                    // Un peu plus tard, quand le coffre s'ouvre, le bruit des pièces
                    setTimeout(() => {
                        playCoinSound();
                    }, 400); // Ajuste ce délai (400ms) selon le timing visuel de l'ouverture
                    
            // On ajoute le son des bulles jaunes du coffre
            playChestBubblesSound();
            
            // Effet d'éruption de bulles dorées
            let goldCount = 0;
            const goldInterval = setInterval(() => {
                for(let i=0; i<3; i++) {
                    createGoldBubble();
                }
                goldCount++;
                if (goldCount > 20) { // Crée ~60 bulles dorées sur 1 seconde
                    clearInterval(goldInterval);
                }
            }, 50);
                }, 500);

        // Quand l'animation Lottie est terminée, on la cache et on la détruit
        window.chestAnimation.addEventListener('complete', () => {
            // On déclenche l'animation de départ vers le bas pour le coffre
            lottieContainer.classList.remove('show');
            lottieContainer.classList.add('hide');
            lottieContainer.style.zIndex = '9'; // Sécurité : on le remet derrière pour sa descente
            
            setTimeout(() => {
                lottieContainer.style.display = 'none';
                window.chestAnimation.destroy();
            }, 600); // 600ms correspond à slideDown
            
            if (lottieCoralsContainer) {
                // On déclenche l'animation de départ vers le bas pour les coraux
                lottieCoralsContainer.classList.remove('show');
                lottieCoralsContainer.classList.add('hide');
                
                // Et on détruit l'animation lottie après que l'élément soit descendu
                setTimeout(() => {
                    lottieCoralsContainer.style.display = 'none';
                    if (window.coralsAnimation) window.coralsAnimation.destroy();
                }, 600);
            }
        });
    };

    // Fonction pour créer une bulle dorée au centre (au-dessus du coffre)
    function createGoldBubble() {
        const goldBubblesContainer = document.getElementById('gold-bubbles-container');
        if (!goldBubblesContainer) return;
        const bubble = document.createElement('div');
        bubble.classList.add('bubble', 'gold');

        const size = Math.random() * 20 + 10;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;

        // Les bulles dorées partent du centre (vers 50%) et s'éparpillent un peu
        let leftPosition = 45 + (Math.random() * 10);
        bubble.style.left = `${leftPosition}%`;
        bubble.style.bottom = '10px'; // Partent d'un peu plus haut (du coffre)

        const animationDuration = Math.random() * 2 + 2; 
        const delay = Math.random() * 0.5; 
        const wobbleDuration = Math.random() * 1 + 1;

        // Elles flottent vers le haut
        bubble.style.animation = `floatUp ${animationDuration}s ease-out forwards ${delay}s, wobble ${wobbleDuration}s ease-in-out infinite alternate ${delay}s`;

        goldBubblesContainer.appendChild(bubble);

        setTimeout(() => {
            bubble.remove();
        }, (animationDuration + 2) * 1000);
    }

    // Bonus : Clique sur ton pseudo pour tester la fontaine, double-clique pour tester le coffre !
    const nameplate = document.querySelector('.nameplate');
    if (nameplate) {
        nameplate.replaceWith(nameplate.cloneNode(true));
        const newNameplate = document.querySelector('.nameplate');
        
        newNameplate.addEventListener('click', (e) => {
            // Empêche le déclenchement du click normal si c'est un double-click
            if (e.detail === 1) { 
                window.clickTimeout = setTimeout(() => {
                    window.triggerBubbleFountain();
                }, 200);
            } else if (e.detail === 2) {
                clearTimeout(window.clickTimeout);
                window.triggerTreasureChest();
            }
        });
    }
}

// Lancement pour le fichier local (OBS Direct)
document.addEventListener('DOMContentLoaded', initOverlay);

// Lancement pour le widget StreamElements
window.addEventListener('onWidgetLoad', initOverlay);

// --- ÉCOUTE DES ÉVÉNEMENTS STREAMELEMENTS (FOLLOW & SUBS) ---
window.addEventListener('onEventReceived', function (obj) {
    if (!obj.detail || !obj.detail.event) return;
    
    const listener = obj.detail.listener;
    
    // Si c'est un Follow (Fontaine normale sur les côtés)
    if (listener === 'follower-latest') {
        if (window.triggerBubbleFountain) window.triggerBubbleFountain();
    }
    
    // Si c'est un Sub (Coffre au trésor + bulles dorées au centre)
    if (listener === 'subscriber-latest') {
        if (window.triggerTreasureChest) window.triggerTreasureChest();
    }
});
