export default {
  'gameName': 'Tower Siege',
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
    'wave': '波次', 'enemies': '敌人', 'callWave': '召唤波次', 'callBoss': '召唤首领',
    'monstersIncoming': '怪物来袭！',
    'skip': '跳过',
    'speed': '速度 {n}×',
    'speedOffer': '解锁 {n}× 速度',
    'speedGroup': '游戏速度', 'recenter': '视角复位',
    'rotateLeft': '向左旋转',
    'rotateRight': '向右旋转',
    'arrowRain': '箭雨',
    'arrowRainAim': '点击战场召唤齐射',
    'extendRange': '射程 +{n}%'
  },


  // ─── The opening cutscene ─────────────────────────────────────────────────
  // Three lines across the ten-second fly-over west of the tower, one per beat:
  // the tower, the horde, the siege train. The fourth thing the player reads is
  // `hud.monstersIncoming`, shown over the engines rather than over the board.
  'intro': {
    'premise': '你的塔是最后一处屏障。',
    'horde': '兽潮已经上路了。',
    'siege': '它们还带来了攻城器械。'
  },

  'warnings': {
    'hoard': '囤积 +{n}%',
    'air': '空中 ×{n}',
    'sea': '海上 ×{n}',
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
    'eco': '伐木屋和采石坑每波都会产出。两三个就能改变你买得起什么。',
    'buff': '战旗强化相邻的每个方块，而且相乘。围住一门炮，别分散摆放。',
    'merge': '相邻的两个相同武器会合成。把两组这样的叠起来就是 2×2。',
    'spend': '你还有金币没花。科技树等级是永久的，会带入之后每一局。',
    'branches': '三棵独立的树：高塔、港口和工坊。彼此互不依赖。',
    'shape': '墙在前，炮在后。挨不到打的方块，永远不用重建。',
    'gold': '金用来升级方块——点一下任意方块。金匣每波都会产出更多。',
    'siegeReach': '投石机停在弓箭手、火炮和臼炮都够不到的地方。用迫击炮回敬它——或者港口的战斗桨帆船。'
  },
  'blocks': {
    'fortify': '加装尖刺',
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
      'buff': '增益', 'core': '核心', 'structure': '结构', 'weapon': '武器', 'economy': '经济', 'utility': '功能', 'ship': '战船' },
    'stats': {
      'yieldGold': '金 / 波',
      'buff': '相邻增益',
      'topDefense': '顶部防御',
      'hp': '生命', 'armor': '护甲', 'dmg': '伤害', 'cooldown': '冷却', 'range': '射程',
      'splash': '溅射', 'yieldWood': '木材 / 波', 'yieldStone': '石材 / 波', 'yieldCoins': '金币 / 波',
      'repair': '修复 / 波', 'blast': '爆炸',
      'thorns': '尖刺'
    },
    'names': {
      'banner': '战旗',
      'obelisk': '方尖碑',
      'lumberHut': '伐木屋',
      'stonepit': '采石坑',
      'coffer': '金匣',
      'skiff': '巡哨小艇', 'longship': '长船', 'galley': '战斗桨帆船',
      'gate': '城门', 'wood': '木箱', 'brace': '加固木箱', 'stone': '石块',
      'archer': '弓箭塔', 'cannon': '加农炮', 'mortar': '迫击炮', 'tesla': '闪电线圈',
      'frost': '寒霜尖塔', 'repair': '维修站',
      'spikes': '尖刺墙',
      'bombard': '臼炮'
    },
    'descriptions': {
      'banner': '强化所有相邻方块。同一方块旁的两面战旗会叠加。',
      'obelisk': '更强的战旗。光环相乘，两个的价值远超两倍。',
      'lumberHut': '每清完一波产出木材。',
      'stonepit': '每清完一波产出石料。',
      'coffer': '每波铸造金币——升级方块所用的货币。',
      'skiff': '停泊在水面。能打到水下的敌人。',
      'longship': '重型鱼叉。挂盾防护，射程超过岸上。',
      'galley': '青铜撞角与甲板臼炮。湖面归你了。',
      'gate': '高塔的核心。它一旦倒下，围攻就结束了。',
      'wood': '廉价填充物，每座早期高塔的骨干。',
      'brace': '两倍木材，超过两倍的坚固度。',
      'stone': '沉重且带护甲，最适合放在底部。',
      'archer': '快速单体箭矢，可攻击飞行单位。',
      'cannon': '射速慢但范围伤害高，能融化密集敌群。',
      'mortar': '远程抛射炮弹，但无法命中飞行单位。',
      'tesla': '在附近敌人之间跳跃的闪电。',
      'frost': '冻结整群敌人并大幅减速。',
      'repair': '在波次之间修复相邻方块。',
      'spikes': '近战攻击它的敌人每次都会被反伤。',
      'bombard': '垂直抛射炮弹。爆炸范围很小，只能打地面目标。'
    },
    'repair': '修理',
    'repairCooldown': '{n}秒',
    'reposition': '移动这个方块'
  },

  'enemies': {
    'names': {
      'grunt': '步兵', 'runner': '疾行者', 'slinger': '投石手', 'brute': '蛮兵',
      'bomber': '爆破兵', 'bat': '蝙蝠', 'bulwark': '盾卫', 'golem': '攻城魔像',
      'wyvern': '双足飞龙',
      'eel': '海蛇',
      'shark': '礁鲨',
      'kraken': '海妖',
      'seadrake': '海龙',
      'ram': '攻城槌',
      'ballista': '弩炮',
      'catapult': '投石机',
      'siegeTower': '攻城塔',
      'trebuchet': '配重投石机',
      'ironRam': '铁甲攻城槌',
      'bombardier': '投弹手',
      'firebug': '燃烧瓶手'
    }
  },

  // ─── Allies ───────────────────────────────────────────────────────────────
  'allies': {
    'cavalry': '骑兵',
    'cavalryFree': '免费骑兵出击',
    'free': '免费',
    'outOfReachHint': '超出射程 — 派出骑兵或提升射程'
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
      'm2_lumberHut': '伐木小屋',
      'logistics': '后勤',
      'unlockCoffer': '金匣',
      'yields': '产出',
      'unlockObelisk': '立石',
      'rallyCry': '战吼',
      'stockpiles': '囤积',
      'forgeWelds': '锻焊',
      'harbour': '港口', 'dockWorks': '码头工程',
      'unlockLongship': '长船', 'seasonedHulls': '熟化船体',
      'navalGunnery': '舰炮术', 'unlockGalley': '战斗桨帆船',
      'admiralty': '海军部',
      'foundations': '地基', 'sharpBolts': '锐利箭矢', 'unlockBrace': '加固木箱',
      'lumberStock': '木材储备', 'longSight': '远视', 'rapidFire': '速射',
      'reinforced': '加固梁柱', 'unlockSawmill': '富矿脉', 'quarryStock': '石材储备',
      'unlockMortar': '迫击炮', 'heavyOrdnance': '重型火炮', 'unlockTesla': '闪电线圈',
      'gateArmor': '城门护甲', 'unlockQuarry': '深层坤道', 'richHauls': '丰厚战利品',
      'wideFoundation': '宽阔地基', 'siegeShells': '攻城炮弹', 'unlockFrost': '寒霜尖塔',
      'forkedBolts': '分叉闪电', 'ironPlating': '铁质装甲', 'unlockRepair': '维修站',
      'unlockMint': '行会特许', 'looting': '掠夺', 'overcharge': '过载',
      'masterwork': '大师之作', 'fieldRepairs': '战地维修', 'greatFoundation': '宏伟地基',
      'warChest': '军费金库',
      'unlockSpikes': '尖刺墙',
      'unlockBombard': '臼炮',
      'sharpSpikes': '磨利尖刺',
      'cavalryDrill': '骑兵操练',
      'artilleryDoctrine': '炮兵学说'
    },
    'descriptions': {
      'm2_lumberHut': '解锁伐木小屋——每波结束后产出木材。',
      'logistics': '解锁采石坑——一种在需要它的那一局里就买得起的廉价产出方块。',
      'unlockCoffer': '解锁金匣，唯一能铸造金币的方块。',
      'yields': '所有经济方块产出 +{n}%。',
      'unlockObelisk': '解锁方尖碑，一种强得多的相邻增益。',
      'rallyCry': '增益方块强度 +{n}%。',
      'stockpiles': '所有经济方块产出 +{n}%。',
      'forgeWelds': '合成方块每级产出 +{n}%：伤害、尖刺与产量。',
      'harbour': '在水面停泊战船。只有它们能打到潜行的敌人。',
      'dockWorks': '每级停泊区加宽 {n} 格。',
      'unlockLongship': '挂盾船体，配重型鱼叉。',
      'seasonedHulls': '战船初始生命值 +{n}%。',
      'navalGunnery': '舰载武器伤害 +{n}%。',
      'unlockGalley': '青铜撞角、甲板臼炮与战斗楼。',
      'admiralty': '舰载武器伤害再 +{n}%。',
      'foundations': '塔上每个方块初始生命值 +{n}%。',
      'sharpBolts': '塔上武器每级伤害 +{n}%。',
      'unlockBrace': '解锁加固木箱——生命值是木材的两倍。',
      'lumberStock': '每级围攻开局多 {n} 木材。',
      'longSight': '所有武器每级射程 +{n}%。',
      'rapidFire': '所有武器每级射速 +{n}%。',
      'reinforced': '塔上每个方块每级生命值 +{n}%。',
      'unlockSawmill': '每级使所有产出建筑产量 +{n}%。',
      'quarryStock': '每级围攻开局多 {n} 石材。',
      'unlockMortar': '解锁迫击炮——远程范围伤害。',
      'heavyOrdnance': '溅射半径每级 +{n}%。',
      'unlockTesla': '解锁闪电线圈——闪电会在敌人之间跳跃。',
      'gateArmor': '城门每级生命值 +{n}%。',
      'unlockQuarry': '每级使所有产出建筑再增 +{n}%。',
      'richHauls': '波次奖励每级 +{n}%。',
      'wideFoundation': '每级可多建造 {n} 列宽度。',
      'siegeShells': '塔上武器每级伤害 +{n}%。',
      'unlockFrost': '解锁寒霜尖塔——减速整群敌人。',
      'forkedBolts': '闪电每级多跳跃 {n} 个敌人。',
      'ironPlating': '每个方块每级护甲 +{n}。',
      'unlockRepair': '解锁维修站——每波治疗相邻方块。',
      'unlockMint': '每级使所有产出建筑再增 +{n}%。',
      'looting': '敌人每级多掉落 {n}% 金币。',
      'overcharge': '所有武器每级射速 +{n}%。',
      'masterwork': '塔上武器每级伤害 +{n}%。',
      'fieldRepairs': '每守住一波，每个方块按每级恢复 {n}% 最大生命值。',
      'greatFoundation': '每级再多建造 {n} 列宽度。',
      'warChest': '波次奖励每级 +{n}%。',
      'unlockSpikes': '解锁尖刺墙 — 攻击它的敌人会被反伤。',
      'unlockBombard': '解锁臼炮 — 对地面部队的近距离迫击火力。',
      'sharpSpikes': '尖刺墙每级反弹伤害 +{n}%。',
      'cavalryDrill': '骑兵每级生命值与伤害 +{n}%。',
      'artilleryDoctrine': '所有武器每级射程 +{n}%。'
    }
  },

  'resources': {
    'wood': '木材',
    'stone': '石材',
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
      'kills500': { 'name': '守卫者', 'desc': '累计击败 500 名敌人。' },
      'kills5k': { 'name': '屠戮者', 'desc': '累计击败 5,000 名敌人。' },
      'kills50k': { 'name': '传奇', 'desc': '累计击败 50,000 名敌人。' },
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
      'kills': '今天击败 {n} 名敌人',
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
      'easy': '波次更小，敌人更弱。',
      'medium': '标准且平衡的围攻。',
      'hard': '波次更密集，敌人更强韧。'
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
