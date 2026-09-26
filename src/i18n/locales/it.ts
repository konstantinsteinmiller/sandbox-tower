export default {
  'gameName': 'Sandbox Tower',
  'cancel': 'Annulla',
  'close': 'Chiudi',
  'ok': 'Ok',
  'continue': 'Continua',
  'tapToContinue': 'Tocca per continuare',
  'clickToContinue': 'Clicca per continuare',
  'rewards': 'RICOMPENSE',
  'tip': 'Consiglio',
  'crazyGamesOnly': 'Questo gioco è disponibile solo su',

  // ─── Mobile-fit game (Drop & Merge) ───────────────────────────────────────
  'gift': {
    'free': 'Gratis',
    'tile': '{name} gratis, livello {n}: toccalo, poi tocca il campo per piazzarlo',
    'pair': 'Coppia di {name} gratis: toccala, poi tocca il campo per piazzarla',
    'tilePaid': '{name}, livello {n}, a metà prezzo: toccalo, poi tocca il campo per piazzarlo',
    'pairPaid': 'Coppia di {name} a metà prezzo: toccala, poi tocca il campo per piazzarla',
    'discount': '-{n}%',
    'chest': 'Forziere volante: toccalo per aprirlo',
    'firstClear': 'Ondata {n} superata! Un regalo per te'
  },

  'mobile': {
    'rotatePortrait': 'Tieni il telefono in verticale per giocare',
    'columnFull': 'Colonna piena',
    'repairAll': 'Ripara tutto',
    'volley': 'Raffica',
    'swap': 'Scambia',
    'menu': 'Menu',
    'materials': 'materiali',
    'zoom': 'Zoom'
  },

  'hud': {
    'wave': 'Ondata', 'enemies': 'Insetti', 'callWave': 'Chiama ondata', 'callBoss': 'Chiama boss',
    'monstersIncoming': 'Insetti in arrivo!',
    'skip': 'Salta',
    'speed': 'Velocità {n}×',
    'speedOffer': 'Sblocca la velocità {n}×',
    'speedGroup': 'Velocità di gioco', 'recenter': 'Ricentra la vista',
    'rotateLeft': 'Ruota a sinistra',
    'rotateRight': 'Ruota a destra',
    'arrowRain': 'Pioggia di freccette',
    'arrowRainAim': 'Tocca il campo di battaglia per chiamare la salva',
    'extendRange': '+{n}% gittata'
  },


  // ─── The opening cutscene ─────────────────────────────────────────────────
  // Three lines across the ten-second fly-over west of the tower, one per beat:
  // the tower, the horde, the siege train. The fourth thing the player reads is
  // `hud.monstersIncoming`, shown over the engines rather than over the board.
  'intro': {
    'premise': 'Il tuo castello di sabbia è l\'ultima cosa ancora in piedi.',
    'horde': 'Gli insetti sono già in marcia.',
    'siege': 'E hanno costruito macchinari.'
  },

  'warnings': {
    'hoard': 'Riserve +{n}%',
    'air': 'Aria ×{n}',
    'sea': 'Acqua ×{n}',
    'bombers': 'Esplosivi ×{n}',
    'siege': 'Assedio ×{n}',
    'outOfReach': 'Fuori portata ×{n} — serve {m} di gittata'
  },
  'hints': {
    'dropBlock': {
      'touch': 'Tocca una colonna per far cadere il pezzo',
      'desktop': 'Clicca una colonna per far cadere il pezzo'
    },
    'mergeBlock': {
      'touch': 'Fai atterrare un pezzo sul suo gemello per fonderli',
      'desktop': 'Fai atterrare un pezzo sul suo gemello per fonderli'
    },
    'selectBlock': { 'touch': 'Tocca un blocco in basso per sceglierlo', 'desktop': 'Clicca un blocco in basso per sceglierlo' },
    'placeBlock': { 'touch': 'Ora tocca uno spazio illuminato per costruire', 'desktop': 'Ora clicca uno spazio illuminato per costruire' },
    'camera': { 'touch': 'Trascina per spostare · Pizzica per zoomare', 'desktop': 'Trascina per spostare · Rotella per zoomare' },
    'callWave': { 'touch': 'Tocca «Chiama ondata» quando la torre è pronta', 'desktop': 'Premi Spazio per anticipare l’ondata' },
    'inspect': { 'touch': 'Tieni premuto un blocco per esaminarlo', 'desktop': 'Clicca un blocco per esaminarlo' }
  },

  'tips': {
    'eco': 'Setacci di sabbia e scavatrici di ciottoli pagano a ogni ondata. Due o tre cambiano ciò che puoi permetterti.',
    'buff': 'Le bandierine di carta potenziano tutto ciò che toccano e si moltiplicano. Circonda un’arma giocattolo invece di spargerle.',
    'merge': 'Due armi uguali affiancate si fondono. Impilane due per ottenere un 2×2.',
    'spend': 'Ti avanzano monete. I gradi dell’albero sono permanenti: valgono in ogni partita futura.',
    'branches': 'Tre alberi separati: castello, piscina e officina. Nessuno dipende dagli altri.',
    'shape': 'Muri davanti, armi dietro. Un blocco mai colpito è un blocco mai ricostruito.',
    'gold': 'L’oro compra i potenziamenti dei blocchi: tocca un blocco. I salvadanai ne coniano a ogni ondata.',
    'siegeReach': 'I trabucchi a matita si piazzano oltre la portata di lanciafreccette, pistola ad acqua o lanciapalloncini. Rispondi con un Mortaio di fango, o con una Nave pirata giocattolo della piscina.'
  },
  'blocks': {
    'fortify': 'Aggiungi stuzzicadenti',
    'sell': 'Vendi',
    'mergeTier': 'Fuso {n}×',
    'upgrade': 'Potenzia',
    'upgradeMax': 'Al massimo',
    'rank': 'Liv {n}/{max}',
    'reinforced': 'Rinforzato',
    'roofed': 'Con tetto',
    'roofNote': 'Con tetto: PS doppi, difesa tripla da sopra. Richiede cielo libero.',
    'enhancedNote': 'Rinforzato: +{hp}% PS, +{dmg}% danni.',
    'enhancedHand': 'Mano rinforzata',
    'reroll': 'Cambia questo pezzo',
    'kinds': {
      'buff': 'Potenziamento', 'core': 'Nucleo', 'structure': 'Struttura', 'weapon': 'Arma', 'economy': 'Economia', 'utility': 'Utilità', 'ship': 'Barca' },
    'stats': {
      'yieldGold': 'Oro / ondata',
      'buff': 'Bonus adiacenti',
      'topDefense': 'Difesa dall’alto',
      'hp': 'PS', 'armor': 'Armatura', 'dmg': 'Danno', 'cooldown': 'Ricarica', 'range': 'Gittata',
      'splash': 'Area', 'yieldWood': 'Sabbia / ondata', 'yieldStone': 'Ciottoli / ondata', 'yieldCoins': 'Monete / ondata',
      'repair': 'Riparazione / ondata', 'blast': 'Esplosione',
      'thorns': 'Spine'
    },
    'names': {
      'banner': 'Bandierina di carta',
      'obelisk': 'Conchiglia magica',
      'lumberHut': 'Setaccio di sabbia',
      'stonepit': 'Scavatrice di ciottoli',
      'coffer': 'Salvadanaio',
      'skiff': 'Barchetta di carta', 'longship': 'Paperella di gomma', 'galley': 'Nave pirata giocattolo',
      'gate': 'Portone del castello', 'wood': 'Blocco di sabbia', 'brace': 'Sabbia compatta', 'stone': 'Muro di ciottoli',
      'archer': 'Lanciafreccette', 'cannon': 'Pistola ad acqua', 'mortar': 'Mortaio di fango', 'tesla': 'Acchiappainsetti',
      'frost': 'Ghiacciolo', 'repair': 'Secchiello e paletta',
      'spikes': 'Muro di stuzzicadenti',
      'bombard': 'Lanciapalloncini'
    },
    'descriptions': {
      'banner': 'Potenzia ogni blocco adiacente. Due bandierine su un blocco si sommano.',
      'obelisk': 'Una bandierina più forte. Le aure si moltiplicano: due valgono ben più del doppio.',
      'lumberHut': 'Setaccia sabbia alla fine di ogni ondata superata.',
      'stonepit': 'Scava ciottoli alla fine di ogni ondata superata.',
      'coffer': 'Conia oro a ogni ondata — la valuta dei potenziamenti dei blocchi.',
      'skiff': 'Galleggia in piscina. Colpisce gli insetti sommersi.',
      'longship': 'Arpione a freccetta pesante. Robusta e con più gittata della riva.',
      'galley': 'Cannoni di sughero e una coffa. La piscina è tua.',
      'gate': 'Il cuore del tuo castello di sabbia. Se cade, l’assedio è finito.',
      'wood': 'Riempimento economico. La spina dorsale di ogni castello iniziale.',
      'brace': 'Il doppio della sabbia e più del doppio della resistenza.',
      'stone': 'Pesante e corazzato. Perfetto alla base.',
      'archer': 'Freccette di gommapiuma rapide su bersaglio singolo. Colpisce i volanti.',
      'cannon': 'Lento, forte danno ad area. Inzuppa le folle compatte.',
      'mortar': 'Palle di fango ad arco a lunga gittata, ma non può colpire i volanti.',
      'tesla': 'Scariche che rimbalzano tra gli insetti vicini.',
      'frost': 'Congela interi gruppi e li rallenta moltissimo.',
      'repair': 'Ripara tutti i blocchi adiacenti tra un’ondata e l’altra.',
      'spikes': 'Gli assalitori si pungono a ogni colpo.',
      'bombard': 'Lancia un gavettone quasi verticale. Piccolo splash, solo insetti a terra.'
    },
    'repair': 'Riparare',
    'repairCooldown': '{n} s',
    'reposition': 'Sposta questo blocco'
  },

  'enemies': {
    'names': {
      'grunt': 'Formica', 'runner': 'Scarafaggio', 'slinger': 'Ragno', 'brute': 'Scarabeo rinoceronte',
      'bomber': 'Coleottero bombardiere', 'bat': 'Mosca', 'bulwark': 'Porcellino di terra', 'golem': 'Cervo volante',
      'wyvern': 'Calabrone',
      'eel': 'Tigre d’acqua',
      'shark': 'Ditisco',
      'kraken': 'Cimice gigante',
      'seadrake': 'Ninfa di libellula',
      'ram': 'Ariete a matita',
      'ballista': 'Balestra elastica',
      'catapult': 'Catapulta a cucchiaio',
      'siegeTower': 'Torre di brick di succo',
      'trebuchet': 'Trabucco a matita',
      'ironRam': 'Ariete di latta',
      'bombardier': 'Bombo',
      'firebug': 'Lucciola'
    }
  },

  // ─── Allies ───────────────────────────────────────────────────────────────
  'allies': {
    'cavalry': 'Cavalieri giocattolo',
    'cavalryFree': 'Carica gratuita dei cavalieri giocattolo',
    'free': 'Gratis',
    'outOfReachHint': 'Fuori portata: manda i cavalieri o aumenta la gittata'
  },

  'result': {
    'towerFell': 'Distrutta!',
    'reachedWave': 'Sei sopravvissuto fino all’ondata {n}',
    'newRecord': 'Nuovo record!',
    'upgrade': 'Potenzia!',
    'defendAgain': 'Difendi di nuovo',
    'continueRun': 'Ricostruisci e continua',
    'continueWave': 'Ondata {n}',
    'tripleCoins': 'Triplica le monete',
    'tripleWave': '3× monete: {n}',
    'waveCleared': 'Ondata {n} respinta!',
    'scoreLabel': 'Punteggio',
    'bestLabel': 'Record',
    'scoreCurrent': '({n} in questa partita)',
    'rankLabel': 'Posizione',
    'rankOf': 'su {n}'
  },

  'tech': {
    'blueprints': {
      'title': 'Progetti'
    },
    'intro1': 'Tutto ciò che compri qui è permanente e resta in ogni partita futura.',
    'intro2': 'Le monete arrivano da ogni assedio, vinto o perso. È qui che si spendono.',
    'intro3': 'I nodi dorati sono già alla tua portata. I blu chiedono più monete, gli spenti il nodo precedente.',
    'introNext': 'Avanti',
    'introDone': 'Capito',
    'sell': 'Vendi grado',
    'sellBlocked': 'Vendi prima {n}: ne ha bisogno.',
    'title': 'Albero tecnologico',
    'rank': 'Grado {current}/{total}',
    'maxed': 'Al massimo',
    'rankOpen': 'Grado {n}',
    'atRank': 'Al grado {r}: {n} in totale',
    'owned': 'Sbloccato',
    'requires': 'Richiede {n}',
    'spotlight': 'Spendi!',
    'names': {
      'm2_lumberHut': 'Setaccio di sabbia',
      'logistics': 'Squadra di scavo',
      'unlockCoffer': 'Salvadanai',
      'yields': 'Rendimenti',
      'unlockObelisk': 'Conchiglie magiche',
      'rallyCry': 'Grido di raccolta',
      'stockpiles': 'Scorte',
      'forgeWelds': 'Supercolla',
      'harbour': 'Piscina', 'dockWorks': 'Piscina più grande',
      'unlockLongship': 'Paperella di gomma', 'seasonedHulls': 'Barche robuste',
      'navalGunnery': 'Cannoni da barca', 'unlockGalley': 'Nave pirata giocattolo',
      'admiralty': 'Ammiraglio Papera',
      'foundations': 'Fondamenta', 'sharpBolts': 'Freccette a punta', 'unlockBrace': 'Sabbia compatta',
      'lumberStock': 'Scorta di sabbia', 'longSight': 'Lunga vista', 'rapidFire': 'Fuoco rapido',
      'reinforced': 'Miscela di sabbia bagnata', 'unlockSawmill': 'Sabbia ricca', 'quarryStock': 'Scorta di ciottoli',
      'unlockMortar': 'Mortaio di fango', 'heavyOrdnance': 'Splash più grande', 'unlockTesla': 'Acchiappainsetti',
      'gateArmor': 'Corazza del portone', 'unlockQuarry': 'Scavo profondo', 'richHauls': 'Bottino ricco',
      'wideFoundation': 'Fondamenta ampie', 'siegeShells': 'Pistole ad acqua potenziate', 'unlockFrost': 'Ghiacciolo',
      'forkedBolts': 'Scariche biforcute', 'ironPlating': 'Sabbia indurita', 'unlockRepair': 'Secchiello e paletta',
      'unlockMint': 'Mappa del tesoro', 'looting': 'Saccheggio', 'overcharge': 'Sovraccarico',
      'masterwork': 'Capolavoro', 'fieldRepairs': 'Riparazioni sul campo', 'greatFoundation': 'Grandi fondamenta',
      'warChest': 'Baule del tesoro',
      'unlockSpikes': 'Muro di stuzzicadenti',
      'unlockBombard': 'Lanciapalloncini',
      'sharpSpikes': 'Stuzzicadenti affilati',
      'cavalryDrill': 'Addestramento dei cavalieri',
      'artilleryDoctrine': 'Tiri lunghi'
    },
    'descriptions': {
      'm2_lumberHut': 'Sblocca il Setaccio di sabbia: produce sabbia dopo ogni ondata.',
      'logistics': 'Sblocca la Scavatrice di ciottoli: un produttore economico che puoi permetterti nella partita in cui serve.',
      'unlockCoffer': 'Sblocca il salvadanaio, l’unico blocco che conia oro.',
      'yields': 'Ogni blocco economico rende +{n}% in più.',
      'unlockObelisk': 'Sblocca la conchiglia magica, un bonus adiacenti molto più forte.',
      'rallyCry': 'I blocchi di potenziamento sono +{n}% più forti.',
      'stockpiles': 'Ogni blocco economico rende +{n}% in più.',
      'forgeWelds': 'I blocchi fusi rendono +{n} % in più per grado: danni, spuntoni e produzione.',
      'harbour': 'Fai galleggiare barche in piscina. Solo loro colpiscono gli insetti sommersi.',
      'dockWorks': 'Le barche galleggiano {n} casella più al largo per grado.',
      'unlockLongship': 'Una paperella di gomma robusta con un arpione a freccetta pesante.',
      'seasonedHulls': 'Le barche partono con +{n}% di PS.',
      'navalGunnery': 'Le armi delle barche infliggono +{n}% di danni.',
      'unlockGalley': 'Cannoni di sughero, una coffa e una passerella.',
      'admiralty': 'Le armi delle barche infliggono un ulteriore +{n}% di danni.',
      'foundations': 'Ogni blocco del castello parte con +{n} % di PS.',
      'sharpBolts': 'Le armi del castello infliggono +{n} % di danno per grado.',
      'unlockBrace': 'Sblocca la sabbia compatta: il doppio dei PS di un blocco di sabbia normale.',
      'lumberStock': 'Inizia ogni assedio con +{n} sabbia per grado.',
      'longSight': 'Tutte le armi arrivano +{n} % più lontano per grado.',
      'rapidFire': 'Tutte le armi sparano l’{n} % più veloce per grado.',
      'reinforced': 'Ogni blocco del castello guadagna +{n} % di PS per grado.',
      'unlockSawmill': 'Ogni produttore rende +{n}% in più per grado.',
      'quarryStock': 'Inizia ogni assedio con +{n} ciottoli per grado.',
      'unlockMortar': 'Sblocca il mortaio di fango: danno ad area a lunga gittata.',
      'heavyOrdnance': 'Raggio d’area +{n} % per grado.',
      'unlockTesla': 'Sblocca l’acchiappainsetti: le scariche rimbalzano.',
      'gateArmor': 'Il portone del castello guadagna +{n} % di PS per grado.',
      'unlockQuarry': 'Ogni produttore rende un ulteriore +{n}% per grado.',
      'richHauls': 'Ricompense d’ondata +{n} % per grado.',
      'wideFoundation': 'Costruisci {n} colonne più larghe per grado.',
      'siegeShells': 'Le armi del castello infliggono +{n} % di danno per grado.',
      'unlockFrost': 'Sblocca il ghiacciolo: rallenta interi gruppi.',
      'forkedBolts': 'La scarica rimbalza su {n} insetto in più per grado.',
      'ironPlating': 'Ogni blocco guadagna +{n} di armatura per grado.',
      'unlockRepair': 'Sblocca il secchiello e paletta: cura i vicini a ogni ondata.',
      'unlockMint': 'Ogni produttore rende un ulteriore +{n}% per grado.',
      'looting': 'Gli insetti lasciano +{n} % di monete in più per grado.',
      'overcharge': 'Tutte le armi sparano il {n} % più veloce per grado.',
      'masterwork': 'Le armi del castello infliggono +{n} % di danno per grado.',
      'fieldRepairs': 'Ogni blocco recupera il {n} % dei PS max per ondata respinta e per grado.',
      'greatFoundation': 'Costruisci altre {n} colonne più larghe per grado.',
      'warChest': 'Ricompense d’ondata +{n} % per grado.',
      'unlockSpikes': 'Sblocca il Muro di stuzzicadenti: gli assalitori si pungono da soli.',
      'unlockBombard': 'Sblocca il Lanciapalloncini: gavettoni a corto raggio sugli insetti a terra.',
      'sharpSpikes': 'I muri di stuzzicadenti riflettono +{n}% di danni in più per grado.',
      'cavalryDrill': 'I cavalieri giocattolo escono con +{n}% di PS e danni per grado.',
      'artilleryDoctrine': 'Tutte le armi arrivano +{n}% più lontano per grado.'
    }
  },

  'resources': {
    'wood': 'sabbia',
    'stone': 'ciottoli',
    'gold': 'oro'
  },

  'ads': {
    'watch': 'Guarda', 'revive': 'Rianima', 'secondChance': 'Seconda occasione',
    'doubleCoins': '2× monete', 'plusCoins': '+{n} monete'
  },

  'achievements': {
    'title': 'Obiettivi', 'subtitle': 'Raggiungi traguardi permanenti per guadagnare monete.',
    'claim': 'Riscuoti', 'claimed': 'Riscosso', 'progress': '{c} / {t}',
    'items': {
      'wave5': { 'name': 'Prima resistenza', 'desc': 'Sopravvivi fino all’ondata 5.' },
      'wave10': { 'name': 'Roccaforte', 'desc': 'Sopravvivi fino all’ondata 10.' },
      'wave20': { 'name': 'Baluardo', 'desc': 'Sopravvivi fino all’ondata 20.' },
      'wave30': { 'name': 'Infrangibile', 'desc': 'Sopravvivi fino all’ondata 30.' },
      'waves50': { 'name': 'Frangiflutti', 'desc': 'Respingi 50 ondate in totale.' },
      'waves250': { 'name': 'Veterano d’assedio', 'desc': 'Respingi 250 ondate in totale.' },
      'kills500': { 'name': 'Difensore', 'desc': 'Schiaccia 500 insetti in totale.' },
      'kills5k': { 'name': 'Schiaccia-insetti', 'desc': 'Schiaccia 5.000 insetti in totale.' },
      'kills50k': { 'name': 'Leggenda', 'desc': 'Schiaccia 50.000 insetti in totale.' },
      'height10': { 'name': 'Verso il cielo', 'desc': 'Costruisci una torre alta 10 blocchi.' },
      'height20': { 'name': 'Spaccanuvole', 'desc': 'Costruisci una torre alta 20 blocchi.' },
      'blocks250': { 'name': 'Costruttore', 'desc': 'Piazza 250 blocchi in totale.' },
      'blocks2k': { 'name': 'Architetto', 'desc': 'Piazza 2.000 blocchi in totale.' },
      'coins5k': { 'name': 'Collezionista', 'desc': 'Guadagna 5.000 monete in totale.' },
      'coins50k': { 'name': 'Tesoriere', 'desc': 'Guadagna 50.000 monete in totale.' },
      'runs25': { 'name': 'Tenace', 'desc': 'Inizia 25 assedi.' }
    }
  },

  'missions': {
    'title': 'Missioni giornaliere', 'subtitle': 'Completa obiettivi ogni giorno per ottenere monete.',
    'claim': 'Riscuoti', 'done': 'Riscosso',
    'types': {
      'coins': 'Guadagna {n} monete oggi',
      'waves': 'Sopravvivi fino all’ondata {n} in un assedio',
      'kills': 'Schiaccia {n} insetti oggi',
      'blocks': 'Piazza {n} blocchi oggi'
    }
  },

  'battlePass': {
    'title': 'Pass battaglia', 'progress': '{current} / {total}', 'daysLeft': '{n} g rimasti',
    'maxed': 'PASS BATTAGLIA COMPLETATO', 'xpProgress': '{current} / {total} XP',
    'howToEarn': 'Come guadagnare XP', 'perRun': 'per assedio', 'perWave': 'per ondata respinta',
    'unlockHint': 'Raggiungi {n} XP per la prossima ricompensa: quelle non riscosse restano disponibili.'
  },

  'dailyRewards': {
    'title': 'Ricompense giornaliere', 'subtitle': 'Accedi ogni giorno per mantenere la serie.',
    'day': 'Giorno {n}', 'dayShort': 'G{n}'
  },

  'options': {
    'title': 'Opzioni', 'general': 'Generale', 'audio': 'Audio', 'language': 'Lingua',
    'difficulty': 'Difficoltà', 'soundEffects': 'Effetti sonori', 'music': 'Musica', 'musicTrack': 'Traccia musicale',
    'musicTracks': { 'cozy': 'Armonia accogliente', 'trance': 'Tunnel trance' },
    'close': 'Salva e chiudi',
    'difficulties': { 'easy': 'Facile', 'medium': 'Media', 'hard': 'Difficile' },
    'difficultyHints': {
      'easy': 'Ondate più piccole e insetti più deboli.',
      'medium': 'L’assedio standard ed equilibrato.',
      'hard': 'Ondate più fitte e insetti più resistenti.'
    }
  },

  'adsBlocked': {
    'title': 'Impossibile mostrare l’annuncio',
    'body': 'Abbiamo provato a mostrarti un video per farti ottenere la ricompensa, ma qualcosa nel tuo browser blocca gli annunci.',
    'allowPrefix': 'Consenti gli annunci su',
    'allowSuffix': '(o metti in pausa il blocco annunci per questo gioco) e riprova.',
    'gotIt': 'Capito'
  },
  'saveStatus': {
    'restoredTitle': 'Salvataggio cloud ripristinato', 'restoredBody': '+{n} monete bonus per il recupero',
    'tap': 'tocca', 'pausedTitle': 'Sincronizzazione in pausa',
    'pausedBody': 'Stai giocando offline. I progressi sono salvati qui.',
    'retry': 'Riprova', 'dismiss': 'ignora'
  },
  'loading': { 'tooLong': 'Il caricamento è troppo lento? Disattiva il blocco annunci e ricarica.' },
  'license': { 'denied': 'Accesso negato: acquista una licenza.' }
}
