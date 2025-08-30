document.addEventListener('DOMContentLoaded', function() {
    const logos = document.querySelectorAll('.logo');
    let currentIndex = 0;
    let mutationAudio = null;
    let titleAudio = null; // make accessible to stop on game start
    // shared back sound used by many close buttons and cancel actions
    const backSfx = new Audio('back.wav');
    const achContainer = document.getElementById('achievement-toasts');
    const loadAchs = () => new Set(JSON.parse(localStorage.getItem('achievements')||'[]'));
    const saveAchs = (set) => localStorage.setItem('achievements', JSON.stringify([...set]));
    const achSfx = new Audio('achievement-mp3-sound.mp3');
    window.hasAchievement = (id)=>loadAchs().has(id);
    // helper: allow overlapping SFX by cloning the audio node
    function playSfx(audio){ try{ const n=audio.cloneNode(true); n.volume=audio.volume; n.play().catch(()=>{});}catch(e){} }

    // ensure progression key exists
    if (localStorage.getItem('highestUnlocked') === null) localStorage.setItem('highestUnlocked','0');

    window.unlockAchievement = (id, title, subtitle="") => {
        const set = loadAchs(); if (set.has(id)) return;
        set.add(id); saveAchs(set);
        try{
            const vol=parseFloat(localStorage.getItem('masterVolume')||'0.8');
            const mute=localStorage.getItem('muteSfx')==='true';
            const loud = Math.min(1, Math.max(0.85, isNaN(vol)?0.85:vol));
            achSfx.volume=loud;
            if(!mute){ achSfx.currentTime=0; achSfx.play().catch(()=>{}); }
        }catch(e){}
        const el=document.createElement('div'); el.className='achievement-toast';
        el.innerHTML=`<div class="achievement-icon"><span>🏆</span></div><div class="achievement-text"><strong>Achievement unlocked</strong><small>${title}${subtitle?` – ${subtitle}`:''}</small></div>`;
        achContainer.appendChild(el); setTimeout(()=>{ el.style.transition='opacity .4s, transform .4s'; el.style.opacity='0'; el.style.transform='translateX(-20px)'; setTimeout(()=>el.remove(),450); }, 3600);
    };

    function showNextLogo() {
        // Hide current logo
        if (currentIndex > 0) {
            logos[currentIndex - 1].classList.remove('active');
        }
        
        // Show next logo if not at the end
        if (currentIndex < logos.length) {
            logos[currentIndex].classList.add('active');
            
            // Play sound for 4J logo (last logo, index 4)
            if (currentIndex === 4) {
                mutationAudio = new Audio('2-09. Mutation.mp3');
                mutationAudio.play().catch(e => console.log('Audio play failed:', e));
                
                // Show main menu 7 seconds after 4J logo appears
                setTimeout(showMainMenu, 7000);
            }
            
            currentIndex++;
            
            // Schedule next logo or finish
            if (currentIndex < logos.length) {
                setTimeout(showNextLogo, 5500); // 5 seconds display + 0.5s transition
            }
        }
    }

    function showMainMenu() {
        // Stop mutation music
        if (mutationAudio) {
            mutationAudio.pause();
            mutationAudio.currentTime = 0;
        }
        // ensure splash is fully removed so it can't overlap the menu
        const splashEl = document.getElementById('splash-screen'); if (splashEl) splashEl.remove();
        
        // Play title screen music
        titleAudio = new Audio('title screen.mp3');
        titleAudio.loop = true;
        // set volume from saved option (default 0.8)
        try {
            const savedVol = parseFloat(localStorage.getItem('masterVolume') || '0.8');
            titleAudio.volume = isNaN(savedVol) ? 0.8 : savedVol;
        } catch(e){}
        titleAudio.play().catch(e => console.log('Title audio play failed:', e));
        
        // Menu button SFX
        const hoverSfx = new Audio('MoveCursor.wav');
        const clickSfx = new Audio('Click.wav');
        const scrollSfx = new Audio('Scroll.wav');
        // ensure close buttons play back sound
        document.querySelectorAll('#levels-close, #options-close').forEach(b => {
            b.addEventListener('click', () => { try { playSfx(backSfx); } catch(e){} });
        });
        
        // Hide logo container and show main menu
        document.querySelector('.logo-container').style.display = 'none';
        document.querySelector('.main-menu').style.display = 'flex';
        // Random splash text on the yellow rotating tagline
        const splashText = "As seen on TV!|Awesome!|100% pure!|May contain nuts!|More polygons!|Moderately attractive!|Limited edition!|Flashing letters!|It's here!|Best in class!|It's finished!|Kind of dragon free!|Excitement!|More than 500 sold!|One of a kind!|Heaps of hits on YouTube!|Indev!|Spiders everywhere!|Check it out!|Holy cow, man!|It's a game!|Made in Sweden!|Uses LWJGL!|Reticulating splines!|Minecraft!|Yaaay!|Singleplayer!|Keyboard compatible!|Ingots!|Exploding creepers!|That's no moon!|l33t!|Create!|Survive!|Dungeon!|Exclusive!|The bee's knees!|Closed source!|Classy!|Wow!|Not on steam!|Oh man!|Awesome community!|Pixels!|Teetsuuuuoooo!|Kaaneeeedaaaa!|Now with difficulty!|Enhanced!|90% bug free!|Pretty!|12 herbs and spices!|Fat free!|Absolutely no memes!|Free dental!|Ask your doctor!|Minors welcome!|Cloud computing!|Legal in Finland!|Hard to label!|Technically good!|Bringing home the bacon!|Indie!|GOTY!|Ceci n'est pas une title screen!|Euclidian!|Now in 3D!|Inspirational!|Herregud!|Complex cellular automata!|Yes, sir!|Played by cowboys!|OpenGL 2.1 (if supported)!|Thousands of colors!|Try it!|Age of Wonders is better!|Try the mushroom stew!|Sensational!|Hot tamale, hot hot tamale!|Play him off, keyboard cat!|Guaranteed!|Macroscopic!|Bring it on!|Random splash!|Call your mother!|Monster infighting!|Loved by millions!|Ultimate edition!|Freaky!|You've got a brand new key!|Water proof!|Uninflammable!|Whoa, dude!|All inclusive!|Tell your friends!|NP is not in P!|Music by C418!|Livestreamed!|Haunted!|Polynomial!|Terrestrial!|All is full of love!|Full of stars!|Scientific!|Not as cool as Spock!|Collaborate and listen!|Never dig down!|Take frequent breaks!|Not linear!|Han shot first!|Nice to meet you!|Buckets of lava!|Ride the pig!|Larger than Earth!|sqrt(-1) love you!|Phobos anomaly!|Punching wood!|Falling off cliffs!|1% sugar!|150% hyperbole!|Synecdoche!|Let's danec!|Seecret Friday update!|Reference implementation!|Kiss the sky!|20 GOTO 10!|Verlet intregration!|Peter Griffin!|Do not distribute!|Cogito ergo sum!|4815162342 lines of code!|A skeleton popped out!|The sum of its parts!|BTAF used to be good!|I miss ADOM!|umop-apisdn!|OICU812!|Bring me Ray Cokes!|Finger-licking!|Thematic!|Pneumatic!|Sublime!|Octagonal!|Une baguette!|Gargamel plays it!|Rita is the new top dog!|SWM forever!|Representing Edsbyn!|Matt Damon!|Supercalifragilisticexpialidocious!|Consummate V's!|Cow Tools!|Double buffered!|Fan fiction!|Flaxkikare!|Jason! Jason! Jason!|Hotter than the sun!|Internet enabled!|Autonomous!|Engage!|Fantasy!|DRR! DRR! DRR!|Kick it root down!|Regional resources!|Woo, facepunch!|Woo, somethingawful!|Woo, /v/!|Woo, tigsource!|Woo, worldofminecraft!|Woo, reddit!|Woo, 2pp!|Google anlyticsed!|Now supports åäö!|Give us Gordon!|Tip your waiter!|Very fun!|12345 is a bad password!|Vote for net neutrality!|Lives in a pineapple under the sea!|MAP11 has two names!|Omnipotent!|Gasp!|...!|Bees, bees, bees, bees!|Jag känner en bot!|This text is hard to read if you play the game at the default resolution, but at 1080p it's fine!|Haha, LOL!|Hampsterdance!|Menger sponge!|idspispopd!|Eple (original edit)!|So fresh, so clean!|Slow acting portals!|Try the Nether!|Don't look directly at the bugs!|Oh, ok, Pigmen!|Finally with ladders!|Scary!|Play Minecraft, Watch Topgear, Get Pig!|Twittered about!|Jump up, jump up, and get down!|Joel is neat!|A riddle, wrapped in a mystery!|This parrot is no more! It has ceased to be!|Welcome to your Doom!|Stay a while, stay forever!|Stay a while and listen!|Treatment for your rash!|\"Autological\" is!|Information wants to be free!|\"Almost never\" is an interesting concept!|Lots of truthiness!|The creeper is a spy!|Turing complete!|It's groundbreaking!|Let our battle's begin!|The sky is the limit!|Jeb has amazing hair!|Ryan also has amazing hair!|Casual gaming!|Undefeated!|Kinda like Lemmings!|Follow the train, CJ!|Leveraging synergy!|This message will never appear on the splash screen, isn't that weird?|DungeonQuest is unfair!|90210!|Check out the far lands!|Tyrion would love it!|Also try VVVVVV!|Also try Super Meat Boy!|Also try Terraria!|Also try Mount And Blade!|Also try Project Zomboid!|Also try World of Goo!|Also try Limbo!|Also try Pixeljunk Shooter!|Also try Braid!|That's super!|Bread is pain!|Read more books!|Khaaaaaaaaan!|Less addictive than TV Tropes!|More addictive than lemonade!|Bigger than a bread box!|Millions of peaches!|Fnord!|This is my true form!|Don't bother with the clones!|Pumpkinhead!|Made by Jeb!|Has an ending!|Finally complete!|Feature packed!|Boots with the fur!|Stop, hammertime!|Testificates!|Conventional!|Homeomorphic to a 3-sphere!|Doesn't avoid double negatives!|Place ALL the blocks!|Does barrel rolls!|Meeting expectations!|PC gaming since 1873!|Ghoughpteighbteau tchoghs!|Déjà vu!|Déjà vu!|Got your nose!|Haley loves Elan!|Afraid of the big, black bat!|Doesn't use the U-word!|Child's play!|See you next Friday or so!|From the streets of Södermalm!|150 bpm for 400000 minutes!|Technologic!|Funk soul brother!|Pumpa kungen!|日本ハロー！|한국 안녕하세요!|Helo Cymru!|Cześć Polsko!|你好中国！|Привет Россия!|Γεια σου Ελλάδα!|My life for Aiur!|Lennart lennart = new Lennart();|I see your vocabulary has improved!|Who put it there?|You can't explain that!|if not ok then return end|§1C§2o§3l§4o§5r§6m§7a§8t§9i§ac|§kFUNKY LOL|Big Pointy Teeth!|Bekarton guards the gate!|Mmmph, mmph!|Don't feed avocados to parrots!|Swords for everyone!|Plz reply to my tweet!|.party()!|Take her pillow!|Put that cookie down!|Pretty scary!|I have a suggestion.|Now with extra hugs!|Now Java 8!|Woah.|HURNERJSGER?|What's up, Doc?|Now contains 32 random daily cats!|That's Numberwang!|pls rt|Do you want to join my server?|Put a little fence around it!|Throw a blanket over it!|One day, somewhere in the future, my work will be quoted!|Now with additional stuff!|Extra things!|Yay, puppies for everyone!|So sweet, like a nice bon bon!|Very influential in its circle!|Now With Multiplayer!|Rise from your grave!|Warning! A huge battleship \"STEVE\" is approaching fast!|Blue warrior shot the food!|Run, coward! I hunger!|Flavor with no seasoning!|Strange, but not a stranger!|Tougher than diamonds, rich like cream!|It swings, it jives!|Cruising streets for gold!|Take an eggbeater and beat it against a skillet!|Make me a table, a funky table!|Take the elevator to the mezzanine!|Stop being reasonable, this is the Internet!|/give @a hugs 64|This is good for Realms.|Any computer is a laptop if you're brave enough!|Do it all, everything!|Where there is not light, there can spider!|GNU Terry Pratchett|More Digital!|doot doot|Falling with style!|There's no stopping the Trollmaso|Throw yourself at the ground and miss|Rule #1: it's never my fault|Replaced molten cheese with blood?|Absolutely fixed relatively broken coordinates|Boats FTW|Javalicious edition|Should not be played while driving|You're going too fast!|Don't feed chocolate to parrots!|The true meaning of covfefe|An illusion! What are you hiding?|Something's not quite right...|Thank you for the fish!|All rumors are true!|Truly gone fishing!|Rainbow turtle?|Something funny!|I need more context.|Ahhhhhh!|Don't worry, be happy!|Water bottle!|What's the question?|Plant a tree!|Go to the dentist!|What do you expect?|Look mum, I'm in a splash!|It came from space.|Awesome game design right there!|Ph1lza had a good run!|10 years of Mining and Crafting!|Ping the human!|In case it isn't obvious, foxes aren't players.|Buzzy Bees!|Minecraft Java Edition presents: Disgusting Bugs|Wash your hands!|Soap and water!|Support local businesses!|Stay home and play games!|Stay safe!|Stay strong!|Cough or sneeze into your elbow!|Don't touch your face!|Support elderly relatives and friends!|Prepare, but don't hoard!|Gamers unite – separately in your own homes!|Save the world – stay inside!|Shop for your elders!|Hang out with your friends online!|Honey, I grew the bees!|Find your claw!|Everybody do the Leif!|<3 Max & 99 & Ducky!|Bushy eyebrows!|Edit is a name!|From free range developers!|Music by Lena Raine!|Aww man!|#minecraftfarms|And my pickaxe!|Envision! Create! Share!|Fabulous graphics!|Also try Minecraft Dungeons!|Vanilla!|May contain traces of citrus!|Zoglin!?|Black lives matter!|Be anti-racist!|Learn about allyship!|Speak OUT against injustice and UP for equality!|Amplify and listen to BIPOC voices!|Educate your friends on anti-racism!|Support the BIPOC community and creators!|Stand up for equality in your community!";
        let choices = [];
        const tag = document.querySelector('.menu-tagline');
        const setRandomSplash = () => {
            if (!tag || !choices.length) return;
            let text = choices[Math.floor(Math.random() * choices.length)];
            if (/^Also try/i.test(text)) text = 'Also try Minecraft!';
            tag.style.whiteSpace = 'nowrap'; tag.style.fontSize = '1.6rem'; tag.textContent = text;
            const maxWidth = 320; let size = 1.6;
            while (tag.scrollWidth > maxWidth && size > 0.9) { size -= 0.1; tag.style.fontSize = `${size}rem`; }
        };
        const computeLines = async () => {
            const files = ['index.html','styles.css','script.js','game.js','splashes.json'];
            const texts = await Promise.all(files.map(f => fetch(f).then(r => r.ok ? r.text() : '').catch(() => '')));
            return texts.reduce((sum,t)=>sum + (t? t.split('\n').length : 0), 0);
        };
        fetch('splashes.json').then(r => r.json()).then(async data => {
            choices = Array.isArray(data) ? data : [];
            const count = await computeLines();
            choices = choices.filter(s => !/\blines of code\b/i.test(s));
            choices.push(`${count.toLocaleString()} lines of code!`);
            setRandomSplash();
        }).catch(() => { choices = ['Awesome!', 'Also try Minecraft!']; setRandomSplash(); });
        
        // Wire Start Game to launch the real game
        const startBtn = document.getElementById('start-btn');
        const levelsBtn = document.getElementById('levels-btn');
        const optionsBtn = document.getElementById('options-btn');
        const exitBtn = document.getElementById('exit-btn');
        const storeBtn = document.getElementById('store-btn');
        const achBtn = document.getElementById('achievements-btn');
        if (startBtn) {
            // hover sound for all menu buttons
            document.querySelectorAll('.menu-btn').forEach(b => {
                b.addEventListener('mouseenter', () => { playSfx(hoverSfx); });
                // also play the start-click SFX for any button press so every "bucket" uses the same click sound
                b.addEventListener('click', () => {
                    const id = (b.id || '').toLowerCase();
                    if (!/close|cancel|back/.test(id)) { playSfx(clickSfx); }
                });
            });
            
            startBtn.onclick = () => {
                if (titleAudio) {
                    titleAudio.pause();
                    titleAudio.currentTime = 0;
                }
                document.querySelector('.main-menu').style.display = 'none';
                const gameEl = document.getElementById('game');
                gameEl.classList.remove('hidden');
                // start the game (defined in game.js)
                if (window.startGame) window.startGame();
            };
        }

        // Levels button opens level selector
        if (levelsBtn) {
            levelsBtn.addEventListener('click', () => {
                try { playSfx(scrollSfx); } catch(e){}
                document.getElementById('levels-modal').classList.remove('hidden');
                populateLevels();
            });
        }
        // Options button opens options modal
        if (optionsBtn) {
            optionsBtn.addEventListener('click', () => {
                openOptions();
            });
        }
        // Exit button opens confirmation
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                document.getElementById('exit-modal').classList.remove('hidden');
            });
        }
        // Store button opens confirmation
        if (storeBtn) {
            storeBtn.addEventListener('click', () => { const w = window.open('https://www.minecraft.net/en-us/marketplace','_blank'); if (w) w.opener = null; });
        }
        // Achievements button opens achievements modal
        if (achBtn) {
            achBtn.addEventListener('click', () => {
                try { playSfx(scrollSfx); } catch(e){}
                openAchievements();
            });
        }
        
        // Hook up "Refresh Splash Text" in Options to cycle tagline
        const refreshBtn = document.getElementById('options-refresh-splash');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                try { playSfx(scrollSfx); } catch(e){}
                setRandomSplash();
            });
        }

        // Pause modal wiring
        window.showPause = () => {
            const gameVisible = !document.getElementById('game').classList.contains('hidden');
            if (!gameVisible) return;
            try { playSfx(backSfx); } catch(e){}
            if (window.pauseGame) window.pauseGame();
            document.getElementById('pause-modal').classList.remove('hidden');
        };
        const pauseResume = document.getElementById('pause-resume');
        const pauseOptions = document.getElementById('pause-options');
        const pauseExit = document.getElementById('pause-exit');
        if (pauseResume) pauseResume.addEventListener('click', () => {
            document.getElementById('pause-modal').classList.add('hidden');
            if (window.resumeGame) window.resumeGame();
        });
        if (pauseOptions) pauseOptions.addEventListener('click', () => {
            document.getElementById('pause-modal').classList.add('hidden');
            openOptions();
        });
        if (pauseExit) pauseExit.addEventListener('click', () => {
            document.getElementById('pause-modal').classList.add('hidden');
            document.getElementById('exit-modal').classList.remove('hidden');
        });
    }

    // LEVELS UI
    function populateLevels() {
        const list = document.getElementById('levels-list');
        list.innerHTML = '';
        // Use number of levels from game.js global levels if available, otherwise default 3
        const numLevels = (window.__LEVEL_COUNT__) ? window.__LEVEL_COUNT__ : 3;
        const unlockedMax = parseInt(localStorage.getItem('highestUnlocked') || '0', 10);
        const currentIdx = typeof window.currentLevelIndex === 'number' ? window.currentLevelIndex : 0;
        for (let i = 0; i < numLevels; i++) {
            const div = document.createElement('div');
            const locked = !(i <= unlockedMax || i === currentIdx);
            div.className = 'level-entry' + (locked ? ' locked' : '');
            div.innerHTML = `<span>Level ${i+1}</span><div><button class="menu-btn${locked?' locked':''}" data-level="${i}" ${locked?'disabled':''}>${locked?'Locked':'Play'}</button></div>`;
            list.appendChild(div);
            // play scroll cue when hovering level entry and make buttons use click SFX
            div.addEventListener('mouseenter', () => { try { playSfx(scrollSfx); } catch(e){} });
            const lvlBtn = div.querySelector('button');
            lvlBtn.addEventListener('click', (e) => {
                if (locked) return; // prevent entering locked levels
                const idx = parseInt(e.currentTarget.getAttribute('data-level'), 10);
                try { clickSfx.currentTime = 0; clickSfx.play().catch(()=>{}); } catch(e){}
                // set level via game API so the internal index updates
                if (window.setLevel) { window.setLevel(idx); } else { window.currentLevelIndex = idx; }
                if (titleAudio) { titleAudio.pause(); titleAudio.currentTime = 0; }
                document.getElementById('levels-modal').classList.add('hidden');
                document.querySelector('.main-menu').style.display = 'none';
                document.getElementById('game').classList.remove('hidden');
                if (window.startGame) window.startGame();
            });
        }
        document.getElementById('levels-close').onclick = () => {
            try { playSfx(backSfx); } catch(e){}
            document.getElementById('levels-modal').classList.add('hidden');
        };
    }

    // OPTIONS UI
    function openOptions() {
        const modal = document.getElementById('options-modal');
        const vol = document.getElementById('opt-volume');
        const muteSfx = document.getElementById('opt-mute-sfx');
        const gamma = document.getElementById('opt-gamma');
        vol.value = localStorage.getItem('masterVolume') || '0.8';
        muteSfx.checked = localStorage.getItem('muteSfx') === 'true';
        gamma.value = localStorage.getItem('gamma') || '1';
        modal.classList.remove('hidden');
        document.getElementById('options-close').onclick = () => {
            try { playSfx(backSfx); } catch(e){}
            modal.classList.add('hidden');
        };
        document.getElementById('options-save').onclick = () => {
            localStorage.setItem('masterVolume', vol.value);
            localStorage.setItem('muteSfx', muteSfx.checked ? 'true' : 'false');
            localStorage.setItem('gamma', gamma.value);
            document.documentElement.style.setProperty('--gamma', gamma.value);
            document.documentElement.style.setProperty('--gamma-brightness', String(Math.pow(parseFloat(gamma.value || '1'), 2)));
            modal.classList.add('hidden');
        };
    }

    // ACHIEVEMENTS UI
    function openAchievements() {
        const modal = document.getElementById('achievements-modal');
        const list = document.getElementById('achievements-list');
        const unlocked = new Set(JSON.parse(localStorage.getItem('achievements')||'[]'));
        const defs = [
            { id:'the-game', title:'The Game', desc:'Play for the first time.' },
            { id:'nether', title:'The Nether', desc:'Beat your first level.' },
            { id:'yahoo', title:'Yahoo!', desc:'Jump 20 times.' },
            { id:'fly', title:"When Steve's fly", desc:'Die from falling for the first time.' },
            { id:'skill', title:'Skill issue', desc:'Die 10 times on 1 level.' },
            { id:'pearl', title:'Ender Pearl', desc:'Collect your first Ender Pearl (Coin).' },
            { id:'the-end', title:'The End', desc:'Complete the game.' },
        ];
        list.innerHTML = '';
        defs.forEach(d => {
            const isOn = unlocked.has(d.id);
            const row = document.createElement('div');
            row.className = 'level-entry';
            row.innerHTML = `<span>${d.title}</span><small style="opacity:.8">${d.desc}</small><div style="min-width:90px;text-align:right;"><span style="font-weight:700;${isOn?'color:#5fbf00':'color:#999'}">${isOn?'Unlocked':'Locked'}</span></div>`;
            list.appendChild(row);
        });
        modal.classList.remove('hidden');
        document.getElementById('achievements-close').onclick = () => {
            try { playSfx(backSfx); } catch(e){}
            modal.classList.add('hidden');
        };
    }

    // EXIT UI
    document.getElementById('exit-confirm').addEventListener('click', () => {
        // call exposed stop
        if (window.stopGame) window.stopGame();
        // hide modals and show main menu
        document.getElementById('exit-modal').classList.add('hidden');
        document.querySelector('.main-menu').style.display = 'flex';
    });
    document.getElementById('exit-cancel').addEventListener('click', () => {
        try { playSfx(backSfx); } catch(e){}
        document.getElementById('exit-modal').classList.add('hidden');
    });

    // handle Escape/back to menu with back SFX
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Pause game instead of returning to title
            if (window.showPause) window.showPause();
        }
    });

    // Start the sequence
    const splash = document.getElementById('splash-screen');
    splash.style.display = 'flex';
    setTimeout(() => { splash.style.display = 'none'; showNextLogo(); }, 5000);

    // apply saved gamma at startup
    const savedGamma = localStorage.getItem('gamma') || '1';
    document.documentElement.style.setProperty('--gamma', savedGamma);
    document.documentElement.style.setProperty('--gamma-brightness', String(Math.pow(parseFloat(savedGamma || '1'), 2)));
});