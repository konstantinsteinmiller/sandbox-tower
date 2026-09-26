export default {
  'gameName': 'Sandbox Tower',
  'cancel': 'Batal',
  'close': 'Tutup',
  'ok': 'Oke',
  'continue': 'Lanjut',
  'tapToContinue': 'Ketuk untuk lanjut',
  'clickToContinue': 'Klik untuk lanjut',
  'rewards': 'HADIAH',
  'tip': 'Tips',
  'crazyGamesOnly': 'Gim ini hanya tersedia di',

  // ─── Mobile-fit game (Drop & Merge) ───────────────────────────────────────
  'gift': {
    'free': 'Gratis',
    'tile': '{name} gratis, tingkat {n}: ketuk, lalu ketuk papan untuk memasangnya',
    'pair': 'Sepasang {name} gratis: ketuk, lalu ketuk papan untuk memasangnya',
    'tilePaid': '{name}, tingkat {n}, setengah harga: ketuk, lalu ketuk papan untuk memasangnya',
    'pairPaid': 'Sepasang {name} setengah harga: ketuk, lalu ketuk papan untuk memasangnya',
    'discount': '-{n}%',
    'chest': 'Peti terbang: ketuk untuk membukanya',
    'firstClear': 'Gelombang {n} selesai! Hadiah untukmu'
  },

  'mobile': {
    'rotatePortrait': 'Pegang ponsel secara tegak untuk bermain',
    'columnFull': 'Kolom penuh',
    'repairAll': 'Perbaiki semua',
    'volley': 'Tembakan salvo',
    'swap': 'Tukar',
    'menu': 'Menu',
    'materials': 'bahan',
    'zoom': 'Zoom'
  },

  'hud': {
    'wave': 'Gelombang', 'enemies': 'Serangga', 'callWave': 'Panggil gelombang', 'callBoss': 'Panggil bos',
    'monstersIncoming': 'Serangga datang!',
    'skip': 'Lewati',
    'speed': 'Kecepatan {n}×',
    'speedOffer': 'Buka kecepatan {n}×',
    'speedGroup': 'Kecepatan game', 'recenter': 'Pusatkan tampilan',
    'rotateLeft': 'Putar ke kiri',
    'rotateRight': 'Putar ke kanan',
    'arrowRain': 'Hujan Panah Busa',
    'arrowRainAim': 'Ketuk medan perang untuk memanggil tembakan',
    'extendRange': '+{n}% jangkauan'
  },


  // ─── The opening cutscene ─────────────────────────────────────────────────
  // Three lines across the ten-second fly-over west of the tower, one per beat:
  // the tower, the horde, the siege train. The fourth thing the player reads is
  // `hud.monstersIncoming`, shown over the engines rather than over the board.
  'intro': {
    'premise': 'Istana pasirmu adalah satu-satunya yang masih berdiri.',
    'horde': 'Serangga itu sudah bergerak.',
    'siege': 'Dan mereka membuat alat-alat sendiri.'
  },

  'warnings': {
    'hoard': 'Timbunan +{n}%',
    'air': 'Udara ×{n}',
    'sea': 'Air ×{n}',
    'bombers': 'Peledak ×{n}',
    'siege': 'Pengepung ×{n}',
    'outOfReach': 'Di luar jangkauan ×{n} — perlu jangkauan {m}'
  },
  'hints': {
    'dropBlock': {
      'touch': 'Ketuk sebuah kolom untuk menjatuhkan balok',
      'desktop': 'Klik sebuah kolom untuk menjatuhkan balok'
    },
    'mergeBlock': {
      'touch': 'Jatuhkan balok di atas kembarannya untuk menggabungkan',
      'desktop': 'Jatuhkan balok di atas kembarannya untuk menggabungkan'
    },
    'selectBlock': { 'touch': 'Ketuk blok di bawah untuk memilihnya', 'desktop': 'Klik blok di bawah untuk memilihnya' },
    'placeBlock': { 'touch': 'Sekarang ketuk kotak bercahaya untuk membangun', 'desktop': 'Sekarang klik kotak bercahaya untuk membangun' },
    'camera': { 'touch': 'Seret untuk menggeser · Cubit untuk zoom', 'desktop': 'Seret untuk menggeser · Gulir untuk zoom' },
    'callWave': { 'touch': 'Ketuk «Panggil gelombang» saat menara siap', 'desktop': 'Tekan Spasi untuk memanggil gelombang lebih awal' },
    'inspect': { 'touch': 'Tahan blok untuk memeriksanya', 'desktop': 'Klik blok untuk memeriksanya' }
  },

  'tips': {
    'eco': 'Ayakan pasir dan penggali kerikil membayar tiap gelombang. Dua atau tiga mengubah apa yang sanggup kamu beli.',
    'buff': 'Bendera kertas memperkuat semua blok di sebelahnya, dan efeknya dikalikan. Kelilingi satu senjata mainan, jangan disebar.',
    'merge': 'Dua senjata sama berdampingan menyatu. Tumpuk dua pasang untuk membuat 2×2.',
    'spend': 'Koinmu masih ada. Peringkat di pohon bersifat permanen dan terbawa ke setiap ronde.',
    'branches': 'Tiga pohon terpisah: istana, kolam renang, dan bengkel. Tidak ada yang saling membutuhkan.',
    'shape': 'Dinding di depan, senjata di belakang. Blok yang tak pernah kena tak pernah perlu dibangun ulang.',
    'gold': 'Emas membeli peningkatan blok — ketuk blok mana pun. Celengan mencetaknya tiap gelombang.',
    'siegeReach': 'Trebuchet pensil berdiri lebih jauh dari jangkauan pelontar panah busa, pistol air, atau pelontar balon. Jawab dengan Mortar Lumpur — atau Kapal Bajak Laut Mainan dari kolam renang.'
  },
  'blocks': {
    'fortify': 'Tambah tusuk gigi',
    'sell': 'Jual',
    'mergeTier': 'Digabung {n}×',
    'upgrade': 'Tingkatkan',
    'upgradeMax': 'Sudah maksimal',
    'rank': 'Lv {n}/{max}',
    'reinforced': 'Diperkuat',
    'roofed': 'Beratap',
    'roofNote': 'Beratap — HP dua kali lipat, pertahanan tiga kali lipat dari atas. Butuh langit terbuka.',
    'enhancedNote': 'Diperkuat — +{hp}% HP, +{dmg}% kerusakan.',
    'enhancedHand': 'Set diperkuat',
    'reroll': 'Tukar bagian ini',
    'kinds': {
      'buff': 'Penguat', 'core': 'Inti', 'structure': 'Struktur', 'weapon': 'Senjata', 'economy': 'Ekonomi', 'utility': 'Utilitas', 'ship': 'Perahu' },
    'stats': {
      'yieldGold': 'Emas / gelombang',
      'buff': 'Penguat tetangga',
      'topDefense': 'Pertahanan atas',
      'hp': 'HP', 'armor': 'Armor', 'dmg': 'Kerusakan', 'cooldown': 'Jeda', 'range': 'Jangkauan',
      'splash': 'Area', 'yieldWood': 'Pasir / gelombang', 'yieldStone': 'Kerikil / gelombang', 'yieldCoins': 'Koin / gelombang',
      'repair': 'Perbaikan / gelombang', 'blast': 'Ledakan',
      'thorns': 'Duri'
    },
    'names': {
      'banner': 'Bendera Kertas',
      'obelisk': 'Kerang Ajaib',
      'lumberHut': 'Ayakan Pasir',
      'stonepit': 'Penggali Kerikil',
      'coffer': 'Celengan',
      'skiff': 'Perahu Kertas', 'longship': 'Bebek Karet', 'galley': 'Kapal Bajak Laut Mainan',
      'gate': 'Gerbang Istana', 'wood': 'Balok Pasir', 'brace': 'Pasir Padat', 'stone': 'Tembok Kerikil',
      'archer': 'Pelontar Panah Busa', 'cannon': 'Pistol Air', 'mortar': 'Mortar Lumpur', 'tesla': 'Pembasmi Serangga',
      'frost': 'Es Loli', 'repair': 'Ember dan Sekop',
      'spikes': 'Dinding Tusuk Gigi',
      'bombard': 'Pelontar Balon'
    },
    'descriptions': {
      'banner': 'Memperkuat setiap blok tetangga. Dua bendera pada satu blok bertumpuk.',
      'obelisk': 'Bendera yang lebih kuat. Aura dikalikan — dua bernilai jauh lebih dari dua kali.',
      'lumberHut': 'Mengayak pasir di akhir setiap gelombang yang tuntas.',
      'stonepit': 'Menggali kerikil di akhir setiap gelombang yang tuntas.',
      'coffer': 'Mencetak emas tiap gelombang — mata uang untuk meningkatkan blok.',
      'skiff': 'Mengapung di kolam renang. Mengenai serangga di bawah permukaan.',
      'longship': 'Harpun panah berat. Kokoh dan jangkauannya melebihi pantai.',
      'galley': 'Meriam gabus dan sarang burung gagak. Kolam renang ini milikmu.',
      'gate': 'Jantung istana pasirmu. Jika jatuh, pengepungan berakhir.',
      'wood': 'Pengisi murah. Tulang punggung setiap istana awal.',
      'brace': 'Dua kali lipat pasir, lebih dari dua kali lipat ketahanan.',
      'stone': 'Berat dan berarmor. Paling cocok di bagian dasar.',
      'archer': 'Panah busa cepat ke satu sasaran. Bisa mengenai penerbang.',
      'cannon': 'Lambat, kerusakan area besar. Membasahi kerumunan padat.',
      'mortar': 'Bola lumpur melengkung jarak jauh — tapi tidak bisa mengenai penerbang.',
      'tesla': 'Setrum yang melompat antar serangga terdekat.',
      'frost': 'Membekukan seluruh kelompok dan memperlambatnya drastis.',
      'repair': 'Memperbaiki blok tetangga di antara gelombang.',
      'spikes': 'Penyerang tertusuk setiap kali memukulnya.',
      'bombard': 'Melontarkan balon air lurus ke atas. Percikan kecil, hanya serangga darat.'
    },
    'repair': 'Perbaiki',
    'repairCooldown': '{n} d',
    'reposition': 'Pindahkan blok ini'
  },

  'enemies': {
    'names': {
      'grunt': 'Semut', 'runner': 'Kecoak', 'slinger': 'Laba-laba', 'brute': 'Kumbang Badak',
      'bomber': 'Kumbang Pengebom', 'bat': 'Lalat', 'bulwark': 'Kutu Kayu', 'golem': 'Kumbang Tanduk Rusa',
      'wyvern': 'Tawon',
      'eel': 'Harimau Air',
      'shark': 'Kumbang Penyelam',
      'kraken': 'Kepik Air Raksasa',
      'seadrake': 'Larva Capung',
      'ram': 'Pendobrak Pensil',
      'ballista': 'Busur Karet Gelang',
      'catapult': 'Katapel Sendok',
      'siegeTower': 'Menara Kotak Jus',
      'trebuchet': 'Trebuchet Pensil',
      'ironRam': 'Pendobrak Kaleng',
      'bombardier': 'Lebah',
      'firebug': 'Kunang-kunang'
    }
  },

  // ─── Allies ───────────────────────────────────────────────────────────────
  'allies': {
    'cavalry': 'Ksatria Mainan',
    'cavalryFree': 'Serbuan gratis ksatria mainan',
    'free': 'Gratis',
    'outOfReachHint': 'Di luar jangkauan — kirim ksatria atau perluas jangkauanmu'
  },

  'result': {
    'towerFell': 'Hancur!',
    'reachedWave': 'Kamu bertahan sampai gelombang {n}',
    'newRecord': 'Rekor baru!',
    'upgrade': 'Tingkatkan!',
    'defendAgain': 'Bertahan lagi',
    'continueRun': 'Bangun ulang & lanjut',
    'continueWave': 'Gelombang {n}',
    'tripleCoins': 'Koin tiga kali lipat',
    'tripleWave': '3× koin — {n}',
    'waveCleared': 'Gelombang {n} berhasil ditahan!',
    'scoreLabel': 'Skor',
    'bestLabel': 'Skor terbaik',
    'scoreCurrent': '({n} ronde ini)',
    'rankLabel': 'Peringkat',
    'rankOf': 'dari {n}'
  },

  'tech': {
    'blueprints': {
      'title': 'Cetak biru'
    },
    'intro1': 'Semua yang kamu beli di sini permanen dan terbawa ke setiap ronde berikutnya.',
    'intro2': 'Koin datang dari setiap pengepungan, menang atau kalah. Di sinilah kamu membelanjakannya.',
    'intro3': 'Node emas sudah terjangkau. Yang biru butuh lebih banyak koin, yang redup butuh node sebelumnya.',
    'introNext': 'Lanjut',
    'introDone': 'Mengerti',
    'sell': 'Jual peringkat',
    'sellBlocked': 'Jual {n} dulu — ia membutuhkannya.',
    'title': 'Pohon Teknologi',
    'rank': 'Peringkat {current}/{total}',
    'maxed': 'Maksimum',
    'rankOpen': 'Peringkat {n}',
    'atRank': 'Di peringkat {r}: total {n}',
    'owned': 'Terbuka',
    'requires': 'Butuh {n}',
    'spotlight': 'Belanjakan!',
    'names': {
      'm2_lumberHut': 'Ayakan Pasir',
      'logistics': 'Tim Penggali',
      'unlockCoffer': 'Celengan',
      'yields': 'Hasil',
      'unlockObelisk': 'Kerang Ajaib',
      'rallyCry': 'Seruan Perang',
      'stockpiles': 'Persediaan',
      'forgeWelds': 'Lem Super',
      'harbour': 'Kolam Renang', 'dockWorks': 'Kolam Renang Lebih Besar',
      'unlockLongship': 'Bebek Karet', 'seasonedHulls': 'Perahu Kokoh',
      'navalGunnery': 'Meriam Perahu', 'unlockGalley': 'Kapal Bajak Laut Mainan',
      'admiralty': 'Laksamana Bebek',
      'foundations': 'Fondasi', 'sharpBolts': 'Panah Runcing', 'unlockBrace': 'Pasir Padat',
      'lumberStock': 'Stok Pasir', 'longSight': 'Penglihatan Jauh', 'rapidFire': 'Tembakan Cepat',
      'reinforced': 'Campuran Pasir Basah', 'unlockSawmill': 'Pasir Kaya', 'quarryStock': 'Stok Kerikil',
      'unlockMortar': 'Mortar Lumpur', 'heavyOrdnance': 'Percikan Lebih Besar', 'unlockTesla': 'Pembasmi Serangga',
      'gateArmor': 'Armor Gerbang', 'unlockQuarry': 'Penggalian Dalam', 'richHauls': 'Rampasan Melimpah',
      'wideFoundation': 'Fondasi Lebar', 'siegeShells': 'Pistol Air Super', 'unlockFrost': 'Es Loli',
      'forkedBolts': 'Setrum Bercabang', 'ironPlating': 'Pasir Mengeras', 'unlockRepair': 'Ember dan Sekop',
      'unlockMint': 'Peta Harta Karun', 'looting': 'Penjarahan', 'overcharge': 'Muatan Berlebih',
      'masterwork': 'Mahakarya', 'fieldRepairs': 'Perbaikan Lapangan', 'greatFoundation': 'Fondasi Agung',
      'warChest': 'Peti Harta Karun',
      'unlockSpikes': 'Dinding Tusuk Gigi',
      'unlockBombard': 'Pelontar Balon',
      'sharpSpikes': 'Tusuk Gigi Tajam',
      'cavalryDrill': 'Latihan Ksatria',
      'artilleryDoctrine': 'Tembakan Jarak Jauh'
    },
    'descriptions': {
      'm2_lumberHut': 'Membuka Ayakan Pasir — menghasilkan pasir setelah setiap gelombang.',
      'logistics': 'Membuka Penggali Kerikil — produsen murah yang terjangkau di ronde yang membutuhkannya.',
      'unlockCoffer': 'Membuka Celengan, satu-satunya blok yang mencetak emas.',
      'yields': 'Setiap blok ekonomi menghasilkan +{n}% lebih banyak.',
      'unlockObelisk': 'Membuka Kerang Ajaib, penguat tetangga yang jauh lebih kuat.',
      'rallyCry': 'Blok penguat +{n}% lebih kuat.',
      'stockpiles': 'Setiap blok ekonomi menghasilkan +{n}% lebih banyak.',
      'forgeWelds': 'Blok yang digabung menghasilkan +{n}% lebih per peringkat: kerusakan, duri, dan hasil.',
      'harbour': 'Apungkan perahu di kolam renang. Hanya perahu yang mengenai serangga menyelam.',
      'dockWorks': 'Perahu mengapung {n} petak lebih jauh per peringkat.',
      'unlockLongship': 'Bebek karet kokoh dengan harpun panah berat.',
      'seasonedHulls': 'Perahu mulai dengan +{n}% HP.',
      'navalGunnery': 'Senjata perahu memberi +{n}% kerusakan.',
      'unlockGalley': 'Meriam gabus, sarang burung gagak, dan jembatan geladak.',
      'admiralty': 'Senjata perahu memberi +{n}% kerusakan lagi.',
      'foundations': 'Setiap blok istana mulai dengan +{n}% HP.',
      'sharpBolts': 'Senjata istana memberi +{n}% kerusakan per peringkat.',
      'unlockBrace': 'Membuka Pasir Padat — dua kali HP balok pasir biasa.',
      'lumberStock': 'Mulai tiap pengepungan dengan +{n} pasir per peringkat.',
      'longSight': 'Jangkauan semua senjata +{n}% per peringkat.',
      'rapidFire': 'Semua senjata menembak {n}% lebih cepat per peringkat.',
      'reinforced': 'Setiap blok istana mendapat +{n}% HP per peringkat.',
      'unlockSawmill': 'Setiap produsen menghasilkan +{n}% lebih banyak per tingkat.',
      'quarryStock': 'Mulai tiap pengepungan dengan +{n} kerikil per peringkat.',
      'unlockMortar': 'Membuka Mortar Lumpur — kerusakan area jarak jauh.',
      'heavyOrdnance': 'Radius area +{n}% per peringkat.',
      'unlockTesla': 'Membuka Pembasmi Serangga — setrum melompat antar serangga.',
      'gateArmor': 'Gerbang istana mendapat +{n}% HP per peringkat.',
      'unlockQuarry': 'Setiap produsen menghasilkan +{n}% tambahan per tingkat.',
      'richHauls': 'Hadiah gelombang +{n}% per peringkat.',
      'wideFoundation': 'Bangun {n} kolom lebih lebar per peringkat.',
      'siegeShells': 'Senjata istana memberi +{n}% kerusakan per peringkat.',
      'unlockFrost': 'Membuka Es Loli — memperlambat seluruh kelompok.',
      'forkedBolts': 'Setrum melompat ke {n} serangga tambahan per peringkat.',
      'ironPlating': 'Setiap blok mendapat +{n} armor per peringkat.',
      'unlockRepair': 'Membuka Ember dan Sekop — menyembuhkan tetangga tiap gelombang.',
      'unlockMint': 'Setiap produsen menghasilkan +{n}% tambahan per tingkat.',
      'looting': 'Serangga menjatuhkan +{n}% lebih banyak koin per peringkat.',
      'overcharge': 'Semua senjata menembak {n}% lebih cepat per peringkat.',
      'masterwork': 'Senjata istana memberi +{n}% kerusakan per peringkat.',
      'fieldRepairs': 'Setiap blok memulihkan {n}% HP maks. per gelombang yang ditahan, per peringkat.',
      'greatFoundation': 'Bangun {n} kolom lagi lebih lebar per peringkat.',
      'warChest': 'Hadiah gelombang +{n}% per peringkat.',
      'unlockSpikes': 'Membuka Dinding Tusuk Gigi — penyerang tertusuk sendiri.',
      'unlockBombard': 'Membuka Pelontar Balon — balon air jarak dekat ke serangga darat.',
      'sharpSpikes': 'Dinding tusuk gigi memantulkan +{n}% damage lebih besar per peringkat.',
      'cavalryDrill': 'Ksatria mainan keluar dengan +{n}% HP dan damage per peringkat.',
      'artilleryDoctrine': 'Semua senjata menjangkau +{n}% lebih jauh per peringkat.'
    }
  },

  'resources': {
    'wood': 'pasir',
    'stone': 'kerikil',
    'gold': 'emas'
  },

  'ads': {
    'watch': 'Tonton', 'revive': 'Hidupkan', 'secondChance': 'Kesempatan Kedua',
    'doubleCoins': '2× Koin', 'plusCoins': '+{n} koin'
  },

  'achievements': {
    'title': 'Pencapaian', 'subtitle': 'Capai tonggak seumur hidup untuk mendapatkan koin.',
    'claim': 'Ambil', 'claimed': 'Diambil', 'progress': '{c} / {t}',
    'items': {
      'wave5': { 'name': 'Pertahanan Pertama', 'desc': 'Bertahan sampai gelombang 5.' },
      'wave10': { 'name': 'Benteng', 'desc': 'Bertahan sampai gelombang 10.' },
      'wave20': { 'name': 'Tembok Kokoh', 'desc': 'Bertahan sampai gelombang 20.' },
      'wave30': { 'name': 'Tak Terpatahkan', 'desc': 'Bertahan sampai gelombang 30.' },
      'waves50': { 'name': 'Pemecah Gelombang', 'desc': 'Tahan total 50 gelombang.' },
      'waves250': { 'name': 'Veteran Pengepungan', 'desc': 'Tahan total 250 gelombang.' },
      'kills500': { 'name': 'Pembela', 'desc': 'Hancurkan total 500 serangga.' },
      'kills5k': { 'name': 'Penghancur Serangga', 'desc': 'Hancurkan total 5.000 serangga.' },
      'kills50k': { 'name': 'Legenda', 'desc': 'Hancurkan total 50.000 serangga.' },
      'height10': { 'name': 'Menjulang', 'desc': 'Bangun menara setinggi 10 blok.' },
      'height20': { 'name': 'Penembus Awan', 'desc': 'Bangun menara setinggi 20 blok.' },
      'blocks250': { 'name': 'Pembangun', 'desc': 'Pasang total 250 blok.' },
      'blocks2k': { 'name': 'Arsitek', 'desc': 'Pasang total 2.000 blok.' },
      'coins5k': { 'name': 'Kolektor Koin', 'desc': 'Dapatkan total 5.000 koin.' },
      'coins50k': { 'name': 'Bendahara', 'desc': 'Dapatkan total 50.000 koin.' },
      'runs25': { 'name': 'Gigih', 'desc': 'Mulai 25 pengepungan.' }
    }
  },

  'missions': {
    'title': 'Misi Harian', 'subtitle': 'Selesaikan tujuan tiap hari untuk mendapatkan koin.',
    'claim': 'Ambil', 'done': 'Diambil',
    'types': {
      'coins': 'Dapatkan {n} koin hari ini',
      'waves': 'Bertahan sampai gelombang {n} dalam satu pengepungan',
      'kills': 'Hancurkan {n} serangga hari ini',
      'blocks': 'Pasang {n} blok hari ini'
    }
  },

  'battlePass': {
    'title': 'Battle Pass', 'progress': '{current} / {total}', 'daysLeft': 'Sisa {n} h',
    'maxed': 'BATTLE PASS SELESAI', 'xpProgress': '{current} / {total} XP',
    'howToEarn': 'Cara mendapat XP', 'perRun': 'per pengepungan', 'perWave': 'per gelombang yang ditahan',
    'unlockHint': 'Capai {n} XP untuk membuka hadiah berikutnya — hadiah yang belum diambil tetap tersimpan.'
  },

  'dailyRewards': {
    'title': 'Hadiah Harian', 'subtitle': 'Masuk setiap hari untuk menjaga rentetanmu.',
    'day': 'Hari {n}', 'dayShort': 'H{n}'
  },

  'options': {
    'title': 'Opsi', 'general': 'Umum', 'audio': 'Audio', 'language': 'Bahasa',
    'difficulty': 'Kesulitan', 'soundEffects': 'Efek Suara', 'music': 'Musik', 'musicTrack': 'Trek Musik',
    'musicTracks': { 'cozy': 'Harmoni Nyaman', 'trance': 'Terowongan Trance' },
    'close': 'Simpan & Tutup',
    'difficulties': { 'easy': 'Mudah', 'medium': 'Sedang', 'hard': 'Sulit' },
    'difficultyHints': {
      'easy': 'Gelombang lebih kecil dan serangga lebih lemah.',
      'medium': 'Pengepungan standar yang seimbang.',
      'hard': 'Gelombang lebih padat dan serangga lebih tangguh.'
    }
  },

  'adsBlocked': {
    'title': 'Tidak dapat menampilkan iklan',
    'body': 'Kami mencoba menampilkan video agar kamu bisa mendapat hadiah, tetapi ada yang memblokir iklan di peramban kamu.',
    'allowPrefix': 'Izinkan iklan di',
    'allowSuffix': '(atau jeda pemblokir iklan untuk gim ini) lalu coba lagi.',
    'gotIt': 'Mengerti'
  },
  'saveStatus': {
    'restoredTitle': 'Simpanan cloud dipulihkan', 'restoredBody': '+{n} koin bonus untuk pemulihan',
    'tap': 'ketuk', 'pausedTitle': 'Sinkronisasi cloud dijeda',
    'pausedBody': 'Bermain offline. Progresmu disimpan di sini.',
    'retry': 'Coba lagi', 'dismiss': 'tutup'
  },
  'loading': { 'tooLong': 'Memuat terlalu lama? Nonaktifkan pemblokir iklan lalu muat ulang.' },
  'license': { 'denied': 'Akses ditolak: silakan beli lisensi.' }
}
