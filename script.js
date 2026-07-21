/**
 * Logique du jeu "Gender Reveal"
 */

// === DOM ELEMENTS ===
const homeView = document.getElementById('home-view');
const gameView = document.getElementById('game-view');
const revealView = document.getElementById('reveal-view');

const btnStart = document.getElementById('btn-start');
const btnSpin = document.getElementById('btn-spin');
const wheelImg = document.getElementById('wheel-img');

const modalOverlay = document.getElementById('modal-overlay');
const modalEmoji = document.getElementById('modal-emoji');
const modalTitle = document.getElementById('modal-title');
const modalText = document.getElementById('modal-text');
const btnNextTurn = document.getElementById('btn-next-turn');

const envelopeWrapper = document.getElementById('envelope-wrapper');
const replayContainer = document.getElementById('replay-container');
const btnReplay = document.getElementById('btn-replay');

// === VARIABLES D'ETAT ===
let currentTurn = 1;
let currentRotation = 0; // Conserve la rotation totale accumulée
let previousItems = []; // Historique des objets tirés

// === CONFIGURATION DE LA ROUE ===
const wheelItems = [
    { name: "Cube", emoji: "🧊", angle: 0 },
    { name: "Ballon", emoji: "🎈", angle: 30 },
    { name: "Licorne", emoji: "🦄", angle: 60 },
    { name: "Noeud", emoji: "🎀", angle: 90 },
    { name: "Arc-en-ciel", emoji: "🌈", angle: 120 },
    { name: "Voiture", emoji: "🚗", angle: 150 },
    { name: "Chaussons", emoji: "🩰", angle: 180 },
    { name: "Biberon", emoji: "🍼", angle: 210 },
    { name: "Ours", emoji: "🧸", angle: 240 },
    { name: "Étoile", emoji: "⭐", angle: 270 },
    { name: "Enveloppe", emoji: "✉️", angle: 300 },
    { name: "Dino", emoji: "🦖", angle: 330 }
];

// === FONCTIONS UTILES ===
function getRandomItem() {
    let availableItems = wheelItems.filter(item => 
        item.name !== "Enveloppe" && !previousItems.includes(item.name)
    );
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    return availableItems[randomIndex];
}

// Lancer le jeu depuis l'accueil
btnStart.addEventListener('click', () => {
    homeView.classList.add('hidden');
    setTimeout(() => {
        gameView.classList.remove('hidden');
    }, 400);
});

// Gérer le clic sur "Faire tourner"
btnSpin.addEventListener('click', () => {
    btnSpin.disabled = true;
    
    let targetItem;
    let spinDuration;
    let extraSpins;

    if (currentTurn === 1 || currentTurn === 2) {
        targetItem = getRandomItem();
        previousItems.push(targetItem.name);
        extraSpins = 4;
        spinDuration = 4;
    } else {
        targetItem = wheelItems.find(i => i.name === "Enveloppe");
        extraSpins = 7;
        spinDuration = 7;
    }

    // NOUVEAU CALCUL ULTRA PRÉCIS (Méthode Delta)
    const currentAngleModulo = currentRotation % 360;
    const targetAngle = (360 - targetItem.angle) % 360;
    
    let delta = targetAngle - currentAngleModulo;
    if (delta <= 0) {
        delta += 360; // Force la roue à toujours tourner vers l'avant
    }

    // Nouvelle rotation ajoutée avec une précision mathématique parfaite
    const newRotation = currentRotation + (extraSpins * 360) + delta;

    wheelImg.style.transition = `transform ${spinDuration}s cubic-bezier(0.25, 1, 0.25, 1)`;
    wheelImg.style.transform = `rotate(${newRotation}deg)`;
    currentRotation = newRotation;

    setTimeout(() => {
        handleTurnEnd(targetItem);
    }, spinDuration * 1000 + 300);
});

// Gérer la fin d'un tour
function handleTurnEnd(item) {
    if (currentTurn === 1) {
        showModal(item.emoji, item.name, "Encore un peu de patience...");
    } else if (currentTurn === 2) {
        showModal(item.emoji, item.name, "On se rapproche...");
    } else if (currentTurn === 3) {
        triggerReveal();
    }
}

// Afficher la modale (Tour 1 & 2)
function showModal(emoji, title, text) {
    modalEmoji.textContent = emoji;
    modalTitle.textContent = title;
    modalText.textContent = text;
    btnNextTurn.disabled = false;
    modalOverlay.classList.remove('hidden');
}

// Fermer la modale et passer au tour suivant
btnNextTurn.addEventListener('click', () => {
    btnNextTurn.disabled = true;
    modalOverlay.classList.add('hidden');
    
    currentTurn++;
    
    if (currentTurn === 3) {
        btnSpin.textContent = "Découvrir notre secret";
    } else {
        btnSpin.textContent = "Faire tourner";
    }
    
    btnSpin.disabled = false;
});

// === LOGIQUE DE REVEAL FINAL ===
function triggerReveal() {
    gameView.classList.add('hidden');
    
    setTimeout(() => {
        revealView.classList.remove('hidden');
        
        setTimeout(() => {
            envelopeWrapper.classList.add('zoom-in');
            
            setTimeout(() => {
                envelopeWrapper.classList.add('open');
                
                setTimeout(() => {
                    launchConfetti();
                    replayContainer.classList.remove('hidden');
                }, 1600);
                
            }, 1000);
        }, 500);
    }, 800);
}

// Fonction confettis
function launchConfetti() {
    var duration = 3 * 1000;
    var end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5, angle: 60, spread: 55, origin: { x: 0 },
            colors: ['#E8C1C5', '#9CAD93', '#D4AF37', '#FDFBF7']
        });
        confetti({
            particleCount: 5, angle: 120, spread: 55, origin: { x: 1 },
            colors: ['#E8C1C5', '#9CAD93', '#D4AF37', '#FDFBF7']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// Réinitialiser l'animation
btnReplay.addEventListener('click', () => {
    currentTurn = 1;
    previousItems = [];
    currentRotation = 0;
    
    btnSpin.textContent = "Faire tourner";
    btnSpin.disabled = false;
    wheelImg.style.transition = 'none';
    wheelImg.style.transform = `rotate(0deg)`;
    
    envelopeWrapper.classList.remove('zoom-in', 'open');
    replayContainer.classList.add('hidden');
    
    revealView.classList.add('hidden');
    setTimeout(() => {
        gameView.classList.remove('hidden');
    }, 800);
});