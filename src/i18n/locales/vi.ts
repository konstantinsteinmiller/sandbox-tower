export default {
  'gameName': 'Sandbox Tower',
  'cancel': 'Hủy',
  'close': 'Đóng',
  'ok': 'OK',
  'continue': 'Tiếp tục',
  'tapToContinue': 'Chạm để tiếp tục',
  'clickToContinue': 'Nhấp để tiếp tục',
  'rewards': 'PHẦN THƯỞNG',
  'tip': 'Mẹo',
  'crazyGamesOnly': 'Trò chơi này chỉ có trên',

  // ─── Mobile-fit game (Drop & Merge) ───────────────────────────────────────
  'gift': {
    'free': 'Miễn phí',
    'tile': '{name} miễn phí, cấp {n}: chạm vào, rồi chạm lên bàn để đặt',
    'pair': 'Cặp {name} miễn phí: chạm vào, rồi chạm lên bàn để đặt',
    'tilePaid': '{name}, cấp {n}, giá một nửa: chạm vào, rồi chạm lên bàn để đặt',
    'pairPaid': 'Cặp {name} giá một nửa: chạm vào, rồi chạm lên bàn để đặt',
    'discount': '-{n}%',
    'chest': 'Rương bay: chạm để mở',
    'firstClear': 'Qua đợt {n}! Quà cho bạn'
  },

  'mobile': {
    'rotatePortrait': 'Cầm điện thoại theo chiều dọc để chơi',
    'columnFull': 'Cột đã đầy',
    'repairAll': 'Sửa tất cả',
    'volley': 'Loạt tên',
    'swap': 'Đổi',
    'menu': 'Menu',
    'materials': 'vật liệu',
    'zoom': 'Thu phóng'
  },

  'hud': {
    'wave': 'Đợt', 'enemies': 'Côn trùng', 'callWave': 'Gọi đợt', 'callBoss': 'Gọi trùm',
    'monstersIncoming': 'Côn trùng đang đến!',
    'skip': 'Bỏ qua',
    'speed': 'Tốc độ {n}×',
    'speedOffer': 'Mở khóa tốc độ {n}×',
    'speedGroup': 'Tốc độ trò chơi', 'recenter': 'Căn giữa khung nhìn',
    'rotateLeft': 'Xoay trái',
    'rotateRight': 'Xoay phải',
    'arrowRain': 'Mưa Phi Tiêu',
    'arrowRainAim': 'Chạm vào chiến trường để gọi loạt bắn',
    'extendRange': '+{n}% tầm bắn'
  },


  // ─── The opening cutscene ─────────────────────────────────────────────────
  // Three lines across the ten-second fly-over west of the tower, one per beat:
  // the tower, the horde, the siege train. The fourth thing the player reads is
  // `hud.monstersIncoming`, shown over the engines rather than over the board.
  'intro': {
    'premise': 'Lâu đài cát của bạn là thứ cuối cùng còn đứng vững.',
    'horde': 'Côn trùng đã lên đường.',
    'siege': 'Và chúng đã tự chế ra cỗ máy.'
  },

  'warnings': {
    'hoard': 'Tích trữ +{n}%',
    'air': 'Đường không ×{n}',
    'sea': 'Nước ×{n}',
    'bombers': 'Bộc phá ×{n}',
    'siege': 'Công thành ×{n}',
    'outOfReach': 'Ngoài tầm bắn ×{n} — cần tầm {m}'
  },
  'hints': {
    'dropBlock': {
      'touch': 'Chạm vào một cột để thả khối',
      'desktop': 'Nhấp vào một cột để thả khối'
    },
    'mergeBlock': {
      'touch': 'Thả khối lên khối giống nó để hợp nhất',
      'desktop': 'Thả khối lên khối giống nó để hợp nhất'
    },
    'selectBlock': { 'touch': 'Chạm vào một khối bên dưới để chọn', 'desktop': 'Nhấp vào một khối bên dưới để chọn' },
    'placeBlock': { 'touch': 'Giờ hãy chạm vào ô phát sáng để xây', 'desktop': 'Giờ hãy nhấp vào ô phát sáng để xây' },
    'camera': { 'touch': 'Kéo để di chuyển · Chụm để phóng to', 'desktop': 'Kéo để di chuyển · Cuộn để phóng to' },
    'callWave': { 'touch': 'Chạm «Gọi đợt» khi tháp đã sẵn sàng', 'desktop': 'Nhấn Space để gọi đợt sớm' },
    'inspect': { 'touch': 'Giữ một khối để xem chi tiết', 'desktop': 'Nhấp một khối để xem chi tiết' }
  },

  'tips': {
    'eco': 'Rây cát và hố sỏi trả công mỗi đợt. Hai ba cái là đủ đổi những gì bạn mua nổi.',
    'buff': 'Cờ giấy tăng sức mọi khối nó chạm, và nhân lên. Hãy vây quanh một vũ khí đồ chơi thay vì rải ra.',
    'merge': 'Hai vũ khí giống nhau cạnh nhau sẽ gộp lại. Xếp hai cặp như vậy thành 2×2.',
    'spend': 'Bạn còn xu chưa tiêu. Cấp trong cây là vĩnh viễn, theo bạn sang mọi ván sau.',
    'branches': 'Ba cây riêng biệt: lâu đài, hồ bơi và xưởng. Không cây nào cần cây nào.',
    'shape': 'Tường phía trước, súng phía sau. Khối không bị đánh là khối không phải xây lại.',
    'gold': 'Vàng mua nâng cấp khối — chạm vào một khối. Heo đất đúc thêm mỗi đợt.',
    'siegeReach': 'Máy bắn đá bút chì đứng xa hơn tầm của súng bắn phi tiêu, súng nước hay súng bắn bóng nước. Hãy đáp trả bằng Súng cối bùn — hoặc Tàu cướp biển đồ chơi từ hồ bơi.'
  },
  'blocks': {
    'fortify': 'Gắn tăm',
    'sell': 'Bán',
    'mergeTier': 'Hợp nhất {n}×',
    'upgrade': 'Nâng cấp',
    'upgradeMax': 'Đã nâng cấp tối đa',
    'rank': 'Cấp {n}/{max}',
    'reinforced': 'Gia cố',
    'roofed': 'Có mái',
    'roofNote': 'Có mái — gấp đôi HP, phòng thủ gấp ba trước đòn từ trên. Cần trống phía trên.',
    'enhancedNote': 'Gia cố — +{hp}% HP, +{dmg}% sát thương.',
    'enhancedHand': 'Bộ khối gia cố',
    'reroll': 'Đổi mảnh này',
    'kinds': {
      'buff': 'Tăng cường', 'core': 'Lõi', 'structure': 'Kết cấu', 'weapon': 'Vũ khí', 'economy': 'Kinh tế', 'utility': 'Tiện ích', 'ship': 'Thuyền' },
    'stats': {
      'yieldGold': 'Vàng / đợt',
      'buff': 'Tăng cho khối kề',
      'topDefense': 'Phòng thủ trên',
      'hp': 'HP', 'armor': 'Giáp', 'dmg': 'Sát thương', 'cooldown': 'Hồi chiêu', 'range': 'Tầm bắn',
      'splash': 'Diện rộng', 'yieldWood': 'Cát / đợt', 'yieldStone': 'Sỏi / đợt', 'yieldCoins': 'Xu / đợt',
      'repair': 'Sửa chữa / đợt', 'blast': 'Vụ nổ',
      'thorns': 'Gai'
    },
    'names': {
      'banner': 'Cờ Giấy',
      'obelisk': 'Vỏ Sò Phép',
      'lumberHut': 'Rây Cát',
      'stonepit': 'Hố Sỏi',
      'coffer': 'Heo Đất',
      'skiff': 'Thuyền Giấy', 'longship': 'Vịt Cao Su', 'galley': 'Tàu Cướp Biển Đồ Chơi',
      'gate': 'Cổng Lâu Đài', 'wood': 'Khối Cát', 'brace': 'Cát Nén', 'stone': 'Tường Sỏi',
      'archer': 'Súng Bắn Phi Tiêu', 'cannon': 'Súng Nước', 'mortar': 'Súng Cối Bùn', 'tesla': 'Đèn Diệt Côn Trùng',
      'frost': 'Kem Que', 'repair': 'Xô Và Xẻng',
      'spikes': 'Tường Tăm',
      'bombard': 'Súng Bắn Bóng Nước'
    },
    'descriptions': {
      'banner': 'Tăng sức mọi khối liền kề. Hai lá cờ giấy cạnh một khối sẽ cộng dồn.',
      'obelisk': 'Cờ giấy mạnh hơn. Hào quang nhân lên — hai cái đáng giá hơn gấp đôi rất nhiều.',
      'lumberHut': 'Rây cát vào cuối mỗi đợt đã dọn sạch.',
      'stonepit': 'Đào sỏi vào cuối mỗi đợt đã dọn sạch.',
      'coffer': 'Đúc vàng mỗi đợt — loại tiền dùng để nâng cấp khối.',
      'skiff': 'Nổi trên hồ bơi. Bắn trúng côn trùng dưới mặt nước.',
      'longship': 'Lao phi tiêu nặng. Chắc chắn và tầm xa hơn bờ.',
      'galley': 'Súng bần và tổ quạ. Hồ bơi này là của bạn.',
      'gate': 'Trái tim của lâu đài cát. Mất nó là cuộc vây hãm kết thúc.',
      'wood': 'Vật liệu rẻ. Xương sống của mọi lâu đài thuở đầu.',
      'brace': 'Gấp đôi cát, hơn gấp đôi độ bền.',
      'stone': 'Nặng và có giáp. Hợp nhất cho phần móng.',
      'archer': 'Phi tiêu xốp nhanh vào một mục tiêu. Bắn được kẻ bay.',
      'cannon': 'Chậm nhưng sát thương diện rộng lớn. Làm ướt sũng đám đông dày đặc.',
      'mortar': 'Banh bùn vòng cung tầm xa — nhưng không bắn được kẻ bay.',
      'tesla': 'Tia điện nhảy giữa các côn trùng gần nhau.',
      'frost': 'Đóng băng cả nhóm và làm chậm chúng nghiêm trọng.',
      'repair': 'Sửa các khối liền kề giữa các đợt.',
      'spikes': 'Kẻ tấn công tự đâm mình sau mỗi đòn đánh.',
      'bombard': 'Bắn bóng nước thẳng lên cao. Splash nhỏ, chỉ nhắm côn trùng mặt đất.'
    },
    'repair': 'Sửa chữa',
    'repairCooldown': '{n} giây',
    'reposition': 'Di chuyển khối này'
  },

  'enemies': {
    'names': {
      'grunt': 'Con Kiến', 'runner': 'Gián', 'slinger': 'Nhện', 'brute': 'Bọ Tê Giác',
      'bomber': 'Bọ Ném Bom', 'bat': 'Ruồi', 'bulwark': 'Bọ Cuộn Tròn', 'golem': 'Bọ Sừng Hươu',
      'wyvern': 'Ong Bắp Cày',
      'eel': 'Hổ Nước',
      'shark': 'Bọ Lặn',
      'kraken': 'Bọ Nước Khổng Lồ',
      'seadrake': 'Ấu Trùng Chuồn Chuồn',
      'ram': 'Cỗ Phá Thành Bút Chì',
      'ballista': 'Nỏ Dây Thun',
      'catapult': 'Máy Bắn Đá Thìa',
      'siegeTower': 'Tháp Hộp Nước Ép',
      'trebuchet': 'Máy Bắn Đá Bút Chì',
      'ironRam': 'Cỗ Phá Thành Lon Thiếc',
      'bombardier': 'Ong Nghệ',
      'firebug': 'Đom Đóm'
    }
  },

  // ─── Allies ───────────────────────────────────────────────────────────────
  'allies': {
    'cavalry': 'Hiệp Sĩ Đồ Chơi',
    'cavalryFree': 'Xuất kích miễn phí của hiệp sĩ đồ chơi',
    'free': 'Miễn phí',
    'outOfReachHint': 'Ngoài tầm bắn — cử hiệp sĩ ra hoặc tăng tầm bắn'
  },

  'result': {
    'towerFell': 'Bị phá huỷ!',
    'reachedWave': 'Bạn trụ được đến đợt {n}',
    'newRecord': 'Kỷ lục mới!',
    'upgrade': 'Nâng cấp!',
    'defendAgain': 'Phòng thủ lại',
    'continueRun': 'Xây lại & tiếp tục',
    'continueWave': 'Đợt {n}',
    'tripleCoins': 'Gấp ba số xu',
    'tripleWave': '3× vàng — {n}',
    'waveCleared': 'Đã chặn đợt {n}!',
    'scoreLabel': 'Điểm',
    'bestLabel': 'Điểm cao nhất',
    'scoreCurrent': '({n} lần này)',
    'rankLabel': 'Hạng',
    'rankOf': 'trên {n}'
  },

  'tech': {
    'blueprints': {
      'title': 'Bản thiết kế'
    },
    'intro1': 'Mọi thứ bạn mua ở đây là vĩnh viễn và theo bạn sang mọi lượt chơi sau.',
    'intro2': 'Xu đến từ mỗi trận vây hãm, dù thắng hay thua. Đây là nơi tiêu chúng.',
    'intro3': 'Nút vàng bạn mua được ngay. Nút xanh cần thêm xu, nút mờ cần nút phía trước.',
    'introNext': 'Tiếp',
    'introDone': 'Đã hiểu',
    'sell': 'Bán cấp',
    'sellBlocked': 'Bán {n} trước — nó cần cái này.',
    'title': 'Cây công nghệ',
    'rank': 'Bậc {current}/{total}',
    'maxed': 'Tối đa',
    'rankOpen': 'Cấp {n}',
    'atRank': 'Ở cấp {r}: tổng {n}',
    'owned': 'Đã mở',
    'requires': 'Cần {n}',
    'spotlight': 'Hãy tiêu!',
    'names': {
      'm2_lumberHut': 'Rây Cát',
      'logistics': 'Đội Đào Đất',
      'unlockCoffer': 'Heo Đất',
      'yields': 'Sản lượng',
      'unlockObelisk': 'Vỏ Sò Phép',
      'rallyCry': 'Tiếng hô xung trận',
      'stockpiles': 'Kho dự trữ',
      'forgeWelds': 'Keo Siêu Dính',
      'harbour': 'Hồ Bơi', 'dockWorks': 'Hồ Bơi Lớn Hơn',
      'unlockLongship': 'Vịt Cao Su', 'seasonedHulls': 'Thuyền Chắc Chắn',
      'navalGunnery': 'Súng Trên Thuyền', 'unlockGalley': 'Tàu Cướp Biển Đồ Chơi',
      'admiralty': 'Đô Đốc Vịt',
      'foundations': 'Nền móng', 'sharpBolts': 'Phi Tiêu Nhọn', 'unlockBrace': 'Cát Nén',
      'lumberStock': 'Kho Cát', 'longSight': 'Tầm nhìn xa', 'rapidFire': 'Bắn nhanh',
      'reinforced': 'Hỗn Hợp Cát Ướt', 'unlockSawmill': 'Cát Giàu', 'quarryStock': 'Kho Sỏi',
      'unlockMortar': 'Súng Cối Bùn', 'heavyOrdnance': 'Splash Lớn Hơn', 'unlockTesla': 'Đèn Diệt Côn Trùng',
      'gateArmor': 'Giáp cổng', 'unlockQuarry': 'Đào Sâu Hơn', 'richHauls': 'Chiến lợi phẩm dồi dào',
      'wideFoundation': 'Nền móng rộng', 'siegeShells': 'Súng Nước Siêu Mạnh', 'unlockFrost': 'Kem Que',
      'forkedBolts': 'Điện Phân Nhánh', 'ironPlating': 'Cát Cứng', 'unlockRepair': 'Xô Và Xẻng',
      'unlockMint': 'Bản Đồ Kho Báu', 'looting': 'Cướp bóc', 'overcharge': 'Quá tải',
      'masterwork': 'Kiệt tác', 'fieldRepairs': 'Sửa chữa dã chiến', 'greatFoundation': 'Đại nền móng',
      'warChest': 'Rương Kho Báu',
      'unlockSpikes': 'Tường Tăm',
      'unlockBombard': 'Súng Bắn Bóng Nước',
      'sharpSpikes': 'Tăm Nhọn',
      'cavalryDrill': 'Huấn Luyện Hiệp Sĩ',
      'artilleryDoctrine': 'Bắn Xa'
    },
    'descriptions': {
      'm2_lumberHut': 'Mở khóa Rây Cát — cho cát sau mỗi đợt.',
      'logistics': 'Mở khoá Hố Sỏi — nhà sản xuất rẻ, mua được ngay trong ván cần nó.',
      'unlockCoffer': 'Mở khoá Heo Đất, khối duy nhất đúc ra vàng.',
      'yields': 'Mỗi khối kinh tế cho thêm +{n}%.',
      'unlockObelisk': 'Mở khoá Vỏ Sò Phép, một hào quang mạnh hơn nhiều.',
      'rallyCry': 'Khối tăng cường mạnh thêm +{n}%.',
      'stockpiles': 'Mỗi khối kinh tế cho thêm +{n}%.',
      'forgeWelds': 'Khối hợp nhất tạo ra nhiều hơn +{n}% mỗi bậc: sát thương, gai và sản lượng.',
      'harbour': 'Thả thuyền nổi trên hồ bơi. Chỉ chúng bắn được côn trùng chìm.',
      'dockWorks': 'Thuyền nổi xa thêm {n} ô mỗi cấp.',
      'unlockLongship': 'Vịt cao su chắc chắn với lao phi tiêu nặng.',
      'seasonedHulls': 'Thuyền khởi đầu với +{n}% HP.',
      'navalGunnery': 'Vũ khí trên thuyền gây +{n}% sát thương.',
      'unlockGalley': 'Súng bần, tổ quạ và ván cầu.',
      'admiralty': 'Vũ khí trên thuyền gây thêm +{n}% sát thương.',
      'foundations': 'Mọi khối trên lâu đài khởi đầu với +{n}% HP.',
      'sharpBolts': 'Vũ khí trên lâu đài gây +{n}% sát thương mỗi bậc.',
      'unlockBrace': 'Mở khóa Cát Nén — HP gấp đôi khối cát thường.',
      'lumberStock': 'Bắt đầu mỗi cuộc vây hãm với +{n} cát mỗi bậc.',
      'longSight': 'Tầm bắn mọi vũ khí +{n}% mỗi bậc.',
      'rapidFire': 'Mọi vũ khí bắn nhanh hơn {n}% mỗi bậc.',
      'reinforced': 'Mọi khối trên lâu đài nhận +{n}% HP mỗi bậc.',
      'unlockSawmill': 'Mọi công trình sản xuất cho thêm +{n}% mỗi cấp.',
      'quarryStock': 'Bắt đầu mỗi cuộc vây hãm với +{n} sỏi mỗi bậc.',
      'unlockMortar': 'Mở khóa Súng Cối Bùn — sát thương diện rộng tầm xa.',
      'heavyOrdnance': 'Bán kính diện rộng +{n}% mỗi bậc.',
      'unlockTesla': 'Mở khóa Đèn Diệt Côn Trùng — tia điện nhảy giữa côn trùng.',
      'gateArmor': 'Cổng lâu đài nhận +{n}% HP mỗi bậc.',
      'unlockQuarry': 'Mọi công trình sản xuất cho thêm +{n}% nữa mỗi cấp.',
      'richHauls': 'Phần thưởng đợt +{n}% mỗi bậc.',
      'wideFoundation': 'Xây rộng thêm {n} cột mỗi bậc.',
      'siegeShells': 'Vũ khí trên lâu đài gây +{n}% sát thương mỗi bậc.',
      'unlockFrost': 'Mở khóa Kem Que — làm chậm cả nhóm.',
      'forkedBolts': 'Điện nhảy thêm {n} côn trùng mỗi bậc.',
      'ironPlating': 'Mọi khối nhận +{n} giáp mỗi bậc.',
      'unlockRepair': 'Mở khóa Xô Và Xẻng — hồi máu khối liền kề mỗi đợt.',
      'unlockMint': 'Mọi công trình sản xuất cho thêm +{n}% nữa mỗi cấp.',
      'looting': 'Côn trùng rơi thêm {n}% xu mỗi bậc.',
      'overcharge': 'Mọi vũ khí bắn nhanh hơn {n}% mỗi bậc.',
      'masterwork': 'Vũ khí trên lâu đài gây +{n}% sát thương mỗi bậc.',
      'fieldRepairs': 'Mỗi đợt chặn được, mỗi khối hồi {n}% HP tối đa cho mỗi bậc.',
      'greatFoundation': 'Xây rộng thêm {n} cột nữa mỗi bậc.',
      'warChest': 'Phần thưởng đợt +{n}% mỗi bậc.',
      'unlockSpikes': 'Mở khoá Tường Tăm — kẻ tấn công tự đâm mình.',
      'unlockBombard': 'Mở khoá Súng Bắn Bóng Nước — bóng nước tầm gần nhắm vào côn trùng mặt đất.',
      'sharpSpikes': 'Tường tăm phản lại thêm +{n}% sát thương mỗi cấp.',
      'cavalryDrill': 'Hiệp sĩ đồ chơi xuất trận với +{n}% HP và sát thương mỗi cấp.',
      'artilleryDoctrine': 'Mọi vũ khí bắn xa thêm +{n}% mỗi cấp.'
    }
  },

  'resources': {
    'wood': 'cát',
    'stone': 'sỏi',
    'gold': 'vàng'
  },

  'ads': {
    'watch': 'Xem', 'revive': 'Hồi sinh', 'secondChance': 'Cơ hội thứ hai',
    'doubleCoins': '2× xu', 'plusCoins': '+{n} xu'
  },

  'achievements': {
    'title': 'Thành tựu', 'subtitle': 'Đạt các cột mốc tích lũy để nhận xu.',
    'claim': 'Nhận', 'claimed': 'Đã nhận', 'progress': '{c} / {t}',
    'items': {
      'wave5': { 'name': 'Chống cự đầu tiên', 'desc': 'Trụ đến đợt 5.' },
      'wave10': { 'name': 'Thành trì', 'desc': 'Trụ đến đợt 10.' },
      'wave20': { 'name': 'Lũy vững', 'desc': 'Trụ đến đợt 20.' },
      'wave30': { 'name': 'Bất khả phá', 'desc': 'Trụ đến đợt 30.' },
      'waves50': { 'name': 'Đê chắn sóng', 'desc': 'Chặn tổng cộng 50 đợt.' },
      'waves250': { 'name': 'Cựu binh công thành', 'desc': 'Chặn tổng cộng 250 đợt.' },
      'kills500': { 'name': 'Người bảo vệ', 'desc': 'Đập tổng cộng 500 côn trùng.' },
      'kills5k': { 'name': 'Kẻ Đập Côn Trùng', 'desc': 'Đập tổng cộng 5.000 côn trùng.' },
      'kills50k': { 'name': 'Huyền thoại', 'desc': 'Đập tổng cộng 50.000 côn trùng.' },
      'height10': { 'name': 'Vươn trời', 'desc': 'Xây tháp cao 10 khối.' },
      'height20': { 'name': 'Xuyên mây', 'desc': 'Xây tháp cao 20 khối.' },
      'blocks250': { 'name': 'Thợ xây', 'desc': 'Đặt tổng cộng 250 khối.' },
      'blocks2k': { 'name': 'Kiến trúc sư', 'desc': 'Đặt tổng cộng 2.000 khối.' },
      'coins5k': { 'name': 'Nhà sưu tầm xu', 'desc': 'Kiếm tổng cộng 5.000 xu.' },
      'coins50k': { 'name': 'Thủ quỹ', 'desc': 'Kiếm tổng cộng 50.000 xu.' },
      'runs25': { 'name': 'Kiên trì', 'desc': 'Bắt đầu 25 cuộc vây hãm.' }
    }
  },

  'missions': {
    'title': 'Nhiệm vụ hằng ngày', 'subtitle': 'Hoàn thành mục tiêu mỗi ngày để nhận xu.',
    'claim': 'Nhận', 'done': 'Đã nhận',
    'types': {
      'coins': 'Kiếm {n} xu hôm nay',
      'waves': 'Trụ đến đợt {n} trong một cuộc vây hãm',
      'kills': 'Đập {n} côn trùng hôm nay',
      'blocks': 'Đặt {n} khối hôm nay'
    }
  },

  'battlePass': {
    'title': 'Battle Pass', 'progress': '{current} / {total}', 'daysLeft': 'Còn {n} ngày',
    'maxed': 'ĐÃ HOÀN THÀNH BATTLE PASS', 'xpProgress': '{current} / {total} XP',
    'howToEarn': 'Cách kiếm XP', 'perRun': 'mỗi cuộc vây hãm', 'perWave': 'mỗi đợt chặn được',
    'unlockHint': 'Đạt {n} XP để mở phần thưởng tiếp theo — phần thưởng chưa nhận vẫn được giữ.'
  },

  'dailyRewards': {
    'title': 'Phần thưởng hằng ngày', 'subtitle': 'Đăng nhập mỗi ngày để giữ chuỗi.',
    'day': 'Ngày {n}', 'dayShort': 'N{n}'
  },

  'options': {
    'title': 'Tùy chọn', 'general': 'Chung', 'audio': 'Âm thanh', 'language': 'Ngôn ngữ',
    'difficulty': 'Độ khó', 'soundEffects': 'Hiệu ứng âm thanh', 'music': 'Nhạc', 'musicTrack': 'Bản nhạc',
    'musicTracks': { 'cozy': 'Giai điệu ấm cúng', 'trance': 'Đường hầm Trance' },
    'close': 'Lưu & Đóng',
    'difficulties': { 'easy': 'Dễ', 'medium': 'Trung bình', 'hard': 'Khó' },
    'difficultyHints': {
      'easy': 'Đợt nhỏ hơn và côn trùng yếu hơn.',
      'medium': 'Cuộc vây hãm tiêu chuẩn, cân bằng.',
      'hard': 'Đợt dày đặc hơn và côn trùng cứng cáp hơn.'
    }
  },

  'adsBlocked': {
    'title': 'Không thể hiển thị quảng cáo',
    'body': 'Chúng tôi đã thử phát video để bạn nhận thưởng, nhưng có gì đó trên trình duyệt đang chặn quảng cáo.',
    'allowPrefix': 'Vui lòng cho phép quảng cáo trên',
    'allowSuffix': '(hoặc tạm dừng trình chặn quảng cáo cho trò chơi này) rồi thử lại.',
    'gotIt': 'Đã hiểu'
  },
  'saveStatus': {
    'restoredTitle': 'Đã khôi phục lưu trên đám mây', 'restoredBody': '+{n} xu thưởng cho việc khôi phục',
    'tap': 'chạm', 'pausedTitle': 'Đã tạm dừng đồng bộ đám mây',
    'pausedBody': 'Đang chơi ngoại tuyến. Tiến trình được lưu tại đây.',
    'retry': 'Thử lại', 'dismiss': 'bỏ qua'
  },
  'loading': { 'tooLong': 'Tải quá lâu? Hãy tắt trình chặn quảng cáo rồi làm mới trang.' },
  'license': { 'denied': 'Từ chối truy cập: vui lòng mua giấy phép.' }
}
