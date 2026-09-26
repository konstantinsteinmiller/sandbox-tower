export default {
  'gameName': 'Sandbox Tower',
  'cancel': 'Anuluj',
  'close': 'Zamknij',
  'ok': 'Ok',
  'continue': 'Kontynuuj',
  'tapToContinue': 'Dotknij, aby kontynuować',
  'clickToContinue': 'Kliknij, aby kontynuować',
  'rewards': 'NAGRODY',
  'tip': 'Wskazówka',
  'crazyGamesOnly': 'Ta gra jest dostępna tylko na',

  // ─── Mobile-fit game (Drop & Merge) ───────────────────────────────────────
  'gift': {
    'free': 'Za darmo',
    'tile': 'Darmowe: {name}, poziom {n}. Stuknij, a potem stuknij planszę, aby postawić',
    'pair': 'Darmowa para: {name}. Stuknij, a potem stuknij planszę, aby postawić',
    'tilePaid': '{name}, poziom {n}, za pół ceny. Stuknij, a potem stuknij planszę, aby postawić',
    'pairPaid': 'Para {name} za pół ceny. Stuknij, a potem stuknij planszę, aby postawić',
    'discount': '-{n}%',
    'chest': 'Latająca skrzynia: stuknij, aby otworzyć',
    'firstClear': 'Fala {n} pokonana! Prezent dla ciebie'
  },

  'mobile': {
    'rotatePortrait': 'Trzymaj telefon pionowo, aby grać',
    'columnFull': 'Kolumna pełna',
    'repairAll': 'Napraw wszystko',
    'volley': 'Salwa',
    'swap': 'Zamień',
    'menu': 'Menu',
    'materials': 'materiały',
    'zoom': 'Powiększenie'
  },

  'hud': {
    'wave': 'Fala', 'enemies': 'Robaki', 'callWave': 'Wezwij falę', 'callBoss': 'Wezwij bossa',
    'monstersIncoming': 'Nadchodzą robaki!',
    'skip': 'Pomiń',
    'speed': 'Prędkość {n}×',
    'speedOffer': 'Odblokuj prędkość {n}×',
    'speedGroup': 'Szybkość gry', 'recenter': 'Wyśrodkuj widok',
    'rotateLeft': 'Obróć w lewo',
    'rotateRight': 'Obróć w prawo',
    'arrowRain': 'Deszcz strzałek',
    'arrowRainAim': 'Dotknij pola bitwy, aby wezwać salwę',
    'extendRange': '+{n}% zasięgu'
  },


  // ─── The opening cutscene ─────────────────────────────────────────────────
  // Three lines across the ten-second fly-over west of the tower, one per beat:
  // the tower, the horde, the siege train. The fourth thing the player reads is
  // `hud.monstersIncoming`, shown over the engines rather than over the board.
  'intro': {
    'premise': 'Twój zamek z piasku to ostatnie, co jeszcze stoi.',
    'horde': 'Robaki już nadciągają.',
    'siege': 'I zbudowały własne machiny.'
  },

  'warnings': {
    'hoard': 'Zapasy +{n}%',
    'air': 'Powietrze ×{n}',
    'sea': 'Woda ×{n}',
    'bombers': 'Ładunki ×{n}',
    'siege': 'Oblężenie ×{n}',
    'outOfReach': 'Poza zasięgiem ×{n} — potrzeba {m} zasięgu'
  },
  'hints': {
    'dropBlock': {
      'touch': 'Dotknij kolumny, aby upuścić element',
      'desktop': 'Kliknij kolumnę, aby upuścić element'
    },
    'mergeBlock': {
      'touch': 'Upuść element na jego bliźniaka, aby je połączyć',
      'desktop': 'Upuść element na jego bliźniaka, aby je połączyć'
    },
    'selectBlock': { 'touch': 'Dotknij bloku na dole, aby go wybrać', 'desktop': 'Kliknij blok na dole, aby go wybrać' },
    'placeBlock': { 'touch': 'Teraz dotknij świecącego pola, aby zbudować', 'desktop': 'Teraz kliknij świecące pole, aby zbudować' },
    'camera': { 'touch': 'Przeciągaj, aby przesuwać · Szczypnij, aby przybliżyć', 'desktop': 'Przeciągaj, aby przesuwać · Scrolluj, aby przybliżyć' },
    'callWave': { 'touch': 'Dotknij „Wezwij falę”, gdy wieża jest gotowa', 'desktop': 'Naciśnij spację, aby wezwać falę wcześniej' },
    'inspect': { 'touch': 'Przytrzymaj blok, aby go sprawdzić', 'desktop': 'Kliknij blok, aby go sprawdzić' }
  },

  'tips': {
    'eco': 'Sitka do piasku i kopalnie kamyków płacą co falę. Dwa lub trzy zmieniają to, na co cię stać.',
    'buff': 'Papierowe chorągiewki wzmacniają wszystko, czego dotykają, i mnożą się. Otocz jedną zabawkową broń zamiast je rozpraszać.',
    'merge': 'Dwie takie same bronie obok siebie łączą się. Ułóż dwie takie pary w 2×2.',
    'spend': 'Zostały ci monety. Rangi w drzewku są trwałe — działają w każdej kolejnej rozgrywce.',
    'branches': 'Trzy osobne drzewka: zamek, brodzik i warsztat. Żadne nie wymaga pozostałych.',
    'shape': 'Mury z przodu, działa z tyłu. Blok, którego nic nie trafia, to blok, którego nie odbudowujesz.',
    'gold': 'Złoto kupuje ulepszenia bloków — dotknij bloku. Skarbonki biją go co falę.',
    'siegeReach': 'Ołówkowe trebusze stają dalej, niż sięgają wyrzutnia strzałek, pistolet na wodę czy wyrzutnia balonów. Odpowiedz Błotnym moździerzem — albo Zabawkowym statkiem piratów z brodzika.'
  },
  'blocks': {
    'fortify': 'Dodaj wykałaczki',
    'sell': 'Sprzedaj',
    'mergeTier': 'Scalony {n}×',
    'upgrade': 'Ulepsz',
    'upgradeMax': 'W pełni ulepszony',
    'rank': 'Poz. {n}/{max}',
    'reinforced': 'Wzmocniony',
    'roofed': 'Zadaszony',
    'roofNote': 'Zadaszone — podwójne PZ, potrójna obrona z góry. Wymaga wolnego nieba.',
    'enhancedNote': 'Wzmocniony — +{hp}% PZ, +{dmg}% obrażeń.',
    'enhancedHand': 'Wzmocniona ręka',
    'reroll': 'Wymień ten element',
    'kinds': {
      'buff': 'Wzmocnienie', 'core': 'Rdzeń', 'structure': 'Konstrukcja', 'weapon': 'Broń', 'economy': 'Ekonomia', 'utility': 'Wsparcie', 'ship': 'Łódka' },
    'stats': {
      'yieldGold': 'Złoto / fala',
      'buff': 'Premia sąsiedztwa',
      'topDefense': 'Obrona z góry',
      'hp': 'PŻ', 'armor': 'Pancerz', 'dmg': 'Obrażenia', 'cooldown': 'Przeładowanie', 'range': 'Zasięg',
      'splash': 'Obszar', 'yieldWood': 'Piasek / falę', 'yieldStone': 'Kamyki / falę', 'yieldCoins': 'Monety / falę',
      'repair': 'Naprawa / falę', 'blast': 'Wybuch',
      'thorns': 'Kolce'
    },
    'names': {
      'banner': 'Papierowa chorągiewka',
      'obelisk': 'Magiczna muszelka',
      'lumberHut': 'Sitko do piasku',
      'stonepit': 'Kopalnia kamyków',
      'coffer': 'Skarbonka',
      'skiff': 'Papierowa łódka', 'longship': 'Gumowa kaczka', 'galley': 'Zabawkowy statek piratów',
      'gate': 'Brama zamku', 'wood': 'Blok piasku', 'brace': 'Ubity piasek', 'stone': 'Mur z kamyków',
      'archer': 'Wyrzutnia strzałek', 'cannon': 'Pistolet na wodę', 'mortar': 'Błotny moździerz', 'tesla': 'Lampa na owady',
      'frost': 'Lody na patyku', 'repair': 'Wiaderko i łopatka',
      'spikes': 'Ściana z wykałaczek',
      'bombard': 'Wyrzutnia balonów'
    },
    'descriptions': {
      'banner': 'Wzmacnia każdy sąsiedni blok. Dwie chorągiewki przy jednym bloku kumulują się.',
      'obelisk': 'Silniejsza chorągiewka. Aury się mnożą — dwie są warte znacznie więcej niż podwójnie.',
      'lumberHut': 'Przesiewa piasek po każdej odpartej fali.',
      'stonepit': 'Wykopuje kamyki po każdej odpartej fali.',
      'coffer': 'Bije złoto co falę — walutę ulepszeń bloków.',
      'skiff': 'Pływa w brodziku. Trafia robaki pod powierzchnią.',
      'longship': 'Ciężki harpun ze strzałki. Wytrzymała i o większym zasięgu niż brzeg.',
      'galley': 'Korkowe działa i bocianie gniazdo. Brodzik jest twój.',
      'gate': 'Serce twojego zamku z piasku. Gdy padnie, oblężenie się kończy.',
      'wood': 'Tanie wypełnienie. Kręgosłup każdego wczesnego zamku.',
      'brace': 'Dwa razy więcej piasku i ponad dwa razy większa wytrzymałość.',
      'stone': 'Ciężki i opancerzony. Najlepszy u podstawy.',
      'archer': 'Szybkie piankowe strzałki w jeden cel. Trafia latających.',
      'cannon': 'Powolny, silne obrażenia obszarowe. Moczy zbite grupy.',
      'mortar': 'Dalekosiężne błotne kule po łuku, ale nie trafia latających.',
      'tesla': 'Wyładowania przeskakujące między pobliskimi robakami.',
      'frost': 'Mrozi całe grupy i mocno je spowalnia.',
      'repair': 'Naprawia sąsiednie bloki między falami.',
      'spikes': 'Napastnicy kłują się na niej przy każdym ciosie.',
      'bombard': 'Wystrzeliwuje balon z wodą stromo w górę. Mały plusk, tylko robaki na ziemi.'
    },
    'repair': 'Napraw',
    'repairCooldown': '{n} s',
    'reposition': 'Przenieś ten blok'
  },

  'enemies': {
    'names': {
      'grunt': 'Mrówka', 'runner': 'Karaluch', 'slinger': 'Pająk', 'brute': 'Chrząszcz nosorożec',
      'bomber': 'Chrząszcz bombardujący', 'bat': 'Mucha', 'bulwark': 'Prosionek', 'golem': 'Jelonek rogacz',
      'wyvern': 'Szerszeń',
      'eel': 'Wodny tygrys',
      'shark': 'Pływak',
      'kraken': 'Płoszczyca',
      'seadrake': 'Larwa ważki',
      'ram': 'Taran z ołówka',
      'ballista': 'Kusza z gumki',
      'catapult': 'Katapulta z łyżki',
      'siegeTower': 'Wieża z kartonika soku',
      'trebuchet': 'Trebusz z ołówka',
      'ironRam': 'Taran z puszki',
      'bombardier': 'Trzmiel',
      'firebug': 'Świetlik'
    }
  },

  // ─── Allies ───────────────────────────────────────────────────────────────
  'allies': {
    'cavalry': 'Zabawkowi rycerze',
    'cavalryFree': 'Darmowa szarża zabawkowych rycerzy',
    'free': 'Za darmo',
    'outOfReachHint': 'Poza zasięgiem — wyślij rycerzy lub zwiększ zasięg'
  },

  'result': {
    'towerFell': 'Zniszczona!',
    'reachedWave': 'Przetrwałeś do fali {n}',
    'newRecord': 'Nowy rekord!',
    'upgrade': 'Ulepsz!',
    'defendAgain': 'Broń ponownie',
    'continueRun': 'Odbuduj i graj dalej',
    'continueWave': 'Fala {n}',
    'tripleCoins': 'Potrój monety',
    'tripleWave': '3× monety — {n}',
    'waveCleared': 'Fala {n} odparta!',
    'scoreLabel': 'Wynik',
    'bestLabel': 'Rekord',
    'scoreCurrent': '({n} w tej grze)',
    'rankLabel': 'Miejsce',
    'rankOf': 'z {n}'
  },

  'tech': {
    'blueprints': {
      'title': 'Plany'
    },
    'intro1': 'Wszystko, co tu kupisz, jest trwałe i zostaje na każdą kolejną rozgrywkę.',
    'intro2': 'Monety dostajesz po każdym oblężeniu, wygranym czy przegranym. Tutaj je wydajesz.',
    'intro3': 'Złote węzły już cię stać. Niebieskie wymagają więcej monet, przygaszone — węzła przed nimi.',
    'introNext': 'Dalej',
    'introDone': 'Jasne',
    'sell': 'Sprzedaj rangę',
    'sellBlocked': 'Najpierw sprzedaj {n} — tego wymaga.',
    'title': 'Drzewko technologii',
    'rank': 'Ranga {current}/{total}',
    'maxed': 'Maksimum',
    'rankOpen': 'Ranga {n}',
    'atRank': 'Na randze {r}: łącznie {n}',
    'owned': 'Odblokowane',
    'requires': 'Wymaga: {n}',
    'spotlight': 'Wydaj!',
    'names': {
      'm2_lumberHut': 'Sitko do piasku',
      'logistics': 'Ekipa kopaczy',
      'unlockCoffer': 'Skarbonki',
      'yields': 'Wydajność',
      'unlockObelisk': 'Magiczne muszelki',
      'rallyCry': 'Okrzyk bojowy',
      'stockpiles': 'Zapasy',
      'forgeWelds': 'Supermocny klej',
      'harbour': 'Brodzik', 'dockWorks': 'Większy brodzik',
      'unlockLongship': 'Gumowa kaczka', 'seasonedHulls': 'Wytrzymałe łódki',
      'navalGunnery': 'Działka na łódkach', 'unlockGalley': 'Zabawkowy statek piratów',
      'admiralty': 'Admirał Kaczor',
      'foundations': 'Fundamenty', 'sharpBolts': 'Ostre strzałki', 'unlockBrace': 'Ubity piasek',
      'lumberStock': 'Zapas piasku', 'longSight': 'Dalekowzroczność', 'rapidFire': 'Szybki ogień',
      'reinforced': 'Mokra mieszanka piasku', 'unlockSawmill': 'Bogaty piasek', 'quarryStock': 'Zapas kamyków',
      'unlockMortar': 'Błotny moździerz', 'heavyOrdnance': 'Większy plusk', 'unlockTesla': 'Lampa na owady',
      'gateArmor': 'Pancerz bramy', 'unlockQuarry': 'Głębokie kopanie', 'richHauls': 'Bogate łupy',
      'wideFoundation': 'Szerokie fundamenty', 'siegeShells': 'Potężne pistolety na wodę', 'unlockFrost': 'Lody na patyku',
      'forkedBolts': 'Rozwidlone wyładowania', 'ironPlating': 'Utwardzony piasek', 'unlockRepair': 'Wiaderko i łopatka',
      'unlockMint': 'Mapa skarbów', 'looting': 'Grabież', 'overcharge': 'Przeciążenie',
      'masterwork': 'Arcydzieło', 'fieldRepairs': 'Naprawy polowe', 'greatFoundation': 'Wielkie fundamenty',
      'warChest': 'Skrzynia skarbów',
      'unlockSpikes': 'Ściana z wykałaczek',
      'unlockBombard': 'Wyrzutnia balonów',
      'sharpSpikes': 'Ostre wykałaczki',
      'cavalryDrill': 'Szkolenie rycerzy',
      'artilleryDoctrine': 'Dalekie strzały'
    },
    'descriptions': {
      'm2_lumberHut': 'Odblokowuje Sitko do piasku — daje piasek po każdej fali.',
      'logistics': 'Odblokowuje Kopalnię kamyków — tani producent, na którego stać cię w trakcie rozgrywki.',
      'unlockCoffer': 'Odblokowuje skarbonkę, jedyny blok bijący złoto.',
      'yields': 'Każdy blok ekonomiczny daje +{n}% więcej.',
      'unlockObelisk': 'Odblokowuje magiczną muszelkę, znacznie silniejszą premię sąsiedztwa.',
      'rallyCry': 'Bloki wzmacniające są +{n}% silniejsze.',
      'stockpiles': 'Każdy blok ekonomiczny daje +{n}% więcej.',
      'forgeWelds': 'Scalone bloki dają +{n} % więcej na rangę: obrażenia, kolce i wydajność.',
      'harbour': 'Puszczaj łódki na brodziku. Tylko one trafiają zanurzone robaki.',
      'dockWorks': 'Łódki pływają {n} pole dalej na rangę.',
      'unlockLongship': 'Wytrzymała gumowa kaczka z ciężkim harpunem ze strzałki.',
      'seasonedHulls': 'Łódki zaczynają z +{n}% PZ.',
      'navalGunnery': 'Broń na łódkach zadaje +{n}% obrażeń.',
      'unlockGalley': 'Korkowe działa, bocianie gniazdo i trap.',
      'admiralty': 'Broń na łódkach zadaje kolejne +{n}% obrażeń.',
      'foundations': 'Każdy blok zamku zaczyna z +{n} % PŻ.',
      'sharpBolts': 'Bronie zamku zadają +{n} % obrażeń na rangę.',
      'unlockBrace': 'Odblokowuje ubity piasek — dwukrotność PŻ zwykłego bloku piasku.',
      'lumberStock': 'Zaczynaj każde oblężenie z +{n} piasku na rangę.',
      'longSight': 'Wszystkie bronie sięgają +{n} % dalej na rangę.',
      'rapidFire': 'Wszystkie bronie strzelają {n} % szybciej na rangę.',
      'reinforced': 'Każdy blok zamku zyskuje +{n} % PŻ na rangę.',
      'unlockSawmill': 'Każdy producent daje +{n}% więcej na poziom.',
      'quarryStock': 'Zaczynaj każde oblężenie z +{n} kamyków na rangę.',
      'unlockMortar': 'Odblokowuje błotny moździerz — obrażenia obszarowe z dużego dystansu.',
      'heavyOrdnance': 'Promień obszaru +{n} % na rangę.',
      'unlockTesla': 'Odblokowuje lampę na owady — wyładowania przeskakują.',
      'gateArmor': 'Brama zamku zyskuje +{n} % PŻ na rangę.',
      'unlockQuarry': 'Każdy producent daje kolejne +{n}% na poziom.',
      'richHauls': 'Nagrody za falę +{n} % na rangę.',
      'wideFoundation': 'Buduj o {n} kolumny szerzej na rangę.',
      'siegeShells': 'Bronie zamku zadają +{n} % obrażeń na rangę.',
      'unlockFrost': 'Odblokowuje lody na patyku — spowalniają całe grupy.',
      'forkedBolts': 'Wyładowanie przeskakuje na {n} robaka więcej na rangę.',
      'ironPlating': 'Każdy blok zyskuje +{n} pancerza na rangę.',
      'unlockRepair': 'Odblokowuje wiaderko i łopatkę — leczy sąsiadów co falę.',
      'unlockMint': 'Każdy producent daje kolejne +{n}% na poziom.',
      'looting': 'Robaki upuszczają +{n} % więcej monet na rangę.',
      'overcharge': 'Wszystkie bronie strzelają {n} % szybciej na rangę.',
      'masterwork': 'Bronie zamku zadają +{n} % obrażeń na rangę.',
      'fieldRepairs': 'Każdy blok odzyskuje {n} % maks. PŻ za odpartą falę, na rangę.',
      'greatFoundation': 'Buduj o kolejne {n} kolumny szerzej na rangę.',
      'warChest': 'Nagrody za falę +{n} % na rangę.',
      'unlockSpikes': 'Odblokowuje Ścianę z wykałaczek — napastnicy kłują się na niej.',
      'unlockBombard': 'Odblokowuje Wyrzutnię balonów — balony z wodą na krótkim dystansie przeciw robakom na ziemi.',
      'sharpSpikes': 'Ściany z wykałaczek odbijają +{n}% więcej obrażeń na rangę.',
      'cavalryDrill': 'Zabawkowi rycerze wyruszają z +{n}% PŻ i obrażeń na rangę.',
      'artilleryDoctrine': 'Wszystkie bronie sięgają +{n}% dalej na rangę.'
    }
  },

  'resources': {
    'wood': 'piasku',
    'stone': 'kamyków',
    'gold': 'złoto'
  },

  'ads': {
    'watch': 'Obejrzyj', 'revive': 'Wskrześ', 'secondChance': 'Druga szansa',
    'doubleCoins': '2× monety', 'plusCoins': '+{n} monet'
  },

  'achievements': {
    'title': 'Osiągnięcia', 'subtitle': 'Zdobywaj monety za kamienie milowe.',
    'claim': 'Odbierz', 'claimed': 'Odebrano', 'progress': '{c} / {t}',
    'items': {
      'wave5': { 'name': 'Pierwsza obrona', 'desc': 'Przetrwaj do fali 5.' },
      'wave10': { 'name': 'Twierdza', 'desc': 'Przetrwaj do fali 10.' },
      'wave20': { 'name': 'Bastion', 'desc': 'Przetrwaj do fali 20.' },
      'wave30': { 'name': 'Niezniszczalny', 'desc': 'Przetrwaj do fali 30.' },
      'waves50': { 'name': 'Falochron', 'desc': 'Odeprzyj łącznie 50 fal.' },
      'waves250': { 'name': 'Weteran oblężeń', 'desc': 'Odeprzyj łącznie 250 fal.' },
      'kills500': { 'name': 'Obrońca', 'desc': 'Zmiażdż łącznie 500 robaków.' },
      'kills5k': { 'name': 'Pogromca robaków', 'desc': 'Zmiażdż łącznie 5000 robaków.' },
      'kills50k': { 'name': 'Legenda', 'desc': 'Zmiażdż łącznie 50 000 robaków.' },
      'height10': { 'name': 'Ku niebu', 'desc': 'Zbuduj wieżę o wysokości 10 bloków.' },
      'height20': { 'name': 'Chmurołap', 'desc': 'Zbuduj wieżę o wysokości 20 bloków.' },
      'blocks250': { 'name': 'Budowniczy', 'desc': 'Postaw łącznie 250 bloków.' },
      'blocks2k': { 'name': 'Architekt', 'desc': 'Postaw łącznie 2000 bloków.' },
      'coins5k': { 'name': 'Zbieracz monet', 'desc': 'Zdobądź łącznie 5000 monet.' },
      'coins50k': { 'name': 'Skarbnik', 'desc': 'Zdobądź łącznie 50 000 monet.' },
      'runs25': { 'name': 'Wytrwały', 'desc': 'Rozpocznij 25 oblężeń.' }
    }
  },

  'missions': {
    'title': 'Misje dzienne', 'subtitle': 'Wykonuj codzienne cele, aby zdobywać monety.',
    'claim': 'Odbierz', 'done': 'Odebrano',
    'types': {
      'coins': 'Zdobądź dziś {n} monet',
      'waves': 'Przetrwaj do fali {n} w jednym oblężeniu',
      'kills': 'Zmiażdż dziś {n} robaków',
      'blocks': 'Postaw dziś {n} bloków'
    }
  },

  'battlePass': {
    'title': 'Karnet bojowy', 'progress': '{current} / {total}', 'daysLeft': 'Pozostało {n} d',
    'maxed': 'KARNET UKOŃCZONY', 'xpProgress': '{current} / {total} XP',
    'howToEarn': 'Jak zdobywać XP', 'perRun': 'za oblężenie', 'perWave': 'za odpartą falę',
    'unlockHint': 'Zdobądź {n} XP, aby odblokować kolejną nagrodę — nieodebrane nagrody czekają.'
  },

  'dailyRewards': {
    'title': 'Nagrody dzienne', 'subtitle': 'Loguj się codziennie, aby utrzymać serię.',
    'day': 'Dzień {n}', 'dayShort': 'D{n}'
  },

  'options': {
    'title': 'Opcje', 'general': 'Ogólne', 'audio': 'Dźwięk', 'language': 'Język',
    'difficulty': 'Trudność', 'soundEffects': 'Efekty dźwiękowe', 'music': 'Muzyka', 'musicTrack': 'Utwór',
    'musicTracks': { 'cozy': 'Przytulna harmonia', 'trance': 'Tunel trance' },
    'close': 'Zapisz i zamknij',
    'difficulties': { 'easy': 'Łatwy', 'medium': 'Średni', 'hard': 'Trudny' },
    'difficultyHints': {
      'easy': 'Mniejsze fale i słabsze robaki.',
      'medium': 'Standardowe, zrównoważone oblężenie.',
      'hard': 'Gęstsze fale i twardsze robaki.'
    }
  },

  'adsBlocked': {
    'title': 'Nie udało się wyświetlić reklamy',
    'body': 'Chcieliśmy pokazać film, byś odebrał nagrodę, ale coś w przeglądarce blokuje reklamy.',
    'allowPrefix': 'Zezwól na reklamy na',
    'allowSuffix': '(lub wstrzymaj blokadę reklam dla tej gry) i spróbuj ponownie.',
    'gotIt': 'Rozumiem'
  },
  'saveStatus': {
    'restoredTitle': 'Zapis w chmurze przywrócony', 'restoredBody': '+{n} monet bonusu za odzyskanie',
    'tap': 'dotknij', 'pausedTitle': 'Synchronizacja wstrzymana',
    'pausedBody': 'Grasz offline. Postęp jest zapisywany tutaj.',
    'retry': 'Ponów', 'dismiss': 'zamknij'
  },
  'loading': { 'tooLong': 'Ładowanie trwa zbyt długo? Wyłącz blokadę reklam i odśwież.' },
  'license': { 'denied': 'Odmowa dostępu: kup licencję.' }
}
