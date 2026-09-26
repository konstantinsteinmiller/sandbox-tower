export default {
  'gameName': 'Sandbox Tower',
  'cancel': '取消',
  'close': '关闭',
  'ok': '确定',
  'continue': '继续',
  'tapToContinue': '点击继续',
  'clickToContinue': '单击继续',
  'rewards': '奖励',
  'tip': '提示',
  'crazyGamesOnly': '本游戏仅在以下平台提供：',

  // ─── Mobile-fit game (Drop & Merge) ───────────────────────────────────────
  'gift': {
    'free': '免费',
    'tile': '免费的{name}（{n}级）：点它，再点棋盘放下',
    'pair': '免费的一对{name}：点它，再点棋盘放下',
    'tilePaid': '半价的{name}（{n}级）：点它，再点棋盘放下',
    'pairPaid': '半价的一对{name}：点它，再点棋盘放下',
    'discount': '-{n}%',
    'chest': '飞行宝箱：点击打开',
    'firstClear': '第{n}波通过！送你一份礼物'
  },

  'mobile': {
    'rotatePortrait': '请竖持手机进行游戏',
    'columnFull': '此列已满',
    'repairAll': '全部修理',
    'volley': '齐射',
    'swap': '更换',
    'menu': '菜单',
    'materials': '材料',
    'zoom': '缩放'
  },

  'hud': {
    'wave': '波次', 'enemies': '虫子', 'callWave': '召唤波次', 'callBoss': '召唤首领',
    'monstersIncoming': '虫子来袭！',
    'skip': '跳过',
    'speed': '速度 {n}×',
    'speedOffer': '解锁 {n}× 速度',
    'speedGroup': '游戏速度', 'recenter': '视角复位',
    'rotateLeft': '向左旋转',
    'rotateRight': '向右旋转',
    'arrowRain': '飞镖雨',
    'arrowRainAim': '点击战场召唤齐射',
    'extendRange': '射程 +{n}%'
  },


  // ─── The opening cutscene ─────────────────────────────────────────────────
  // Three lines across the ten-second fly-over west of the tower, one per beat:
  // the tower, the horde, the siege train. The fourth thing the player reads is
  // `hud.monstersIncoming`, shown over the engines rather than over the board.
  'intro': {
    'premise': '你的沙堡是最后一处屏障。',
    'horde': '虫潮已经上路了。',
    'siege': '它们还带来了自制装置。'
  },

  'warnings': {
    'hoard': '囤积 +{n}%',
    'air': '空中 ×{n}',
    'sea': '水中 ×{n}',
    'bombers': '爆破 ×{n}',
    'siege': '攻城 ×{n}',
    'outOfReach': '超出射程 ×{n} — 需要 {m} 射程'
  },
  'hints': {
    'dropBlock': {
      'touch': '点击一列放下方块',
      'desktop': '点击一列放下方块'
    },
    'mergeBlock': {
      'touch': '把方块落在相同方块上即可合并',
      'desktop': '把方块落在相同方块上即可合并'
    },
    'selectBlock': { 'touch': '点击下方的方块来选择', 'desktop': '单击下方的方块来选择' },
    'placeBlock': { 'touch': '现在点击发光的格子进行建造', 'desktop': '现在单击发光的格子进行建造' },
    'camera': { 'touch': '拖动平移 · 双指缩放', 'desktop': '拖动平移 · 滚轮缩放' },
    'callWave': { 'touch': '塔准备好后点击“召唤波次”', 'desktop': '按空格键提前召唤波次' },
    'inspect': { 'touch': '长按方块查看详情', 'desktop': '单击方块查看详情' }
  },

  'tips': {
    'eco': '筛沙机和挖石机每波都会产出。两三个就能改变你买得起什么。',
    'buff': '纸旗强化相邻的每个方块，而且相乘。围住一件玩具武器，别分散摆放。',
    'merge': '相邻的两个相同武器会合成。把两组这样的叠起来就是 2×2。',
    'spend': '你还有金币没花。科技树等级是永久的，会带入之后每一局。',
    'branches': '三棵独立的树：城堡、戏水池和工坊。彼此互不依赖。',
    'shape': '墙在前，炮在后。挨不到打的方块，永远不用重建。',
    'gold': '金用来升级方块——点一下任意方块。存钱罐每波都会产出更多。',
    'siegeReach': '铅笔投石机停在飞镖枪、水枪和气球炮都够不到的地方。用泥浆炮回敬它——或者戏水池里的玩具海盗船。'
  },
  'blocks': {
    'fortify': '加装牙签',
    'sell': '出售',
    'mergeTier': '合成 {n}×',
    'upgrade': '升级',
    'upgradeMax': '已满级',
    'rank': '等级 {n}/{max}',
    'reinforced': '强化',
    'roofed': '带屋顶',
    'roofNote': '带屋顶——生命值翻倍，来自上方的防御提升三倍。上方需留空。',
    'enhancedNote': '强化——生命值 +{hp}%，伤害 +{dmg}%。',
    'enhancedHand': '强化积木',
    'reroll': '更换此方块',
    'kinds': {
      'buff': '增益', 'core': '核心', 'structure': '结构', 'weapon': '武器', 'economy': '经济', 'utility': '功能', 'ship': '船' },
    'stats': {
      'yieldGold': '金 / 波',
      'buff': '相邻增益',
      'topDefense': '顶部防御',
      'hp': '生命', 'armor': '护甲', 'dmg': '伤害', 'cooldown': '冷却', 'range': '射程',
      'splash': '溅射', 'yieldWood': '沙子 / 波', 'yieldStone': '卵石 / 波', 'yieldCoins': '金币 / 波',
      'repair': '修复 / 波', 'blast': '爆炸',
      'thorns': '尖刺'
    },
    'names': {
      'banner': '纸旗',
      'obelisk': '魔法贝壳',
      'lumberHut': '筛沙机',
      'stonepit': '挖石机',
      'coffer': '存钱罐',
      'skiff': '纸船', 'longship': '橡皮鸭', 'galley': '玩具海盗船',
      'gate': '沙堡大门', 'wood': '沙块', 'brace': '压实沙', 'stone': '卵石墙',
      'archer': '飞镖枪', 'cannon': '水枪', 'mortar': '泥浆炮', 'tesla': '灭虫灯',
      'frost': '冰棒', 'repair': '桶铲',
      'spikes': '牙签墙',
      'bombard': '气球炮'
    },
    'descriptions': {
      'banner': '强化所有相邻方块。同一方块旁的两面纸旗会叠加。',
      'obelisk': '更强的纸旗。光环相乘，两个的价值远超两倍。',
      'lumberHut': '每清完一波筛出沙子。',
      'stonepit': '每清完一波挖出卵石。',
      'coffer': '每波铸造金币——升级方块所用的货币。',
      'skiff': '漂浮在护城河上。能打到水下的虫子。',
      'longship': '重型飞镖鱼叉。结实耐用，射程超过岸上。',
      'galley': '软木炮与瞭望台。护城河归你了。',
      'gate': '沙堡的核心。它一旦倒下，围攻就结束了。',
      'wood': '廉价填充物，每座早期城堡的骨干。',
      'brace': '两倍沙量，超过两倍的坚固度。',
      'stone': '沉重且带护甲，最适合放在底部。',
      'archer': '快速单体飞镖，可攻击飞行虫子。',
      'cannon': '射速慢但范围伤害高，能浇透密集虫群。',
      'mortar': '远程抛射泥球，但无法命中飞行虫子。',
      'tesla': '在附近虫子之间跳跃的电击。',
      'frost': '冻结整群敌人并大幅减速。',
      'repair': '在波次之间修复相邻方块。',
      'spikes': '攻击它的虫子每次都会被扎到。',
      'bombard': '垂直抛射水球。溅射范围很小，只能打地面虫子。'
    },
    'repair': '修理',
    'repairCooldown': '{n}秒',
    'reposition': '移动这个方块'
  },

  'enemies': {
    'names': {
      'grunt': '蚂蚁', 'runner': '蟑螂', 'slinger': '蜘蛛', 'brute': '独角仙',
      'bomber': '放屁虫', 'bat': '苍蝇', 'bulwark': '西瓜虫', 'golem': '锹形虫',
      'wyvern': '胡蜂',
      'eel': '水虎虫',
      'shark': '龙虱',
      'kraken': '田鳖',
      'seadrake': '水虿',
      'ram': '铅笔锤',
      'ballista': '橡皮筋弩',
      'catapult': '勺子投石机',
      'siegeTower': '果汁盒塔',
      'trebuchet': '铅笔投石机',
      'ironRam': '铁罐锤',
      'bombardier': '熊蜂',
      'firebug': '萤火虫'
    }
  },

  // ─── Allies ───────────────────────────────────────────────────────────────
  'allies': {
    'cavalry': '玩具骑士',
    'cavalryFree': '免费玩具骑士冲锋',
    'free': '免费',
    'outOfReachHint': '超出射程 — 派出骑士或提升射程'
  },

  'result': {
    'towerFell': '已摧毁！',
    'reachedWave': '你坚持到了第 {n} 波',
    'newRecord': '新纪录！',
    'upgrade': '升级！',
    'defendAgain': '再次防守',
    'continueRun': '重建并继续',
    'continueWave': '第 {n} 波',
    'tripleCoins': '金币三倍',
    'tripleWave': '3× 金币 — {n}',
    'waveCleared': '第 {n} 波已守住！',
    'scoreLabel': '分数',
    'bestLabel': '最高分',
    'scoreCurrent': '(本局 {n})',
    'rankLabel': '排名',
    'rankOf': '共 {n} 名'
  },

  'tech': {
    'blueprints': {
      'title': '蓝图'
    },
    'intro1': '在这里购买的一切都是永久的，会带入之后的每一局。',
    'intro2': '每场攻城战都会给你金币，无论输赢。金币就在这里花。',
    'intro3': '金色节点你现在就买得起，蓝色还差金币，暗色需要先解锁前置节点。',
    'introNext': '下一步',
    'introDone': '知道了',
    'sell': '出售等级',
    'sellBlocked': '请先出售 {n}——它依赖此项。',
    'title': '科技树',
    'rank': '等级 {current}/{total}',
    'maxed': '已满级',
    'rankOpen': '等级 {n}',
    'atRank': '等级 {r}：共 {n}',
    'owned': '已解锁',
    'requires': '需要 {n}',
    'spotlight': '快花掉！',
    'names': {
      'm2_lumberHut': '筛沙机',
      'logistics': '挖掘小队',
      'unlockCoffer': '存钱罐',
      'yields': '产出',
      'unlockObelisk': '魔法贝壳',
      'rallyCry': '战吼',
      'stockpiles': '囤积',
      'forgeWelds': '强力胶',
      'harbour': '戏水池', 'dockWorks': '更大戏水池',
      'unlockLongship': '橡皮鸭', 'seasonedHulls': '坚固船体',
      'navalGunnery': '船只火力', 'unlockGalley': '玩具海盗船',
      'admiralty': '鸭子上将',
      'foundations': '地基', 'sharpBolts': '尖头飞镖', 'unlockBrace': '压实沙',
      'lumberStock': '沙子储备', 'longSight': '远视', 'rapidFire': '速射',
      'reinforced': '湿沙配方', 'unlockSawmill': '富沙层', 'quarryStock': '卵石储备',
      'unlockMortar': '泥浆炮', 'heavyOrdnance': '更大水花', 'unlockTesla': '灭虫灯',
      'gateArmor': '城门护甲', 'unlockQuarry': '深度挖掘', 'richHauls': '丰厚战利品',
      'wideFoundation': '宽阔地基', 'siegeShells': '强力水炮', 'unlockFrost': '冰棒',
      'forkedBolts': '分叉电击', 'ironPlating': '硬化沙层', 'unlockRepair': '桶铲',
      'unlockMint': '藏宝图', 'looting': '掠夺', 'overcharge': '过载',
      'masterwork': '大师之作', 'fieldRepairs': '战地维修', 'greatFoundation': '宏伟地基',
      'warChest': '藏宝箱',
      'unlockSpikes': '牙签墙',
      'unlockBombard': '气球炮',
      'sharpSpikes': '锋利牙签',
      'cavalryDrill': '骑士训练',
      'artilleryDoctrine': '远程射击'
    },
    'descriptions': {
      'm2_lumberHut': '解锁筛沙机——每波结束后筛出沙子。',
      'logistics': '解锁挖石机——一种在需要它的那一局里就买得起的廉价产出方块。',
      'unlockCoffer': '解锁存钱罐，唯一能铸造金币的方块。',
      'yields': '所有经济方块产出 +{n}%。',
      'unlockObelisk': '解锁魔法贝壳，一种强得多的相邻增益。',
      'rallyCry': '增益方块强度 +{n}%。',
      'stockpiles': '所有经济方块产出 +{n}%。',
      'forgeWelds': '合成方块每级产出 +{n}%：伤害、尖刺与产量。',
      'harbour': '在护城河上放船。只有它们能打到潜伏的虫子。',
      'dockWorks': '每级停船区加宽 {n} 格。',
      'unlockLongship': '结实的橡皮鸭，配重型飞镖鱼叉。',
      'seasonedHulls': '船只初始生命值 +{n}%。',
      'navalGunnery': '船只武器伤害 +{n}%。',
      'unlockGalley': '软木炮、瞭望台与可行走的跳板。',
      'admiralty': '船只武器伤害再 +{n}%。',
      'foundations': '城堡里每个方块初始生命值 +{n}%。',
      'sharpBolts': '城堡武器每级伤害 +{n}%。',
      'unlockBrace': '解锁压实沙——生命值是普通沙块的两倍。',
      'lumberStock': '每级围攻开局多 {n} 沙子。',
      'longSight': '所有武器每级射程 +{n}%。',
      'rapidFire': '所有武器每级射速 +{n}%。',
      'reinforced': '城堡里每个方块每级生命值 +{n}%。',
      'unlockSawmill': '每级使所有产出建筑产量 +{n}%。',
      'quarryStock': '每级围攻开局多 {n} 卵石。',
      'unlockMortar': '解锁泥浆炮——远程范围伤害。',
      'heavyOrdnance': '溅射半径每级 +{n}%。',
      'unlockTesla': '解锁灭虫灯——电击会在虫子之间跳跃。',
      'gateArmor': '沙堡大门每级生命值 +{n}%。',
      'unlockQuarry': '每级使所有产出建筑再增 +{n}%。',
      'richHauls': '波次奖励每级 +{n}%。',
      'wideFoundation': '每级可多建造 {n} 列宽度。',
      'siegeShells': '城堡武器每级伤害 +{n}%。',
      'unlockFrost': '解锁冰棒——减速整群敌人。',
      'forkedBolts': '电击每级多跳跃 {n} 只虫子。',
      'ironPlating': '每个方块每级护甲 +{n}。',
      'unlockRepair': '解锁桶铲——每波修补相邻方块。',
      'unlockMint': '每级使所有产出建筑再增 +{n}%。',
      'looting': '虫子每级多掉落 {n}% 金币。',
      'overcharge': '所有武器每级射速 +{n}%。',
      'masterwork': '城堡武器每级伤害 +{n}%。',
      'fieldRepairs': '每守住一波，每个方块按每级恢复 {n}% 最大生命值。',
      'greatFoundation': '每级再多建造 {n} 列宽度。',
      'warChest': '波次奖励每级 +{n}%。',
      'unlockSpikes': '解锁牙签墙 — 攻击它的虫子会被扎到。',
      'unlockBombard': '解锁气球炮 — 对地面虫子的近距离水球攻击。',
      'sharpSpikes': '牙签墙每级反弹伤害 +{n}%。',
      'cavalryDrill': '玩具骑士每级生命值与伤害 +{n}%。',
      'artilleryDoctrine': '所有武器每级射程 +{n}%。'
    }
  },

  'resources': {
    'wood': '沙子',
    'stone': '卵石',
    'gold': '黄金'
  },

  'ads': {
    'watch': '观看', 'revive': '复活', 'secondChance': '第二次机会',
    'doubleCoins': '2× 金币', 'plusCoins': '+{n} 金币'
  },

  'achievements': {
    'title': '成就', 'subtitle': '达成长期里程碑赚取金币。',
    'claim': '领取', 'claimed': '已领取', 'progress': '{c} / {t}',
    'items': {
      'wave5': { 'name': '首次坚守', 'desc': '坚持到第 5 波。' },
      'wave10': { 'name': '要塞', 'desc': '坚持到第 10 波。' },
      'wave20': { 'name': '壁垒', 'desc': '坚持到第 20 波。' },
      'wave30': { 'name': '坚不可摧', 'desc': '坚持到第 30 波。' },
      'waves50': { 'name': '破浪者', 'desc': '累计守住 50 波。' },
      'waves250': { 'name': '围攻老兵', 'desc': '累计守住 250 波。' },
      'kills500': { 'name': '守卫者', 'desc': '累计消灭 500 只虫子。' },
      'kills5k': { 'name': '灭虫高手', 'desc': '累计消灭 5,000 只虫子。' },
      'kills50k': { 'name': '传奇', 'desc': '累计消灭 50,000 只虫子。' },
      'height10': { 'name': '直上云霄', 'desc': '建造 10 格高的高塔。' },
      'height20': { 'name': '穿云者', 'desc': '建造 20 格高的高塔。' },
      'blocks250': { 'name': '建造者', 'desc': '累计放置 250 个方块。' },
      'blocks2k': { 'name': '建筑师', 'desc': '累计放置 2,000 个方块。' },
      'coins5k': { 'name': '金币收藏家', 'desc': '累计赚取 5,000 金币。' },
      'coins50k': { 'name': '司库', 'desc': '累计赚取 50,000 金币。' },
      'runs25': { 'name': '坚持不懈', 'desc': '开始 25 次围攻。' }
    }
  },

  'missions': {
    'title': '每日任务', 'subtitle': '每天完成目标赚取金币。',
    'claim': '领取', 'done': '已领取',
    'types': {
      'coins': '今天赚取 {n} 金币',
      'waves': '单次围攻坚持到第 {n} 波',
      'kills': '今天消灭 {n} 只虫子',
      'blocks': '今天放置 {n} 个方块'
    }
  },

  'battlePass': {
    'title': '战斗通行证', 'progress': '{current} / {total}', 'daysLeft': '剩余 {n} 天',
    'maxed': '战斗通行证已完成', 'xpProgress': '{current} / {total} XP',
    'howToEarn': '如何获得经验', 'perRun': '每次围攻', 'perWave': '每守住一波',
    'unlockHint': '达到 {n} XP 解锁下一个奖励——未领取的奖励会一直保留。'
  },

  'dailyRewards': {
    'title': '每日奖励', 'subtitle': '每天登录以保持连续记录。',
    'day': '第 {n} 天', 'dayShort': 'D{n}'
  },

  'options': {
    'title': '选项', 'general': '通用', 'audio': '音频', 'language': '语言',
    'difficulty': '难度', 'soundEffects': '音效', 'music': '音乐', 'musicTrack': '音乐曲目',
    'musicTracks': { 'cozy': '惬意和声', 'trance': '迷幻隧道' },
    'close': '保存并关闭',
    'difficulties': { 'easy': '简单', 'medium': '普通', 'hard': '困难' },
    'difficultyHints': {
      'easy': '波次更小，虫子更弱。',
      'medium': '标准且平衡的围攻。',
      'hard': '波次更密集，虫子更强韧。'
    }
  },

  'adsBlocked': {
    'title': '无法显示广告',
    'body': '我们本想为你播放视频以便领取奖励，但你的浏览器中有内容拦截了广告。',
    'allowPrefix': '请在以下网站允许广告：',
    'allowSuffix': '（或为本游戏暂停广告拦截器）然后重试。',
    'gotIt': '知道了'
  },
  'saveStatus': {
    'restoredTitle': '云存档已恢复', 'restoredBody': '恢复奖励 +{n} 金币',
    'tap': '点击', 'pausedTitle': '云同步已暂停',
    'pausedBody': '正在离线游戏。你的进度会保存在本地。',
    'retry': '重试', 'dismiss': '忽略'
  },
  'loading': { 'tooLong': '加载太久？请关闭广告拦截器并刷新页面。' },
  'license': { 'denied': '访问被拒绝：请购买许可证。' }
}
