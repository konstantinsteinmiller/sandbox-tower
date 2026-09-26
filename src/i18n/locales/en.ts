// English source bundle. Single source of truth for translation keys — every
// new player-facing string gets a key here first; the per-language files in
// this folder mirror the shape. Vite ships each non-English locale as its own
// lazy chunk (see `src/i18n/index.ts`).
export default {
  'gameName': 'Sandbox Tower',
  'cancel': 'Cancel',
  'close': 'Close',
  'ok': 'Ok',
  'continue': 'Continue',
  'tapToContinue': 'Tap to continue',
  'clickToContinue': 'Click to continue',
  'rewards': 'REWARDS',
  'tip': 'Tip',
  'crazyGamesOnly': 'This game is only available on',

  // ─── HUD ──────────────────────────────────────────────────────────────────
  // ─── Mobile-fit game (Drop & Merge) ───────────────────────────────────────
  // ─── Gift pieces: the flying chest and the first-clear present ──────────
  'gift': {
    'free': 'Free',
    'tile': 'Free {name}, tier {n}: tap it, then tap the board to place it',
    'pair': 'Free pair of {name}: tap it, then tap the board to place it',
    'tilePaid': '{name}, tier {n}, half price: tap it, then tap the board to place it',
    'pairPaid': 'Pair of {name}, half price: tap it, then tap the board to place it',
    'discount': '-{n}%',
    'chest': 'Flying chest: tap to open it',
    'firstClear': 'Wave {n} cleared! A gift for you'
  },

  'mobile': {
    'rotatePortrait': 'Hold your phone upright to play',
    'columnFull': 'Column full',
    'repairAll': 'Repair all',
    'volley': 'Volley',
    'swap': 'Swap',
    'menu': 'Menu',
    'materials': 'materials',
    'zoom': 'Zoom'
  },

  'hud': {
    'wave': 'Wave',
    'enemies': 'Bugs',
    'callWave': 'Call Wave',
    'monstersIncoming': 'Bugs incoming!',
    'skip': 'Skip',
    'callBoss': 'Call Boss',
    'speed': 'Speed {n}×',
    'speedOffer': 'Unlock {n}× speed',
    'speedGroup': 'Game speed',
    'recenter': 'Recentre the view',
    'rotateLeft': 'Rotate left',
    'rotateRight': 'Rotate right',
    'arrowRain': 'Dart Rain',
    'arrowRainAim': 'Tap the battlefield to call the volley',
    'extendRange': '+{n}% Range'
  },

  // ─── The opening cutscene ─────────────────────────────────────────────────
  // Three lines across the ten-second fly-over west of the tower, one per beat:
  // the tower, the horde, the siege train. The fourth thing the player reads is
  // `hud.monstersIncoming`, shown over the engines rather than over the board.
  'intro': {
    'premise': 'Your sandcastle is the last thing standing.',
    'horde': 'The bugs are already marching.',
    'siege': 'And they built contraptions.'
  },

  // ─── Control hints ────────────────────────────────────────────────────────
  // Each has a touch and a pointer phrasing — a wrong verb reads as a bug.

  'warnings': {
    'hoard': 'Hoard +{n}%',
    'air': 'Air ×{n}',
    'sea': 'Water ×{n}',
    'bombers': 'Blast ×{n}',
    'siege': 'Siege ×{n}',
    'outOfReach': 'Outranged ×{n} — needs {m} range'
  },
  'hints': {
    'dropBlock': {
      'touch': 'Tap a column to drop the piece',
      'desktop': 'Click a column to drop the piece'
    },
    'mergeBlock': {
      'touch': 'Land a piece on its twin to merge them',
      'desktop': 'Land a piece on its twin to merge them'
    },
    'selectBlock': {
      'touch': 'Tap a block below to pick it',
      'desktop': 'Click a block below to pick it'
    },
    'placeBlock': {
      'touch': 'Now tap a glowing slot to build',
      'desktop': 'Now click a glowing slot to build'
    },
    'camera': {
      'touch': 'Drag to pan · Pinch to zoom',
      'desktop': 'Drag to pan · Scroll to zoom'
    },
    'callWave': {
      'touch': 'Tap Call Wave when your tower is ready',
      'desktop': 'Press Space to call the wave early'
    },
    'inspect': {
      'touch': 'Hold a block to inspect it',
      'desktop': 'Click a block to inspect it'
    }
  },

  // ─── Blocks ───────────────────────────────────────────────────────────────
  'tips': {
    'eco': 'Sand sifters and pebble diggers pay you every wave. Two or three change what you can afford.',
    'buff': 'Paper flags boost every block they touch — and they multiply. Surround one toy weapon instead of spreading them out.',
    'merge': 'Two identical weapons side by side fuse into one. Stack two of those to make a 2×2.',
    'spend': 'You have coins to spend. Tech-tree ranks are permanent — they carry into every future run.',
    'branches': 'Three separate trees: the castle, the paddling pool, and the workshop. None of them needs the others.',
    'shape': 'Walls in front, guns behind. A block that never gets hit is a block you never rebuild.',
    'gold': 'Gold buys block upgrades — tap any block to spend it. Piggy banks mint more every wave.',
    'siegeReach': 'Pencil trebuchets stand off further than a dart blaster, squirt gun or balloon launcher can reach. Answer them with a Mud Mortar — or a Toy Pirate Ship from the paddling pool.'
  },
  'blocks': {
    'fortify': 'Add toothpicks',
    'mergeTier': 'Merged {n}×',
    'repair': 'Repair',
    'repairCooldown': '{n}s',
    'reposition': 'Move this block',
    'sell': 'Sell',
    'upgrade': 'Upgrade',
    'upgradeMax': 'Fully upgraded',
    'rank': 'Lv {n}/{max}',
    'reinforced': 'Reinforced',
    'roofed': 'Roofed',
    'roofNote': 'Roofed — double HP, triple defence from above. Needs clear sky.',
    'enhancedNote': 'Reinforced — +{hp}% HP, +{dmg}% damage.',
    'enhancedHand': 'Reinforced hand',
    'reroll': 'Swap this piece',
    'kinds': {
      'buff': 'Buff',
      'core': 'Core',
      'structure': 'Structure',
      'weapon': 'Weapon',
      'economy': 'Economy',
      'utility': 'Utility',
      'ship': 'Boat'
    },
    'stats': {
      'yieldGold': 'Gold / wave',
      'buff': 'Neighbour buff',
      'hp': 'HP',
      'armor': 'Armour',
      'topDefense': 'Top defence',
      'dmg': 'Damage',
      'cooldown': 'Cooldown',
      'range': 'Range',
      'splash': 'Splash',
      'yieldWood': 'Sand / wave',
      'yieldStone': 'Pebbles / wave',
      'yieldCoins': 'Coins / wave',
      'repair': 'Repair / wave',
      'blast': 'Death blast',
      'thorns': 'Thorns'
    },
    'names': {
      'banner': 'Paper Flag',
      'obelisk': 'Magic Seashell',
      'lumberHut': 'Sand Sifter',
      'stonepit': 'Pebble Digger',
      'coffer': 'Piggy Bank',
      'skiff': 'Paper Boat', 'longship': 'Rubber Duck', 'galley': 'Toy Pirate Ship',
      'gate': 'Castle Gate',
      'wood': 'Sand Block',
      'brace': 'Packed Sand',
      'stone': 'Pebble Wall',
      'archer': 'Dart Blaster',
      'cannon': 'Squirt Gun',
      'mortar': 'Mud Mortar',
      'tesla': 'Bug Zapper',
      'frost': 'Ice Pop',
      'repair': 'Bucket & Spade',
      'spikes': 'Toothpick Wall',
      'bombard': 'Balloon Launcher'
    },
    'descriptions': {
      'banner': 'Boosts every neighbouring block. Two flags on one block stack.',
      'obelisk': 'A stronger flag. Auras multiply, so pairs are worth far more than double.',
      'lumberHut': 'Sifts sand at the end of every cleared wave.',
      'stonepit': 'Digs up pebbles at the end of every cleared wave.',
      'coffer': 'Mints run gold every wave — the currency block upgrades cost.',
      'skiff': 'Floats on the moat. Hits bugs under the surface.',
      'longship': 'Heavy dart harpoon. Tough, and it out-ranges the shore.',
      'galley': "Cork cannons and a crow's nest. The moat is yours.",
      'gate': 'The heart of your sandcastle. Lose it and the siege is over.',
      'wood': 'Cheap filler. The backbone of every early castle.',
      'brace': 'Twice the sand, more than twice the staying power.',
      'stone': 'Heavy and armoured. Best spent on the base.',
      'archer': 'Fast single-target foam darts. Hits fliers.',
      'cannon': 'Slow, heavy splash. Soaks packed crowds.',
      'mortar': 'Long-range arcing mud balls — but it cannot hit fliers.',
      'tesla': 'Zaps that fork between nearby bugs.',
      'frost': 'Chills a whole cluster and slows it to a crawl.',
      'repair': 'Patches every neighbouring block between waves.',
      'spikes': 'Attackers prick themselves on it every time they strike.',
      'bombard': 'Lobs a water balloon straight up. Small splash, ground bugs only.'
    }
  },

  // ─── Enemies ──────────────────────────────────────────────────────────────
  'enemies': {
    'names': {
      'grunt': 'Ant',
      'runner': 'Cockroach',
      'slinger': 'Spider',
      'brute': 'Rhino Beetle',
      'bomber': 'Bombardier Beetle',
      'bat': 'Fly',
      'bulwark': 'Roly-Poly',
      'golem': 'Stag Beetle',
      'wyvern': 'Hornet',
      'eel': 'Water Tiger',
      'shark': 'Diving Beetle',
      'kraken': 'Toe-Biter',
      'seadrake': 'Dragonfly Nymph',
      'ram': 'Pencil Ram',
      'ballista': 'Rubber-Band Crossbow',
      'catapult': 'Spoon Catapult',
      'siegeTower': 'Juice-Box Tower',
      'trebuchet': 'Pencil Trebuchet',
      'ironRam': 'Tin-Can Ram',
      'bombardier': 'Bumblebee',
      'firebug': 'Firefly'
    }
  },

  // ─── Allies ───────────────────────────────────────────────────────────────
  'allies': {
    'cavalry': 'Toy Knights',
    'cavalryFree': 'Free toy knight charge',
    'free': 'Free',
    'outOfReachHint': 'Out of reach — send the knights or extend your range'
  },

  // ─── Result / run summary ─────────────────────────────────────────────────
  'result': {
    'towerFell': 'Destroyed!',
    'reachedWave': 'You survived to wave {n}',
    'newRecord': 'New record!',
    'upgrade': 'Upgrade!',
    'defendAgain': 'Defend again',
    'continueRun': 'Rebuild & continue',
    'continueWave': 'Wave {n}',
    'tripleCoins': 'Triple coins',
    'tripleWave': '3× coins — {n}',
    'waveCleared': 'Wave {n} held!',
    'scoreLabel': 'Score',
    'bestLabel': 'Best score',
    'scoreCurrent': '({n} this run)',
    'rankLabel': 'Rank',
    'rankOf': 'of {n}'
  },

  // ─── Tech tree ────────────────────────────────────────────────────────────
  'tech': {
    'blueprints': {
      'title': 'Blueprints'
    },
    'sell': 'Sell rank',
    'sellBlocked': 'Sell {n} first — it needs this.',
    'intro1': 'Everything you buy here is permanent. It carries into every future run.',
    'intro2': 'Coins come from every siege, win or lose. This is where you spend them.',
    'intro3': 'Gold nodes you can afford now. Blue need more coins. Dim need the node before them.',
    'introNext': 'Next',
    'introDone': 'Got it',
    'title': 'Tech Tree',
    'rank': 'Rank {current}/{total}',
    'maxed': 'Maxed',
    'rankOpen': 'Rank {n}',
    'atRank': 'At rank {r}: {n} total',
    'owned': 'Unlocked',
    'requires': 'Requires {n}',
    'spotlight': 'Spend!',
    'names': {
      'm2_lumberHut': 'Sand Sifter',
      'forgeWelds': 'Super Glue',
      'logistics': 'Digging Crew',
      'unlockCoffer': 'Piggy Banks',
      'yields': 'Yields',
      'unlockObelisk': 'Magic Seashells',
      'rallyCry': 'Rally Cry',
      'stockpiles': 'Stockpiles',
      'harbour': 'Paddling Pool', 'dockWorks': 'Bigger Pool',
      'unlockLongship': 'Rubber Duck', 'seasonedHulls': 'Sturdy Boats',
      'navalGunnery': 'Boat Blasters', 'unlockGalley': 'Toy Pirate Ship',
      'admiralty': 'Admiral Duck',
      'foundations': 'Foundations',
      'sharpBolts': 'Pointy Darts',
      'unlockBrace': 'Packed Sand',
      'lumberStock': 'Sand Stockpile',
      'longSight': 'Long Sight',
      'rapidFire': 'Rapid Fire',
      'reinforced': 'Wet Sand Mix',
      'unlockSawmill': 'Rich Sand',
      'quarryStock': 'Pebble Stockpile',
      'unlockMortar': 'Mud Mortar',
      'heavyOrdnance': 'Bigger Splash',
      'unlockTesla': 'Bug Zapper',
      'gateArmor': 'Gate Armour',
      'unlockQuarry': 'Deep Digging',
      'richHauls': 'Rich Hauls',
      'wideFoundation': 'Wide Foundation',
      'siegeShells': 'Power Soakers',
      'unlockFrost': 'Ice Pop',
      'forkedBolts': 'Forked Zaps',
      'ironPlating': 'Hard-Packed Sand',
      'unlockRepair': 'Bucket & Spade',
      'unlockMint': 'Treasure Map',
      'looting': 'Looting',
      'overcharge': 'Overcharge',
      'masterwork': 'Masterwork',
      'fieldRepairs': 'Field Repairs',
      'greatFoundation': 'Great Foundation',
      'warChest': 'Treasure Chest',
      'unlockSpikes': 'Toothpick Wall',
      'unlockBombard': 'Balloon Launcher',
      'sharpSpikes': 'Sharp Toothpicks',
      'cavalryDrill': 'Knight Training',
      'artilleryDoctrine': 'Long Shots'
    },
    'descriptions': {
      'm2_lumberHut': 'Unlocks the Sand Sifter — pays sand after every wave.',
      'forgeWelds': 'Merged blocks produce +{n}% more per rank — damage, thorns and yield.',
      'logistics': 'Unlocks the Pebble Digger — a cheap producer you can afford in the run it matters.',
      'unlockCoffer': 'Unlocks the Piggy Bank, the only block that mints run gold.',
      'yields': 'Every economy block yields +{n}% more.',
      'unlockObelisk': 'Unlocks the Magic Seashell, a far stronger neighbour buff.',
      'rallyCry': 'Buff blocks are +{n}% stronger.',
      'stockpiles': 'Every economy block yields +{n}% more.',
      'harbour': 'Float boats on the moat. They alone can hit submerged bugs.',
      'dockWorks': 'Float boats {n} cell wider per rank.',
      'unlockLongship': 'A tough rubber duck with a heavy dart harpoon.',
      'seasonedHulls': 'Boats start with +{n}% HP.',
      'navalGunnery': 'Boat weapons deal +{n}% damage.',
      'unlockGalley': "Cork cannons, a crow's nest and a plank to walk.",
      'admiralty': 'Boat weapons deal a further +{n}% damage.',
      'foundations': 'Every castle block starts with +{n}% HP.',
      'sharpBolts': 'Castle weapons deal +{n}% damage per rank.',
      'unlockBrace': 'Unlocks Packed Sand — twice the HP of a plain sand block.',
      'lumberStock': 'Start each siege with +{n} sand per rank.',
      'longSight': 'All weapons reach +{n}% further per rank.',
      'rapidFire': 'All weapons fire {n}% faster per rank.',
      'reinforced': 'Every castle block gains +{n}% HP per rank.',
      'unlockSawmill': 'Every producer yields +{n}% more per rank.',
      'quarryStock': 'Start each siege with +{n} pebbles per rank.',
      'unlockMortar': 'Unlocks the Mud Mortar — long-range arcing splash.',
      'heavyOrdnance': 'Splash radius +{n}% per rank.',
      'unlockTesla': 'Unlocks the Bug Zapper — zaps fork between bugs.',
      'gateArmor': 'The Castle Gate gains +{n}% HP per rank.',
      'unlockQuarry': 'Every producer yields a further +{n}% per rank.',
      'richHauls': 'Wave rewards +{n}% per rank.',
      'wideFoundation': 'Build {n} columns wider per rank.',
      'siegeShells': 'Castle weapons deal +{n}% damage per rank.',
      'unlockFrost': 'Unlocks the Ice Pop — slows whole clusters.',
      'forkedBolts': 'Zaps fork to {n} extra bug per rank.',
      'ironPlating': 'Every block gains +{n} armour per rank.',
      'unlockRepair': 'Unlocks the Bucket & Spade — patches neighbours each wave.',
      'unlockMint': 'Every producer yields a further +{n}% per rank.',
      'looting': 'Bugs drop +{n}% more coins per rank.',
      'overcharge': 'All weapons fire {n}% faster per rank.',
      'masterwork': 'Castle weapons deal +{n}% damage per rank.',
      'fieldRepairs': 'Every block heals {n}% of its max HP per cleared wave, per rank.',
      'greatFoundation': 'Build {n} more columns wider per rank.',
      'warChest': 'Wave rewards +{n}% per rank.',
      'unlockSpikes': 'Unlocks the Toothpick Wall — attackers prick themselves on it.',
      'unlockBombard': 'Unlocks the Balloon Launcher — short-range water balloons against ground bugs.',
      'sharpSpikes': 'Toothpick walls reflect +{n}% more damage per rank.',
      'cavalryDrill': 'Toy knights charge out with +{n}% HP and damage per rank.',
      'artilleryDoctrine': 'All weapons reach +{n}% further per rank.'
    }
  },

  // ─── Resources ────────────────────────────────────────────────────────────
  'resources': {
    'wood': 'sand',
    'stone': 'pebbles',
    'gold': 'gold'
  },

  // ─── Ads ──────────────────────────────────────────────────────────────────
  'ads': {
    'watch': 'Watch',
    'revive': 'Revive',
    'secondChance': 'Second Chance',
    'doubleCoins': '2× Coins',
    'plusCoins': '+{n} coins'
  },

  // ─── Achievements ─────────────────────────────────────────────────────────
  'achievements': {
    'title': 'Achievements',
    'subtitle': 'Hit lifetime milestones to earn coins.',
    'claim': 'Claim',
    'claimed': 'Claimed',
    'progress': '{c} / {t}',
    'items': {
      'wave5': { 'name': 'First Stand', 'desc': 'Survive to wave 5.' },
      'wave10': { 'name': 'Stronghold', 'desc': 'Survive to wave 10.' },
      'wave20': { 'name': 'Bulwark', 'desc': 'Survive to wave 20.' },
      'wave30': { 'name': 'Unbreakable', 'desc': 'Survive to wave 30.' },
      'waves50': { 'name': 'Wave Breaker', 'desc': 'Clear 50 waves in total.' },
      'waves250': { 'name': 'Siege Veteran', 'desc': 'Clear 250 waves in total.' },
      'kills500': { 'name': 'Defender', 'desc': 'Squash 500 bugs in total.' },
      'kills5k': { 'name': 'Bug Squasher', 'desc': 'Squash 5,000 bugs in total.' },
      'kills50k': { 'name': 'Legend', 'desc': 'Squash 50,000 bugs in total.' },
      'height10': { 'name': 'Skyward', 'desc': 'Build a tower 10 blocks tall.' },
      'height20': { 'name': 'Cloudpiercer', 'desc': 'Build a tower 20 blocks tall.' },
      'blocks250': { 'name': 'Builder', 'desc': 'Place 250 blocks in total.' },
      'blocks2k': { 'name': 'Architect', 'desc': 'Place 2,000 blocks in total.' },
      'coins5k': { 'name': 'Coin Collector', 'desc': 'Earn 5,000 coins in total.' },
      'coins50k': { 'name': 'Treasurer', 'desc': 'Earn 50,000 coins in total.' },
      'runs25': { 'name': 'Persistent', 'desc': 'Start 25 sieges.' }
    }
  },

  // ─── Daily missions ───────────────────────────────────────────────────────
  'missions': {
    'title': 'Daily Missions',
    'subtitle': 'Complete goals each day for coins.',
    'claim': 'Claim',
    'done': 'Claimed',
    'types': {
      'coins': 'Earn {n} coins today',
      'waves': 'Survive to wave {n} in one siege',
      'kills': 'Squash {n} bugs today',
      'blocks': 'Place {n} blocks today'
    }
  },

  // ─── Battle pass ──────────────────────────────────────────────────────────
  'battlePass': {
    'title': 'Battle Pass',
    'progress': '{current} / {total}',
    'daysLeft': '{n}d left',
    'maxed': 'BATTLE PASS COMPLETE',
    'xpProgress': '{current} / {total} XP',
    'howToEarn': 'How to earn XP',
    'perRun': 'per siege',
    'perWave': 'per wave held',
    'unlockHint': 'Reach {n} XP to unlock the next reward — unclaimed rewards stay until you tap them.'
  },

  // ─── Daily rewards ────────────────────────────────────────────────────────
  'dailyRewards': {
    'title': 'Daily Rewards',
    'subtitle': 'Sign in every day to keep your streak.',
    'day': 'Day {n}',
    'dayShort': 'D{n}'
  },

  // ─── Options ──────────────────────────────────────────────────────────────
  'options': {
    'title': 'Options',
    'general': 'General',
    'audio': 'Audio',
    'language': 'Language',
    'difficulty': 'Difficulty',
    'soundEffects': 'Sound Effects',
    'music': 'Music',
    'musicTrack': 'Music Track',
    'musicTracks': {
      'cozy': 'Cozy Harmony',
      'trance': 'Trance Tunnel'
    },
    'close': 'Save & Close',
    'difficulties': {
      'easy': 'Easy',
      'medium': 'Medium',
      'hard': 'Hard'
    },
    'difficultyHints': {
      'easy': 'Smaller waves and softer bugs.',
      'medium': 'The standard, balanced siege.',
      'hard': 'Denser waves and tougher bugs.'
    }
  },

  // ─── System ───────────────────────────────────────────────────────────────
  'adsBlocked': {
    'title': "Couldn't show ad",
    'body': 'We tried to show you a video so you could earn your reward, but something on your browser is blocking ads.',
    'allowPrefix': 'Please allow ads on',
    'allowSuffix': '(or pause your ad-blocker for this game) and try again.',
    'gotIt': 'Got it'
  },
  'saveStatus': {
    'restoredTitle': 'Cloud save restored',
    'restoredBody': '+{n} bonus coins for the recovery',
    'tap': 'tap',
    'pausedTitle': 'Cloud sync paused',
    'pausedBody': 'Playing offline. Your progress is saved here.',
    'retry': 'Retry',
    'dismiss': 'dismiss'
  },
  'loading': {
    'tooLong': 'Loading taking too long? Try disabling your ad blocker and refresh.'
  },
  'license': {
    'denied': 'Access Denied: Please purchase a license.'
  }
}
