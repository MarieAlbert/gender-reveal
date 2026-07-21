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
const turnCounterText = document.getElementById('turn-counter');

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
// 12 cases équitablement réparties (360 / 12 = 30 degrés par case).
// L'ordre ci-dessous sert de référence pour le placement logique.
const wheelItems = [
    { name: "Dino", emoji: "🦖", angle: 0 },
    { name: "Cube", emoji: "🧊", angle: 30 },
    { name: "Ballon", emoji: "🎈", angle: 60 },
    { name: "Licorne", emoji: "🦄", angle: 90 },
    { name: "Noeud", emoji: "🎀", angle: 120 },
    { name: "Arc-en-ciel", emoji: "🌈", angle: 150 },
    { name: "Chaussons", emoji: "🩰", angle: 180 },
    { name: "Voiture", emoji: "🚗", angle: 210 },
    { name: "Biberon", emoji: "🍼", angle: 240 },
    { name: "Ours", emoji: "🧸", angle: 270 },
    { name: "Étoile", emoji: "⭐", angle: 300 },
    { name: "Enveloppe", emoji: "✉️", angle: 330 }
];

// === FONCTIONS UTILES ===

// Tirer un objet aléatoire selon les règles
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
    }, 400); // Transition douce
});

// Gérer le clic sur "Faire tourner"
btnSpin.addEventListener('click', () => {
    // Désactiver le bouton pendant que ça tourne
    btnSpin.disabled = true;
    
    let targetItem;
    let spinDuration;
    let extraSpins;

    // Définir la cible en fonction du tour
    if (currentTurn === 1 || currentTurn === 2) {
        targetItem = getRandomItem();
        previousItems.push(targetItem.name);
        extraSpins = 4; // Inertie standard
        spinDuration = 4; // 4 secondes
    } else {
        // Tour 3
        targetItem = wheelItems.find(i => i.name === "Enveloppe");
        extraSpins = 7; // Tourne plus longtemps pour le suspense
        spinDuration = 7; // 7 secondes
    }

    // CALIBRAGE DE TA ROUE : 
    // Si l'aiguille tombe un peu à côté de l'enveloppe, modifie ce chiffre (ex: 15, 30, -20, etc.)
    // jusqu'à ce que ça tombe pile poil au centre de la case enveloppe !
    const ajustementImage = 33; 

    // Calcul de la rotation
    const targetAngle = 360 - targetItem.angle + ajustementImage;
    
    // Aligne sur le tour précédent pour ne pas rembobiner
    const currentSpins = Math.floor(currentRotation / 360);
    const newRotation = (currentSpins + extraSpins) * 360 + targetAngle;

    // Appliquer la rotation
    wheelImg.style.transition = `transform ${spinDuration}s cubic-bezier(0.25, 1, 0.25, 1)`;
    wheelImg.style.transform = `rotate(${newRotation}deg)`;
    currentRotation = newRotation;

    // Attendre la fin de la rotation
    setTimeout(() => {
        handleTurnEnd(targetItem);
    }, spinDuration * 1000 + 300); // Marge de sécurité de 300ms
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
    modalOverlay.classList.remove('hidden');
}

// Fermer la modale et passer au tour suivant
btnNextTurn.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
    
    currentTurn++;
    turnCounterText.textContent = `Tour ${currentTurn} / 3`;
    
    if (currentTurn === 3) {
        btnSpin.textContent = "Découvrir notre secret";
    }
    
    btnSpin.disabled = false;
});

// === LOGIQUE DE REVEAL FINAL ===
function triggerReveal() {
    // Transition vers l'écran sombre
    gameView.classList.add('hidden');
    
    setTimeout(() => {
        revealView.classList.remove('hidden');
        
        // Déclencher l'animation d'ouverture de l'enveloppe
        setTimeout(() => {
            envelopeWrapper.classList.add('zoom-in');
            
            setTimeout(() => {
                envelopeWrapper.classList.add('open');
                
                // Lancer les confettis une fois la carte sortie (env. 1.5s après 'open')
                setTimeout(() => {
                    launchConfetti();
                    replayContainer.classList.remove('hidden');
                }, 1600);
                
            }, 1000);
            
        }, 500); // Léger délai à l'entrée
        
    }, 800);
}

// Fonction confettis (utilise canvas-confetti via CDN)
function launchConfetti() {
    var duration = 3 * 1000;
    var end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#E8C1C5', '#9CAD93', '#D4AF37', '#FDFBF7']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#E8C1C5', '#9CAD93', '#D4AF37', '#FDFBF7']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// Réinitialiser l'animation
btnReplay.addEventListener('click', () => {
    // Reset de l'état
    currentTurn = 1;
    previousItems = [];
    currentRotation = 0;
    
    turnCounterText.textContent = `Tour 1 / 3`;
    btnSpin.textContent = "Faire tourner";
    btnSpin.disabled = false;
    wheelImg.style.transition = 'none';
    wheelImg.style.transform = `rotate(0deg)`;
    
    // Reset Envelope
    envelopeWrapper.classList.remove('zoom-in', 'open');
    replayContainer.classList.add('hidden');
    
    // Vues
    revealView.classList.add('hidden');
    setTimeout(() => {
        gameView.classList.remove('hidden');
    }, 800);
});