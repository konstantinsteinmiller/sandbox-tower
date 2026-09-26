export default {
  'gameName': 'Sandbox Tower',
  'cancel': 'Annuleren',
  'close': 'Sluiten',
  'ok': 'Ok',
  'continue': 'Doorgaan',
  'tapToContinue': 'Tik om door te gaan',
  'clickToContinue': 'Klik om door te gaan',
  'rewards': 'BELONINGEN',
  'tip': 'Tip',
  'crazyGamesOnly': 'Dit spel is alleen beschikbaar op',

  // ─── Mobile-fit game (Drop & Merge) ───────────────────────────────────────
  'gift': {
    'free': 'Gratis',
    'tile': 'Gratis {name}, niveau {n}: tik erop en tik dan op het veld om het te plaatsen',
    'pair': 'Gratis paar {name}: tik erop en tik dan op het veld om het te plaatsen',
    'tilePaid': '{name}, niveau {n}, voor de halve prijs: tik erop en tik dan op het veld om het te plaatsen',
    'pairPaid': 'Paar {name} voor de halve prijs: tik erop en tik dan op het veld om het te plaatsen',
    'discount': '-{n}%',
    'chest': 'Vliegende kist: tik om hem te openen',
    'firstClear': 'Golf {n} gehaald! Een cadeau voor jou'
  },

  'mobile': {
    'rotatePortrait': 'Houd je telefoon rechtop om te spelen',
    'columnFull': 'Kolom vol',
    'repairAll': 'Alles repareren',
    'volley': 'Salvo',
    'swap': 'Wisselen',
    'menu': 'Menu',
    'materials': 'materialen',
    'zoom': 'Zoomen'
  },

  'hud': {
    'wave': 'Golf', 'enemies': 'Beestjes', 'callWave': 'Golf oproepen', 'callBoss': 'Boss oproepen',
    'monstersIncoming': 'Beestjes in aantocht!',
    'skip': 'Overslaan',
    'speed': 'Snelheid {n}×',
    'speedOffer': '{n}× snelheid ontgrendelen',
    'speedGroup': 'Spelsnelheid', 'recenter': 'Beeld centreren',
    'rotateLeft': 'Naar links draaien',
    'rotateRight': 'Naar rechts draaien',
    'arrowRain': 'Pijltjesregen',
    'arrowRainAim': 'Tik op het slagveld om het salvo te roepen',
    'extendRange': '+{n}% bereik'
  },


  // ─── The opening cutscene ─────────────────────────────────────────────────
  // Three lines across the ten-second fly-over west of the tower, one per beat:
  // the tower, the horde, the siege train. The fourth thing the player reads is
  // `hud.monstersIncoming`, shown over the engines rather than over the board.
  'intro': {
    'premise': 'Jouw zandkasteel is het laatste wat nog staat.',
    'horde': 'De beestjes zijn al op mars.',
    'siege': 'En ze hebben zelf machines gebouwd.'
  },

  'warnings': {
    'hoard': 'Voorraad +{n}%',
    'air': 'Lucht ×{n}',
    'sea': 'Water ×{n}',
    'bombers': 'Explosief ×{n}',
    'siege': 'Beleg ×{n}',
    'outOfReach': 'Buiten bereik ×{n} — {m} bereik nodig'
  },
  'hints': {
    'dropBlock': {
      'touch': 'Tik op een kolom om het stuk te laten vallen',
      'desktop': 'Klik op een kolom om het stuk te laten vallen'
    },
    'mergeBlock': {
      'touch': 'Laat een stuk op zijn tweeling landen om ze samen te voegen',
      'desktop': 'Laat een stuk op zijn tweeling landen om ze samen te voegen'
    },
    'selectBlock': { 'touch': 'Tik hieronder op een blok om het te kiezen', 'desktop': 'Klik hieronder op een blok om het te kiezen' },
    'placeBlock': { 'touch': 'Tik nu op een oplichtend vak om te bouwen', 'desktop': 'Klik nu op een oplichtend vak om te bouwen' },
    'camera': { 'touch': 'Sleep om te bewegen · Knijp om te zoomen', 'desktop': 'Sleep om te bewegen · Scroll om te zoomen' },
    'callWave': { 'touch': 'Tik op «Golf oproepen» als je toren klaar is', 'desktop': 'Druk op spatie om de golf vroeger te starten' },
    'inspect': { 'touch': 'Houd een blok ingedrukt om het te bekijken', 'desktop': 'Klik op een blok om het te bekijken' }
  },

  'tips': {
    'eco': 'Zandzeven en kiezelgraverijen betalen elke golf. Twee of drie veranderen wat je kunt betalen.',
    'buff': 'Papieren vlaggetjes versterken alles wat ze raken, en ze vermenigvuldigen. Omsingel één speelgoedwapen in plaats van ze te spreiden.',
    'merge': 'Twee gelijke wapens naast elkaar versmelten. Stapel er twee om een 2×2 te maken.',
    'spend': 'Je hebt munten over. Rangen in de techboom zijn permanent en gaan mee in elke run.',
    'branches': 'Drie losse bomen: het kasteel, het zwembadje en de werkplaats. Geen ervan heeft de andere nodig.',
    'shape': 'Muren voor, geschut erachter. Een blok dat nooit geraakt wordt, bouw je nooit opnieuw.',
    'gold': 'Goud koopt blokupgrades — tik op een blok. Spaarvarkens slaan er elke golf meer.',
    'siegeReach': 'Potloodtrebuchets staan verder weg dan een dartblaster, waterpistool of ballonwerper reikt. Antwoord met een Moddermortier — of een Speelgoedpiratenschip uit het zwembadje.'
  },
  'blocks': {
    'fortify': 'Tandenstokers',
    'sell': 'Verkopen',
    'mergeTier': 'Samengevoegd {n}×',
    'upgrade': 'Upgraden',
    'upgradeMax': 'Volledig geüpgraded',
    'rank': 'Niv {n}/{max}',
    'reinforced': 'Versterkt',
    'roofed': 'Overdekt',
    'roofNote': 'Overdekt — dubbele HP, drievoudige verdediging van bovenaf. Vereist vrije hemel.',
    'enhancedNote': 'Versterkt — +{hp}% HP, +{dmg}% schade.',
    'enhancedHand': 'Versterkte hand',
    'reroll': 'Dit stuk ruilen',
    'kinds': {
      'buff': 'Versterking', 'core': 'Kern', 'structure': 'Structuur', 'weapon': 'Wapen', 'economy': 'Economie', 'utility': 'Speciaal', 'ship': 'Boot' },
    'stats': {
      'yieldGold': 'Goud / golf',
      'buff': 'Burenbonus',
      'topDefense': 'Verdediging boven',
      'hp': 'HP', 'armor': 'Pantser', 'dmg': 'Schade', 'cooldown': 'Afkoeling', 'range': 'Bereik',
      'splash': 'Gebied', 'yieldWood': 'Zand / golf', 'yieldStone': 'Kiezels / golf', 'yieldCoins': 'Munten / golf',
      'repair': 'Reparatie / golf', 'blast': 'Explosie',
      'thorns': 'Stekels'
    },
    'names': {
      'banner': 'Papieren vlaggetje',
      'obelisk': 'Magische schelp',
      'lumberHut': 'Zandzeef',
      'stonepit': 'Kiezelgraver',
      'coffer': 'Spaarvarken',
      'skiff': 'Papieren bootje', 'longship': 'Rubberen eend', 'galley': 'Speelgoedpiratenschip',
      'gate': 'Kasteelpoort', 'wood': 'Zandblok', 'brace': 'Aangestampt zand', 'stone': 'Kiezelmuur',
      'archer': 'Dartblaster', 'cannon': 'Waterpistool', 'mortar': 'Moddermortier', 'tesla': 'Insectenlamp',
      'frost': 'IJslolly', 'repair': 'Emmertje en schepje',
      'spikes': 'Tandenstokermuur',
      'bombard': 'Ballonwerper'
    },
    'descriptions': {
      'banner': 'Versterkt elk aangrenzend blok. Twee vlaggetjes op één blok stapelen.',
      'obelisk': 'Een sterker vlaggetje. Aura’s vermenigvuldigen — twee zijn veel meer waard dan dubbel.',
      'lumberHut': 'Zeeft zand aan het eind van elke voltooide golf.',
      'stonepit': 'Graaft kiezels aan het eind van elke voltooide golf.',
      'coffer': 'Slaat elke golf goud — de munt voor blokupgrades.',
      'skiff': 'Drijft in het zwembadje. Raakt beestjes onder de oppervlakte.',
      'longship': 'Zware pijltjesharpoen. Stevig en verder dan de oever.',
      'galley': 'Kurken kanonnen en een kraaiennest. Het zwembadje is van jou.',
      'gate': 'Het hart van je zandkasteel. Valt het, dan is het beleg voorbij.',
      'wood': 'Goedkope vulling. De ruggengraat van elk beginnend kasteel.',
      'brace': 'Twee keer zoveel zand, meer dan twee keer zo sterk.',
      'stone': 'Zwaar en gepantserd. Het best in de basis.',
      'archer': 'Snelle schuimpijltjes op één doel. Raakt ook vliegers.',
      'cannon': 'Traag, zware gebiedsschade. Doorweekt dichte groepen.',
      'mortar': 'Modderballen met groot bereik, maar raakt geen vliegers.',
      'tesla': 'Schokjes die overspringen naar beestjes in de buurt.',
      'frost': 'Bevriest hele groepen en vertraagt ze enorm.',
      'repair': 'Herstelt alle aangrenzende blokken tussen golven door.',
      'spikes': 'Aanvallers prikken zichzelf eraan bij elke klap.',
      'bombard': 'Schiet een waterballon recht omhoog. Kleine plons, alleen beestjes op de grond.'
    },
    'repair': 'Repareren',
    'repairCooldown': '{n} s',
    'reposition': 'Dit blok verplaatsen'
  },

  'enemies': {
    'names': {
      'grunt': 'Mier', 'runner': 'Kakkerlak', 'slinger': 'Spin', 'brute': 'Neushoornkever',
      'bomber': 'Bombardeerkever', 'bat': 'Vlieg', 'bulwark': 'Pissebed', 'golem': 'Vliegend hert',
      'wyvern': 'Hoornaar',
      'eel': 'Watertijger',
      'shark': 'Waterkever',
      'kraken': 'Reuzenwants',
      'seadrake': 'Libellenlarve',
      'ram': 'Potloodstormram',
      'ballista': 'Elastiekjeskruisboog',
      'catapult': 'Lepelkatapult',
      'siegeTower': 'Sappakjestoren',
      'trebuchet': 'Potloodtrebuchet',
      'ironRam': 'Blikjesstormram',
      'bombardier': 'Hommel',
      'firebug': 'Vuurvliegje'
    }
  },

  // ─── Allies ───────────────────────────────────────────────────────────────
  'allies': {
    'cavalry': 'Speelgoedridders',
    'cavalryFree': 'Gratis aanval van de speelgoedridders',
    'free': 'Gratis',
    'outOfReachHint': 'Buiten bereik — stuur de ridders of vergroot je bereik'
  },

  'result': {
    'towerFell': 'Verwoest!',
    'reachedWave': 'Je overleefde tot golf {n}',
    'newRecord': 'Nieuw record!',
    'upgrade': 'Verbeteren!',
    'defendAgain': 'Opnieuw verdedigen',
    'continueRun': 'Herbouwen & doorgaan',
    'continueWave': 'Golf {n}',
    'tripleCoins': 'Munten verdrievoudigen',
    'tripleWave': '3× munten — {n}',
    'waveCleared': 'Golf {n} gehouden!',
    'scoreLabel': 'Score',
    'bestLabel': 'Beste score',
    'scoreCurrent': '({n} deze ronde)',
    'rankLabel': 'Rang',
    'rankOf': 'van {n}'
  },

  'tech': {
    'blueprints': {
      'title': 'Blauwdrukken'
    },
    'intro1': 'Alles wat je hier koopt is permanent en gaat mee in elke volgende run.',
    'intro2': 'Munten komen uit elk beleg, of je nu wint of verliest. Hier geef je ze uit.',
    'intro3': 'Gouden knopen kun je nu betalen. Blauwe vragen meer munten, doffe de knoop ervoor.',
    'introNext': 'Volgende',
    'introDone': 'Begrepen',
    'sell': 'Rang verkopen',
    'sellBlocked': 'Verkoop eerst {n} — die heeft dit nodig.',
    'title': 'Techboom',
    'rank': 'Rang {current}/{total}',
    'maxed': 'Maximaal',
    'rankOpen': 'Rang {n}',
    'atRank': 'Op rang {r}: {n} totaal',
    'owned': 'Ontgrendeld',
    'requires': 'Vereist {n}',
    'spotlight': 'Uitgeven!',
    'names': {
      'm2_lumberHut': 'Zandzeef',
      'logistics': 'Graafploeg',
      'unlockCoffer': 'Spaarvarkens',
      'yields': 'Opbrengsten',
      'unlockObelisk': 'Magische schelpen',
      'rallyCry': 'Strijdkreet',
      'stockpiles': 'Voorraden',
      'forgeWelds': 'Superlijm',
      'harbour': 'Zwembadje', 'dockWorks': 'Groter zwembadje',
      'unlockLongship': 'Rubberen eend', 'seasonedHulls': 'Stevige bootjes',
      'navalGunnery': 'Bootkanonnen', 'unlockGalley': 'Speelgoedpiratenschip',
      'admiralty': 'Admiraal Eend',
      'foundations': 'Fundering', 'sharpBolts': 'Scherpe pijltjes', 'unlockBrace': 'Aangestampt zand',
      'lumberStock': 'Zandvoorraad', 'longSight': 'Verrekijker', 'rapidFire': 'Snelvuur',
      'reinforced': 'Natzandmix', 'unlockSawmill': 'Rijk zand', 'quarryStock': 'Kiezelvoorraad',
      'unlockMortar': 'Moddermortier', 'heavyOrdnance': 'Grotere plons', 'unlockTesla': 'Insectenlamp',
      'gateArmor': 'Poortpantser', 'unlockQuarry': 'Diep graafwerk', 'richHauls': 'Rijke buit',
      'wideFoundation': 'Brede fundering', 'siegeShells': 'Superwaterpistolen', 'unlockFrost': 'IJslolly',
      'forkedBolts': 'Gevorkte schokjes', 'ironPlating': 'Verhard zand', 'unlockRepair': 'Emmertje en schepje',
      'unlockMint': 'Schatkaart', 'looting': 'Plundering', 'overcharge': 'Overlading',
      'masterwork': 'Meesterwerk', 'fieldRepairs': 'Veldreparaties', 'greatFoundation': 'Grote fundering',
      'warChest': 'Schatkist',
      'unlockSpikes': 'Tandenstokermuur',
      'unlockBombard': 'Ballonwerper',
      'sharpSpikes': 'Scherpe tandenstokers',
      'cavalryDrill': 'Riddertraining',
      'artilleryDoctrine': 'Verre schoten'
    },
    'descriptions': {
      'm2_lumberHut': 'Ontgrendelt de Zandzeef — levert zand na elke golf.',
      'logistics': 'Ontgrendelt de Kiezelgraver — een goedkope producent die je in de run zelf kunt betalen.',
      'unlockCoffer': 'Ontgrendelt het spaarvarken, het enige blok dat goud slaat.',
      'yields': 'Elk economieblok levert +{n}% meer op.',
      'unlockObelisk': 'Ontgrendelt de magische schelp, een veel sterkere burenbonus.',
      'rallyCry': 'Versterkingsblokken zijn +{n}% sterker.',
      'stockpiles': 'Elk economieblok levert +{n}% meer op.',
      'forgeWelds': 'Samengevoegde blokken leveren +{n} % meer per rang: schade, stekels en opbrengst.',
      'harbour': 'Laat bootjes drijven in het zwembadje. Alleen zij raken duikers.',
      'dockWorks': 'Bootjes drijven {n} vak verder per rang.',
      'unlockLongship': 'Een stevige rubberen eend met een zware pijltjesharpoen.',
      'seasonedHulls': 'Bootjes starten met +{n}% HP.',
      'navalGunnery': 'Bootwapens doen +{n}% schade.',
      'unlockGalley': 'Kurken kanonnen, een kraaiennest en een loopplank.',
      'admiralty': 'Bootwapens doen nog eens +{n}% schade.',
      'foundations': 'Elk kasteelblok begint met +{n} % HP.',
      'sharpBolts': 'Kasteelwapens doen +{n} % schade per rang.',
      'unlockBrace': 'Ontgrendelt aangestampt zand: twee keer de HP van een gewoon zandblok.',
      'lumberStock': 'Start elk beleg met +{n} zand per rang.',
      'longSight': 'Alle wapens reiken +{n} % verder per rang.',
      'rapidFire': 'Alle wapens vuren {n} % sneller per rang.',
      'reinforced': 'Elk kasteelblok krijgt +{n} % HP per rang.',
      'unlockSawmill': 'Elke producent levert +{n}% meer per rang.',
      'quarryStock': 'Start elk beleg met +{n} kiezels per rang.',
      'unlockMortar': 'Ontgrendelt de moddermortier: gebiedsschade op lange afstand.',
      'heavyOrdnance': 'Gebiedsstraal +{n} % per rang.',
      'unlockTesla': 'Ontgrendelt de insectenlamp: schokjes springen over.',
      'gateArmor': 'De kasteelpoort krijgt +{n} % HP per rang.',
      'unlockQuarry': 'Elke producent levert nog eens +{n}% per rang.',
      'richHauls': 'Golfbeloningen +{n} % per rang.',
      'wideFoundation': 'Bouw {n} kolommen breder per rang.',
      'siegeShells': 'Kasteelwapens doen +{n} % schade per rang.',
      'unlockFrost': 'Ontgrendelt de ijslolly: vertraagt hele groepen.',
      'forkedBolts': 'Schokjes springen naar {n} extra beestje per rang.',
      'ironPlating': 'Elk blok krijgt +{n} pantser per rang.',
      'unlockRepair': 'Ontgrendelt het emmertje en schepje: heelt buren elke golf.',
      'unlockMint': 'Elke producent levert nog eens +{n}% per rang.',
      'looting': 'Beestjes laten +{n} % meer munten vallen per rang.',
      'overcharge': 'Alle wapens vuren {n} % sneller per rang.',
      'masterwork': 'Kasteelwapens doen +{n} % schade per rang.',
      'fieldRepairs': 'Elk blok herstelt {n} % van zijn max. HP per doorstane golf, per rang.',
      'greatFoundation': 'Bouw nog eens {n} kolommen breder per rang.',
      'warChest': 'Golfbeloningen +{n} % per rang.',
      'unlockSpikes': 'Ontgrendelt de Tandenstokermuur — aanvallers prikken zichzelf eraan.',
      'unlockBombard': 'Ontgrendelt de Ballonwerper — waterballonnen op korte afstand tegen beestjes op de grond.',
      'sharpSpikes': 'Tandenstokermuren kaatsen +{n}% meer schade terug per rang.',
      'cavalryDrill': 'Speelgoedridders rijden uit met +{n}% HP en schade per rang.',
      'artilleryDoctrine': 'Alle wapens reiken +{n}% verder per rang.'
    }
  },

  'resources': {
    'wood': 'zand',
    'stone': 'kiezels',
    'gold': 'goud'
  },

  'ads': {
    'watch': 'Bekijken', 'revive': 'Herleven', 'secondChance': 'Tweede kans',
    'doubleCoins': '2× munten', 'plusCoins': '+{n} munten'
  },

  'achievements': {
    'title': 'Prestaties', 'subtitle': 'Bereik mijlpalen om munten te verdienen.',
    'claim': 'Ophalen', 'claimed': 'Opgehaald', 'progress': '{c} / {t}',
    'items': {
      'wave5': { 'name': 'Eerste weerstand', 'desc': 'Overleef tot golf 5.' },
      'wave10': { 'name': 'Bolwerk', 'desc': 'Overleef tot golf 10.' },
      'wave20': { 'name': 'Vesting', 'desc': 'Overleef tot golf 20.' },
      'wave30': { 'name': 'Onbreekbaar', 'desc': 'Overleef tot golf 30.' },
      'waves50': { 'name': 'Golfbreker', 'desc': 'Houd in totaal 50 golven tegen.' },
      'waves250': { 'name': 'Belegveteraan', 'desc': 'Houd in totaal 250 golven tegen.' },
      'kills500': { 'name': 'Verdediger', 'desc': 'Verpletter in totaal 500 beestjes.' },
      'kills5k': { 'name': 'Beestjesverpletteraar', 'desc': 'Verpletter in totaal 5.000 beestjes.' },
      'kills50k': { 'name': 'Legende', 'desc': 'Verpletter in totaal 50.000 beestjes.' },
      'height10': { 'name': 'Hemelwaarts', 'desc': 'Bouw een toren van 10 blokken hoog.' },
      'height20': { 'name': 'Wolkenboorder', 'desc': 'Bouw een toren van 20 blokken hoog.' },
      'blocks250': { 'name': 'Bouwer', 'desc': 'Plaats in totaal 250 blokken.' },
      'blocks2k': { 'name': 'Architect', 'desc': 'Plaats in totaal 2.000 blokken.' },
      'coins5k': { 'name': 'Muntverzamelaar', 'desc': 'Verdien in totaal 5.000 munten.' },
      'coins50k': { 'name': 'Schatbewaarder', 'desc': 'Verdien in totaal 50.000 munten.' },
      'runs25': { 'name': 'Volhouder', 'desc': 'Start 25 belegeringen.' }
    }
  },

  'missions': {
    'title': 'Dagelijkse missies', 'subtitle': 'Voltooi elke dag doelen voor munten.',
    'claim': 'Ophalen', 'done': 'Opgehaald',
    'types': {
      'coins': 'Verdien vandaag {n} munten',
      'waves': 'Overleef tot golf {n} in één beleg',
      'kills': 'Verpletter vandaag {n} beestjes',
      'blocks': 'Plaats vandaag {n} blokken'
    }
  },

  'battlePass': {
    'title': 'Battle Pass', 'progress': '{current} / {total}', 'daysLeft': 'Nog {n} d',
    'maxed': 'BATTLE PASS VOLTOOID', 'xpProgress': '{current} / {total} XP',
    'howToEarn': 'Zo verdien je XP', 'perRun': 'per beleg', 'perWave': 'per gehouden golf',
    'unlockHint': 'Bereik {n} XP voor de volgende beloning — niet-opgehaalde beloningen blijven staan.'
  },

  'dailyRewards': {
    'title': 'Dagelijkse beloningen', 'subtitle': 'Log elke dag in om je reeks te behouden.',
    'day': 'Dag {n}', 'dayShort': 'D{n}'
  },

  'options': {
    'title': 'Opties', 'general': 'Algemeen', 'audio': 'Audio', 'language': 'Taal',
    'difficulty': 'Moeilijkheid', 'soundEffects': 'Geluidseffecten', 'music': 'Muziek', 'musicTrack': 'Muzieknummer',
    'musicTracks': { 'cozy': 'Behaaglijke harmonie', 'trance': 'Trance-tunnel' },
    'close': 'Opslaan en sluiten',
    'difficulties': { 'easy': 'Makkelijk', 'medium': 'Gemiddeld', 'hard': 'Moeilijk' },
    'difficultyHints': {
      'easy': 'Kleinere golven en zwakkere beestjes.',
      'medium': 'Het standaard, gebalanceerde beleg.',
      'hard': 'Dichtere golven en taaiere beestjes.'
    }
  },

  'adsBlocked': {
    'title': 'Advertentie kon niet worden getoond',
    'body': 'We wilden je een video tonen zodat je je beloning kon verdienen, maar iets in je browser blokkeert advertenties.',
    'allowPrefix': 'Sta advertenties toe op',
    'allowSuffix': '(of pauzeer je adblocker voor dit spel) en probeer het opnieuw.',
    'gotIt': 'Begrepen'
  },
  'saveStatus': {
    'restoredTitle': 'Cloudopslag hersteld', 'restoredBody': '+{n} bonusmunten voor het herstel',
    'tap': 'tik', 'pausedTitle': 'Cloudsync gepauzeerd',
    'pausedBody': 'Je speelt offline. Je voortgang wordt hier opgeslagen.',
    'retry': 'Opnieuw', 'dismiss': 'sluiten'
  },
  'loading': { 'tooLong': 'Duurt het laden te lang? Schakel je adblocker uit en ververs.' },
  'license': { 'denied': 'Toegang geweigerd: koop een licentie.' }
}
