export default {
  'gameName': 'Sandbox Tower',
  'cancel': 'İptal',
  'close': 'Kapat',
  'ok': 'Tamam',
  'continue': 'Devam',
  'tapToContinue': 'Devam etmek için dokun',
  'clickToContinue': 'Devam etmek için tıkla',
  'rewards': 'ÖDÜLLER',
  'tip': 'İpucu',
  'crazyGamesOnly': 'Bu oyun yalnızca şurada mevcut:',

  // ─── Mobile-fit game (Drop & Merge) ───────────────────────────────────────
  'gift': {
    'free': 'Bedava',
    'tile': 'Bedava {name}, seviye {n}: dokun, sonra yerleştirmek için tahtaya dokun',
    'pair': 'Bedava bir çift {name}: dokun, sonra yerleştirmek için tahtaya dokun',
    'tilePaid': '{name}, seviye {n}, yarı fiyatına: dokun, sonra yerleştirmek için tahtaya dokun',
    'pairPaid': 'Yarı fiyatına bir çift {name}: dokun, sonra yerleştirmek için tahtaya dokun',
    'discount': '%{n} indirim',
    'chest': 'Uçan sandık: açmak için dokun',
    'firstClear': '{n}. dalga geçildi! Sana bir hediye'
  },

  'mobile': {
    'rotatePortrait': 'Oynamak için telefonunu dik tut',
    'columnFull': 'Sütun dolu',
    'repairAll': 'Hepsini onar',
    'volley': 'Yaylım',
    'swap': 'Değiştir',
    'menu': 'Menü',
    'materials': 'malzeme',
    'zoom': 'Yakınlaştırma'
  },

  'hud': {
    'wave': 'Dalga', 'enemies': 'Böcekler', 'callWave': 'Dalgayı çağır', 'callBoss': 'Boss’u çağır',
    'monstersIncoming': 'Böcekler geliyor!',
    'skip': 'Atla',
    'speed': 'Hız {n}×',
    'speedOffer': '{n}× hızı aç',
    'speedGroup': 'Oyun hızı', 'recenter': 'Görünümü ortala',
    'rotateLeft': 'Sola döndür',
    'rotateRight': 'Sağa döndür',
    'arrowRain': 'Dart Yağmuru',
    'arrowRainAim': 'Yaylım ateşi için savaş alanına dokun',
    'extendRange': '+%{n} menzil'
  },


  // ─── The opening cutscene ─────────────────────────────────────────────────
  // Three lines across the ten-second fly-over west of the tower, one per beat:
  // the tower, the horde, the siege train. The fourth thing the player reads is
  // `hud.monstersIncoming`, shown over the engines rather than over the board.
  'intro': {
    'premise': 'Kum kalen ayakta kalan son şey.',
    'horde': 'Böcekler çoktan yola çıktı.',
    'siege': 'Ve kendi makinelerini yaptılar.'
  },

  'warnings': {
    'hoard': 'Stok +{n}%',
    'air': 'Hava ×{n}',
    'sea': 'Su ×{n}',
    'bombers': 'Patlayıcı ×{n}',
    'siege': 'Kuşatma ×{n}',
    'outOfReach': 'Menzil dışı ×{n} — {m} menzil gerek'
  },
  'hints': {
    'dropBlock': {
      'touch': 'Parçayı bırakmak için bir sütuna dokun',
      'desktop': 'Parçayı bırakmak için bir sütuna tıkla'
    },
    'mergeBlock': {
      'touch': 'Birleştirmek için bir parçayı ikizinin üstüne bırak',
      'desktop': 'Birleştirmek için bir parçayı ikizinin üstüne bırak'
    },
    'selectBlock': { 'touch': 'Seçmek için aşağıdaki bir bloğa dokun', 'desktop': 'Seçmek için aşağıdaki bir bloğa tıkla' },
    'placeBlock': { 'touch': 'Şimdi inşa etmek için parlayan bir yuvaya dokun', 'desktop': 'Şimdi inşa etmek için parlayan bir yuvaya tıkla' },
    'camera': { 'touch': 'Kaydırmak için sürükle · Yakınlaştırmak için sıkıştır', 'desktop': 'Kaydırmak için sürükle · Yakınlaştırmak için tekerlek' },
    'callWave': { 'touch': 'Kulen hazırken «Dalgayı çağır»a dokun', 'desktop': 'Dalgayı erken başlatmak için Boşluk’a bas' },
    'inspect': { 'touch': 'İncelemek için bir bloğu basılı tut', 'desktop': 'İncelemek için bir bloğa tıkla' }
  },

  'tips': {
    'eco': 'Kum elekleri ve çakıl ocakları her dalga ödeme yapar. İki üç tanesi neye gücünün yeteceğini değiştirir.',
    'buff': 'Kağıt bayraklar dokundukları her bloğu güçlendirir ve çarpılır. Dağıtmak yerine bir oyuncak silahı çevrele.',
    'merge': 'Yan yana iki aynı silah birleşir. Bunlardan ikisini üst üste koyup 2×2 yap.',
    'spend': 'Harcanacak paran var. Ağaç rütbeleri kalıcıdır, sonraki her tura taşınır.',
    'branches': 'Üç ayrı ağaç: kale, havuz ve atölye. Hiçbiri diğerine ihtiyaç duymaz.',
    'shape': 'Duvarlar önde, silahlar arkada. Hiç vurulmayan blok, hiç yeniden yapılmayan bloktur.',
    'gold': 'Altın blok yükseltmesi alır — bir bloğa dokun. Kumbaralar her dalga daha fazlasını basar.',
    'siegeReach': 'Kalem mancınıkları dart fırlatıcı, su tabancası ya da balon fırlatıcının erişemeyeceği kadar uzakta durur. Cevabı bir Çamur Havanı — ya da havuzdan bir Oyuncak Korsan Gemisi.'
  },
  'blocks': {
    'fortify': 'Kürdan ekle',
    'sell': 'Sat',
    'mergeTier': 'Birleşik {n}×',
    'upgrade': 'Yükselt',
    'upgradeMax': 'Tam yükseltildi',
    'rank': 'Sv {n}/{max}',
    'reinforced': 'Takviyeli',
    'roofed': 'Çatılı',
    'roofNote': 'Çatılı — iki kat CP, yukarıdan gelen hasara üç kat savunma. Üstü boş olmalı.',
    'enhancedNote': 'Takviyeli — +%{hp} CP, +%{dmg} hasar.',
    'enhancedHand': 'Takviyeli el',
    'reroll': 'Bu parçayı değiştir',
    'kinds': {
      'buff': 'Güçlendirme', 'core': 'Çekirdek', 'structure': 'Yapı', 'weapon': 'Silah', 'economy': 'Ekonomi', 'utility': 'Yardımcı', 'ship': 'Tekne' },
    'stats': {
      'yieldGold': 'Altın / dalga',
      'buff': 'Komşu bonusu',
      'topDefense': 'Üstten savunma',
      'hp': 'CP', 'armor': 'Zırh', 'dmg': 'Hasar', 'cooldown': 'Bekleme', 'range': 'Menzil',
      'splash': 'Alan', 'yieldWood': 'Kum / dalga', 'yieldStone': 'Çakıl / dalga', 'yieldCoins': 'Altın / dalga',
      'repair': 'Onarım / dalga', 'blast': 'Patlama',
      'thorns': 'Dikenler'
    },
    'names': {
      'banner': 'Kağıt Bayrak',
      'obelisk': 'Büyülü Deniz Kabuğu',
      'lumberHut': 'Kum Eleği',
      'stonepit': 'Çakıl Kazıcı',
      'coffer': 'Kumbara',
      'skiff': 'Kağıt Tekne', 'longship': 'Lastik Ördek', 'galley': 'Oyuncak Korsan Gemisi',
      'gate': 'Kale Kapısı', 'wood': 'Kum Bloğu', 'brace': 'Sıkıştırılmış Kum', 'stone': 'Çakıl Duvarı',
      'archer': 'Dart Fırlatıcı', 'cannon': 'Su Tabancası', 'mortar': 'Çamur Havanı', 'tesla': 'Böcek Öldürücü',
      'frost': 'Dondurma Çubuğu', 'repair': 'Kova ve Kürek',
      'spikes': 'Kürdan Duvarı',
      'bombard': 'Balon Fırlatıcı'
    },
    'descriptions': {
      'banner': 'Komşu tüm blokları güçlendirir. Bir bloktaki iki bayrak birikir.',
      'obelisk': 'Daha güçlü bir bayrak. Auralar çarpılır — iki tanesi iki katından çok daha değerli.',
      'lumberHut': 'Temizlenen her dalganın sonunda kum eler.',
      'stonepit': 'Temizlenen her dalganın sonunda çakıl kazar.',
      'coffer': 'Her dalgada altın basar — blok yükseltmelerinin para birimi.',
      'skiff': 'Havuzda yüzer. Yüzeyin altındaki böceklere vurur.',
      'longship': 'Ağır dart zıpkını. Sağlam ve kıyıdan daha uzun menzilli.',
      'galley': 'Mantar toplar ve bir karga yuvası. Havuz senindir.',
      'gate': 'Kum kalenin kalbi. Düşerse kuşatma biter.',
      'wood': 'Ucuz dolgu. Her erken kalenin bel kemiği.',
      'brace': 'İki katı kum, iki katından fazla dayanıklılık.',
      'stone': 'Ağır ve zırhlı. En iyisi temelde.',
      'archer': 'Tek hedefe hızlı köpük dartlar. Uçanları da vurur.',
      'cannon': 'Yavaş, ağır alan hasarı. Sıkışık kalabalıkları ıslatır.',
      'mortar': 'Uzun menzilli yay çizen çamur topları — ama uçanları vuramaz.',
      'tesla': 'Yakındaki böcekler arasında sıçrayan şoklar.',
      'frost': 'Tüm grubu dondurur ve ağır yavaşlatır.',
      'repair': 'Dalgalar arasında komşu blokları onarır.',
      'spikes': 'Saldıranlar her vuruşta kendilerini batırır.',
      'bombard': 'Su balonunu dik yukarı fırlatır. Küçük sıçrama, sadece kara böcekleri.'
    },
    'repair': 'Onar',
    'repairCooldown': '{n} sn',
    'reposition': 'Bu bloğu taşı'
  },

  'enemies': {
    'names': {
      'grunt': 'Karınca', 'runner': 'Hamamböceği', 'slinger': 'Örümcek', 'brute': 'Gergedan Böceği',
      'bomber': 'Bombardıman Böceği', 'bat': 'Sinek', 'bulwark': 'Top Böcek', 'golem': 'Geyik Böceği',
      'wyvern': 'Eşek Arısı',
      'eel': 'Su Kaplanı',
      'shark': 'Dalgıç Böcek',
      'kraken': 'Dev Su Böceği',
      'seadrake': 'Yusufçuk Larvası',
      'ram': 'Kalem Koçbaşı',
      'ballista': 'Lastik Bantlı Arbalet',
      'catapult': 'Kaşık Mancınığı',
      'siegeTower': 'Meyve Suyu Kutusu Kulesi',
      'trebuchet': 'Kalem Trebuşesi',
      'ironRam': 'Teneke Kutu Koçbaşı',
      'bombardier': 'Bombus Arısı',
      'firebug': 'Ateş Böceği'
    }
  },

  // ─── Allies ───────────────────────────────────────────────────────────────
  'allies': {
    'cavalry': 'Oyuncak Şövalyeler',
    'cavalryFree': 'Oyuncak şövalyelerin ücretsiz saldırısı',
    'free': 'Ücretsiz',
    'outOfReachHint': 'Menzil dışı — şövalyeleri gönder ya da menzilini artır'
  },

  'result': {
    'towerFell': 'Yıkıldı!',
    'reachedWave': '{n}. dalgaya kadar dayandın',
    'newRecord': 'Yeni rekor!',
    'upgrade': 'Geliştir!',
    'defendAgain': 'Tekrar savun',
    'continueRun': 'Yeniden kur ve devam et',
    'continueWave': '{n}. dalga',
    'tripleCoins': 'Altınları üçe katla',
    'tripleWave': '3× altın — {n}',
    'waveCleared': '{n}. dalga durduruldu!',
    'scoreLabel': 'Puan',
    'bestLabel': 'En iyi puan',
    'scoreCurrent': '(bu turda {n})',
    'rankLabel': 'Sıra',
    'rankOf': '/ {n}'
  },

  'tech': {
    'blueprints': {
      'title': 'Planlar'
    },
    'intro1': 'Burada aldığın her şey kalıcıdır ve sonraki tüm turlara taşınır.',
    'intro2': 'Paralar her kuşatmadan gelir, kazan ya da kaybet. Onları burada harcarsın.',
    'intro3': 'Altın düğümleri şimdi alabilirsin. Maviler daha çok para, sönükler önceki düğümü ister.',
    'introNext': 'İleri',
    'introDone': 'Anladım',
    'sell': 'Rütbe sat',
    'sellBlocked': 'Önce {n} sat — buna ihtiyacı var.',
    'title': 'Teknoloji Ağacı',
    'rank': 'Kademe {current}/{total}',
    'maxed': 'Maksimum',
    'rankOpen': 'Rütbe {n}',
    'atRank': '{r}. rütbede: toplam {n}',
    'owned': 'Açıldı',
    'requires': 'Gerekli: {n}',
    'spotlight': 'Harca!',
    'names': {
      'm2_lumberHut': 'Kum Eleği',
      'logistics': 'Kazı Ekibi',
      'unlockCoffer': 'Kumbaralar',
      'yields': 'Verim',
      'unlockObelisk': 'Büyülü Deniz Kabukları',
      'rallyCry': 'Savaş Narası',
      'stockpiles': 'Stoklar',
      'forgeWelds': 'Süper Yapıştırıcı',
      'harbour': 'Havuz', 'dockWorks': 'Daha Büyük Havuz',
      'unlockLongship': 'Lastik Ördek', 'seasonedHulls': 'Sağlam Tekneler',
      'navalGunnery': 'Tekne Silahları', 'unlockGalley': 'Oyuncak Korsan Gemisi',
      'admiralty': 'Amiral Ördek',
      'foundations': 'Temeller', 'sharpBolts': 'Sivri Dartlar', 'unlockBrace': 'Sıkıştırılmış Kum',
      'lumberStock': 'Kum Stoku', 'longSight': 'Uzak Görüş', 'rapidFire': 'Hızlı Atış',
      'reinforced': 'Islak Kum Karışımı', 'unlockSawmill': 'Zengin Kum', 'quarryStock': 'Çakıl Stoku',
      'unlockMortar': 'Çamur Havanı', 'heavyOrdnance': 'Daha Büyük Sıçrama', 'unlockTesla': 'Böcek Öldürücü',
      'gateArmor': 'Kapı Zırhı', 'unlockQuarry': 'Derin Kazı', 'richHauls': 'Zengin Ganimet',
      'wideFoundation': 'Geniş Temel', 'siegeShells': 'Güçlü Su Tabancaları', 'unlockFrost': 'Dondurma Çubuğu',
      'forkedBolts': 'Çatallı Şoklar', 'ironPlating': 'Sertleşmiş Kum', 'unlockRepair': 'Kova ve Kürek',
      'unlockMint': 'Hazine Haritası', 'looting': 'Yağma', 'overcharge': 'Aşırı Yükleme',
      'masterwork': 'Şaheser', 'fieldRepairs': 'Saha Onarımı', 'greatFoundation': 'Büyük Temel',
      'warChest': 'Hazine Sandığı',
      'unlockSpikes': 'Kürdan Duvarı',
      'unlockBombard': 'Balon Fırlatıcı',
      'sharpSpikes': 'Keskin Kürdanlar',
      'cavalryDrill': 'Şövalye Eğitimi',
      'artilleryDoctrine': 'Uzun Atışlar'
    },
    'descriptions': {
      'm2_lumberHut': 'Kum Eleğini açar — her dalgadan sonra kum verir.',
      'logistics': 'Çakıl Kazıcıyı açar — tam ihtiyaç duyduğun turda alabileceğin ucuz bir üretici.',
      'unlockCoffer': 'Altın basan tek blok olan kumbarayı açar.',
      'yields': 'Her ekonomi bloğu +%{n} daha fazla verir.',
      'unlockObelisk': 'Çok daha güçlü bir komşu bonusu olan büyülü deniz kabuğunu açar.',
      'rallyCry': 'Güçlendirme blokları +%{n} daha güçlü.',
      'stockpiles': 'Her ekonomi bloğu +%{n} daha fazla verir.',
      'forgeWelds': 'Birleşik bloklar kademe başına +%{n} daha fazla üretir: hasar, diken ve verim.',
      'harbour': 'Tekneleri havuzda yüzdür. Batıklara yalnızca onlar vurur.',
      'dockWorks': 'Tekneler her rütbede {n} kare daha uzağa yüzer.',
      'unlockLongship': 'Ağır dart zıpkınlı, sağlam bir lastik ördek.',
      'seasonedHulls': 'Tekneler +%{n} CP ile başlar.',
      'navalGunnery': 'Tekne silahları +%{n} hasar verir.',
      'unlockGalley': 'Mantar toplar, bir karga yuvası ve bir güverte.',
      'admiralty': 'Tekne silahları +%{n} daha fazla hasar verir.',
      'foundations': 'Her kale bloğu +%{n} CP ile başlar.',
      'sharpBolts': 'Kale silahları kademe başına +%{n} hasar verir.',
      'unlockBrace': 'Sıkıştırılmış kumu açar — normal kum bloğunun iki katı CP.',
      'lumberStock': 'Her kuşatmaya kademe başına +{n} kumla başla.',
      'longSight': 'Tüm silahlar kademe başına +%{n} daha uzağa erişir.',
      'rapidFire': 'Tüm silahlar kademe başına %{n} daha hızlı ateş eder.',
      'reinforced': 'Her kale bloğu kademe başına +%{n} CP kazanır.',
      'unlockSawmill': 'Her üretici rütbe başına +%{n} daha fazla verir.',
      'quarryStock': 'Her kuşatmaya kademe başına +{n} çakılla başla.',
      'unlockMortar': 'Çamur Havanını açar — uzun menzilli alan hasarı.',
      'heavyOrdnance': 'Alan yarıçapı kademe başına +%{n}.',
      'unlockTesla': 'Böcek öldürücüyü açar — şoklar sıçrar.',
      'gateArmor': 'Kale kapısı kademe başına +%{n} CP kazanır.',
      'unlockQuarry': 'Her üretici rütbe başına +%{n} daha verir.',
      'richHauls': 'Dalga ödülleri kademe başına +%{n}.',
      'wideFoundation': 'Kademe başına {n} sütun daha geniş inşa et.',
      'siegeShells': 'Kale silahları kademe başına +%{n} hasar verir.',
      'unlockFrost': 'Dondurma çubuğunu açar — tüm grupları yavaşlatır.',
      'forkedBolts': 'Şok kademe başına {n} böceğe daha sıçrar.',
      'ironPlating': 'Her blok kademe başına +{n} zırh kazanır.',
      'unlockRepair': 'Kova ve küreği açar — her dalgada komşuları iyileştirir.',
      'unlockMint': 'Her üretici rütbe başına +%{n} daha verir.',
      'looting': 'Böcekler kademe başına +%{n} daha fazla altın düşürür.',
      'overcharge': 'Tüm silahlar kademe başına %{n} daha hızlı ateş eder.',
      'masterwork': 'Kale silahları kademe başına +%{n} hasar verir.',
      'fieldRepairs': 'Her blok, durdurulan dalga ve kademe başına maks. CP’sinin %{n}’sını yeniler.',
      'greatFoundation': 'Kademe başına {n} sütun daha geniş inşa et.',
      'warChest': 'Dalga ödülleri kademe başına +%{n}.',
      'unlockSpikes': 'Kürdan Duvarını açar — saldıranlar kendilerini batırır.',
      'unlockBombard': 'Balon Fırlatıcıyı açar — kara böceklerine kısa menzilli su balonu ateşi.',
      'sharpSpikes': 'Kürdan duvarları rütbe başına %{n} daha fazla hasar yansıtır.',
      'cavalryDrill': 'Oyuncak şövalyeler rütbe başına %{n} daha fazla CP ve hasarla çıkar.',
      'artilleryDoctrine': 'Tüm silahlar rütbe başına %{n} daha uzağa ulaşır.'
    }
  },

  'resources': {
    'wood': 'kum',
    'stone': 'çakıl',
    'gold': 'altın'
  },

  'ads': {
    'watch': 'İzle', 'revive': 'Dirilt', 'secondChance': 'İkinci Şans',
    'doubleCoins': '2× Altın', 'plusCoins': '+{n} altın'
  },

  'achievements': {
    'title': 'Başarımlar', 'subtitle': 'Kalıcı hedeflere ulaşarak altın kazan.',
    'claim': 'Al', 'claimed': 'Alındı', 'progress': '{c} / {t}',
    'items': {
      'wave5': { 'name': 'İlk Direniş', 'desc': '5. dalgaya kadar dayan.' },
      'wave10': { 'name': 'Kale', 'desc': '10. dalgaya kadar dayan.' },
      'wave20': { 'name': 'Siper', 'desc': '20. dalgaya kadar dayan.' },
      'wave30': { 'name': 'Kırılmaz', 'desc': '30. dalgaya kadar dayan.' },
      'waves50': { 'name': 'Dalgakıran', 'desc': 'Toplam 50 dalga durdur.' },
      'waves250': { 'name': 'Kuşatma Gazisi', 'desc': 'Toplam 250 dalga durdur.' },
      'kills500': { 'name': 'Savunucu', 'desc': 'Toplamda 500 böcek ez.' },
      'kills5k': { 'name': 'Böcek Ezici', 'desc': 'Toplamda 5.000 böcek ez.' },
      'kills50k': { 'name': 'Efsane', 'desc': 'Toplamda 50.000 böcek ez.' },
      'height10': { 'name': 'Göğe Doğru', 'desc': '10 blok yüksekliğinde bir kule inşa et.' },
      'height20': { 'name': 'Bulut Delen', 'desc': '20 blok yüksekliğinde bir kule inşa et.' },
      'blocks250': { 'name': 'İnşaatçı', 'desc': 'Toplam 250 blok yerleştir.' },
      'blocks2k': { 'name': 'Mimar', 'desc': 'Toplam 2.000 blok yerleştir.' },
      'coins5k': { 'name': 'Altın Toplayıcı', 'desc': 'Toplam 5.000 altın kazan.' },
      'coins50k': { 'name': 'Hazinedar', 'desc': 'Toplam 50.000 altın kazan.' },
      'runs25': { 'name': 'Azimli', 'desc': '25 kuşatma başlat.' }
    }
  },

  'missions': {
    'title': 'Günlük Görevler', 'subtitle': 'Her gün hedefleri tamamla, altın kazan.',
    'claim': 'Al', 'done': 'Alındı',
    'types': {
      'coins': 'Bugün {n} altın kazan',
      'waves': 'Tek kuşatmada {n}. dalgaya kadar dayan',
      'kills': 'Bugün {n} böcek ez',
      'blocks': 'Bugün {n} blok yerleştir'
    }
  },

  'battlePass': {
    'title': 'Savaş Bileti', 'progress': '{current} / {total}', 'daysLeft': '{n}g kaldı',
    'maxed': 'SAVAŞ BİLETİ TAMAMLANDI', 'xpProgress': '{current} / {total} XP',
    'howToEarn': 'XP nasıl kazanılır', 'perRun': 'kuşatma başına', 'perWave': 'durdurulan dalga başına',
    'unlockHint': 'Sonraki ödül için {n} XP’ye ulaş — alınmayan ödüller bekler.'
  },

  'dailyRewards': {
    'title': 'Günlük Ödüller', 'subtitle': 'Serini korumak için her gün giriş yap.',
    'day': '{n}. Gün', 'dayShort': 'G{n}'
  },

  'options': {
    'title': 'Seçenekler', 'general': 'Genel', 'audio': 'Ses', 'language': 'Dil',
    'difficulty': 'Zorluk', 'soundEffects': 'Ses Efektleri', 'music': 'Müzik', 'musicTrack': 'Müzik Parçası',
    'musicTracks': { 'cozy': 'Huzurlu Uyum', 'trance': 'Trance Tüneli' },
    'close': 'Kaydet ve Kapat',
    'difficulties': { 'easy': 'Kolay', 'medium': 'Orta', 'hard': 'Zor' },
    'difficultyHints': {
      'easy': 'Daha küçük dalgalar ve daha zayıf böcekler.',
      'medium': 'Standart, dengeli kuşatma.',
      'hard': 'Daha yoğun dalgalar ve daha dayanıklı böcekler.'
    }
  },

  'adsBlocked': {
    'title': 'Reklam gösterilemedi',
    'body': 'Ödülünü kazanabilmen için bir video göstermek istedik ama tarayıcındaki bir şey reklamları engelliyor.',
    'allowPrefix': 'Lütfen şu adreste reklamlara izin ver:',
    'allowSuffix': '(veya bu oyun için reklam engelleyiciyi duraklat) ve tekrar dene.',
    'gotIt': 'Anladım'
  },
  'saveStatus': {
    'restoredTitle': 'Bulut kaydı geri yüklendi', 'restoredBody': 'Kurtarma için +{n} bonus altın',
    'tap': 'dokun', 'pausedTitle': 'Bulut eşitlemesi duraklatıldı',
    'pausedBody': 'Çevrimdışı oynuyorsun. İlerlemen burada kaydediliyor.',
    'retry': 'Yeniden dene', 'dismiss': 'kapat'
  },
  'loading': { 'tooLong': 'Yükleme çok mu uzun sürüyor? Reklam engelleyiciyi kapatıp sayfayı yenile.' },
  'license': { 'denied': 'Erişim reddedildi: lütfen bir lisans satın al.' }
}
