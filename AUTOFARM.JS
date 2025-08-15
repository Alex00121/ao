// =========================
//   CONFIGURATION DU BOT
// =========================
const CONFIG = {
    START_X: 0,     // Coordonnée X de départ de la zone
    START_Y: 0,     // Coordonnée Y de départ de la zone
    WIDTH: 10,      // Largeur de la zone à peindre
    HEIGHT: 10,     // Hauteur de la zone à peindre
    COOLDOWN: 5000  // Temps entre 2 pixels en ms (5s ici)
};

// Liste des couleurs possibles (à adapter selon palette du site)
const COLORS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// Largeur totale de la board (⚠ À vérifier pour le site)
const BOARD_WIDTH = 1000;

// =========================
//   FONCTIONS DU BOT
// =========================

// Récupère la board actuelle
async function getBoard() {
    const res = await fetch("https://backend.wplace.live/s0/board", { credentials: 'include' });
    if (!res.ok) throw new Error("Impossible de récupérer la board");
    const arrayBuffer = await res.arrayBuffer();
    return new Uint8Array(arrayBuffer);
}

// Peint un pixel
async function paintPixel(x, y, color) {
    const res = await fetch(`https://backend.wplace.live/s0/pixel/${x}/${y}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Authentification via cookies
        body: JSON.stringify({
            coords: [x, y],
            colors: [color]
        })
    });

    if (!res.ok) {
        const text = await res.text();
        console.error(`❌ Échec pour pixel (${x}, ${y}) : ${text}`);
        return false;
    }

    console.log(`✅ Pixel peint (${x}, ${y}) en couleur ${color}`);
    return true;
}

// Pause
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =========================
//   BOUCLE PRINCIPALE
// =========================
async function startAutoFarm() {
    console.log("🚀 Autofarm démarré !");
    
    let board = await getBoard();

    while (true) {
        for (let dy = 0; dy < CONFIG.HEIGHT; dy++) {
            for (let dx = 0; dx < CONFIG.WIDTH; dx++) {
                const px = CONFIG.START_X + dx;
                const py = CONFIG.START_Y + dy;

                // Couleur actuelle sur la board
                const index = (py * BOARD_WIDTH) + px;
                const currentColor = board[index];

                // Choisir une nouvelle couleur différente
                let newColor;
                do {
                    newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
                } while (newColor === currentColor);

                // Peindre le pixel
                const success = await paintPixel(px, py, newColor);

                // Attendre le cooldown
                await wait(CONFIG.COOLDOWN);

                // Récupérer à nouveau la board si nécessaire
                if (success) {
                    board = await getBoard();
                }
            }
        }
    }
}

// Lancer le bot
startAutoFarm().catch(console.error);
