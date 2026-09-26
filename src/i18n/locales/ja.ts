export default {
  'gameName': 'Sandbox Tower',
  'cancel': 'キャンセル',
  'close': '閉じる',
  'ok': 'OK',
  'continue': '続ける',
  'tapToContinue': 'タップして続ける',
  'clickToContinue': 'クリックして続ける',
  'rewards': '報酬',
  'tip': 'ヒント',
  'crazyGamesOnly': 'このゲームは以下でのみプレイできます：',

  // ─── Mobile-fit game (Drop & Merge) ───────────────────────────────────────
  'gift': {
    'free': '無料',
    'tile': '無料の{name}（レベル{n}）：タップしてから盤面をタップして置こう',
    'pair': '無料の{name}ペア：タップしてから盤面をタップして置こう',
    'tilePaid': '{name}（レベル{n}）半額：タップしてから盤面をタップして置こう',
    'pairPaid': '{name}ペア半額：タップしてから盤面をタップして置こう',
    'discount': '-{n}%',
    'chest': '空飛ぶ宝箱：タップして開けよう',
    'firstClear': 'ウェーブ{n}クリア！プレゼントだよ'
  },

  'mobile': {
    'rotatePortrait': '縦向きに持ってプレイしてください',
    'columnFull': '列がいっぱいです',
    'repairAll': 'すべて修理',
    'volley': '一斉射撃',
    'swap': '交換',
    'menu': 'メニュー',
    'materials': '資材',
    'zoom': 'ズーム'
  },

  'hud': {
    'wave': 'ウェーブ', 'enemies': '虫', 'callWave': 'ウェーブを呼ぶ', 'callBoss': 'ボスを呼ぶ',
    'monstersIncoming': '虫襲来！',
    'skip': 'スキップ',
    'speed': '速度 {n}×',
    'speedOffer': '{n}×速度を解放',
    'speedGroup': 'ゲーム速度', 'recenter': '視点を戻す',
    'rotateLeft': '左に回転',
    'rotateRight': '右に回転',
    'arrowRain': 'ダーツの雨',
    'arrowRainAim': '戦場をタップして一斉射を呼びます',
    'extendRange': '射程 +{n}%'
  },


  // ─── The opening cutscene ─────────────────────────────────────────────────
  // Three lines across the ten-second fly-over west of the tower, one per beat:
  // the tower, the horde, the siege train. The fourth thing the player reads is
  // `hud.monstersIncoming`, shown over the engines rather than over the board.
  'intro': {
    'premise': 'この砂のお城が、最後に残された砦だ。',
    'horde': '虫の群れはすでに進軍している。',
    'siege': 'しかもガラクタ兵器を引き連れている。'
  },

  'warnings': {
    'hoard': '備蓄 +{n}%',
    'air': '空 ×{n}',
    'sea': '水 ×{n}',
    'bombers': '爆発 ×{n}',
    'siege': '攻城 ×{n}',
    'outOfReach': '射程外 ×{n} — 射程{m}が必要'
  },
  'hints': {
    'dropBlock': {
      'touch': '列をタップしてピースを落とす',
      'desktop': '列をクリックしてピースを落とす'
    },
    'mergeBlock': {
      'touch': '同じピースの上に落とすと合体します',
      'desktop': '同じピースの上に落とすと合体します'
    },
    'selectBlock': { 'touch': '下のブロックをタップして選択', 'desktop': '下のブロックをクリックして選択' },
    'placeBlock': { 'touch': '光っているマスをタップして建設', 'desktop': '光っているマスをクリックして建設' },
    'camera': { 'touch': 'ドラッグで移動 · ピンチでズーム', 'desktop': 'ドラッグで移動 · スクロールでズーム' },
    'callWave': { 'touch': 'タワーの準備ができたら「ウェーブを呼ぶ」をタップ', 'desktop': 'スペースキーで早めにウェーブを呼ぶ' },
    'inspect': { 'touch': 'ブロックを長押しで詳細を表示', 'desktop': 'ブロックをクリックで詳細を表示' }
  },

  'tips': {
    'eco': '砂ふるいと砂利掘りは毎ウェーブ産出します。2〜3個で買えるものが変わります。',
    'buff': '紙の旗は触れたブロックすべてを強化し、効果は乗算されます。散らさずおもちゃの武器を1つ囲みましょう。',
    'merge': '隣り合う同じ武器は合体します。それを2つ重ねて2×2にしましょう。',
    'spend': 'コインが余っています。ツリーのランクは永続で、以降すべてのプレイに残ります。',
    'branches': '独立した3つのツリー：城・プール・工房。どれも他を必要としません。',
    'shape': '壁は前、砲は後ろ。当たらないブロックは建て直す必要もありません。',
    'gold': '金はブロック強化に使えます。ブロックをタップ。貯金箱が毎ウェーブ鋳造します。',
    'siegeReach': '鉛筆投石機はダーツ銃・水鉄砲・風船砲のどれも届かない距離に構えます。答えは泥鉄砲、あるいはプールのおもちゃの海賊船です。'
  },
  'blocks': {
    'fortify': 'ようじを刺す',
    'sell': '売却',
    'mergeTier': '合成 {n}×',
    'upgrade': 'アップグレード',
    'upgradeMax': '最大強化済み',
    'rank': 'Lv {n}/{max}',
    'reinforced': '強化済み',
    'roofed': '屋根付き',
    'roofNote': '屋根付き — HP2倍、上からの攻撃に防御3倍。上に空きが必要。',
    'enhancedNote': '強化済み — HP +{hp}%、ダメージ +{dmg}%。',
    'enhancedHand': '強化ブロック',
    'reroll': 'このピースを交換',
    'kinds': {
      'buff': '強化', 'core': 'コア', 'structure': '構造', 'weapon': '兵器', 'economy': '経済', 'utility': '特殊', 'ship': 'ボート' },
    'stats': {
      'yieldGold': '金 / ウェーブ',
      'buff': '隣接強化',
      'topDefense': '上面防御',
      'hp': 'HP', 'armor': '装甲', 'dmg': 'ダメージ', 'cooldown': 'クールダウン', 'range': '射程',
      'splash': '範囲', 'yieldWood': '砂 / ウェーブ', 'yieldStone': '砂利 / ウェーブ', 'yieldCoins': 'コイン / ウェーブ',
      'repair': '修理 / ウェーブ', 'blast': '爆発',
      'thorns': '棘'
    },
    'names': {
      'banner': '紙の旗',
      'obelisk': '魔法の貝殻',
      'lumberHut': '砂ふるい',
      'stonepit': '砂利掘り',
      'coffer': '貯金箱',
      'skiff': '紙の船', 'longship': 'ゴムのアヒル', 'galley': 'おもちゃの海賊船',
      'gate': '城門', 'wood': '砂ブロック', 'brace': '固めた砂', 'stone': '石垣',
      'archer': 'ダーツ銃', 'cannon': '水鉄砲', 'mortar': '泥鉄砲', 'tesla': '電撃殺虫器',
      'frost': 'アイスバー', 'repair': 'バケツとスコップ',
      'spikes': 'ようじ壁',
      'bombard': '風船砲'
    },
    'descriptions': {
      'banner': '隣接するすべてのブロックを強化します。同じブロックに旗を2本重ねると効果も重なります。',
      'obelisk': 'より強力な旗。オーラは乗算されるため、2つは2倍よりはるかに強力です。',
      'lumberHut': 'ウェーブを凌ぐたびに砂をふるいます。',
      'stonepit': 'ウェーブを凌ぐたびに砂利を掘り出します。',
      'coffer': '毎ウェーブ金を鋳造します。ブロック強化に使う通貨です。',
      'skiff': '堀に浮かびます。水面下の虫にも当たる。',
      'longship': '重いダーツ銛。頑丈で、岸より射程が長い。',
      'galley': 'コルク砲と見張り台。堀はあなたのものだ。',
      'gate': 'あなたの城の心臓部。失えば包囲戦は終了です。',
      'wood': '安価な埋め草。序盤の城の背骨。',
      'brace': '砂の2倍、耐久はそれ以上。',
      'stone': '重くて装甲付き。土台に最適。',
      'archer': '単体への高速なダーツ。飛ぶ虫にも当たります。',
      'cannon': '低速だが強力な範囲攻撃。密集した虫をずぶ濡れにします。',
      'mortar': '長射程の放物線を描く泥玉。ただし飛ぶ虫には当たりません。',
      'tesla': '近くの虫へ跳ねる電撃。',
      'frost': '集団ごと凍らせて大幅に減速。',
      'repair': 'ウェーブの合間に隣接ブロックを修理。',
      'spikes': '攻撃した虫は毎回ようじに刺さります。',
      'bombard': '水風船を真上に打ち上げます。小さな水しぶき、地上の虫のみ。'
    },
    'repair': '修理',
    'repairCooldown': '{n}秒',
    'reposition': 'このブロックを移動'
  },

  'enemies': {
    'names': {
      'grunt': 'アリ', 'runner': 'ゴキブリ', 'slinger': 'クモ', 'brute': 'カブトムシ',
      'bomber': 'ヘッピリムシ', 'bat': 'ハエ', 'bulwark': 'ダンゴムシ', 'golem': 'クワガタムシ',
      'wyvern': 'スズメバチ',
      'eel': 'ミズトラ',
      'shark': 'ゲンゴロウ',
      'kraken': 'タガメ',
      'seadrake': 'ヤゴ',
      'ram': '鉛筆ラム',
      'ballista': '輪ゴム鉄砲',
      'catapult': 'スプーン投石機',
      'siegeTower': 'ジュースタワー',
      'trebuchet': '鉛筆投石機',
      'ironRam': '缶詰ラム',
      'bombardier': 'マルハナバチ',
      'firebug': 'ホタル'
    }
  },

  // ─── Allies ───────────────────────────────────────────────────────────────
  'allies': {
    'cavalry': 'おもちゃの騎士',
    'cavalryFree': '無料の騎士出撃',
    'free': '無料',
    'outOfReachHint': '射程外 — 騎士を出すか射程を伸ばそう'
  },

  'result': {
    'towerFell': '崩壊！',
    'reachedWave': 'ウェーブ {n} まで耐えました',
    'newRecord': '新記録！',
    'upgrade': '強化！',
    'defendAgain': 'もう一度防衛',
    'continueRun': '再建して続行',
    'continueWave': 'ウェーブ {n}',
    'tripleCoins': 'コイン3倍',
    'tripleWave': 'コイン3倍 — {n}',
    'waveCleared': 'ウェーブ {n} を防衛！',
    'scoreLabel': 'スコア',
    'bestLabel': '最高スコア',
    'scoreCurrent': '(今回 {n})',
    'rankLabel': '順位',
    'rankOf': '{n} 人中'
  },

  'tech': {
    'blueprints': {
      'title': '設計図'
    },
    'intro1': 'ここで買ったものはすべて永続します。以降のすべてのプレイに引き継がれます。',
    'intro2': 'コインは勝敗を問わず、包囲戦ごとに手に入ります。使う場所はここです。',
    'intro3': '金色のノードは今すぐ買えます。青はコイン不足、暗いものは前提ノードが必要です。',
    'introNext': '次へ',
    'introDone': 'わかった',
    'sell': 'ランクを売却',
    'sellBlocked': 'まず{n}を売却してください（前提です）。',
    'title': 'テックツリー',
    'rank': 'ランク {current}/{total}',
    'maxed': '最大',
    'rankOpen': 'ランク {n}',
    'atRank': 'ランク {r}：合計 {n}',
    'owned': '解放済み',
    'requires': '必要：{n}',
    'spotlight': '使おう！',
    'names': {
      'm2_lumberHut': '砂ふるい',
      'logistics': '掘り隊',
      'unlockCoffer': '貯金箱',
      'yields': '産出',
      'unlockObelisk': '魔法の貝殻',
      'rallyCry': '鬨の声',
      'stockpiles': '備蓄',
      'forgeWelds': 'ボンド',
      'harbour': 'プール', 'dockWorks': '大きなプール',
      'unlockLongship': 'ゴムのアヒル', 'seasonedHulls': '頑丈なボート',
      'navalGunnery': 'ボート砲撃', 'unlockGalley': 'おもちゃの海賊船',
      'admiralty': 'アヒル提督',
      'foundations': '基礎', 'sharpBolts': 'とがったダーツ', 'unlockBrace': '固めた砂',
      'lumberStock': '砂の備蓄', 'longSight': '遠見', 'rapidFire': '速射',
      'reinforced': '湿った砂', 'unlockSawmill': '良質な砂', 'quarryStock': '砂利の備蓄',
      'unlockMortar': '泥鉄砲', 'heavyOrdnance': '大きな水しぶき', 'unlockTesla': '電撃殺虫器',
      'gateArmor': 'ゲート装甲', 'unlockQuarry': '深堀り', 'richHauls': '豊かな戦利品',
      'wideFoundation': '広い基礎', 'siegeShells': '強力水鉄砲', 'unlockFrost': 'アイスバー',
      'forkedBolts': '分岐する電撃', 'ironPlating': '硬く固めた砂', 'unlockRepair': 'バケツとスコップ',
      'unlockMint': '宝の地図', 'looting': '略奪', 'overcharge': 'オーバーチャージ',
      'masterwork': '傑作', 'fieldRepairs': '野戦修理', 'greatFoundation': '大基礎',
      'warChest': '宝箱',
      'unlockSpikes': 'ようじ壁',
      'unlockBombard': '風船砲',
      'sharpSpikes': 'とがったようじ',
      'cavalryDrill': '騎士訓練',
      'artilleryDoctrine': 'ロングショット'
    },
    'descriptions': {
      'm2_lumberHut': '砂ふるいを解放 — 毎ウェーブ後に砂を産出。',
      'logistics': '砂利掘りを解放。必要なその走行中に買える安価な産出ブロックです。',
      'unlockCoffer': '金を鋳造する唯一のブロック、貯金箱を解放します。',
      'yields': '経済ブロックの産出量 +{n}%。',
      'unlockObelisk': 'はるかに強力な隣接強化、魔法の貝殻を解放します。',
      'rallyCry': '強化ブロックの効果 +{n}%。',
      'stockpiles': '経済ブロックの産出量 +{n}%。',
      'forgeWelds': '合成ブロックの出力がランクごとに +{n}%（ダメージ・棘・産出）。',
      'harbour': '堀にボートを浮かべます。潜行中の虫を撃てるのはボートだけ。',
      'dockWorks': 'ランクごとにボートを浮かべる範囲が{n}マス広がる。',
      'unlockLongship': '重いダーツ銛を積んだ頑丈なゴムのアヒル。',
      'seasonedHulls': 'ボートのHPが+{n}%で始まる。',
      'navalGunnery': 'ボートの武器のダメージ+{n}%。',
      'unlockGalley': 'コルク砲、見張り台、そして歩み板。',
      'admiralty': 'ボートの武器のダメージがさらに+{n}%。',
      'foundations': '城のすべてのブロックのHPが +{n}% で始まります。',
      'sharpBolts': '城の兵器のダメージがランクごとに +{n}%。',
      'unlockBrace': '固めた砂を解放——普通の砂ブロックの2倍のHP。',
      'lumberStock': '包囲戦開始時の砂がランクごとに +{n}。',
      'longSight': '全兵器の射程がランクごとに +{n}%。',
      'rapidFire': '全兵器の攻撃速度がランクごとに +{n}%。',
      'reinforced': '城の全ブロックのHPがランクごとに +{n}%。',
      'unlockSawmill': '各生産施設の産出がランクごとに+{n}%。',
      'quarryStock': '包囲戦開始時の砂利がランクごとに +{n}。',
      'unlockMortar': '泥鉄砲を解放——長射程の範囲ダメージ。',
      'heavyOrdnance': '範囲半径がランクごとに +{n}%。',
      'unlockTesla': '電撃殺虫器を解放——電撃が虫の間を跳ねます。',
      'gateArmor': '城門のHPがランクごとに +{n}%。',
      'unlockQuarry': '各生産施設の産出がランクごとにさらに+{n}%。',
      'richHauls': 'ウェーブ報酬がランクごとに +{n}%。',
      'wideFoundation': '建設可能幅がランクごとに {n} 列拡大。',
      'siegeShells': '城の兵器のダメージがランクごとに +{n}%。',
      'unlockFrost': 'アイスバーを解放——集団をまとめて減速。',
      'forkedBolts': '電撃の跳ね先がランクごとに {n} 匹増加。',
      'ironPlating': '全ブロックの装甲がランクごとに +{n}。',
      'unlockRepair': 'バケツとスコップを解放——毎ウェーブ隣接ブロックを修理。',
      'unlockMint': '各生産施設の産出がランクごとにさらに+{n}%。',
      'looting': '虫のコイン落とし量がランクごとに +{n}%。',
      'overcharge': '全兵器の攻撃速度がランクごとに +{n}%。',
      'masterwork': '城の兵器のダメージがランクごとに +{n}%。',
      'fieldRepairs': '防衛したウェーブごとに、各ブロックが最大HPの{n}%をランクごとに回復。',
      'greatFoundation': '建設可能幅がさらにランクごとに {n} 列拡大。',
      'warChest': 'ウェーブ報酬がランクごとに +{n}%。',
      'unlockSpikes': 'ようじ壁を解放 — 攻撃した虫はようじに刺さります。',
      'unlockBombard': '風船砲を解放 — 地上の虫への近距離水風船攻撃。',
      'sharpSpikes': 'ようじ壁の反射ダメージがランクごとに +{n}%。',
      'cavalryDrill': '騎士のHPとダメージがランクごとに +{n}%。',
      'artilleryDoctrine': '全兵器の射程がランクごとに +{n}%。'
    }
  },

  'resources': {
    'wood': '砂',
    'stone': '砂利',
    'gold': '金貨'
  },

  'ads': {
    'watch': '視聴', 'revive': '復活', 'secondChance': 'セカンドチャンス',
    'doubleCoins': '2× コイン', 'plusCoins': '+{n} コイン'
  },

  'achievements': {
    'title': '実績', 'subtitle': '累計マイルストーンを達成してコインを獲得。',
    'claim': '受け取る', 'claimed': '受取済', 'progress': '{c} / {t}',
    'items': {
      'wave5': { 'name': '最初の抵抗', 'desc': 'ウェーブ 5 まで耐える。' },
      'wave10': { 'name': '要塞', 'desc': 'ウェーブ 10 まで耐える。' },
      'wave20': { 'name': '防壁', 'desc': 'ウェーブ 20 まで耐える。' },
      'wave30': { 'name': '不屈', 'desc': 'ウェーブ 30 まで耐える。' },
      'waves50': { 'name': '波止め', 'desc': '累計 50 ウェーブを防衛。' },
      'waves250': { 'name': '包囲戦の古兵', 'desc': '累計 250 ウェーブを防衛。' },
      'kills500': { 'name': '守護者', 'desc': '累計 500 匹の虫を退治。' },
      'kills5k': { 'name': '虫退治マスター', 'desc': '累計 5,000 匹の虫を退治。' },
      'kills50k': { 'name': '伝説', 'desc': '累計 50,000 匹の虫を退治。' },
      'height10': { 'name': '天へ', 'desc': '高さ 10 ブロックのタワーを建設。' },
      'height20': { 'name': '雲を突く者', 'desc': '高さ 20 ブロックのタワーを建設。' },
      'blocks250': { 'name': 'ビルダー', 'desc': '累計 250 ブロックを設置。' },
      'blocks2k': { 'name': '建築家', 'desc': '累計 2,000 ブロックを設置。' },
      'coins5k': { 'name': 'コイン収集家', 'desc': '累計 5,000 コインを獲得。' },
      'coins50k': { 'name': '財務官', 'desc': '累計 50,000 コインを獲得。' },
      'runs25': { 'name': '粘り強い', 'desc': '25 回の包囲戦を開始。' }
    }
  },

  'missions': {
    'title': 'デイリーミッション', 'subtitle': '毎日目標を達成してコインを獲得。',
    'claim': '受け取る', 'done': '受取済',
    'types': {
      'coins': '今日 {n} コインを獲得',
      'waves': '1回の包囲戦でウェーブ {n} まで耐える',
      'kills': '今日 {n} 匹の虫を退治',
      'blocks': '今日 {n} ブロックを設置'
    }
  },

  'battlePass': {
    'title': 'バトルパス', 'progress': '{current} / {total}', 'daysLeft': '残り {n} 日',
    'maxed': 'バトルパス完了', 'xpProgress': '{current} / {total} XP',
    'howToEarn': 'XP の稼ぎ方', 'perRun': '包囲戦ごと', 'perWave': '防衛ウェーブごと',
    'unlockHint': '{n} XP で次の報酬が解放されます。未受取の報酬は消えません。'
  },

  'dailyRewards': {
    'title': 'デイリーボーナス', 'subtitle': '毎日ログインして連続記録を維持しよう。',
    'day': '{n} 日目', 'dayShort': 'D{n}'
  },

  'options': {
    'title': '設定', 'general': '一般', 'audio': 'オーディオ', 'language': '言語',
    'difficulty': '難易度', 'soundEffects': '効果音', 'music': '音楽', 'musicTrack': '楽曲',
    'musicTracks': { 'cozy': 'コージーハーモニー', 'trance': 'トランストンネル' },
    'close': '保存して閉じる',
    'difficulties': { 'easy': 'イージー', 'medium': 'ノーマル', 'hard': 'ハード' },
    'difficultyHints': {
      'easy': 'ウェーブが小さく、虫も弱め。',
      'medium': '標準でバランスの取れた包囲戦。',
      'hard': 'ウェーブが濃密で、虫も頑丈。'
    }
  },

  'adsBlocked': {
    'title': '広告を表示できませんでした',
    'body': '報酬獲得のために動画を表示しようとしましたが、ブラウザの何かが広告をブロックしています。',
    'allowPrefix': '次のサイトで広告を許可してください：',
    'allowSuffix': '（またはこのゲームのみ広告ブロッカーを一時停止）してから再試行してください。',
    'gotIt': 'わかりました'
  },
  'saveStatus': {
    'restoredTitle': 'クラウドセーブを復元しました', 'restoredBody': '復元ボーナス +{n} コイン',
    'tap': 'タップ', 'pausedTitle': 'クラウド同期を一時停止中',
    'pausedBody': 'オフラインでプレイ中です。進行状況はここに保存されます。',
    'retry': '再試行', 'dismiss': '閉じる'
  },
  'loading': { 'tooLong': '読み込みが長すぎますか？ 広告ブロッカーを無効にして再読み込みしてください。' },
  'license': { 'denied': 'アクセスが拒否されました：ライセンスをご購入ください。' }
}
