export default {
  'gameName': 'Sandbox Tower',
  'cancel': '취소',
  'close': '닫기',
  'ok': '확인',
  'continue': '계속',
  'tapToContinue': '탭하여 계속',
  'clickToContinue': '클릭하여 계속',
  'rewards': '보상',
  'tip': '팁',
  'crazyGamesOnly': '이 게임은 다음에서만 이용할 수 있습니다:',

  // ─── Mobile-fit game (Drop & Merge) ───────────────────────────────────────
  'gift': {
    'free': '무료',
    'tile': '무료 {name}, {n}단계: 탭한 다음 보드를 탭해서 놓으세요',
    'pair': '무료 {name} 한 쌍: 탭한 다음 보드를 탭해서 놓으세요',
    'tilePaid': '{name}, {n}단계, 반값: 탭한 다음 보드를 탭해서 놓으세요',
    'pairPaid': '{name} 한 쌍 반값: 탭한 다음 보드를 탭해서 놓으세요',
    'discount': '-{n}%',
    'chest': '날아다니는 상자: 탭해서 열기',
    'firstClear': '{n}웨이브 클리어! 선물이에요'
  },

  'mobile': {
    'rotatePortrait': '세로로 들고 플레이하세요',
    'columnFull': '열이 가득 찼습니다',
    'repairAll': '모두 수리',
    'volley': '일제 사격',
    'swap': '교체',
    'menu': '메뉴',
    'materials': '자재',
    'zoom': '확대/축소'
  },

  'hud': {
    'wave': '웨이브', 'enemies': '벌레', 'callWave': '웨이브 호출', 'callBoss': '보스 호출',
    'monstersIncoming': '벌레가 몰려온다!',
    'skip': '건너뛰기',
    'speed': '속도 {n}×',
    'speedOffer': '{n}× 속도 잠금 해제',
    'speedGroup': '게임 속도', 'recenter': '화면 중앙 정렬',
    'rotateLeft': '왼쪽으로 회전',
    'rotateRight': '오른쪽으로 회전',
    'arrowRain': '다트비',
    'arrowRainAim': '전장을 탭해 일제 사격을 부르세요',
    'extendRange': '사거리 +{n}%'
  },


  // ─── The opening cutscene ─────────────────────────────────────────────────
  // Three lines across the ten-second fly-over west of the tower, one per beat:
  // the tower, the horde, the siege train. The fourth thing the player reads is
  // `hud.monstersIncoming`, shown over the engines rather than over the board.
  'intro': {
    'premise': '당신의 모래성이 마지막 남은 보루다.',
    'horde': '벌레 무리는 이미 진군을 시작했다.',
    'siege': '게다가 직접 만든 장난감 병기까지 끌고 온다.'
  },

  'warnings': {
    'hoard': '비축 +{n}%',
    'air': '공중 ×{n}',
    'sea': '수중 ×{n}',
    'bombers': '폭발 ×{n}',
    'siege': '공성 ×{n}',
    'outOfReach': '사거리 밖 ×{n} — 사거리 {m} 필요'
  },
  'hints': {
    'dropBlock': {
      'touch': '열을 탭해 조각을 떨어뜨리세요',
      'desktop': '열을 클릭해 조각을 떨어뜨리세요'
    },
    'mergeBlock': {
      'touch': '같은 조각 위에 떨어뜨리면 합쳐집니다',
      'desktop': '같은 조각 위에 떨어뜨리면 합쳐집니다'
    },
    'selectBlock': { 'touch': '아래 블록을 탭해 선택하세요', 'desktop': '아래 블록을 클릭해 선택하세요' },
    'placeBlock': { 'touch': '이제 빛나는 칸을 탭해 건설하세요', 'desktop': '이제 빛나는 칸을 클릭해 건설하세요' },
    'camera': { 'touch': '드래그로 이동 · 핀치로 확대', 'desktop': '드래그로 이동 · 스크롤로 확대' },
    'callWave': { 'touch': '타워가 준비되면 «웨이브 호출»을 탭하세요', 'desktop': '스페이스바로 웨이브를 일찍 호출' },
    'inspect': { 'touch': '블록을 길게 눌러 확인하세요', 'desktop': '블록을 클릭해 확인하세요' }
  },

  'tips': {
    'eco': '모래 체와 자갈 굴착기는 매 웨이브 지급합니다. 두세 개면 살 수 있는 것이 달라집니다.',
    'buff': '종이 깃발은 인접한 모든 블록을 강화하며 효과가 곱해집니다. 흩지 말고 장난감 무기 하나를 둘러싸세요.',
    'merge': '나란한 같은 무기는 합쳐집니다. 그런 쌍을 두 개 쌓아 2×2로 만드세요.',
    'spend': '쓸 코인이 남았습니다. 트리 등급은 영구적이며 이후 모든 판에 이어집니다.',
    'branches': '독립된 세 트리: 성, 물놀이장, 공방. 서로를 필요로 하지 않습니다.',
    'shape': '벽은 앞, 포는 뒤. 맞지 않는 블록은 다시 지을 일도 없습니다.',
    'gold': '골드로 블록을 강화합니다 — 블록을 누르세요. 돼지 저금통이 매 웨이브 더 만듭니다.',
    'siegeReach': '연필 트레뷰셋은 다트 발사기, 물총, 풍선 발사기 어느 것도 닿지 않는 거리에 자리 잡습니다. 답은 진흙 박격포 — 또는 물놀이장의 장난감 해적선입니다.'
  },
  'blocks': {
    'fortify': '이쑤시개 설치',
    'sell': '판매',
    'mergeTier': '합성 {n}×',
    'upgrade': '업그레이드',
    'upgradeMax': '최대 강화',
    'rank': 'Lv {n}/{max}',
    'reinforced': '강화됨',
    'roofed': '지붕 있음',
    'roofNote': '지붕 있음 — 체력 2배, 위쪽 공격 방어 3배. 위가 비어 있어야 합니다.',
    'enhancedNote': '강화됨 — 체력 +{hp}%, 피해 +{dmg}%.',
    'enhancedHand': '강화 블록',
    'reroll': '이 조각 교체',
    'kinds': {
      'buff': '강화', 'core': '핵심', 'structure': '구조', 'weapon': '무기', 'economy': '경제', 'utility': '보조', 'ship': '배' },
    'stats': {
      'yieldGold': '골드 / 웨이브',
      'buff': '인접 강화',
      'topDefense': '상단 방어',
      'hp': '체력', 'armor': '방어', 'dmg': '피해', 'cooldown': '재사용', 'range': '사거리',
      'splash': '범위', 'yieldWood': '모래 / 웨이브', 'yieldStone': '자갈 / 웨이브', 'yieldCoins': '코인 / 웨이브',
      'repair': '수리 / 웨이브', 'blast': '폭발',
      'thorns': '가시'
    },
    'names': {
      'banner': '종이 깃발',
      'obelisk': '마법 조개',
      'lumberHut': '모래 체',
      'stonepit': '자갈 굴착기',
      'coffer': '돼지 저금통',
      'skiff': '종이배', 'longship': '고무 오리', 'galley': '장난감 해적선',
      'gate': '성문', 'wood': '모래 블록', 'brace': '다진 모래', 'stone': '자갈벽',
      'archer': '다트 발사기', 'cannon': '물총', 'mortar': '진흙 박격포', 'tesla': '벌레 퇴치기',
      'frost': '아이스바', 'repair': '양동이와 삽',
      'spikes': '이쑤시개 벽',
      'bombard': '풍선 발사기'
    },
    'descriptions': {
      'banner': '인접한 모든 블록을 강화합니다. 한 블록에 깃발 두 개는 중첩됩니다.',
      'obelisk': '더 강한 깃발. 오라는 곱해지므로 두 개는 두 배보다 훨씬 강합니다.',
      'lumberHut': '웨이브를 막아낼 때마다 모래를 체질합니다.',
      'stonepit': '웨이브를 막아낼 때마다 자갈을 캐냅니다.',
      'coffer': '매 웨이브 골드를 주조합니다 — 블록 강화에 쓰는 화폐입니다.',
      'skiff': '해자 위에 떠 있습니다. 수면 아래의 벌레도 공격합니다.',
      'longship': '묵직한 다트 작살. 튼튼하고 해안보다 사거리가 깁니다.',
      'galley': '코르크 대포와 망루. 이제 해자는 당신 것입니다.',
      'gate': '모래성의 심장. 무너지면 공성전은 끝납니다.',
      'wood': '저렴한 채움재. 초반 성의 척추.',
      'brace': '모래는 두 배, 내구는 두 배 이상.',
      'stone': '무겁고 방어력이 높습니다. 바닥에 가장 적합.',
      'archer': '단일 대상 빠른 폼 다트. 비행 벌레도 맞힙니다.',
      'cannon': '느리지만 강력한 범위 피해. 밀집한 무리를 흠뻑 적십니다.',
      'mortar': '장거리 곡사 진흙 포격 — 다만 비행 벌레는 맞히지 못합니다.',
      'tesla': '근처 벌레들 사이로 튀는 전기 충격.',
      'frost': '무리 전체를 얼려 크게 둔화시킵니다.',
      'repair': '웨이브 사이에 인접 블록을 수리합니다.',
      'spikes': '공격하는 적은 매번 스스로 찔립니다.',
      'bombard': '물풍선을 수직으로 쏘아 올립니다. 작은 물벼락, 지상의 벌레만 타격.'
    },
    'repair': '수리',
    'repairCooldown': '{n}초',
    'reposition': '이 블록 옮기기'
  },

  'enemies': {
    'names': {
      'grunt': '개미', 'runner': '바퀴벌레', 'slinger': '거미', 'brute': '장수풍뎅이',
      'bomber': '폭탄먼지벌레', 'bat': '파리', 'bulwark': '공벌레', 'golem': '사슴벌레',
      'wyvern': '말벌',
      'eel': '물호랑이',
      'shark': '물방개',
      'kraken': '물장군',
      'seadrake': '잠자리 유충',
      'ram': '연필 충차',
      'ballista': '고무줄 석궁',
      'catapult': '숟가락 투석기',
      'siegeTower': '주스팩 공성탑',
      'trebuchet': '연필 트레뷰셋',
      'ironRam': '깡통 충차',
      'bombardier': '호박벌',
      'firebug': '반딧불이'
    }
  },

  // ─── Allies ───────────────────────────────────────────────────────────────
  'allies': {
    'cavalry': '장난감 기사',
    'cavalryFree': '무료 장난감 기사 돌격',
    'free': '무료',
    'outOfReachHint': '사거리 밖 — 기사를 보내거나 사거리를 늘리세요'
  },

  'result': {
    'towerFell': '파괴됨!',
    'reachedWave': '웨이브 {n}까지 버텼습니다',
    'newRecord': '신기록!',
    'upgrade': '업그레이드!',
    'defendAgain': '다시 방어',
    'continueRun': '재건하고 계속',
    'continueWave': '웨이브 {n}',
    'tripleCoins': '코인 3배',
    'tripleWave': '코인 3배 — {n}',
    'waveCleared': '웨이브 {n} 방어 성공!',
    'scoreLabel': '점수',
    'bestLabel': '최고 점수',
    'scoreCurrent': '(이번 판 {n})',
    'rankLabel': '순위',
    'rankOf': '{n}명 중'
  },

  'tech': {
    'blueprints': {
      'title': '설계도'
    },
    'intro1': '여기서 구매한 것은 모두 영구적이며, 이후 모든 플레이에 이어집니다.',
    'intro2': '코인은 승패와 상관없이 모든 공성전에서 얻습니다. 여기서 사용하세요.',
    'intro3': '금색 노드는 지금 구매 가능합니다. 파란색은 코인이 더 필요하고, 흐린 것은 앞 노드가 필요합니다.',
    'introNext': '다음',
    'introDone': '알겠어요',
    'sell': '등급 판매',
    'sellBlocked': '먼저 {n}을(를) 파세요 — 선행 조건입니다.',
    'title': '테크 트리',
    'rank': '등급 {current}/{total}',
    'maxed': '최대',
    'rankOpen': '{n}랭크',
    'atRank': '랭크 {r}: 총 {n}',
    'owned': '해금됨',
    'requires': '필요: {n}',
    'spotlight': '사용하세요!',
    'names': {
      'm2_lumberHut': '모래 체',
      'logistics': '굴착팀',
      'unlockCoffer': '돼지 저금통',
      'yields': '산출',
      'unlockObelisk': '마법 조개',
      'rallyCry': '전투 함성',
      'stockpiles': '비축',
      'forgeWelds': '순간접착제',
      'harbour': '물놀이장', 'dockWorks': '더 큰 물놀이장',
      'unlockLongship': '고무 오리', 'seasonedHulls': '튼튼한 배',
      'navalGunnery': '보트 화력', 'unlockGalley': '장난감 해적선',
      'admiralty': '오리 제독',
      'foundations': '기초', 'sharpBolts': '뾰족한 다트', 'unlockBrace': '다진 모래',
      'lumberStock': '모래 비축', 'longSight': '원시', 'rapidFire': '속사',
      'reinforced': '젖은 모래', 'unlockSawmill': '풍부한 모래', 'quarryStock': '자갈 비축',
      'unlockMortar': '진흙 박격포', 'heavyOrdnance': '더 큰 물벼락', 'unlockTesla': '벌레 퇴치기',
      'gateArmor': '성문 장갑', 'unlockQuarry': '깊은 굴착', 'richHauls': '풍성한 전리품',
      'wideFoundation': '넓은 기초', 'siegeShells': '강력한 물총', 'unlockFrost': '아이스바',
      'forkedBolts': '갈라지는 전기 충격', 'ironPlating': '단단한 모래', 'unlockRepair': '양동이와 삽',
      'unlockMint': '보물 지도', 'looting': '약탈', 'overcharge': '과충전',
      'masterwork': '명작', 'fieldRepairs': '야전 수리', 'greatFoundation': '대기초',
      'warChest': '보물 상자',
      'unlockSpikes': '이쑤시개 벽',
      'unlockBombard': '풍선 발사기',
      'sharpSpikes': '뾰족한 이쑤시개',
      'cavalryDrill': '기사 훈련',
      'artilleryDoctrine': '장거리 사격'
    },
    'descriptions': {
      'm2_lumberHut': '모래 체 해금 — 매 웨이브 후 모래를 줍니다.',
      'logistics': '자갈 굴착기 해금 — 필요한 그 판에서 살 수 있는 저렴한 생산 블록입니다.',
      'unlockCoffer': '골드를 주조하는 유일한 블록, 돼지 저금통을 해금합니다.',
      'yields': '경제 블록 산출량 +{n}%.',
      'unlockObelisk': '훨씬 강한 인접 강화인 마법 조개를 해금합니다.',
      'rallyCry': '강화 블록이 +{n}% 강해집니다.',
      'stockpiles': '경제 블록 산출량 +{n}%.',
      'forgeWelds': '합성 블록의 산출이 등급당 +{n}% — 피해, 가시, 생산.',
      'harbour': '해자 위에 배를 띄웁니다. 잠수한 벌레는 배만 공격할 수 있습니다.',
      'dockWorks': '등급마다 배를 띄우는 폭이 {n}칸 넓어집니다.',
      'unlockLongship': '묵직한 다트 작살을 실은 튼튼한 고무 오리입니다.',
      'seasonedHulls': '배가 체력 +{n}%로 시작합니다.',
      'navalGunnery': '배 무기 피해 +{n}%.',
      'unlockGalley': '코르크 대포, 망루, 그리고 걸을 수 있는 널빤지.',
      'admiralty': '배 무기 피해가 추가로 +{n}%.',
      'foundations': '성의 모든 블록이 체력 +{n}%로 시작합니다.',
      'sharpBolts': '성 무기의 피해가 등급당 +{n}%.',
      'unlockBrace': '다진 모래 해금 — 일반 모래 블록의 두 배 체력.',
      'lumberStock': '공성전 시작 모래가 등급당 +{n}.',
      'longSight': '모든 무기의 사거리가 등급당 +{n}%.',
      'rapidFire': '모든 무기의 공격 속도가 등급당 +{n}%.',
      'reinforced': '성의 모든 블록의 체력이 등급당 +{n}%.',
      'unlockSawmill': '모든 생산 건물 산출이 랭크당 +{n}%.',
      'quarryStock': '공성전 시작 자갈이 등급당 +{n}.',
      'unlockMortar': '진흙 박격포 해금 — 장거리 범위 피해.',
      'heavyOrdnance': '범위 반경이 등급당 +{n}%.',
      'unlockTesla': '벌레 퇴치기 해금 — 전기 충격이 벌레 사이로 튑니다.',
      'gateArmor': '성문 체력이 등급당 +{n}%.',
      'unlockQuarry': '모든 생산 건물 산출이 랭크당 +{n}% 추가.',
      'richHauls': '웨이브 보상이 등급당 +{n}%.',
      'wideFoundation': '건설 가능 폭이 등급당 {n}칸 확장.',
      'siegeShells': '성 무기의 피해가 등급당 +{n}%.',
      'unlockFrost': '아이스바 해금 — 무리 전체를 둔화.',
      'forkedBolts': '전기 충격이 등급당 벌레 {n}마리에게 더 튑니다.',
      'ironPlating': '모든 블록의 방어가 등급당 +{n}.',
      'unlockRepair': '양동이와 삽 해금 — 매 웨이브 인접 블록 회복.',
      'unlockMint': '모든 생산 건물 산출이 랭크당 +{n}% 추가.',
      'looting': '벌레의 코인 드롭이 등급당 +{n}%.',
      'overcharge': '모든 무기의 공격 속도가 등급당 +{n}%.',
      'masterwork': '성 무기의 피해가 등급당 +{n}%.',
      'fieldRepairs': '방어한 웨이브마다 각 블록이 최대 체력의 {n}%를 등급당 회복.',
      'greatFoundation': '건설 가능 폭이 등급당 {n}칸 더 확장.',
      'warChest': '웨이브 보상이 등급당 +{n}%.',
      'unlockSpikes': '이쑤시개 벽 해금 — 공격한 적이 스스로 찔립니다.',
      'unlockBombard': '풍선 발사기 해금 — 지상의 벌레를 향한 근거리 물풍선 공격.',
      'sharpSpikes': '이쑤시개 벽의 반사 피해가 랭크당 +{n}%.',
      'cavalryDrill': '장난감 기사의 체력과 피해량이 랭크당 +{n}%.',
      'artilleryDoctrine': '모든 무기의 사거리가 랭크당 +{n}%.'
    }
  },

  'resources': {
    'wood': '모래',
    'stone': '자갈',
    'gold': '금'
  },

  'ads': {
    'watch': '시청', 'revive': '부활', 'secondChance': '두 번째 기회',
    'doubleCoins': '2× 코인', 'plusCoins': '+{n} 코인'
  },

  'achievements': {
    'title': '업적', 'subtitle': '누적 목표를 달성해 코인을 얻으세요.',
    'claim': '수령', 'claimed': '수령함', 'progress': '{c} / {t}',
    'items': {
      'wave5': { 'name': '첫 저항', 'desc': '웨이브 5까지 버티세요.' },
      'wave10': { 'name': '요새', 'desc': '웨이브 10까지 버티세요.' },
      'wave20': { 'name': '방벽', 'desc': '웨이브 20까지 버티세요.' },
      'wave30': { 'name': '불굴', 'desc': '웨이브 30까지 버티세요.' },
      'waves50': { 'name': '방파제', 'desc': '누적 50 웨이브를 막으세요.' },
      'waves250': { 'name': '공성 베테랑', 'desc': '누적 250 웨이브를 막으세요.' },
      'kills500': { 'name': '수호자', 'desc': '누적 500마리의 벌레를 처치하세요.' },
      'kills5k': { 'name': '벌레 잡이', 'desc': '누적 5,000마리의 벌레를 처치하세요.' },
      'kills50k': { 'name': '전설', 'desc': '누적 50,000마리의 벌레를 처치하세요.' },
      'height10': { 'name': '하늘로', 'desc': '높이 10블록의 타워를 지으세요.' },
      'height20': { 'name': '구름 뚫기', 'desc': '높이 20블록의 타워를 지으세요.' },
      'blocks250': { 'name': '건축가', 'desc': '누적 250개의 블록을 설치하세요.' },
      'blocks2k': { 'name': '설계자', 'desc': '누적 2,000개의 블록을 설치하세요.' },
      'coins5k': { 'name': '코인 수집가', 'desc': '누적 5,000 코인을 벌으세요.' },
      'coins50k': { 'name': '재무관', 'desc': '누적 50,000 코인을 벌으세요.' },
      'runs25': { 'name': '끈기', 'desc': '25번의 공성전을 시작하세요.' }
    }
  },

  'missions': {
    'title': '일일 미션', 'subtitle': '매일 목표를 완료하고 코인을 받으세요.',
    'claim': '수령', 'done': '수령함',
    'types': {
      'coins': '오늘 {n} 코인 획득',
      'waves': '한 번의 공성전에서 웨이브 {n}까지 버티기',
      'kills': '오늘 벌레 {n}마리 처치',
      'blocks': '오늘 블록 {n}개 설치'
    }
  },

  'battlePass': {
    'title': '배틀패스', 'progress': '{current} / {total}', 'daysLeft': '{n}일 남음',
    'maxed': '배틀패스 완료', 'xpProgress': '{current} / {total} XP',
    'howToEarn': 'XP 획득 방법', 'perRun': '공성전당', 'perWave': '방어한 웨이브당',
    'unlockHint': '{n} XP를 모으면 다음 보상이 해금됩니다 — 수령하지 않은 보상은 그대로 남습니다.'
  },

  'dailyRewards': {
    'title': '일일 보상', 'subtitle': '매일 접속해 연속 기록을 이어가세요.',
    'day': '{n}일차', 'dayShort': 'D{n}'
  },

  'options': {
    'title': '설정', 'general': '일반', 'audio': '오디오', 'language': '언어',
    'difficulty': '난이도', 'soundEffects': '효과음', 'music': '음악', 'musicTrack': '음악 트랙',
    'musicTracks': { 'cozy': '아늑한 하모니', 'trance': '트랜스 터널' },
    'close': '저장 후 닫기',
    'difficulties': { 'easy': '쉬움', 'medium': '보통', 'hard': '어려움' },
    'difficultyHints': {
      'easy': '웨이브가 작고 벌레가 약합니다.',
      'medium': '표준적이고 균형 잡힌 공성전.',
      'hard': '웨이브가 빽빽하고 벌레가 단단합니다.'
    }
  },

  'adsBlocked': {
    'title': '광고를 표시할 수 없습니다',
    'body': '보상을 드리려고 영상을 재생하려 했지만, 브라우저의 무언가가 광고를 차단하고 있습니다.',
    'allowPrefix': '다음 사이트에서 광고를 허용해 주세요:',
    'allowSuffix': '(또는 이 게임에 한해 광고 차단기를 일시 중지) 후 다시 시도하세요.',
    'gotIt': '알겠습니다'
  },
  'saveStatus': {
    'restoredTitle': '클라우드 저장이 복원되었습니다', 'restoredBody': '복구 보너스 +{n} 코인',
    'tap': '탭', 'pausedTitle': '클라우드 동기화 일시 중지',
    'pausedBody': '오프라인으로 플레이 중입니다. 진행 상황은 여기에 저장됩니다.',
    'retry': '다시 시도', 'dismiss': '닫기'
  },
  'loading': { 'tooLong': '로딩이 너무 오래 걸리나요? 광고 차단기를 끄고 새로고침하세요.' },
  'license': { 'denied': '접근이 거부되었습니다: 라이선스를 구매해 주세요.' }
}
