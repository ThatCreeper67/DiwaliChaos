# 🪔 Diwali Chaos — Operation Phooljhadi

https://diwali-chaos.vercel.app/

A humorous, story-driven 2D stealth-adventure and arcade boss-fight browser game set in an Indian residential neighbourhood during Diwali.

Built with **Phaser 3**, **Vite**, **HTML5 Canvas**, and the **Web Audio API**.

---

## 📖 Story Overview

Diwali has arrived at the Gokuldham Residency, but disaster strikes! **Phooljhadi**, the neighbourhood’s beloved indie dog, has been confiscated by the despotic Society President, **Sharma Ji**, citing Section 144 of the Society Bye-Laws!

Take control of **Chintu**, a determined kid on a festive rescue mission:
1. **Level 1 — Bazaar Escape:** Sneak through the bustling festive market without getting spotted by your omnipresent Father!
2. **Level 2 — Operation Laddoo Collection:** Collect sweets from aunties, sweet vendors, and hidden gift boxes across the society to fuel your adventure.
3. **Level 3 — Home Infiltration: Mummy's Kitchen:** Infiltrate your own home, locate the brass key, bypass Mummy’s watchful eyes using furniture as natural cover, and retrieve the legendary stash of **15 Sutli Bombs**!
4. **Level 4 — Backdoor Maze:** Navigate the maze behind the house connecting the alley to Sharma Ji's street — no map, no GPS, just your wits!
5. **Level 5 — Sharma Ji's Fortress:** Face Sharma Ji in his central aangan. Sharma Ji is strictly confined to the courtyard, while you use safe interior rooms to rest, heal with laddoos, throw Sutli bombs to stun him, and trigger 3 mandatory environmental sabotage objectives!

### The Punchline
When Sharma Ji is defeated and Phooljhadi is rescued, you step out onto the street... only to find Papa waiting outside with his morning newspaper:

> *"Beta. Ghar chalein?"*

---

## 🎮 Controls

| Action | Control |
|---|---|
| **Move Chintu** | `W`, `A`, `S`, `D` or `Arrow Keys` |
| **Interact / Talk / Search** | `E` |
| **Throw Sutli Bomb** (Boss Fight) | `Left Mouse Click` or `Spacebar` |
| **Eat Laddoo (Heal 1 Heart)** | `H` |
| **Pause Menu** | `Esc` or On-Screen `PAUSE` button |

---

## ✨ Features

- **Top-Down 2D Modern Pixel Art:** 100% procedurally synthesized textures — zero missing external assets or 404s. Includes dynamic character sprites (Chintu, Papa, Mummy, Sharma Ji, Phooljhadi, Aunties, Halwais), rangolis, glowing diyas, and authentic Indian domestic interiors.
- **Procedural Diwali Sound Engine:** Pure Web Audio API synthesis powering festive classical raga melodies, bustling bazaar rhythms, sneaky stealth grooves, dramatic boss music, and cartoon sound effects (laddoo crunches, fuse hisses, Sutli bomb explosions, Sharma Ji megaphone shouts).
- **Global Game Stopwatch:** Displayed in the top-left corner (`00:24:38`). Measures uninterrupted active gameplay across all 5 levels, persists through deaths/restarts, pauses on pause, and logs official completion records.
- **Personal Record System:** LocalStorage tracking of completed runs, completion timestamps, run numbers, and persistent Personal Best (PB) without requiring external servers.
- **Progressive Detection Stealth:** Mother AI uses progressive suspicion meter and environmental cover occlusion; Father AI uses line-of-sight vision cones.
- **Tactical Boss Arena:** Sharma Ji is strictly confined to the central aangan courtyard. Safe adjoining rooms allow the player to heal and regroup. 3 mandatory environmental objectives can be completed in any order.

---

## 🛠️ Tech Stack

- **Game Engine:** [Phaser 3](https://phaser.io/)
- **Bundler:** [Vite 6](https://vitejs.dev/)
- **Audio:** Web Audio API (real-time oscillator and noise synthesis)
- **State & Storage:** HTML5 LocalStorage
- **Platform:** Modern Web Browsers (Chrome, Firefox, Safari, Edge)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/diwali-chaos.git
   cd diwali-chaos
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

4. Build for production:
   ```bash
   npm run build
   ```
   The optimized production bundle will be generated in `dist/`.

5. Preview production build:
   ```bash
   npm run preview
   ```

---

## 📁 Project Structure

```text
diwali-chaos/
├── index.html                # Entry HTML with themed loader
├── package.json              # Project dependencies and build scripts
├── vite.config.js            # Vite configuration
├── dist/                     # Optimized production build output
├── src/
│   ├── main.js               # Application bootstrap
│   ├── config/
│   │   └── GameConfig.js     # Phaser 3 setup and scene registration
│   ├── scenes/
│   │   ├── BootScene.js      # System initialisation
│   │   ├── PreloadScene.js   # Texture generation & asset setup
│   │   ├── MainMenuScene.js  # Main menu, records, settings, credits
│   │   ├── BazaarScene.js    # Level 1: Bazaar Escape
│   │   ├── SocietyScene.js   # Level 2: Operation Laddoo Collection
│   │   ├── HomeScene.js      # Level 3: Mummy's Kitchen Infiltration
│   │   ├── MazeScene.js      # Level 4: Backdoor Maze
│   │   ├── BossScene.js      # Level 5: Sharma Ji's Fortress
│   │   └── CreditsScene.js   # Victory cinematic & credits
│   ├── entities/
│   │   ├── Player.js         # Chintu character controller & abilities
│   │   ├── Father.js         # Father AI with patrol & vision cone
│   │   ├── Mother.js         # Mother AI with progressive detection
│   │   └── SharmaJi.js       # Boss AI confined to central aangan
│   ├── systems/
│   │   ├── SoundSystem.js    # Web Audio API procedural sound engine
│   │   ├── TimerManager.js   # Central full-game stopwatch
│   │   ├── RecordManager.js  # Local personal completion records
│   │   ├── InventoryManager.js # Laddoo, bomb, health & key tracker
│   │   ├── DialogueManager.js  # Retro typewriter dialogue overlay
│   │   └── SaveManager.js    # Checkpoint save/continue system
│   ├── ui/
│   │   └── HUD.js            # In-game HUD overlay & pause menu
│   └── utils/
│       └── TextureGenerator.js # Procedural pixel-art graphics generator
└── README.md
```

---

## 📜 Credits & License

- **Game Design & Direction:** Diwali Chaos Team
- **Sound & Art Synthesis:** Procedural generation via HTML5 Canvas & Web Audio API
- **License:** MIT License. Free for personal, educational, and open-source use.
