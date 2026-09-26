export default {
  'gameName': 'Sandbox Tower',
  'cancel': 'Annuler',
  'close': 'Fermer',
  'ok': 'Ok',
  'continue': 'Continuer',
  'tapToContinue': 'Touchez pour continuer',
  'clickToContinue': 'Cliquez pour continuer',
  'rewards': 'RÉCOMPENSES',
  'tip': 'Astuce',
  'crazyGamesOnly': 'Ce jeu est uniquement disponible sur',

  // ─── Mobile-fit game (Drop & Merge) ───────────────────────────────────────
  'gift': {
    'free': 'Gratuit',
    'tile': '{name} gratuit, niveau {n} : touche-le, puis touche le plateau pour le placer',
    'pair': 'Paire de {name} gratuite : touche-la, puis touche le plateau pour la placer',
    'tilePaid': '{name}, niveau {n}, à moitié prix : touche-le, puis touche le plateau pour le placer',
    'pairPaid': 'Paire de {name} à moitié prix : touche-la, puis touche le plateau pour la placer',
    'discount': '-{n} %',
    'chest': 'Coffre volant : touche-le pour l’ouvrir',
    'firstClear': 'Vague {n} terminée ! Un cadeau pour toi'
  },

  'mobile': {
    'rotatePortrait': 'Tenez votre téléphone à la verticale pour jouer',
    'columnFull': 'Colonne pleine',
    'repairAll': 'Tout réparer',
    'volley': 'Volée',
    'swap': 'Échanger',
    'menu': 'Menu',
    'materials': 'matériaux',
    'zoom': 'Zoom'
  },

  'hud': {
    'wave': 'Vague', 'enemies': 'Bestioles', 'callWave': 'Appeler la vague', 'callBoss': 'Appeler le boss',
    'monstersIncoming': 'Les bestioles arrivent !',
    'skip': 'Passer',
    'speed': 'Vitesse {n}×',
    'speedOffer': 'Débloquer la vitesse {n}×',
    'speedGroup': 'Vitesse du jeu', 'recenter': 'Recentrer la vue',
    'rotateLeft': 'Pivoter à gauche',
    'rotateRight': 'Pivoter à droite',
    'arrowRain': 'Pluie de fléchettes',
    'arrowRainAim': 'Touchez le champ de bataille pour lancer la volée',
    'extendRange': '+{n} % de portée'
  },


  // ─── The opening cutscene ─────────────────────────────────────────────────
  // Three lines across the ten-second fly-over west of the tower, one per beat:
  // the tower, the horde, the siege train. The fourth thing the player reads is
  // `hud.monstersIncoming`, shown over the engines rather than over the board.
  'intro': {
    'premise': 'Ton château de sable est le dernier encore debout.',
    'horde': 'Les bestioles sont déjà en marche.',
    'siege': 'Et elles ont construit des engins.'
  },

  'warnings': {
    'hoard': 'Trésor +{n}%',
    'air': 'Air ×{n}',
    'sea': 'Eau ×{n}',
    'bombers': 'Explosifs ×{n}',
    'siege': 'Siège ×{n}',
    'outOfReach': 'Hors de portée ×{n} — il faut {m} de portée'
  },
  'hints': {
    'dropBlock': {
      'touch': 'Touchez une colonne pour lâcher la pièce',
      'desktop': 'Cliquez sur une colonne pour lâcher la pièce'
    },
    'mergeBlock': {
      'touch': 'Posez une pièce sur sa jumelle pour les fusionner',
      'desktop': 'Posez une pièce sur sa jumelle pour les fusionner'
    },
    'selectBlock': { 'touch': 'Touchez un bloc en bas pour le choisir', 'desktop': 'Cliquez sur un bloc en bas pour le choisir' },
    'placeBlock': { 'touch': 'Touchez maintenant un emplacement lumineux', 'desktop': 'Cliquez maintenant sur un emplacement lumineux' },
    'camera': { 'touch': 'Glissez pour déplacer · Pincez pour zoomer', 'desktop': 'Glissez pour déplacer · Molette pour zoomer' },
    'callWave': { 'touch': 'Touchez « Appeler la vague » quand votre tour est prête', 'desktop': 'Espace pour lancer la vague en avance' },
    'inspect': { 'touch': 'Maintenez un bloc pour l’inspecter', 'desktop': 'Cliquez sur un bloc pour l’inspecter' }
  },

  'tips': {
    'eco': 'Tamis à sable et excavatrices à galets rapportent à chaque vague. Deux ou trois changent ce que vous pouvez payer.',
    'buff': 'Les fanions en papier renforcent tout ce qu’ils touchent, et se multiplient. Entourez une arme-jouet plutôt que de les disperser.',
    'merge': 'Deux armes identiques côte à côte fusionnent. Empilez-en deux pour obtenir un 2×2.',
    'spend': 'Il vous reste des pièces. Les rangs de l’arbre sont permanents : ils suivent chaque partie.',
    'branches': 'Trois arbres distincts : le château, la pataugeoire et l’atelier. Aucun ne dépend des autres.',
    'shape': 'Les murs devant, les canons derrière. Un bloc jamais touché est un bloc jamais reconstruit.',
    'gold': 'L’or paie les améliorations de bloc — touchez un bloc. Les tirelires en frappent à chaque vague.',
    'siegeReach': 'Les trébuchets à crayon se postent hors de portée du lance-fléchettes, du pistolet à eau ou du lance-ballons. Répondez avec un Mortier à boue — ou un Bateau pirate en jouet de la pataugeoire.'
  },
  'blocks': {
    'fortify': 'Ajouter des cure-dents',
    'sell': 'Vendre',
    'mergeTier': 'Fusionné {n}×',
    'upgrade': 'Améliorer',
    'upgradeMax': 'Amélioration max',
    'rank': 'Niv {n}/{max}',
    'reinforced': 'Renforcé',
    'roofed': 'Toituré',
    'roofNote': 'Toituré — PV doublés, défense triplée par le haut. Nécessite un ciel dégagé.',
    'enhancedNote': 'Renforcé — +{hp} % de PV, +{dmg} % de dégâts.',
    'enhancedHand': 'Main renforcée',
    'reroll': 'Changer cette pièce',
    'kinds': {
      'buff': 'Renfort', 'core': 'Cœur', 'structure': 'Structure', 'weapon': 'Arme', 'economy': 'Économie', 'utility': 'Utilitaire', 'ship': 'Bateau' },
    'stats': {
      'yieldGold': 'Or / vague',
      'buff': 'Renfort voisin',
      'topDefense': 'Défense (haut)',
      'hp': 'PV', 'armor': 'Armure', 'dmg': 'Dégâts', 'cooldown': 'Recharge', 'range': 'Portée',
      'splash': 'Zone', 'yieldWood': 'Sable / vague', 'yieldStone': 'Galets / vague', 'yieldCoins': 'Pièces / vague',
      'repair': 'Réparation / vague', 'blast': 'Explosion',
      'thorns': 'Épines'
    },
    'names': {
      'banner': 'Fanion en papier',
      'obelisk': 'Coquillage magique',
      'lumberHut': 'Tamis à sable',
      'stonepit': 'Excavatrice à galets',
      'coffer': 'Tirelire',
      'skiff': 'Bateau en papier', 'longship': 'Canard en caoutchouc', 'galley': 'Bateau pirate en jouet',
      'gate': 'Porte du château', 'wood': 'Bloc de sable', 'brace': 'Sable tassé', 'stone': 'Mur de galets',
      'archer': 'Lance-fléchettes', 'cannon': 'Pistolet à eau', 'mortar': 'Mortier à boue', 'tesla': 'Grille-insectes',
      'frost': 'Sucette glacée', 'repair': 'Seau et pelle',
      'spikes': 'Mur à cure-dents',
      'bombard': 'Lance-ballons'
    },
    'descriptions': {
      'banner': 'Renforce tous les blocs adjacents. Deux fanions sur un bloc se cumulent.',
      'obelisk': 'Un fanion plus fort. Les auras se multiplient : deux valent bien plus que le double.',
      'lumberHut': 'Tamise du sable à la fin de chaque vague nettoyée.',
      'stonepit': 'Extrait des galets à la fin de chaque vague nettoyée.',
      'coffer': 'Frappe de l’or à chaque vague — la monnaie des améliorations de bloc.',
      'skiff': 'Flotte sur la pataugeoire. Touche les bestioles immergées.',
      'longship': 'Harpon à fléchette lourd. Robuste et plus long que la rive.',
      'galley': 'Canons en liège et un nid-de-pie. La pataugeoire est à vous.',
      'gate': 'Le cœur de votre château de sable. S’il tombe, le siège est fini.',
      'wood': 'Remplissage bon marché. La colonne vertébrale de tout château débutant.',
      'brace': 'Deux fois plus de sable, bien plus de résistance.',
      'stone': 'Lourd et blindé. Idéal pour la base.',
      'archer': 'Fléchettes en mousse rapides sur une cible unique. Touche les volants.',
      'cannon': 'Lent, gros dégâts de zone. Trempe les groupes serrés.',
      'mortar': 'Boules de boue en cloche à longue portée, mais incapable de toucher les volants.',
      'tesla': 'Décharges qui rebondissent entre les bestioles proches.',
      'frost': 'Gèle tout un groupe et le ralentit fortement.',
      'repair': 'Répare tous les blocs voisins entre les vagues.',
      'spikes': 'Les assaillants se piquent dessus à chaque coup.',
      'bombard': 'Envoie un ballon d’eau à la verticale. Petit splash, bestioles au sol uniquement.'
    },
    'repair': 'Réparer',
    'repairCooldown': '{n} s',
    'reposition': 'Déplacer ce bloc'
  },

  'enemies': {
    'names': {
      'grunt': 'Fourmi', 'runner': 'Cafard', 'slinger': 'Araignée', 'brute': 'Scarabée rhinocéros',
      'bomber': 'Coléoptère bombardier', 'bat': 'Mouche', 'bulwark': 'Cloporte', 'golem': 'Lucane',
      'wyvern': 'Frelon',
      'eel': 'Tigre d’eau',
      'shark': 'Dytique',
      'kraken': 'Punaise géante',
      'seadrake': 'Larve de libellule',
      'ram': 'Bélier crayon',
      'ballista': 'Arbalète élastique',
      'catapult': 'Catapulte à cuillère',
      'siegeTower': 'Tour en berlingot de jus',
      'trebuchet': 'Trébuchet à crayon',
      'ironRam': 'Bélier en boîte de conserve',
      'bombardier': 'Bourdon',
      'firebug': 'Luciole'
    }
  },

  // ─── Allies ───────────────────────────────────────────────────────────────
  'allies': {
    'cavalry': 'Chevaliers-jouets',
    'cavalryFree': 'Charge gratuite des chevaliers-jouets',
    'free': 'Gratuit',
    'outOfReachHint': 'Hors de portée — envoyez les chevaliers ou augmentez votre portée'
  },

  'result': {
    'towerFell': 'Détruite !',
    'reachedWave': 'Vous avez tenu jusqu’à la vague {n}',
    'newRecord': 'Nouveau record !',
    'upgrade': 'Améliorer !',
    'defendAgain': 'Défendre à nouveau',
    'continueRun': 'Reconstruire et continuer',
    'continueWave': 'Vague {n}',
    'tripleCoins': 'Tripler les pièces',
    'tripleWave': '3× pièces — {n}',
    'waveCleared': 'Vague {n} repoussée !',
    'scoreLabel': 'Score',
    'bestLabel': 'Record',
    'scoreCurrent': '({n} cette partie)',
    'rankLabel': 'Rang',
    'rankOf': 'sur {n}'
  },

  'tech': {
    'blueprints': {
      'title': 'Plans'
    },
    'intro1': 'Tout ce que vous achetez ici est permanent et vous suit dans chaque partie.',
    'intro2': 'Les pièces tombent après chaque siège, victoire ou défaite. C’est ici qu’on les dépense.',
    'intro3': 'Les nœuds dorés sont abordables. Les bleus exigent plus de pièces, les ternes le nœud précédent.',
    'introNext': 'Suivant',
    'introDone': 'Compris',
    'sell': 'Vendre un rang',
    'sellBlocked': 'Vendez d’abord {n} — il en dépend.',
    'title': 'Arbre technologique',
    'rank': 'Rang {current}/{total}',
    'maxed': 'Au maximum',
    'rankOpen': 'Rang {n}',
    'atRank': 'Au rang {r} : {n} au total',
    'owned': 'Débloqué',
    'requires': 'Nécessite {n}',
    'spotlight': 'Dépensez !',
    'names': {
      'm2_lumberHut': 'Tamis à sable',
      'logistics': 'Équipe de creusage',
      'unlockCoffer': 'Tirelires',
      'yields': 'Rendements',
      'unlockObelisk': 'Coquillages magiques',
      'rallyCry': 'Cri de ralliement',
      'stockpiles': 'Réserves',
      'forgeWelds': 'Super colle',
      'harbour': 'Pataugeoire', 'dockWorks': 'Plus grande pataugeoire',
      'unlockLongship': 'Canard en caoutchouc', 'seasonedHulls': 'Bateaux robustes',
      'navalGunnery': 'Canons de bateau', 'unlockGalley': 'Bateau pirate en jouet',
      'admiralty': 'Amiral Canard',
      'foundations': 'Fondations', 'sharpBolts': 'Fléchettes pointues', 'unlockBrace': 'Sable tassé',
      'lumberStock': 'Réserve de sable', 'longSight': 'Longue vue', 'rapidFire': 'Tir rapide',
      'reinforced': 'Mélange de sable humide', 'unlockSawmill': 'Sable riche', 'quarryStock': 'Réserve de galets',
      'unlockMortar': 'Mortier à boue', 'heavyOrdnance': 'Plus gros splash', 'unlockTesla': 'Grille-insectes',
      'gateArmor': 'Blindage de la porte', 'unlockQuarry': 'Creusage profond', 'richHauls': 'Butin abondant',
      'wideFoundation': 'Fondation large', 'siegeShells': 'Pistolets à eau surpuissants', 'unlockFrost': 'Sucette glacée',
      'forkedBolts': 'Décharges ramifiées', 'ironPlating': 'Sable durci', 'unlockRepair': 'Seau et pelle',
      'unlockMint': 'Carte au trésor', 'looting': 'Pillage', 'overcharge': 'Surcharge',
      'masterwork': 'Chef-d’œuvre', 'fieldRepairs': 'Réparations de campagne', 'greatFoundation': 'Grande fondation',
      'warChest': 'Coffre au trésor',
      'unlockSpikes': 'Mur à cure-dents',
      'unlockBombard': 'Lance-ballons',
      'sharpSpikes': 'Cure-dents affûtés',
      'cavalryDrill': 'Entraînement des chevaliers',
      'artilleryDoctrine': 'Tirs longue distance'
    },
    'descriptions': {
      'm2_lumberHut': 'Débloque le tamis à sable : du sable après chaque vague.',
      'logistics': 'Débloque l’excavatrice à galets — un producteur bon marché, payable dans la partie où il compte.',
      'unlockCoffer': 'Débloque la tirelire, le seul bloc qui frappe de l’or.',
      'yields': 'Chaque bloc d’économie rapporte +{n} % de plus.',
      'unlockObelisk': 'Débloque le coquillage magique, un renfort voisin bien plus puissant.',
      'rallyCry': 'Les blocs de renfort sont +{n} % plus forts.',
      'stockpiles': 'Chaque bloc d’économie rapporte +{n} % de plus.',
      'forgeWelds': 'Les blocs fusionnés produisent +{n} % de plus par rang : dégâts, épines et rendement.',
      'harbour': 'Faites flotter des bateaux dans la pataugeoire. Eux seuls touchent les bestioles immergées.',
      'dockWorks': 'Les bateaux flottent {n} case plus loin par rang.',
      'unlockLongship': 'Un canard en caoutchouc robuste avec un harpon à fléchette lourd.',
      'seasonedHulls': 'Les bateaux démarrent avec +{n} % de PV.',
      'navalGunnery': 'Les armes des bateaux infligent +{n} % de dégâts.',
      'unlockGalley': 'Canons en liège, un nid-de-pie et une passerelle.',
      'admiralty': 'Les armes des bateaux infligent +{n} % de dégâts en plus.',
      'foundations': 'Chaque bloc du château démarre avec +{n} % de PV.',
      'sharpBolts': 'Les armes du château infligent +{n} % de dégâts par rang.',
      'unlockBrace': 'Débloque le sable tassé : deux fois les PV d’un bloc de sable normal.',
      'lumberStock': 'Commencez chaque siège avec +{n} de sable par rang.',
      'longSight': 'Toutes les armes portent +{n} % plus loin par rang.',
      'rapidFire': 'Toutes les armes tirent {n} % plus vite par rang.',
      'reinforced': 'Chaque bloc du château gagne +{n} % de PV par rang.',
      'unlockSawmill': 'Chaque producteur rapporte +{n}% de plus par rang.',
      'quarryStock': 'Commencez chaque siège avec +{n} de galets par rang.',
      'unlockMortar': 'Débloque le mortier à boue : dégâts de zone à longue portée.',
      'heavyOrdnance': 'Rayon de zone +{n} % par rang.',
      'unlockTesla': 'Débloque le grille-insectes : les décharges rebondissent.',
      'gateArmor': 'La porte du château gagne +{n} % de PV par rang.',
      'unlockQuarry': 'Chaque producteur rapporte +{n}% supplémentaires par rang.',
      'richHauls': 'Récompenses de vague +{n} % par rang.',
      'wideFoundation': 'Construisez {n} colonnes plus large par rang.',
      'siegeShells': 'Les armes du château infligent +{n} % de dégâts par rang.',
      'unlockFrost': 'Débloque la sucette glacée : ralentit des groupes entiers.',
      'forkedBolts': 'La décharge rebondit sur {n} bestiole de plus par rang.',
      'ironPlating': 'Chaque bloc gagne +{n} d’armure par rang.',
      'unlockRepair': 'Débloque le seau et pelle : soigne les voisins à chaque vague.',
      'unlockMint': 'Chaque producteur rapporte +{n}% supplémentaires par rang.',
      'looting': 'Les bestioles lâchent +{n} % de pièces en plus par rang.',
      'overcharge': 'Toutes les armes tirent {n} % plus vite par rang.',
      'masterwork': 'Les armes du château infligent +{n} % de dégâts par rang.',
      'fieldRepairs': 'Chaque bloc récupère {n} % de ses PV max par vague repoussée et par rang.',
      'greatFoundation': 'Construisez {n} colonnes de plus par rang.',
      'warChest': 'Récompenses de vague +{n} % par rang.',
      'unlockSpikes': 'Débloque le Mur à cure-dents — les assaillants se piquent dessus.',
      'unlockBombard': 'Débloque le Lance-ballons — ballons d’eau à courte portée sur les bestioles au sol.',
      'sharpSpikes': 'Les murs à cure-dents renvoient +{n} % de dégâts en plus par rang.',
      'cavalryDrill': 'Les chevaliers-jouets sortent avec +{n} % de PV et de dégâts par rang.',
      'artilleryDoctrine': 'Toutes les armes portent +{n} % plus loin par rang.'
    }
  },

  'resources': {
    'wood': 'sable',
    'stone': 'galets',
    'gold': 'or'
  },

  'ads': {
    'watch': 'Regarder', 'revive': 'Revivre', 'secondChance': 'Seconde chance',
    'doubleCoins': '2× pièces', 'plusCoins': '+{n} pièces'
  },

  'achievements': {
    'title': 'Succès', 'subtitle': 'Atteignez des paliers à vie pour gagner des pièces.',
    'claim': 'Réclamer', 'claimed': 'Réclamé', 'progress': '{c} / {t}',
    'items': {
      'wave5': { 'name': 'Première résistance', 'desc': 'Tenez jusqu’à la vague 5.' },
      'wave10': { 'name': 'Bastion', 'desc': 'Tenez jusqu’à la vague 10.' },
      'wave20': { 'name': 'Rempart', 'desc': 'Tenez jusqu’à la vague 20.' },
      'wave30': { 'name': 'Incassable', 'desc': 'Tenez jusqu’à la vague 30.' },
      'waves50': { 'name': 'Brise-lames', 'desc': 'Repoussez 50 vagues au total.' },
      'waves250': { 'name': 'Vétéran des sièges', 'desc': 'Repoussez 250 vagues au total.' },
      'kills500': { 'name': 'Défenseur', 'desc': 'Écrasez 500 bestioles au total.' },
      'kills5k': { 'name': 'Écraseur de bestioles', 'desc': 'Écrasez 5 000 bestioles au total.' },
      'kills50k': { 'name': 'Légende', 'desc': 'Écrasez 50 000 bestioles au total.' },
      'height10': { 'name': 'Vers le ciel', 'desc': 'Construisez une tour de 10 blocs de haut.' },
      'height20': { 'name': 'Perce-nuages', 'desc': 'Construisez une tour de 20 blocs de haut.' },
      'blocks250': { 'name': 'Bâtisseur', 'desc': 'Placez 250 blocs au total.' },
      'blocks2k': { 'name': 'Architecte', 'desc': 'Placez 2 000 blocs au total.' },
      'coins5k': { 'name': 'Collectionneur', 'desc': 'Gagnez 5 000 pièces au total.' },
      'coins50k': { 'name': 'Trésorier', 'desc': 'Gagnez 50 000 pièces au total.' },
      'runs25': { 'name': 'Persévérant', 'desc': 'Lancez 25 sièges.' }
    }
  },

  'missions': {
    'title': 'Missions quotidiennes', 'subtitle': 'Accomplissez des objectifs chaque jour pour des pièces.',
    'claim': 'Réclamer', 'done': 'Réclamé',
    'types': {
      'coins': 'Gagnez {n} pièces aujourd’hui',
      'waves': 'Tenez jusqu’à la vague {n} en un siège',
      'kills': 'Écrasez {n} bestioles aujourd’hui',
      'blocks': 'Placez {n} blocs aujourd’hui'
    }
  },

  'battlePass': {
    'title': 'Passe de combat', 'progress': '{current} / {total}', 'daysLeft': '{n} j restants',
    'maxed': 'PASSE DE COMBAT TERMINÉ', 'xpProgress': '{current} / {total} XP',
    'howToEarn': 'Comment gagner de l’XP', 'perRun': 'par siège', 'perWave': 'par vague repoussée',
    'unlockHint': 'Atteignez {n} XP pour débloquer la prochaine récompense — les récompenses non réclamées sont conservées.'
  },

  'dailyRewards': {
    'title': 'Récompenses quotidiennes', 'subtitle': 'Connectez-vous chaque jour pour garder votre série.',
    'day': 'Jour {n}', 'dayShort': 'J{n}'
  },

  'options': {
    'title': 'Options', 'general': 'Général', 'audio': 'Audio', 'language': 'Langue',
    'difficulty': 'Difficulté', 'soundEffects': 'Effets sonores', 'music': 'Musique', 'musicTrack': 'Piste musicale',
    'musicTracks': { 'cozy': 'Harmonie douce', 'trance': 'Tunnel trance' },
    'close': 'Enregistrer et fermer',
    'difficulties': { 'easy': 'Facile', 'medium': 'Moyen', 'hard': 'Difficile' },
    'difficultyHints': {
      'easy': 'Vagues plus petites et bestioles plus faibles.',
      'medium': 'Le siège standard et équilibré.',
      'hard': 'Vagues plus denses et bestioles plus coriaces.'
    }
  },

  'adsBlocked': {
    'title': 'Impossible d’afficher la publicité',
    'body': 'Nous avons essayé de vous montrer une vidéo pour votre récompense, mais quelque chose dans votre navigateur bloque les publicités.',
    'allowPrefix': 'Autorisez les publicités sur',
    'allowSuffix': '(ou mettez votre bloqueur en pause pour ce jeu) puis réessayez.',
    'gotIt': 'Compris'
  },
  'saveStatus': {
    'restoredTitle': 'Sauvegarde cloud restaurée', 'restoredBody': '+{n} pièces bonus pour la récupération',
    'tap': 'toucher', 'pausedTitle': 'Synchronisation en pause',
    'pausedBody': 'Vous jouez hors ligne. Votre progression est enregistrée ici.',
    'retry': 'Réessayer', 'dismiss': 'ignorer'
  },
  'loading': { 'tooLong': 'Le chargement est trop long ? Désactivez votre bloqueur de publicités et rechargez.' },
  'license': { 'denied': 'Accès refusé : veuillez acheter une licence.' }
}
