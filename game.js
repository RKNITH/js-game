// Minimal 2D platformer with WASD + mobile joystick
import nipplejs from 'nipplejs';

(function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Tile/sprite assets
    const imgDirt = new Image();
    imgDirt.src = 'dirt.png';
    const imgStone = new Image();
    imgStone.src = 'stone.jpg';
    const imgSteve = new Image();
    imgSteve.src = 'steve.jpg';
    const imgPearl = new Image();
    imgPearl.src = 'Ender_Pearl_JE3_BE2.webp';
    const imgGoal = new Image();
    imgGoal.src = 'portal.gif';
    const imgSky = new Image();
    imgSky.src = '17576286_xl.webp';
    let dirtPattern = null, stonePattern = null, grassPattern = null;
    
    // Responsive canvas
    function resize() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        // recreate tile patterns when canvas context size changes and images ready
        if (ctx && imgDirt.complete) dirtPattern = ctx.createPattern(imgDirt, 'repeat');
        if (ctx && imgStone.complete) stonePattern = ctx.createPattern(imgStone, 'repeat');
        if (ctx && imgGrass.complete) grassPattern = ctx.createPattern(imgGrass, 'repeat');
    }
    window.addEventListener('resize', resize);
    // Ensure patterns are created when images finish loading
    imgDirt.addEventListener('load', () => { if (ctx) dirtPattern = ctx.createPattern(imgDirt, 'repeat'); });
    imgStone.addEventListener('load', () => { if (ctx) stonePattern = ctx.createPattern(imgStone, 'repeat'); });

    // add level management
    let currentLevelIndex = 0;
    const levels = [
        // Level 1 - Tutorial level with easy jumps
        {
            playerStart: { x: 100, y: 0 },
            platforms: [
                { x: 0, y: 700, w: 400, h: 40 },
                { x: 500, y: 640, w: 200, h: 30 },
                { x: 800, y: 580, w: 200, h: 30 },
                { x: 1100, y: 520, w: 200, h: 30 },
                { x: 1400, y: 580, w: 200, h: 30 },
                { x: 1700, y: 640, w: 300, h: 40 }
            ],
            movingPlatforms: [],
            coins: [
                { x: 550, y: 600, r: 10 },
                { x: 850, y: 540, r: 10 },
                { x: 1150, y: 480, r: 10 }
            ],
            goal: { x: 1850, y: 560, w: 48, h: 80 },
            world: { width: 2200, height: 1000, gravity: 1800 }
        },
        // Level 2 - Simple stairs
        {
            playerStart: { x: 80, y: 0 },
            platforms: [
                { x: 0, y: 700, w: 300, h: 40 },
                { x: 350, y: 650, w: 180, h: 30 },
                { x: 580, y: 600, w: 180, h: 30 },
                { x: 810, y: 550, w: 180, h: 30 },
                { x: 1040, y: 500, w: 180, h: 30 },
                { x: 1270, y: 450, w: 200, h: 30 }
            ],
            movingPlatforms: [],
            coins: [
                { x: 400, y: 610, r: 10 },
                { x: 630, y: 560, r: 10 },
                { x: 1120, y: 460, r: 10 }
            ],
            goal: { x: 1370, y: 370, w: 48, h: 80 },
            world: { width: 1800, height: 1000, gravity: 1800 }
        },
        // Level 3 - Wider jumps but still reasonable
        {
            playerStart: { x: 50, y: 0 },
            platforms: [
                { x: 0, y: 700, w: 400, h: 40 },
                { x: 550, y: 620, w: 220, h: 30 },
                { x: 900, y: 580, w: 200, h: 30 },
                { x: 1250, y: 540, w: 200, h: 30 },
                { x: 1600, y: 580, w: 220, h: 30 },
                { x: 1950, y: 620, w: 300, h: 40 }
            ],
            movingPlatforms: [
                { x: 1100, y: 520, w: 150, h: 24, range: 100, speed: 60, axis: 'x', base: 1100, dir: 1 }
            ],
            coins: [
                { x: 600, y: 580, r: 10 },
                { x: 950, y: 540, r: 10 },
                { x: 1300, y: 500, r: 10 },
                { x: 2000, y: 580, r: 10 }
            ],
            goal: { x: 2100, y: 540, w: 48, h: 80 },
            world: { width: 2500, height: 1000, gravity: 1800 }
        },
        // Level 4 - Vertical climbing with safe platforms
        {
            playerStart: { x: 80, y: 0 },
            platforms: [
                { x: 0, y: 700, w: 300, h: 40 },
                { x: 400, y: 620, w: 180, h: 30 },
                { x: 650, y: 540, w: 180, h: 30 },
                { x: 900, y: 460, w: 180, h: 30 },
                { x: 1150, y: 380, w: 180, h: 30 },
                { x: 1400, y: 300, w: 200, h: 30 }
            ],
            movingPlatforms: [],
            coins: [
                { x: 450, y: 580, r: 10 },
                { x: 700, y: 500, r: 10 },
                { x: 950, y: 420, r: 10 }
            ],
            goal: { x: 1500, y: 220, w: 48, h: 80 },
            world: { width: 1800, height: 1000, gravity: 1800 }
        }
    ];

    // Generate 10 additional levels with proper spacing and reachable goals
    for (let n = 0; n < 46; n++) { // Increased from 10 to 46 levels (50 total)
        const levelThemes = [
            'epic_journey', 'underground_maze', 'mountain_climb', 'floating_fortress', 
            'crystal_caverns', 'desert_temple', 'forest_canopy', 'volcanic_passage',
            'ice_palace', 'ancient_ruins', 'sky_bridge', 'deep_mines'
        ];
        
        const theme = levelThemes[n % levelThemes.length];
        const startX = 80;
        const groundY = 700;
        let platforms = [];
        let movingPlatforms = [];
        let coins = [];
        let goalX = 2500, goalY = 200; // Reduced distance
        let worldWidth = 3000; // Reduced world width
        
        const difficulty = Math.min(n / 8, 6); // Slower difficulty ramp
        
        switch (theme) {
            case 'epic_journey':
                // Multi-section journey with story beats
                platforms = [
                    // Starting village area
                    { x: 0, y: groundY, w: 600, h: 40, material: 'grass' },
                    { x: 450, y: 620, w: 250, h: 30, material: 'dirt' }, // Wider platforms
                    { x: 650, y: 580, w: 200, h: 25, material: 'stone' },
                    { x: 800, y: 620, w: 300, h: 35, material: 'grass' },
                    
                    // Bridge crossing section
                    { x: 1050, y: 600, w: 150, h: 20, material: 'stone' }, // Closer spacing
                    { x: 1150, y: 580, w: 150, h: 20, material: 'stone' },
                    { x: 1250, y: 560, w: 150, h: 20, material: 'stone' },
                    { x: 1350, y: 540, w: 150, h: 20, material: 'stone' },
                    { x: 1450, y: 520, w: 200, h: 30, material: 'grass' },
                    
                    // Mountain base
                    { x: 1600, y: 650, w: 250, h: 50, material: 'stone' },
                    { x: 1750, y: 580, w: 200, h: 30, material: 'stone' },
                    { x: 1850, y: 520, w: 180, h: 25, material: 'stone' },
                    { x: 1950, y: 460, w: 160, h: 25, material: 'stone' },
                    { x: 2050, y: 400, w: 140, h: 25, material: 'stone' },
                    { x: 2150, y: 340, w: 200, h: 25, material: 'stone' },
                    
                    // Final area
                    { x: 2300, y: 320, w: 300, h: 40, material: 'grass' }
                ];
                
                movingPlatforms = [
                    { x: 1500, y: 560, w: 120, h: 18, range: 80, speed: 35, axis: 'x', base: 1500, dir: 1 } // Reduced range
                ];
                
                coins = [
                    // Easier coin placement
                    { x: 550, y: 580, r: 10 }, { x: 750, y: 540, r: 10 }, { x: 950, y: 580, r: 10 },
                    { x: 1200, y: 540, r: 10 }, { x: 1400, y: 500, r: 10 },
                    { x: 1800, y: 540, r: 10 }, { x: 1900, y: 480, r: 10 }, { x: 2000, y: 420, r: 10 },
                    { x: 2100, y: 360, r: 10 }, { x: 2200, y: 300, r: 10 }, { x: 2450, y: 280, r: 10 }
                ];
                
                goalX = 2500; goalY = 240;
                worldWidth = 2800;
                break;

            case 'underground_maze':
                // Simplified cave system
                platforms = [
                    // Surface entrance
                    { x: 0, y: groundY, w: 300, h: 40, material: 'grass' },
                    { x: 250, y: 650, w: 150, h: 25, material: 'stone' },
                    
                    // Upper cave level - wider platforms, closer spacing
                    { x: 350, y: 620, w: 220, h: 30, material: 'stone' },
                    { x: 520, y: 580, w: 200, h: 25, material: 'stone' },
                    { x: 680, y: 600, w: 200, h: 30, material: 'stone' },
                    { x: 840, y: 560, w: 180, h: 25, material: 'stone' },
                    { x: 980, y: 590, w: 200, h: 28, material: 'stone' },
                    
                    // Mid cave level
                    { x: 450, y: 480, w: 180, h: 25, material: 'stone' },
                    { x: 590, y: 450, w: 160, h: 25, material: 'stone' },
                    { x: 720, y: 470, w: 180, h: 25, material: 'stone' },
                    { x: 860, y: 430, w: 170, h: 25, material: 'stone' },
                    { x: 990, y: 460, w: 190, h: 25, material: 'stone' },
                    
                    // Lower cave level
                    { x: 550, y: 350, w: 200, h: 30, material: 'stone' },
                    { x: 720, y: 320, w: 180, h: 25, material: 'stone' },
                    { x: 870, y: 340, w: 200, h: 30, material: 'stone' },
                    { x: 1040, y: 300, w: 190, h: 25, material: 'stone' },
                    { x: 1200, y: 330, w: 210, h: 30, material: 'stone' },
                    
                    // Final chamber
                    { x: 1380, y: 280, w: 300, h: 40, material: 'grass' }
                ];
                
                movingPlatforms = [
                    { x: 1150, y: 380, w: 100, h: 18, range: 60, speed: 30, axis: 'y', base: 350, dir: 1 }
                ];
                
                coins = [
                    { x: 450, y: 580, r: 10 }, { x: 620, y: 540, r: 10 }, { x: 780, y: 560, r: 10 },
                    { x: 520, y: 440, r: 10 }, { x: 650, y: 410, r: 10 }, { x: 800, y: 430, r: 10 },
                    { x: 650, y: 310, r: 10 }, { x: 820, y: 280, r: 10 }, { x: 1140, y: 290, r: 10 },
                    { x: 1530, y: 240, r: 10 }
                ];
                
                goalX = 1600; goalY = 200;
                worldWidth = 1900;
                break;

            case 'mountain_climb':
                // Gentler mountain climb
                platforms = [
                    // Base camp
                    { x: 0, y: groundY, w: 400, h: 40, material: 'grass' },
                    { x: 350, y: 650, w: 200, h: 25, material: 'stone' },
                    
                    // Lower slopes - generous spacing
                    { x: 300, y: 600, w: 150, h: 25, material: 'stone' },
                    { x: 420, y: 580, w: 140, h: 20, material: 'stone' },
                    { x: 530, y: 620, w: 180, h: 25, material: 'stone' },
                    { x: 680, y: 590, w: 160, h: 25, material: 'stone' },
                    
                    // Mid slopes
                    { x: 250, y: 520, w: 140, h: 20, material: 'stone' },
                    { x: 360, y: 490, w: 130, h: 18, material: 'stone' },
                    { x: 460, y: 460, w: 140, h: 20, material: 'stone' },
                    { x: 570, y: 430, w: 130, h: 18, material: 'stone' },
                    { x: 670, y: 400, w: 140, h: 20, material: 'stone' },
                    
                    // Upper slopes
                    { x: 200, y: 380, w: 120, h: 16, material: 'stone' },
                    { x: 300, y: 350, w: 110, h: 15, material: 'stone' },
                    { x: 390, y: 320, w: 120, h: 16, material: 'stone' },
                    { x: 490, y: 290, w: 110, h: 15, material: 'stone' },
                    { x: 580, y: 260, w: 120, h: 16, material: 'stone' },
                    
                    // Summit approach
                    { x: 670, y: 230, w: 140, h: 20, material: 'stone' },
                    { x: 780, y: 200, w: 160, h: 22, material: 'stone' },
                    { x: 920, y: 170, w: 200, h: 30, material: 'grass' }
                ];
                
                movingPlatforms = [
                    { x: 810, y: 340, w: 100, h: 16, range: 40, speed: 25, axis: 'x', base: 810, dir: 1 }
                ];
                
                coins = [
                    { x: 450, y: 610, r: 10 }, { x: 350, y: 560, r: 10 }, { x: 470, y: 540, r: 10 },
                    { x: 300, y: 480, r: 10 }, { x: 410, y: 450, r: 10 }, { x: 510, y: 420, r: 10 },
                    { x: 250, y: 340, r: 10 }, { x: 340, y: 310, r: 10 }, { x: 430, y: 280, r: 10 },
                    { x: 720, y: 190, r: 10 }, { x: 1020, y: 130, r: 10 }
                ];
                
                goalX = 1050; goalY = 90;
                worldWidth = 1300;
                break;

            case 'floating_fortress':
                // More accessible sky platforms
                platforms = [
                    // Ground start
                    { x: 0, y: groundY, w: 250, h: 40, material: 'grass' },
                    
                    // Tower base - easier climb
                    { x: 220, y: 650, w: 120, h: 50, material: 'stone' },
                    { x: 240, y: 600, w: 80, h: 25, material: 'stone' },
                    { x: 260, y: 550, w: 80, h: 25, material: 'stone' },
                    { x: 280, y: 500, w: 80, h: 25, material: 'stone' },
                    { x: 300, y: 450, w: 100, h: 25, material: 'stone' },
                    
                    // Sky islands - closer together
                    { x: 380, y: 420, w: 200, h: 35, material: 'grass' },
                    { x: 550, y: 380, w: 160, h: 25, material: 'stone' },
                    { x: 680, y: 420, w: 140, h: 20, material: 'stone' },
                    { x: 790, y: 380, w: 140, h: 20, material: 'stone' },
                    { x: 900, y: 340, w: 140, h: 20, material: 'stone' },
                    
                    // Central platform
                    { x: 1010, y: 320, w: 250, h: 40, material: 'stone' },
                    { x: 1100, y: 270, w: 120, h: 25, material: 'stone' },
                    { x: 1180, y: 220, w: 120, h: 25, material: 'stone' },
                    
                    // Final bridge
                    { x: 1270, y: 200, w: 160, h: 20, material: 'stone' },
                    { x: 1400, y: 180, w: 200, h: 30, material: 'grass' }
                ];
                
                movingPlatforms = [
                    { x: 820, y: 360, w: 80, h: 16, range: 50, speed: 30, axis: 'y', base: 340, dir: 1 }
                ];
                
                coins = [
                    { x: 270, y: 610, r: 10 }, { x: 290, y: 510, r: 10 }, { x: 330, y: 410, r: 10 },
                    { x: 480, y: 380, r: 10 }, { x: 620, y: 340, r: 10 }, { x: 750, y: 380, r: 10 },
                    { x: 860, y: 340, r: 10 }, { x: 970, y: 300, r: 10 }, { x: 1160, y: 230, r: 10 },
                    { x: 1500, y: 140, r: 10 }
                ];
                
                goalX = 1520; goalY = 100;
                worldWidth = 1700;
                break;

            default:
                // Create simpler, more manageable layouts
                const sectionCount = 3 + Math.floor(difficulty / 2);
                const sectionWidth = 500; // Reduced section width
                platforms = [{ x: 0, y: groundY, w: 300, h: 40, material: 'grass' }];
                
                for (let section = 0; section < sectionCount; section++) {
                    const baseX = 250 + section * sectionWidth;
                    const baseY = 600 - section * 15;
                    
                    // Simpler platform layouts
                    for (let i = 0; i < 5; i++) {
                        platforms.push({
                            x: baseX + i * 100,
                            y: baseY - Math.sin(i * 0.5) * 40, // Gentler waves
                            w: 120 + Math.random() * 30, // Wider platforms
                            h: 25 + Math.random() * 5,
                            material: i % 3 === 0 ? 'grass' : 'stone'
                        });
                    }
                    
                    // Add connecting platforms between sections
                    if (section < sectionCount - 1) {
                        platforms.push({
                            x: baseX + 450,
                            y: baseY - 30,
                            w: 100,
                            h: 25,
                            material: 'stone'
                        });
                    }
                    
                    // Add coins for this section
                    for (let i = 0; i < 2; i++) {
                        coins.push({
                            x: baseX + 50 + i * 200,
                            y: baseY - 60,
                            r: 10
                        });
                    }
                }
                
                goalX = 250 + sectionCount * sectionWidth - 100;
                goalY = 600 - sectionCount * 15 - 80;
                worldWidth = goalX + 300;
        }
        
        // Ensure minimum coin count for longer levels
        while (coins.length < 8) {
            const randomPlatform = platforms[Math.floor(platforms.length * 0.3) + Math.floor(Math.random() * platforms.length * 0.4)];
            if (randomPlatform) {
                coins.push({
                    x: randomPlatform.x + randomPlatform.w / 2,
                    y: randomPlatform.y - 30,
                    r: 10
                });
            }
        }
        
        levels.push({
            playerStart: { x: startX, y: 0 },
            platforms: platforms,
            movingPlatforms: movingPlatforms,
            coins: coins,
            goal: { x: goalX, y: goalY, w: 48, h: 80 },
            world: { 
                width: worldWidth, 
                height: 1000, 
                gravity: 1600 + Math.min(difficulty * 20, 100) // Reduced gravity increase
            }
        });
    }
    try { window.__LEVEL_COUNT__ = levels.length; } catch(e){}

    function loadLevel(index) {
        const lvl = levels[index];
        // map level data into runtime structures
        platforms.length = 0; movingPlatforms.length = 0; coins.length = 0;
        for (const p of lvl.platforms) platforms.push(Object.assign({}, p));
        for (const mp of lvl.movingPlatforms) movingPlatforms.push(Object.assign({}, mp));
        for (const c of lvl.coins) coins.push(Object.assign({ got: false }, c));
        goal.x = lvl.goal.x; goal.y = lvl.goal.y; goal.w = lvl.goal.w; goal.h = lvl.goal.h; goal.reached = false;
        world.width = lvl.world.width; world.height = lvl.world.height; world.gravity = lvl.world.gravity;
        player.x = lvl.playerStart.x; player.y = lvl.playerStart.y;
        // update HUD level display
        const hudLevel = document.getElementById('hud-level');
        if (hudLevel) hudLevel.textContent = `Level ${currentLevelIndex + 1}`;

        // switch music for cave levels (levels with index >= 10)
        try {
            const savedVol = parseFloat(localStorage.getItem('masterVolume') || '0.8');
            const muteSfx = localStorage.getItem('muteSfx') === 'true';
            const vol = isNaN(savedVol) ? 0.8 : savedVol;
            bgMusic.volume = vol; caveMusic.volume = vol;
            // only switch if needed, don't restart same track on same level/death
            const wantCave = currentLevelIndex >= 10;
            if (!muteSfx) {
                if (wantCave) {
                    if (!caveMusic.paused) { /* leave playing */ }
                    else {
                        try { bgMusic.pause(); } catch(e){}
                        caveMusic.play().catch(()=>{});
                    }
                } else {
                    if (!bgMusic.paused) { /* leave playing */ }
                    else {
                        try { caveMusic.pause(); } catch(e){}
                        bgMusic.play().catch(()=>{});
                    }
                }
            }
        } catch(e){}
    }

    // World units (virtual) and camera
    const world = {
        gravity: 1800,
        width: 4000,
        height: 2000
    };
    const camera = { x: 0, y: 0 };

    // Player
    const player = {
        x: 100, y: 0, w: 40, h: 60,
        vx: 0, vy: 0,
        speed: 320,
        jumpV: 960,
        onGround: false
    };

    // Platforms (x, y, w, h) in world space
    const platforms = [
        { x: 0, y: 700, w: 800, h: 40 },
        { x: 900, y: 620, w: 300, h: 30 },
        { x: 1300, y: 540, w: 280, h: 30 },
        { x: 1650, y: 460, w: 220, h: 30 },
        { x: 1950, y: 540, w: 280, h: 30 },
        { x: 2300, y: 620, w: 300, h: 30 },
        { x: 2700, y: 700, w: 800, h: 40 }
    ];
    const movingPlatforms = [
        { x: 1100, y: 500, w: 220, h: 26, range: 160, speed: 80, axis: 'x', base: 1100, dir: 1 },
        { x: 2100, y: 580, w: 220, h: 26, range: 120, speed: 60, axis: 'y', base: 580, dir: 1 }
    ];
    const coins = [
        { x: 980, y: 560, r: 10, got: false }, { x: 1500, y: 480, r: 10, got: false },
        { x: 1680, y: 400, r: 10, got: false }, { x: 2350, y: 560, r: 10, got: false },
        { x: 2900, y: 640, r: 10, got: false }
    ];

    // Goal flag
    const goal = { x: 3400, y: 620, w: 30, h: 80, reached: false };

    // Input
    const keys = new Set();
    let moveAxis = 0; // -1..1
    let jumpRequested = false;

    function keyDown(e) {
        const k = e.key.toLowerCase();
        if (['w','a','s','d','arrowleft','arrowright',' '].includes(k)) e.preventDefault();
        keys.add(k);
    }
    function keyUp(e) {
        keys.delete(e.key.toLowerCase());
    }
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    // Mobile joystick
    let joystick = null;
    function setupJoystick() {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (!isTouch) return;
        const zone = document.getElementById('joystick');
        zone.style.display = 'block';
        joystick = nipplejs.create({
            zone,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'black',
            size: 140,
            restOpacity: 0.25
        });
        joystick.on('move', (_, data) => {
            const rad = data.angle ? data.angle.radian : 0;
            const force = Math.min(1, data.force || 0);
            const x = Math.cos(rad) * force;
            moveAxis = Math.max(-1, Math.min(1, x));
        });
        joystick.on('end', () => { moveAxis = 0; });
        // Tap to jump
        zone.addEventListener('touchend', () => { jumpRequested = true; }, { passive: true });
    }

    // Mobile buttons (left/right/jump/pause) support
    function setupMobileButtons() {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (!isTouch) return;
        const controls = document.querySelector('.mobile-controls');
        if (controls) controls.style.display = 'flex';
        const btnLeft = document.getElementById('mobile-left');
        const btnRight = document.getElementById('mobile-right');
        const btnJump = document.getElementById('mobile-jump');
        const btnPause = document.getElementById('mobile-pause');

        const touchStart = (e) => { e.preventDefault(); };
        // left
        if (btnLeft) {
            btnLeft.addEventListener('touchstart', (e)=>{ touchStart(e); moveAxis = -1; }, { passive: false });
            btnLeft.addEventListener('touchend', ()=>{ moveAxis = 0; }, { passive: true });
            btnLeft.addEventListener('mousedown', ()=>{ moveAxis = -1; });
            btnLeft.addEventListener('mouseup', ()=>{ moveAxis = 0; });
        }
        // right
        if (btnRight) {
            btnRight.addEventListener('touchstart', (e)=>{ touchStart(e); moveAxis = 1; }, { passive: false });
            btnRight.addEventListener('touchend', ()=>{ moveAxis = 0; }, { passive: true });
            btnRight.addEventListener('mousedown', ()=>{ moveAxis = 1; });
            btnRight.addEventListener('mouseup', ()=>{ moveAxis = 0; });
        }
        // jump
        if (btnJump) {
            btnJump.addEventListener('touchstart', (e)=>{ touchStart(e); jumpRequested = true; }, { passive: false });
            btnJump.addEventListener('click', ()=>{ jumpRequested = true; });
        }
        // pause (return to menu)
        if (btnPause) {
            btnPause.addEventListener('touchstart', (e)=>{ touchStart(e); btnPause.classList.add('active'); if (window.showPause) window.showPause(); }, { passive: false });
            btnPause.addEventListener('click', ()=>{ if (window.showPause) window.showPause(); });
        }
    }

    // HUD
    const hudStatus = document.getElementById('hud-status');
    const hudCoins = document.getElementById('hud-coins');
    let coinCount = 0;
    const hotbarCount = document.getElementById('hotbar-count');
    let totalPearls = 0;
    const updateHotbar = () => { if (hotbarCount) hotbarCount.textContent = String(totalPearls); };

    // Game SFX
    const sfx = {
        stepStone: new Audio('stone.ogg'),
        stepGrass: new Audio('grass1.ogg'),
        stepDirt: new Audio('dirtmining.ogg.mp3'),
        die: new Audio('Minecraft - Hit (Sound Effect).mp3'),
        win: new Audio('the-nether-minecraft-movie.mp3'),
        spawn: new Audio('i-am-steve-a-minecraft-movie-trailer-vs-movie-comparison-at-warnerbros_rKgWf2Cf.mp3'),
        pearl: new Audio('an-ender-pearl.mp3')
    };
    // add background music (Jack Black - Placing Blocks)
    const bgMusic = new Audio('Jack Black - Placing Blocks (Music Video)-[AudioTrimmer.com].mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.8;
    // cave theme & cave background image for later levels
    const caveMusic = new Audio('Music-Underground.mp3.mpeg.mp3');
    caveMusic.loop = true;
    const imgCave = new Image();
    imgCave.src = 'cavebackground.webp';
    // grass texture (shows as grass top on platforms)
    const imgGrass = new Image();
    imgGrass.src = 'IMG_0104.jpeg';
    imgGrass.addEventListener('load', () => { if (ctx) grassPattern = ctx.createPattern(imgGrass, 'repeat'); });
    // expose controls and read saved audio settings
    try {
        // expose a couple of globals for the menu to manipulate
        window.__LEVEL_COUNT__ = levels.length;
        window.currentLevelIndex = currentLevelIndex;
        window.setLevel = (i) => {
            currentLevelIndex = Math.max(0, Math.min(levels.length - 1, (i|0)));
            window.currentLevelIndex = currentLevelIndex;
        };
    } catch(e){}

    // Collision helpers
    function rectsIntersect(a, b) {
        return !(a.x + a.w <= b.x || a.x >= b.x + b.w || a.y + a.h <= b.y || a.y >= b.y + b.h);
    }

    function resolveCollisions(px, py, nx, ny) {
        // Move axis-aligned and resolve separately for stability
        let newX = px + nx, newY = py + ny;
        const playerBox = { x: newX, y: newY, w: player.w, h: player.h };
        player.onGround = false;

        for (const p of currentPlatforms) {
            if (!rectsIntersect(playerBox, p)) continue;
            // Compute previous box to infer side
            const prev = { x: px, y: py, w: player.w, h: player.h };
            // Horizontal resolution
            if (!rectsIntersect({ x: newX, y: prev.y, w: player.w, h: player.h }, p)) {
                // Vertical collision only
            } else if (!rectsIntersect({ x: prev.x, y: newY, w: player.w, h: player.h }, p)) {
                // Horizontal collision only
            } else {
                // Resolve minimal penetration
            }

            const overlapLeft = (prev.x + player.w) - p.x;
            const overlapRight = (p.x + p.w) - prev.x;
            const overlapTop = (prev.y + player.h) - p.y;
            const overlapBottom = (p.y + p.h) - prev.y;

            const minOverlapX = overlapLeft < overlapRight ? overlapLeft : overlapRight;
            const minOverlapY = overlapTop < overlapBottom ? overlapTop : overlapBottom;

            if (minOverlapX < minOverlapY) {
                // Resolve on X
                if (overlapLeft < overlapRight) {
                    newX = p.x - player.w;
                } else {
                    newX = p.x + p.w;
                }
                player.vx = 0;
                playerBox.x = newX;
            } else {
                // Resolve on Y
                if (overlapTop < overlapBottom) {
                    newY = p.y - player.h;
                    player.onGround = true;
                } else {
                    newY = p.y + p.h;
                }
                player.vy = 0;
                playerBox.y = newY;
            }
        }
        return { x: newX, y: newY };
    }

    // helper: determine material for a platform (fallback to stone)
    function platformMaterial(p) {
        // Prefer explicit material if present
        if (p.material) return p.material;
        // Heuristic used elsewhere: wide platforms use dirt-like texture
        if (p.w > 200) return 'dirt';
        // Higher platforms tend to be grassy (jump pads / small platforms)
        if (p.y < 500) return 'grass';
        return 'stone';
    }

    // add per-platform scaled tiling pattern helper
    function makeScaledPattern(img, p) {
        const scale = Math.max(0.1, p.h / (img.naturalHeight || 64));
        const pat = ctx.createPattern(img, 'repeat');
        if (pat && pat.setTransform) {
            const m = new DOMMatrix();
            m.a = scale; m.d = scale; m.e = -p.x * scale; m.f = -p.y * scale;
            pat.setTransform(m);
        }
        return pat;
    }

    // Game loop
    let last = 0;
    let running = false;
    let time = 0;
    let coyote = 0, buffer = 0;
    const COYOTE_MAX = 0.08, BUFFER_MAX = 0.12;
    let jumpCount = 0, deathCountThisLevel = 0, anyLevelBeaten = false;

    function update(dt) {
        time += dt;
        
        // Update disappearing platforms
        for (const p of platforms) {
            if (p.disappearing) {
                p.cycleTimer = (p.cycleTimer || 0) + dt;
                p.visible = Math.floor(p.cycleTimer / p.cycleTime) % 2 === 0;
            }
        }
        
        // Input
        const left = keys.has('a') || keys.has('arrowleft') || moveAxis < -0.2;
        const right = keys.has('d') || keys.has('arrowright') || moveAxis > 0.2;
        const jumpKey = keys.has('w') || keys.has(' ') || keys.has('arrowup');
        const move = (right ? 1 : 0) - (left ? 1 : 0);
        player.vx = move * player.speed;

        // Jump buffer & coyote time
        buffer = (jumpKey || jumpRequested) ? BUFFER_MAX : Math.max(0, buffer - dt);
        coyote = player.onGround ? COYOTE_MAX : Math.max(0, coyote - dt);
        if (buffer > 0 && coyote > 0) { player.vy = -player.jumpV; buffer = 0; coyote = 0; jumpCount++; if (jumpCount===20) { try{ window.unlockAchievement('yahoo','Yahoo!','Jump 20 times'); }catch(e){} } }
        jumpRequested = false;

        // Physics (variable jump height)
        const holdingJump = jumpKey;
        player.vy += world.gravity * dt * (player.vy < 0 && !holdingJump ? 1.8 : 1);

        // Integrate and resolve
        let nx = player.vx * dt;
        let ny = player.vy * dt;
        // Update moving platforms
        for (const mp of movingPlatforms) {
            const t = Math.sin((time * mp.speed) / mp.range);
            if (mp.axis === 'x') mp.x = mp.base + t * mp.range;
            else mp.y = mp.base + t * mp.range;
        }
        // Build currentPlatforms for collision (exclude invisible disappearing platforms)
        window.currentPlatforms = [
            ...platforms.filter(p => !p.disappearing || p.visible),
            ...movingPlatforms
        ];
        const solved = resolveCollisions(player.x, player.y, nx, ny);
        player.x = Math.max(0, Math.min(world.width - player.w, solved.x));
        // allow player.y to go beyond world.height so falling death can trigger
        player.y = solved.y;

        // Camera follow (center player, clamp to world)
        const viewW = canvas.width, viewH = canvas.height;
        const targetX = Math.max(0, Math.min(world.width - viewW, player.x + player.w/2 - viewW/2));
        const targetY = Math.max(0, Math.min(world.height - viewH, player.y + player.h/2 - viewH/2));
        camera.x += (targetX - camera.x) * Math.min(1, dt * 8);
        camera.y += (targetY - camera.y) * Math.min(1, dt * 8);

        // Check goal
        if (!goal.reached && rectsIntersect({ x: player.x, y: player.y, w: player.w, h: player.h }, goal)) {
            goal.reached = true;
            hudStatus.textContent = 'Level Complete!';
            sfx.win.currentTime = 0; sfx.win.play().catch(()=>{});
            if (!anyLevelBeaten) { anyLevelBeaten = true; try{ window.unlockAchievement('nether','The Nether','Beat your first level'); }catch(e){} }
            if (currentLevelIndex === levels.length - 1) { try{ window.unlockAchievement('the-end','The End','Complete the game'); }catch(e){} }
            // unlock next level in progression
            try{
                const current = currentLevelIndex;
                const next = Math.min(levels.length - 1, current + 1);
                const prevMax = parseInt(localStorage.getItem('highestUnlocked') || '0', 10);
                if (next > prevMax) localStorage.setItem('highestUnlocked', String(next));
            }catch(e){}
            setTimeout(() => {
                currentLevelIndex = (currentLevelIndex + 1) % levels.length;
                deathCountThisLevel = 0;
                hudStatus.textContent = '';
                resetLevel();
            }, 1200);
        }
        // Coin collection
        for (const c of coins) {
            if (!c.got && Math.abs(player.x + player.w/2 - c.x) < c.r + player.w/2 &&
                Math.abs(player.y + player.h/2 - c.y) < c.r + player.h/2) {
                c.got = true;
                coinCount++;
                if (hudCoins) hudCoins.textContent = `Coins ${coinCount}/${coins.length}`;
                try { sfx.pearl.currentTime = 0; sfx.pearl.play().catch(()=>{}); } catch(e){}
                totalPearls++;
                updateHotbar();
                try{ if (!window.hasAchievement('pearl')) window.unlockAchievement('pearl','Ender Pearl','Collect your first Ender Pearl'); }catch(e){}
            }
        }
        // simple footstep when onGround and moving
        if (player.onGround && Math.abs(player.vx) > 10) {
            if (!player._stepTimer) player._stepTimer = 0;
            player._stepTimer -= dt;
            if (player._stepTimer <= 0) {
                // choose platform under player's feet
                let under = null;
                for (const p of window.currentPlatforms || []) {
                    // check intersection slightly below feet
                    const probe = { x: player.x, y: player.y + player.h + 4, w: player.w, h: 2 };
                    if (!(probe.x + probe.w <= p.x || probe.x >= p.x + p.w || probe.y + probe.h <= p.y || probe.y >= p.y + p.h)) {
                        under = p;
                        break;
                    }
                }
                const mat = under ? platformMaterial(under) : 'stone';
                try {
                    if (mat === 'grass') {
                        sfx.stepGrass.currentTime = 0; sfx.stepGrass.play().catch(()=>{});
                    } else if (mat === 'dirt') {
                        sfx.stepDirt.currentTime = 0; sfx.stepDirt.play().catch(()=>{});
                    } else {
                        sfx.stepStone.currentTime = 0; sfx.stepStone.play().catch(()=>{});
                    }
                } catch(e){}
                player._stepTimer = 0.35; // cadence
            }
        } else {
            player._stepTimer = 0;
        }

        // Restart
        if (keys.has('r')) {
            resetLevel();
        }
        // Escape back to menu
        if (keys.has('escape')) {
            stopGameToMenu();
        }

        // Death by falling below the world
        if (player.y > world.height + 300) {
            hudStatus.textContent = 'You Died — Falling';
            sfx.die.currentTime = 0; sfx.die.play().catch(()=>{});
            try{ if (!window.hasAchievement('fly')) window.unlockAchievement('fly',"When Steve's fly",'Die from falling for the first time'); }catch(e){}
            deathCountThisLevel++; if (deathCountThisLevel === 10) { try{ window.unlockAchievement('skill','Skill issue','Die 10 times on 1 level'); }catch(e){} }
            setTimeout(resetLevel, 250);
        }
    }

    function draw() {
        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Sky background (use provided image with subtle parallax)
        if (currentLevelIndex >= 10 && imgCave.complete && imgCave.naturalWidth) {
            // cave background: tile and offset slightly for parallax
            const sx = (camera.x * 0.05) % imgCave.naturalWidth;
            ctx.drawImage(imgCave, -sx, -camera.y * 0.02, imgCave.naturalWidth, canvas.height);
            ctx.drawImage(imgCave, imgCave.naturalWidth - sx, -camera.y * 0.02, imgCave.naturalWidth, canvas.height);
        } else if (imgSky.complete && imgSky.naturalWidth) {
            // tile the sky horizontally to cover wide worlds, offset by camera for parallax
            const sx = (camera.x * 0.15) % imgSky.naturalWidth;
            ctx.drawImage(imgSky, -sx, -camera.y * 0.05, imgSky.naturalWidth, canvas.height);
            ctx.drawImage(imgSky, imgSky.naturalWidth - sx, -camera.y * 0.05, imgSky.naturalWidth, canvas.height);
        } else {
            ctx.fillStyle = '#f7f7f7'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // Distant hills (subtle shapes over sky)
        ctx.save(); ctx.translate(-camera.x * 0.2, -camera.y * 0.1);
        ctx.fillStyle = 'rgba(230,230,230,0.7)'; ctx.fillRect(200, 620, 900, 140); ctx.fillRect(1500, 580, 800, 180);
        ctx.restore();
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        // Platforms (static + moving)
        for (const p of platforms.concat(movingPlatforms)) {
            // Skip invisible disappearing platforms
            if (p.disappearing && !p.visible) continue;
            
            const mat = platformMaterial(p);
            const baseImg = (mat === 'dirt' || p.w > 200) ? imgDirt : imgStone;
            
            // Add visual feedback for disappearing platforms
            const alpha = p.disappearing ? (p.visible ? 1 : 0.3) : 1;
            ctx.globalAlpha = alpha;
            
            if (baseImg.complete && baseImg.naturalWidth) {
                ctx.fillStyle = makeScaledPattern(baseImg, p);
                ctx.fillRect(p.x, p.y, p.w, p.h);
            } else {
                ctx.fillStyle = '#c9b79a'; ctx.fillRect(p.x, p.y, p.w, p.h);
            }
            // grass top strip if material is grass and texture available
            if (mat === 'grass' && grassPattern) {
                ctx.fillStyle = grassPattern;
                const strip = Math.max(8, Math.min(16, Math.floor(p.h * 0.35)));
                ctx.fillRect(p.x, p.y, p.w, strip);
            }
            
            // Add warning effect for disappearing platforms
            if (p.disappearing && p.visible) {
                const cycleProgress = (p.cycleTimer % p.cycleTime) / p.cycleTime;
                if (cycleProgress > 0.7) {
                    ctx.strokeStyle = `rgba(255, 0, 0, ${Math.sin((cycleProgress - 0.7) * 10) * 0.5 + 0.5})`;
                    ctx.lineWidth = 3;
                    ctx.strokeRect(p.x, p.y, p.w, p.h);
                    ctx.lineWidth = 1;
                }
            }
            
            ctx.globalAlpha = 1;
            ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.strokeRect(p.x, p.y, p.w, p.h);
        }

        // Goal flag
        if (imgGoal.complete && imgGoal.naturalWidth) {
            // center the portal graphic on the goal rect for nicer visuals
            const gw = Math.max(goal.w, 64);
            const gh = Math.max(goal.h, 64);
            ctx.drawImage(imgGoal, goal.x - (gw - goal.w)/2, goal.y - (gh - goal.h)/2, gw, gh);
        } else {
            ctx.fillStyle = goal.reached ? '#0a0' : '#000';
            ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
            ctx.beginPath();
            ctx.moveTo(goal.x + goal.w, goal.y);
            ctx.lineTo(goal.x + goal.w + 40, goal.y + 15);
            ctx.lineTo(goal.x + goal.w, goal.y + 30);
            ctx.closePath();
            ctx.fill();
        }

        // Coins
        for (const c of coins) {
            if (c.got) continue;
            if (imgPearl.complete) {
                const size = c.r * 2.6; // visual scale
                ctx.drawImage(imgPearl, c.x - size/2, c.y - size/2, size, size);
            } else {
                ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI*2); ctx.fill();
            }
        }

        // Player
        // Draw Steve sprite if available, otherwise fallback to rectangle
        if (imgSteve.complete) {
            ctx.drawImage(imgSteve, player.x, player.y, player.w, player.h);
            // small outline for readability
            ctx.strokeStyle = 'rgba(0,0,0,0.35)';
            ctx.strokeRect(player.x, player.y, player.w, player.h);
        } else {
            ctx.fillStyle = '#111';
            ctx.fillRect(player.x, player.y, player.w, player.h);
        }

        ctx.restore();
    }

    function loop(ts) {
        if (!running) return;
        if (!last) last = ts;
        const dt = Math.min(0.033, (ts - last) / 1000);
        last = ts;
        update(dt);
        draw();
        requestAnimationFrame(loop);
    }

    // update resetLevel to set cave class on game element when appropriate
    function resetLevel() {
        loadLevel(currentLevelIndex);
        player.vx = 0; player.vy = 0; player.onGround = false;
        hudStatus.textContent = '';
        coinCount = 0; if (hudCoins) hudCoins.textContent = `Coins 0/${coins.length}`;
        // play spawn SFX
        sfx.spawn.currentTime = 0; sfx.spawn.play().catch(()=>{});

        // apply cave class for visual tweaks
        try {
            const gameEl = document.getElementById('game');
            if (gameEl) {
                if (currentLevelIndex >= 10) gameEl.classList.add('cave');
                else gameEl.classList.remove('cave');
            }
        } catch(e){}
    }

    function stopGameToMenu() {
        running = false;
        // play die/exit sound for feedback
        sfx.die.currentTime = 0; sfx.die.play().catch(()=>{});
        // stop background music when returning to menu
        try { bgMusic.pause(); bgMusic.currentTime = 0; } catch(e){}
        document.getElementById('game').classList.add('hidden');
        const menu = document.querySelector('.main-menu');
        menu.style.display = 'flex';
    }

    window.startGame = function startGame() {
        resize();
        setupJoystick();
        setupMobileButtons();
        if (typeof window.currentLevelIndex === 'number') currentLevelIndex = window.currentLevelIndex;
        resetLevel();
        last = 0;
        running = true;
        updateHotbar();
        try{ if (!window.hasAchievement('the-game')) window.unlockAchievement('the-game','The Game','Play for the first time'); }catch(e){}
        // apply saved audio prefs
        try {
            const savedVol = parseFloat(localStorage.getItem('masterVolume') || '0.8');
            const muteSfx = localStorage.getItem('muteSfx') === 'true';
            if (!isNaN(savedVol)) bgMusic.volume = savedVol;
            // apply to sfx collection
            for (const k in sfx) {
                try { sfx[k].volume = muteSfx ? 0 : (savedVol || 0.8); } catch(e){}
            }
        } catch(e){}
        // start background music for the gameplay
        try { bgMusic.currentTime = 0; bgMusic.play().catch(()=>{}); } catch(e){}
        requestAnimationFrame(loop);
    };

    // expose stop so menu can call it (stops music and returns to menu)
    window.stopGame = function stopGame() {
        stopGameToMenu();
    };

    // Pause/Resume controls for Escape/menu
    window.pauseGame = function pauseGame() {
        if (!running) return;
        running = false;
        try { bgMusic.pause(); caveMusic.pause(); } catch(e){}
    };
    window.resumeGame = function resumeGame() {
        if (running) return;
        running = true;
        try {
            const savedVol = parseFloat(localStorage.getItem('masterVolume') || '0.8');
            bgMusic.volume = isNaN(savedVol) ? 0.8 : savedVol;
            caveMusic.volume = isNaN(savedVol) ? 0.8 : savedVol;
            if (currentLevelIndex >= 10) { caveMusic.play().catch(()=>{}); } else { bgMusic.play().catch(()=>{}); }
        } catch(e){}
        requestAnimationFrame(loop);
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (window.showPause) window.showPause();
        }
    });
})();