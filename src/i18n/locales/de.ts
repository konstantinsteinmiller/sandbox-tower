export default {
  'gameName': 'Sandbox Tower',
  'cancel': 'Abbrechen',
  'close': 'Schließen',
  'ok': 'Ok',
  'continue': 'Weiter',
  'tapToContinue': 'Zum Fortfahren tippen',
  'clickToContinue': 'Zum Fortfahren klicken',
  'rewards': 'BELOHNUNGEN',
  'tip': 'Tipp',
  'crazyGamesOnly': 'Dieses Spiel ist nur verfügbar auf',

  // ─── Mobile-fit game (Drop & Merge) ───────────────────────────────────────
  'gift': {
    'free': 'Gratis',
    'tile': 'Gratis: {name}, Stufe {n}. Antippen, dann aufs Feld tippen, um es zu platzieren',
    'pair': 'Gratis: ein Paar {name}. Antippen, dann aufs Feld tippen, um es zu platzieren',
    'tilePaid': '{name}, Stufe {n}, zum halben Preis. Antippen, dann aufs Feld tippen, um es zu platzieren',
    'pairPaid': 'Ein Paar {name} zum halben Preis. Antippen, dann aufs Feld tippen, um es zu platzieren',
    'discount': '-{n} %',
    'chest': 'Fliegende Truhe: antippen zum Öffnen',
    'firstClear': 'Welle {n} geschafft! Ein Geschenk für dich'
  },

  'mobile': {
    'rotatePortrait': 'Halte dein Handy aufrecht, um zu spielen',
    'columnFull': 'Spalte voll',
    'repairAll': 'Alles reparieren',
    'volley': 'Salve',
    'swap': 'Tauschen',
    'menu': 'Menü',
    'materials': 'Material',
    'zoom': 'Zoom'
  },

  'hud': {
    'wave': 'Welle', 'enemies': 'Viecher', 'callWave': 'Welle rufen', 'callBoss': 'Boss rufen',
    'monstersIncoming': 'Viecher im Anmarsch!',
    'skip': 'Überspringen',
    'speed': 'Tempo {n}×',
    'speedOffer': '{n}× Tempo freischalten',
    'speedGroup': 'Spieltempo', 'recenter': 'Ansicht zentrieren',
    'rotateLeft': 'Nach links drehen',
    'rotateRight': 'Nach rechts drehen',
    'arrowRain': 'Dartregen',
    'arrowRainAim': 'Tippe das Schlachtfeld an, um die Salve zu rufen',
    'extendRange': '+{n}% Reichweite'
  },


  // ─── The opening cutscene ─────────────────────────────────────────────────
  // Three lines across the ten-second fly-over west of the tower, one per beat:
  // the tower, the horde, the siege train. The fourth thing the player reads is
  // `hud.monstersIncoming`, shown over the engines rather than over the board.
  'intro': {
    'premise': 'Deine Sandburg ist das Letzte, was noch steht.',
    'horde': 'Die Viecher sind schon im Anmarsch.',
    'siege': 'Und sie haben sich eigene Maschinen gebaut.'
  },

  'warnings': {
    'hoard': 'Hortung +{n}%',
    'air': 'Luft ×{n}',
    'sea': 'Wasser ×{n}',
    'bombers': 'Sprengung ×{n}',
    'siege': 'Belagerung ×{n}',
    'outOfReach': 'Außer Reichweite ×{n} — braucht {m} Reichweite'
  },
  'hints': {
    'dropBlock': {
      'touch': 'Tippe auf eine Spalte, um das Teil fallen zu lassen',
      'desktop': 'Klicke auf eine Spalte, um das Teil fallen zu lassen'
    },
    'mergeBlock': {
      'touch': 'Lande ein Teil auf seinem Zwilling, um sie zu verschmelzen',
      'desktop': 'Lande ein Teil auf seinem Zwilling, um sie zu verschmelzen'
    },
    'selectBlock': { 'touch': 'Tippe unten auf einen Block', 'desktop': 'Klicke unten auf einen Block' },
    'placeBlock': { 'touch': 'Tippe jetzt auf einen leuchtenden Platz', 'desktop': 'Klicke jetzt auf einen leuchtenden Platz' },
    'camera': { 'touch': 'Ziehen zum Bewegen · Zoomen mit zwei Fingern', 'desktop': 'Ziehen zum Bewegen · Scrollen zum Zoomen' },
    'callWave': { 'touch': 'Tippe auf „Welle rufen“, wenn dein Turm bereit ist', 'desktop': 'Leertaste ruft die Welle vorzeitig' },
    'inspect': { 'touch': 'Halte einen Block gedrückt, um ihn zu prüfen', 'desktop': 'Klicke einen Block an, um ihn zu prüfen' }
  },

  'tips': {
    'eco': 'Sandsiebe und Kieselbagger zahlen jede Welle. Zwei oder drei ändern, was du dir leisten kannst.',
    'buff': 'Papierfähnchen stärken alle angrenzenden Blöcke – und sie multiplizieren sich. Umzingle eine Spielzeugwaffe, statt sie zu verteilen.',
    'merge': 'Zwei gleiche Waffen nebeneinander verschmelzen. Staple zwei davon zu einem 2×2.',
    'spend': 'Du hast Münzen übrig. Techbaum-Ränge sind dauerhaft und gelten in jedem weiteren Lauf.',
    'branches': 'Drei getrennte Bäume: die Burg, das Planschbecken und die Werkstatt. Keiner braucht die anderen.',
    'shape': 'Mauern vorn, Geschütze dahinter. Ein Block, der nie getroffen wird, muss nie ersetzt werden.',
    'gold': 'Gold kauft Block-Upgrades – tippe einen Block an. Sparschweine prägen jede Welle mehr.',
    'siegeReach': 'Bleistift-Tribocks stehen weiter entfernt, als Dartblaster, Wasserpistole oder Ballonwerfer reichen. Antworte mit einem Schlammmörser – oder einem Spielzeug-Piratenschiff aus dem Planschbecken.'
  },
  'blocks': {
    'fortify': 'Zahnstocher hinzufügen',
    'sell': 'Verkaufen',
    'mergeTier': 'Verschmolzen {n}×',
    'upgrade': 'Ausbauen',
    'upgradeMax': 'Voll ausgebaut',
    'rank': 'St. {n}/{max}',
    'reinforced': 'Verstärkt',
    'roofed': 'Überdacht',
    'roofNote': 'Überdacht – doppelte TP, dreifache Abwehr von oben. Braucht freien Himmel.',
    'enhancedNote': 'Verstärkt – +{hp} % TP, +{dmg} % Schaden.',
    'enhancedHand': 'Verstärkte Hand',
    'reroll': 'Teil tauschen',
    'kinds': {
      'buff': 'Verstärkung', 'core': 'Kern', 'structure': 'Struktur', 'weapon': 'Waffe', 'economy': 'Wirtschaft', 'utility': 'Spezial', 'ship': 'Boot' },
    'stats': {
      'yieldGold': 'Gold / Welle',
      'buff': 'Nachbar-Bonus',
      'topDefense': 'Abwehr von oben',
      'hp': 'TP', 'armor': 'Panzerung', 'dmg': 'Schaden', 'cooldown': 'Abklingzeit', 'range': 'Reichweite',
      'splash': 'Splash', 'yieldWood': 'Sand / Welle', 'yieldStone': 'Kiesel / Welle', 'yieldCoins': 'Münzen / Welle',
      'repair': 'Reparatur / Welle', 'blast': 'Explosion',
      'thorns': 'Dornen'
    },
    'names': {
      'banner': 'Papierfähnchen',
      'obelisk': 'Zaubermuschel',
      'lumberHut': 'Sandsieb',
      'stonepit': 'Kieselbagger',
      'coffer': 'Sparschwein',
      'skiff': 'Papierboot', 'longship': 'Gummiente', 'galley': 'Spielzeug-Piratenschiff',
      'gate': 'Burgtor', 'wood': 'Sandblock', 'brace': 'Gestampfter Sand', 'stone': 'Kieselmauer',
      'archer': 'Dartblaster', 'cannon': 'Wasserpistole', 'mortar': 'Schlammmörser', 'tesla': 'Insektenlampe',
      'frost': 'Eis am Stiel', 'repair': 'Eimer & Schaufel',
      'spikes': 'Zahnstochermauer',
      'bombard': 'Ballonwerfer'
    },
    'descriptions': {
      'banner': 'Stärkt alle angrenzenden Blöcke. Zwei Fähnchen an einem Block stapeln sich.',
      'obelisk': 'Ein stärkeres Fähnchen. Auren multiplizieren sich — Paare sind weit mehr als doppelt wert.',
      'lumberHut': 'Siebt Sand am Ende jeder abgeschlossenen Welle.',
      'stonepit': 'Gräbt Kiesel am Ende jeder abgeschlossenen Welle.',
      'coffer': 'Prägt jede Welle Gold – die Währung für Block-Upgrades.',
      'skiff': 'Schwimmt im Planschbecken. Trifft Viecher unter der Oberfläche.',
      'longship': 'Schwere Dart-Harpune. Robust, und reicht weiter als das Ufer.',
      'galley': 'Korkkanonen und ein Krähennest. Das Planschbecken gehört dir.',
      'gate': 'Das Herz deiner Sandburg. Fällt es, ist die Belagerung vorbei.',
      'wood': 'Günstige Füllung. Das Rückgrat jeder frühen Burg.',
      'brace': 'Doppelter Sand, mehr als doppelte Haltbarkeit.',
      'stone': 'Schwer und gepanzert. Am besten im Fundament.',
      'archer': 'Schnelle Schaumstoffpfeile auf ein Ziel. Trifft auch Flieger.',
      'cannon': 'Langsam, schwerer Flächenschaden. Durchnässt dichte Pulks.',
      'mortar': 'Weitreichende Schlammkugeln im Bogen – trifft aber keine Flieger.',
      'tesla': 'Blitze, die auf nahe Viecher überspringen.',
      'frost': 'Kühlt ganze Gruppen ab und verlangsamt sie stark.',
      'repair': 'Flickt zwischen den Wellen alle angrenzenden Blöcke.',
      'spikes': 'Angreifer piksen sich bei jedem Schlag daran selbst.',
      'bombard': 'Schleudert einen Wasserballon steil nach oben. Kleiner Platscher, nur Bodenziele.'
    },
    'repair': 'Reparieren',
    'repairCooldown': '{n} s',
    'reposition': 'Diesen Block versetzen'
  },

  'enemies': {
    'names': {
      'grunt': 'Ameise', 'runner': 'Kakerlake', 'slinger': 'Spinne', 'brute': 'Nashornkäfer',
      'bomber': 'Bombardierkäfer', 'bat': 'Fliege', 'bulwark': 'Rollassel', 'golem': 'Hirschkäfer',
      'wyvern': 'Hornisse',
      'eel': 'Wassertiger',
      'shark': 'Schwimmkäfer',
      'kraken': 'Wasserwanze',
      'seadrake': 'Libellenlarve',
      'ram': 'Bleistiftramme',
      'ballista': 'Gummiband-Armbrust',
      'catapult': 'Löffelkatapult',
      'siegeTower': 'Safttütenturm',
      'trebuchet': 'Bleistifttrebuchet',
      'ironRam': 'Blechdosenramme',
      'bombardier': 'Hummel',
      'firebug': 'Glühwürmchen'
    }
  },

  // ─── Allies ───────────────────────────────────────────────────────────────
  'allies': {
    'cavalry': 'Spielzeugritter',
    'cavalryFree': 'Kostenloser Spielzeugritter-Angriff',
    'free': 'Gratis',
    'outOfReachHint': 'Außer Reichweite — schick die Ritter oder erhöhe deine Reichweite'
  },

  'result': {
    'towerFell': 'Zerstört!',
    'reachedWave': 'Du hast Welle {n} überstanden',
    'newRecord': 'Neuer Rekord!',
    'upgrade': 'Verbessern!',
    'defendAgain': 'Erneut verteidigen',
    'continueRun': 'Wiederaufbauen & weiter',
    'continueWave': 'Welle {n}',
    'tripleCoins': 'Münzen verdreifachen',
    'tripleWave': '3× Münzen – {n}',
    'waveCleared': 'Welle {n} gehalten!',
    'scoreLabel': 'Punkte',
    'bestLabel': 'Bestwert',
    'scoreCurrent': '({n} dieser Lauf)',
    'rankLabel': 'Rang',
    'rankOf': 'von {n}'
  },

  'tech': {
    'blueprints': {
      'title': 'Baupläne'
    },
    'intro1': 'Alles, was du hier kaufst, ist dauerhaft und gilt in jedem weiteren Lauf.',
    'intro2': 'Münzen gibt es nach jeder Belagerung – ob Sieg oder Niederlage. Hier gibst du sie aus.',
    'intro3': 'Goldene Knoten kannst du dir jetzt leisten. Blaue brauchen mehr Münzen, dunkle den Knoten davor.',
    'introNext': 'Weiter',
    'introDone': 'Alles klar',
    'sell': 'Rang verkaufen',
    'sellBlocked': 'Verkaufe zuerst {n} — es braucht dies.',
    'title': 'Techbaum',
    'rank': 'Rang {current}/{total}',
    'maxed': 'Maximal',
    'rankOpen': 'Rang {n}',
    'atRank': 'Auf Rang {r}: {n} gesamt',
    'owned': 'Freigeschaltet',
    'requires': 'Benötigt {n}',
    'spotlight': 'Ausgeben!',
    'names': {
      'm2_lumberHut': 'Sandsieb',
      'logistics': 'Grabtrupp',
      'unlockCoffer': 'Sparschweine',
      'yields': 'Erträge',
      'unlockObelisk': 'Zaubermuscheln',
      'rallyCry': 'Schlachtruf',
      'stockpiles': 'Vorräte',
      'forgeWelds': 'Superkleber',
      'harbour': 'Planschbecken', 'dockWorks': 'Größeres Becken',
      'unlockLongship': 'Gummiente', 'seasonedHulls': 'Robuste Boote',
      'navalGunnery': 'Bootskanonen', 'unlockGalley': 'Spielzeug-Piratenschiff',
      'admiralty': 'Entenadmiral',
      'foundations': 'Fundamente', 'sharpBolts': 'Spitze Pfeile', 'unlockBrace': 'Gestampfter Sand',
      'lumberStock': 'Sandvorrat', 'longSight': 'Weitsicht', 'rapidFire': 'Schnellfeuer',
      'reinforced': 'Nasssand-Mischung', 'unlockSawmill': 'Reicher Sand', 'quarryStock': 'Kieselvorrat',
      'unlockMortar': 'Schlammmörser', 'heavyOrdnance': 'Größerer Platscher', 'unlockTesla': 'Insektenlampe',
      'gateArmor': 'Torpanzerung', 'unlockQuarry': 'Tiefes Graben', 'richHauls': 'Reiche Beute',
      'wideFoundation': 'Breites Fundament', 'siegeShells': 'Power-Wasserpistolen', 'unlockFrost': 'Eis am Stiel',
      'forkedBolts': 'Verzweigte Blitze', 'ironPlating': 'Harter Sandpanzer', 'unlockRepair': 'Eimer & Schaufel',
      'unlockMint': 'Schatzkarte', 'looting': 'Plünderung', 'overcharge': 'Überladung',
      'masterwork': 'Meisterwerk', 'fieldRepairs': 'Feldreparaturen', 'greatFoundation': 'Großes Fundament',
      'warChest': 'Schatztruhe',
      'unlockSpikes': 'Zahnstochermauer',
      'unlockBombard': 'Ballonwerfer',
      'sharpSpikes': 'Scharfe Zahnstocher',
      'cavalryDrill': 'Ritterausbildung',
      'artilleryDoctrine': 'Weitschüsse'
    },
    'descriptions': {
      'm2_lumberHut': 'Schaltet das Sandsieb frei — liefert nach jeder Welle Sand.',
      'logistics': 'Schaltet den Kieselbagger frei – ein günstiger Produzent, den du dir im Lauf leisten kannst.',
      'unlockCoffer': 'Schaltet das Sparschwein frei, den einzigen Block, der Gold prägt.',
      'yields': 'Jeder Wirtschaftsblock liefert +{n} % mehr.',
      'unlockObelisk': 'Schaltet die Zaubermuschel frei, einen deutlich stärkeren Nachbar-Bonus.',
      'rallyCry': 'Verstärkungsblöcke sind +{n} % stärker.',
      'stockpiles': 'Jeder Wirtschaftsblock liefert +{n} % mehr.',
      'forgeWelds': 'Verschmolzene Blöcke leisten +{n} % mehr pro Rang – Schaden, Dornen und Ertrag.',
      'harbour': 'Lass Boote im Planschbecken schwimmen. Nur sie treffen getauchte Viecher.',
      'dockWorks': 'Boote liegen pro Rang {n} Feld breiter.',
      'unlockLongship': 'Eine robuste Gummiente mit schwerer Dart-Harpune.',
      'seasonedHulls': 'Boote starten mit +{n} % TP.',
      'navalGunnery': 'Bootswaffen verursachen +{n} % Schaden.',
      'unlockGalley': 'Korkkanonen, ein Krähennest und ein Laufsteg.',
      'admiralty': 'Bootswaffen verursachen weitere +{n} % Schaden.',
      'foundations': 'Jeder Burgblock startet mit +{n} % TP.',
      'sharpBolts': 'Burgwaffen verursachen +{n} % Schaden pro Rang.',
      'unlockBrace': 'Schaltet den Gestampften Sand frei – doppelte TP eines normalen Sandblocks.',
      'lumberStock': 'Starte jede Belagerung mit +{n} Sand pro Rang.',
      'longSight': 'Alle Waffen reichen +{n} % weiter pro Rang.',
      'rapidFire': 'Alle Waffen feuern {n} % schneller pro Rang.',
      'reinforced': 'Jeder Burgblock erhält +{n} % TP pro Rang.',
      'unlockSawmill': 'Jeder Produzent liefert +{n}% mehr pro Rang.',
      'quarryStock': 'Starte jede Belagerung mit +{n} Kiesel pro Rang.',
      'unlockMortar': 'Schaltet den Schlammmörser frei – weitreichender Flächenschaden.',
      'heavyOrdnance': 'Splash-Radius +{n} % pro Rang.',
      'unlockTesla': 'Schaltet die Insektenlampe frei – Zaps springen über.',
      'gateArmor': 'Das Burgtor erhält +{n} % TP pro Rang.',
      'unlockQuarry': 'Jeder Produzent liefert weitere +{n}% pro Rang.',
      'richHauls': 'Wellenbelohnungen +{n} % pro Rang.',
      'wideFoundation': 'Baue {n} Spalten breiter pro Rang.',
      'siegeShells': 'Burgwaffen verursachen +{n} % Schaden pro Rang.',
      'unlockFrost': 'Schaltet das Eis am Stiel frei – verlangsamt ganze Gruppen.',
      'forkedBolts': 'Zaps springen auf {n} zusätzliches Viech pro Rang.',
      'ironPlating': 'Jeder Block erhält +{n} Panzerung pro Rang.',
      'unlockRepair': 'Schaltet Eimer & Schaufel frei – heilt jede Welle Nachbarn.',
      'unlockMint': 'Jeder Produzent liefert weitere +{n}% pro Rang.',
      'looting': 'Viecher lassen +{n} % mehr Münzen fallen pro Rang.',
      'overcharge': 'Alle Waffen feuern {n} % schneller pro Rang.',
      'masterwork': 'Burgwaffen verursachen +{n} % Schaden pro Rang.',
      'fieldRepairs': 'Jeder Block heilt {n} % seiner max. TP pro gehaltener Welle und Rang.',
      'greatFoundation': 'Baue {n} weitere Spalten breiter pro Rang.',
      'warChest': 'Wellenbelohnungen +{n} % pro Rang.',
      'unlockSpikes': 'Schaltet die Zahnstochermauer frei – Angreifer piksen sich daran.',
      'unlockBombard': 'Schaltet den Ballonwerfer frei – kurzreichweitige Wasserballons gegen Bodenviecher.',
      'sharpSpikes': 'Zahnstochermauern reflektieren +{n} % mehr Schaden pro Rang.',
      'cavalryDrill': 'Spielzeugritter reiten mit +{n} % TP und Schaden pro Rang aus.',
      'artilleryDoctrine': 'Alle Waffen reichen +{n} % weiter pro Rang.'
    }
  },

  'resources': {
    'wood': 'Sand',
    'stone': 'Kiesel',
    'gold': 'Gold'
  },

  'ads': {
    'watch': 'Ansehen', 'revive': 'Wiederbeleben', 'secondChance': 'Zweite Chance',
    'doubleCoins': '2× Münzen', 'plusCoins': '+{n} Münzen'
  },

  'achievements': {
    'title': 'Erfolge', 'subtitle': 'Erreiche Langzeit-Meilensteine für Münzen.',
    'claim': 'Abholen', 'claimed': 'Abgeholt', 'progress': '{c} / {t}',
    'items': {
      'wave5': { 'name': 'Erster Widerstand', 'desc': 'Überstehe Welle 5.' },
      'wave10': { 'name': 'Festung', 'desc': 'Überstehe Welle 10.' },
      'wave20': { 'name': 'Bollwerk', 'desc': 'Überstehe Welle 20.' },
      'wave30': { 'name': 'Unzerbrechlich', 'desc': 'Überstehe Welle 30.' },
      'waves50': { 'name': 'Wellenbrecher', 'desc': 'Halte insgesamt 50 Wellen.' },
      'waves250': { 'name': 'Belagerungsveteran', 'desc': 'Halte insgesamt 250 Wellen.' },
      'kills500': { 'name': 'Verteidiger', 'desc': 'Zerquetsche insgesamt 500 Viecher.' },
      'kills5k': { 'name': 'Käferklatscher', 'desc': 'Zerquetsche insgesamt 5.000 Viecher.' },
      'kills50k': { 'name': 'Legende', 'desc': 'Zerquetsche insgesamt 50.000 Viecher.' },
      'height10': { 'name': 'Himmelwärts', 'desc': 'Baue einen Turm mit 10 Blöcken Höhe.' },
      'height20': { 'name': 'Wolkenbrecher', 'desc': 'Baue einen Turm mit 20 Blöcken Höhe.' },
      'blocks250': { 'name': 'Baumeister', 'desc': 'Platziere insgesamt 250 Blöcke.' },
      'blocks2k': { 'name': 'Architekt', 'desc': 'Platziere insgesamt 2.000 Blöcke.' },
      'coins5k': { 'name': 'Münzsammler', 'desc': 'Verdiene insgesamt 5.000 Münzen.' },
      'coins50k': { 'name': 'Schatzmeister', 'desc': 'Verdiene insgesamt 50.000 Münzen.' },
      'runs25': { 'name': 'Hartnäckig', 'desc': 'Starte 25 Belagerungen.' }
    }
  },

  'missions': {
    'title': 'Tagesmissionen', 'subtitle': 'Erfülle täglich Ziele für Münzen.',
    'claim': 'Abholen', 'done': 'Abgeholt',
    'types': {
      'coins': 'Verdiene heute {n} Münzen',
      'waves': 'Überstehe Welle {n} in einer Belagerung',
      'kills': 'Zerquetsche heute {n} Viecher',
      'blocks': 'Platziere heute {n} Blöcke'
    }
  },

  'battlePass': {
    'title': 'Battle Pass', 'progress': '{current} / {total}', 'daysLeft': 'Noch {n} T',
    'maxed': 'BATTLE PASS ABGESCHLOSSEN', 'xpProgress': '{current} / {total} XP',
    'howToEarn': 'So verdienst du XP', 'perRun': 'pro Belagerung', 'perWave': 'pro gehaltener Welle',
    'unlockHint': 'Erreiche {n} XP für die nächste Belohnung – nicht abgeholte Belohnungen bleiben erhalten.'
  },

  'dailyRewards': {
    'title': 'Tägliche Belohnungen', 'subtitle': 'Melde dich täglich an, um deine Serie zu halten.',
    'day': 'Tag {n}', 'dayShort': 'T{n}'
  },

  'options': {
    'title': 'Optionen', 'general': 'Allgemein', 'audio': 'Audio', 'language': 'Sprache',
    'difficulty': 'Schwierigkeit', 'soundEffects': 'Soundeffekte', 'music': 'Musik', 'musicTrack': 'Musiktitel',
    'musicTracks': { 'cozy': 'Gemütliche Harmonie', 'trance': 'Trance-Tunnel' },
    'close': 'Speichern & Schließen',
    'difficulties': { 'easy': 'Leicht', 'medium': 'Mittel', 'hard': 'Schwer' },
    'difficultyHints': {
      'easy': 'Kleinere Wellen und schwächere Viecher.',
      'medium': 'Die normale, ausgewogene Belagerung.',
      'hard': 'Dichtere Wellen und zähere Viecher.'
    }
  },

  'adsBlocked': {
    'title': 'Werbung konnte nicht geladen werden',
    'body': 'Wir wollten dir ein Video zeigen, damit du deine Belohnung erhältst, aber etwas in deinem Browser blockiert Werbung.',
    'allowPrefix': 'Bitte erlaube Werbung auf',
    'allowSuffix': '(oder pausiere deinen Adblocker für dieses Spiel) und versuche es erneut.',
    'gotIt': 'Verstanden'
  },
  'saveStatus': {
    'restoredTitle': 'Cloud-Speicher wiederhergestellt', 'restoredBody': '+{n} Bonusmünzen für die Wiederherstellung',
    'tap': 'tippen', 'pausedTitle': 'Cloud-Sync pausiert',
    'pausedBody': 'Offline-Modus. Dein Fortschritt wird hier gespeichert.',
    'retry': 'Erneut versuchen', 'dismiss': 'ausblenden'
  },
  'loading': { 'tooLong': 'Laden dauert zu lange? Deaktiviere deinen Adblocker und lade neu.' },
  'license': { 'denied': 'Zugriff verweigert: Bitte erwerbe eine Lizenz.' }
}
