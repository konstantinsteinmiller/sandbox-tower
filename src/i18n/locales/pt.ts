export default {
  'gameName': 'Sandbox Tower',
  'cancel': 'Cancelar',
  'close': 'Fechar',
  'ok': 'Ok',
  'continue': 'Continuar',
  'tapToContinue': 'Toque para continuar',
  'clickToContinue': 'Clique para continuar',
  'rewards': 'RECOMPENSAS',
  'tip': 'Dica',
  'crazyGamesOnly': 'Este jogo só está disponível em',

  // ─── Mobile-fit game (Drop & Merge) ───────────────────────────────────────
  'gift': {
    'free': 'Grátis',
    'tile': '{name} grátis, nível {n}: toque nele e depois no tabuleiro para colocá-lo',
    'pair': 'Par de {name} grátis: toque nele e depois no tabuleiro para colocá-lo',
    'tilePaid': '{name}, nível {n}, pela metade do preço: toque nele e depois no tabuleiro para colocá-lo',
    'pairPaid': 'Par de {name} pela metade do preço: toque nele e depois no tabuleiro para colocá-lo',
    'discount': '-{n}%',
    'chest': 'Baú voador: toque para abri-lo',
    'firstClear': 'Onda {n} vencida! Um presente para você'
  },

  'mobile': {
    'rotatePortrait': 'Segure o celular na vertical para jogar',
    'columnFull': 'Coluna cheia',
    'repairAll': 'Reparar tudo',
    'volley': 'Rajada',
    'swap': 'Trocar',
    'menu': 'Menu',
    'materials': 'materiais',
    'zoom': 'Zoom'
  },

  'hud': {
    'wave': 'Onda', 'enemies': 'Bichos', 'callWave': 'Chamar onda', 'callBoss': 'Chamar chefe',
    'monstersIncoming': 'Bichos a caminho!',
    'skip': 'Saltar',
    'speed': 'Velocidade {n}×',
    'speedOffer': 'Desbloquear velocidade {n}×',
    'speedGroup': 'Velocidade do jogo', 'recenter': 'Centralizar a vista',
    'rotateLeft': 'Girar à esquerda',
    'rotateRight': 'Girar à direita',
    'arrowRain': 'Chuva de dardos',
    'arrowRainAim': 'Toque no campo de batalha para chamar a salva',
    'extendRange': '+{n}% de alcance'
  },


  // ─── The opening cutscene ─────────────────────────────────────────────────
  // Three lines across the ten-second fly-over west of the tower, one per beat:
  // the tower, the horde, the siege train. The fourth thing the player reads is
  // `hud.monstersIncoming`, shown over the engines rather than over the board.
  'intro': {
    'premise': 'O teu castelo de areia é a última coisa de pé.',
    'horde': 'Os bichos já estão a marchar.',
    'siege': 'E construíram engenhocas.'
  },

  'warnings': {
    'hoard': 'Reservas +{n}%',
    'air': 'Ar ×{n}',
    'sea': 'Água ×{n}',
    'bombers': 'Explosivos ×{n}',
    'siege': 'Cerco ×{n}',
    'outOfReach': 'Fora de alcance ×{n} — precisa de {m} de alcance'
  },
  'hints': {
    'dropBlock': {
      'touch': 'Toque numa coluna para soltar a peça',
      'desktop': 'Clique numa coluna para soltar a peça'
    },
    'mergeBlock': {
      'touch': 'Pouse uma peça sobre a sua gêmea para fundi-las',
      'desktop': 'Pouse uma peça sobre a sua gêmea para fundi-las'
    },
    'selectBlock': { 'touch': 'Toque num bloco abaixo para escolhê-lo', 'desktop': 'Clique num bloco abaixo para escolhê-lo' },
    'placeBlock': { 'touch': 'Agora toque num espaço iluminado para construir', 'desktop': 'Agora clique num espaço iluminado para construir' },
    'camera': { 'touch': 'Arraste para mover · Pinça para ampliar', 'desktop': 'Arraste para mover · Rolagem para ampliar' },
    'callWave': { 'touch': 'Toque em «Chamar onda» quando a torre estiver pronta', 'desktop': 'Pressione Espaço para adiantar a onda' },
    'inspect': { 'touch': 'Segure um bloco para inspecioná-lo', 'desktop': 'Clique num bloco para inspecioná-lo' }
  },

  'tips': {
    'eco': 'Peneiras de areia e escavadoras de seixos pagam a cada vaga. Duas ou três mudam o que consegues pagar.',
    'buff': 'As bandeirinhas de papel reforçam tudo o que tocam e multiplicam-se. Rodeia uma arma de brinquedo em vez de as espalhar.',
    'merge': 'Duas armas iguais lado a lado fundem-se. Empilha duas dessas para fazer um 2×2.',
    'spend': 'Tens moedas por gastar. Os níveis da árvore são permanentes e valem em todas as partidas.',
    'branches': 'Três árvores separadas: o castelo, a piscina e a oficina. Nenhuma precisa das outras.',
    'shape': 'Muros à frente, armas atrás. Um bloco que nunca é atingido é um bloco que nunca reconstróis.',
    'gold': 'O ouro compra melhorias de bloco — toca num bloco. Os mealheiros cunham mais a cada vaga.',
    'siegeReach': 'Os trebuchetes de lápis ficam além do alcance do lança-dardos, da pistola de água ou do lança-balões. Responda com um Morteiro de lama — ou um Navio pirata de brinquedo da piscina.'
  },
  'blocks': {
    'fortify': 'Adicionar palitos',
    'sell': 'Vender',
    'mergeTier': 'Fundido {n}×',
    'upgrade': 'Melhorar',
    'upgradeMax': 'Totalmente melhorado',
    'rank': 'Nv {n}/{max}',
    'reinforced': 'Reforçado',
    'roofed': 'Com telhado',
    'roofNote': 'Com telhado: PV em dobro e defesa tripla vinda de cima. Precisa de céu livre.',
    'enhancedNote': 'Reforçado: +{hp}% de PV e +{dmg}% de dano.',
    'enhancedHand': 'Mão reforçada',
    'reroll': 'Trocar esta peça',
    'kinds': {
      'buff': 'Reforço', 'core': 'Núcleo', 'structure': 'Estrutura', 'weapon': 'Arma', 'economy': 'Economia', 'utility': 'Utilidade', 'ship': 'Barco' },
    'stats': {
      'yieldGold': 'Ouro / vaga',
      'buff': 'Reforço vizinho',
      'topDefense': 'Defesa superior',
      'hp': 'PV', 'armor': 'Armadura', 'dmg': 'Dano', 'cooldown': 'Recarga', 'range': 'Alcance',
      'splash': 'Área', 'yieldWood': 'Areia / onda', 'yieldStone': 'Seixos / onda', 'yieldCoins': 'Moedas / onda',
      'repair': 'Reparo / onda', 'blast': 'Explosão',
      'thorns': 'Espinhos'
    },
    'names': {
      'banner': 'Bandeirinha de papel',
      'obelisk': 'Concha mágica',
      'lumberHut': 'Peneira de areia',
      'stonepit': 'Escavadora de seixos',
      'coffer': 'Mealheiro',
      'skiff': 'Barquinho de papel', 'longship': 'Pato de borracha', 'galley': 'Navio pirata de brinquedo',
      'gate': 'Portão do castelo', 'wood': 'Bloco de areia', 'brace': 'Areia compactada', 'stone': 'Muro de seixos',
      'archer': 'Lança-dardos', 'cannon': 'Pistola de água', 'mortar': 'Morteiro de lama', 'tesla': 'Mata-bichos',
      'frost': 'Gelado de pau', 'repair': 'Balde e pá',
      'spikes': 'Muro de palitos',
      'bombard': 'Lança-balões'
    },
    'descriptions': {
      'banner': 'Reforça todos os blocos vizinhos. Duas bandeirinhas num bloco acumulam.',
      'obelisk': 'Uma bandeirinha mais forte. As auras multiplicam-se: duas valem muito mais que o dobro.',
      'lumberHut': 'Peneira areia no fim de cada vaga superada.',
      'stonepit': 'Escava seixos no fim de cada vaga superada.',
      'coffer': 'Cunha ouro a cada vaga — a moeda das melhorias de bloco.',
      'skiff': 'Flutua na piscina. Atinge bichos submersos.',
      'longship': 'Arpão de dardo pesado. Resistente e com mais alcance que a margem.',
      'galley': 'Canhões de cortiça e um ninho de corvo. A piscina é tua.',
      'gate': 'O coração do teu castelo de areia. Se cair, o cerco acaba.',
      'wood': 'Enchimento barato. A espinha dorsal de todo castelo inicial.',
      'brace': 'O dobro de areia e mais que o dobro de resistência.',
      'stone': 'Pesado e blindado. Melhor na base.',
      'archer': 'Dardos de espuma rápidos num alvo único. Atinge voadores.',
      'cannon': 'Lento, com forte dano em área. Encharca multidões.',
      'mortar': 'Bolas de lama em arco de longo alcance, mas não atinge voadores.',
      'tesla': 'Choques que saltam entre bichos próximos.',
      'frost': 'Congela grupos inteiros e os deixa lentíssimos.',
      'repair': 'Repara todos os blocos vizinhos entre as ondas.',
      'spikes': 'Os atacantes se picam nele a cada golpe.',
      'bombard': 'Lança um balão de água quase na vertical. Splash pequeno, só bichos terrestres.'
    },
    'repair': 'Reparar',
    'repairCooldown': '{n} s',
    'reposition': 'Mover este bloco'
  },

  'enemies': {
    'names': {
      'grunt': 'Formiga', 'runner': 'Barata', 'slinger': 'Aranha', 'brute': 'Besouro rinoceronte',
      'bomber': 'Besouro bombardeiro', 'bat': 'Mosca', 'bulwark': 'Bicho-de-conta', 'golem': 'Cervo-voador',
      'wyvern': 'Vespão',
      'eel': 'Tigre-da-água',
      'shark': 'Besouro-mergulhador',
      'kraken': 'Barata-d’água gigante',
      'seadrake': 'Ninfa de libélula',
      'ram': 'Aríete de lápis',
      'ballista': 'Besta de elástico',
      'catapult': 'Catapulta de colher',
      'siegeTower': 'Torre de caixinha de suco',
      'trebuchet': 'Trabuco de lápis',
      'ironRam': 'Aríete de lata',
      'bombardier': 'Abelhão',
      'firebug': 'Pirilampo'
    }
  },

  // ─── Allies ───────────────────────────────────────────────────────────────
  'allies': {
    'cavalry': 'Cavaleiros de brinquedo',
    'cavalryFree': 'Carga grátis dos cavaleiros de brinquedo',
    'free': 'Grátis',
    'outOfReachHint': 'Fora de alcance — envie os cavaleiros ou aumente seu alcance'
  },

  'result': {
    'towerFell': 'Destruída!',
    'reachedWave': 'Você sobreviveu até a onda {n}',
    'newRecord': 'Novo recorde!',
    'upgrade': 'Melhorar!',
    'defendAgain': 'Defender de novo',
    'continueRun': 'Reconstruir e continuar',
    'continueWave': 'Onda {n}',
    'tripleCoins': 'Triplicar moedas',
    'tripleWave': '3× moedas — {n}',
    'waveCleared': 'Onda {n} contida!',
    'scoreLabel': 'Pontos',
    'bestLabel': 'Recorde',
    'scoreCurrent': '({n} nesta partida)',
    'rankLabel': 'Posição',
    'rankOf': 'de {n}'
  },

  'tech': {
    'blueprints': {
      'title': 'Projetos'
    },
    'intro1': 'Tudo o que compras aqui é permanente e acompanha-te em todas as partidas.',
    'intro2': 'As moedas vêm de cada cerco, ganhes ou percas. É aqui que as gastas.',
    'intro3': 'Os nós dourados já podes pagar. Os azuis pedem mais moedas; os apagados, o nó anterior.',
    'introNext': 'Próximo',
    'introDone': 'Entendi',
    'sell': 'Vender nível',
    'sellBlocked': 'Venda antes {n} — ele precisa disto.',
    'title': 'Árvore tecnológica',
    'rank': 'Nível {current}/{total}',
    'maxed': 'No máximo',
    'rankOpen': 'Nível {n}',
    'atRank': 'No nível {r}: {n} no total',
    'owned': 'Desbloqueado',
    'requires': 'Requer {n}',
    'spotlight': 'Gaste!',
    'names': {
      'm2_lumberHut': 'Peneira de areia',
      'logistics': 'Equipa de escavação',
      'unlockCoffer': 'Mealheiros',
      'yields': 'Rendimentos',
      'unlockObelisk': 'Conchas mágicas',
      'rallyCry': 'Grito de guerra',
      'stockpiles': 'Reservas',
      'forgeWelds': 'Supercola',
      'harbour': 'Piscina', 'dockWorks': 'Piscina maior',
      'unlockLongship': 'Pato de borracha', 'seasonedHulls': 'Barcos resistentes',
      'navalGunnery': 'Canhões dos barcos', 'unlockGalley': 'Navio pirata de brinquedo',
      'admiralty': 'Almirante Pato',
      'foundations': 'Fundações', 'sharpBolts': 'Dardos pontiagudos', 'unlockBrace': 'Areia compactada',
      'lumberStock': 'Reserva de areia', 'longSight': 'Visão longa', 'rapidFire': 'Tiro rápido',
      'reinforced': 'Mistura de areia molhada', 'unlockSawmill': 'Areia rica', 'quarryStock': 'Reserva de seixos',
      'unlockMortar': 'Morteiro de lama', 'heavyOrdnance': 'Splash maior', 'unlockTesla': 'Mata-bichos',
      'gateArmor': 'Blindagem do portão', 'unlockQuarry': 'Escavação profunda', 'richHauls': 'Espólio farto',
      'wideFoundation': 'Fundação ampla', 'siegeShells': 'Pistolas de água potentes', 'unlockFrost': 'Gelado de pau',
      'forkedBolts': 'Choques bifurcados', 'ironPlating': 'Areia endurecida', 'unlockRepair': 'Balde e pá',
      'unlockMint': 'Mapa do tesouro', 'looting': 'Pilhagem', 'overcharge': 'Sobrecarga',
      'masterwork': 'Obra-prima', 'fieldRepairs': 'Reparos de campo', 'greatFoundation': 'Grande fundação',
      'warChest': 'Baú do tesouro',
      'unlockSpikes': 'Muro de palitos',
      'unlockBombard': 'Lança-balões',
      'sharpSpikes': 'Palitos afiados',
      'cavalryDrill': 'Treino dos cavaleiros',
      'artilleryDoctrine': 'Tiros longos'
    },
    'descriptions': {
      'm2_lumberHut': 'Desbloqueia a Peneira de areia — rende areia após cada onda.',
      'logistics': 'Desbloqueia a Escavadora de seixos — um produtor barato que consegues pagar na partida em que importa.',
      'unlockCoffer': 'Desbloqueia o mealheiro, o único bloco que cunha ouro.',
      'yields': 'Cada bloco de economia rende +{n}% mais.',
      'unlockObelisk': 'Desbloqueia a concha mágica, um reforço vizinho muito mais forte.',
      'rallyCry': 'Os blocos de reforço são +{n}% mais fortes.',
      'stockpiles': 'Cada bloco de economia rende +{n}% mais.',
      'forgeWelds': 'Blocos fundidos rendem +{n} % mais por nível: dano, espinhos e produção.',
      'harbour': 'Ponha barcos a flutuar na piscina. Só eles atingem bichos submersos.',
      'dockWorks': 'Os barcos flutuam {n} casa mais longe por nível.',
      'unlockLongship': 'Um pato de borracha resistente com um arpão de dardo pesado.',
      'seasonedHulls': 'Os barcos começam com +{n}% de PV.',
      'navalGunnery': 'As armas dos barcos causam +{n}% de dano.',
      'unlockGalley': 'Canhões de cortiça, um ninho de corvo e uma prancha.',
      'admiralty': 'As armas dos barcos causam mais +{n}% de dano.',
      'foundations': 'Cada bloco do castelo começa com +{n} % de PV.',
      'sharpBolts': 'As armas do castelo causam +{n} % de dano por nível.',
      'unlockBrace': 'Desbloqueia a areia compactada: o dobro dos PV de um bloco de areia normal.',
      'lumberStock': 'Comece cada cerco com +{n} de areia por nível.',
      'longSight': 'Todas as armas alcançam +{n} % mais longe por nível.',
      'rapidFire': 'Todas as armas atiram {n} % mais rápido por nível.',
      'reinforced': 'Cada bloco do castelo ganha +{n} % de PV por nível.',
      'unlockSawmill': 'Cada produtor rende +{n}% a mais por nível.',
      'quarryStock': 'Comece cada cerco com +{n} de seixos por nível.',
      'unlockMortar': 'Desbloqueia o morteiro de lama: dano em área a longa distância.',
      'heavyOrdnance': 'Raio de área +{n} % por nível.',
      'unlockTesla': 'Desbloqueia o mata-bichos: os choques saltam entre bichos.',
      'gateArmor': 'O portão do castelo ganha +{n} % de PV por nível.',
      'unlockQuarry': 'Cada produtor rende mais +{n}% por nível.',
      'richHauls': 'Recompensas de onda +{n} % por nível.',
      'wideFoundation': 'Construa {n} colunas mais largas por nível.',
      'siegeShells': 'As armas do castelo causam +{n} % de dano por nível.',
      'unlockFrost': 'Desbloqueia o gelado de pau: retarda grupos inteiros.',
      'forkedBolts': 'O choque salta para {n} bicho a mais por nível.',
      'ironPlating': 'Cada bloco ganha +{n} de armadura por nível.',
      'unlockRepair': 'Desbloqueia o balde e pá: cura os vizinhos a cada onda.',
      'unlockMint': 'Cada produtor rende mais +{n}% por nível.',
      'looting': 'Bichos soltam +{n} % mais moedas por nível.',
      'overcharge': 'Todas as armas atiram {n} % mais rápido por nível.',
      'masterwork': 'As armas do castelo causam +{n} % de dano por nível.',
      'fieldRepairs': 'Cada bloco recupera {n} % dos PV máximos por onda contida e por nível.',
      'greatFoundation': 'Construa mais {n} colunas de largura por nível.',
      'warChest': 'Recompensas de onda +{n} % por nível.',
      'unlockSpikes': 'Desbloqueia o Muro de palitos — os atacantes se picam nele.',
      'unlockBombard': 'Desbloqueia o Lança-balões — balões de água de curto alcance contra bichos terrestres.',
      'sharpSpikes': 'Muros de palitos refletem +{n}% mais dano por nível.',
      'cavalryDrill': 'Os cavaleiros de brinquedo saem com +{n}% de PV e dano por nível.',
      'artilleryDoctrine': 'Todas as armas alcançam +{n}% mais longe por nível.'
    }
  },

  'resources': {
    'wood': 'areia',
    'stone': 'seixos',
    'gold': 'ouro'
  },

  'ads': {
    'watch': 'Assistir', 'revive': 'Reviver', 'secondChance': 'Segunda chance',
    'doubleCoins': '2× moedas', 'plusCoins': '+{n} moedas'
  },

  'achievements': {
    'title': 'Conquistas', 'subtitle': 'Alcance marcos permanentes para ganhar moedas.',
    'claim': 'Resgatar', 'claimed': 'Resgatado', 'progress': '{c} / {t}',
    'items': {
      'wave5': { 'name': 'Primeira defesa', 'desc': 'Sobreviva até a onda 5.' },
      'wave10': { 'name': 'Fortaleza', 'desc': 'Sobreviva até a onda 10.' },
      'wave20': { 'name': 'Baluarte', 'desc': 'Sobreviva até a onda 20.' },
      'wave30': { 'name': 'Inquebrável', 'desc': 'Sobreviva até a onda 30.' },
      'waves50': { 'name': 'Quebra-ondas', 'desc': 'Contenha 50 ondas no total.' },
      'waves250': { 'name': 'Veterano de cercos', 'desc': 'Contenha 250 ondas no total.' },
      'kills500': { 'name': 'Defensor', 'desc': 'Esmague 500 bichos no total.' },
      'kills5k': { 'name': 'Esmaga-bichos', 'desc': 'Esmague 5.000 bichos no total.' },
      'kills50k': { 'name': 'Lenda', 'desc': 'Esmague 50.000 bichos no total.' },
      'height10': { 'name': 'Rumo ao céu', 'desc': 'Construa uma torre de 10 blocos de altura.' },
      'height20': { 'name': 'Fura-nuvens', 'desc': 'Construa uma torre de 20 blocos de altura.' },
      'blocks250': { 'name': 'Construtor', 'desc': 'Posicione 250 blocos no total.' },
      'blocks2k': { 'name': 'Arquiteto', 'desc': 'Posicione 2.000 blocos no total.' },
      'coins5k': { 'name': 'Colecionador', 'desc': 'Ganhe 5.000 moedas no total.' },
      'coins50k': { 'name': 'Tesoureiro', 'desc': 'Ganhe 50.000 moedas no total.' },
      'runs25': { 'name': 'Persistente', 'desc': 'Inicie 25 cercos.' }
    }
  },

  'missions': {
    'title': 'Missões diárias', 'subtitle': 'Cumpra objetivos todos os dias para ganhar moedas.',
    'claim': 'Resgatar', 'done': 'Resgatado',
    'types': {
      'coins': 'Ganhe {n} moedas hoje',
      'waves': 'Sobreviva até a onda {n} num cerco',
      'kills': 'Esmague {n} bichos hoje',
      'blocks': 'Posicione {n} blocos hoje'
    }
  },

  'battlePass': {
    'title': 'Passe de batalha', 'progress': '{current} / {total}', 'daysLeft': 'Faltam {n} d',
    'maxed': 'PASSE DE BATALHA COMPLETO', 'xpProgress': '{current} / {total} XP',
    'howToEarn': 'Como ganhar XP', 'perRun': 'por cerco', 'perWave': 'por onda contida',
    'unlockHint': 'Alcance {n} XP para a próxima recompensa — as não resgatadas permanecem disponíveis.'
  },

  'dailyRewards': {
    'title': 'Recompensas diárias', 'subtitle': 'Entre todos os dias para manter sua sequência.',
    'day': 'Dia {n}', 'dayShort': 'D{n}'
  },

  'options': {
    'title': 'Opções', 'general': 'Geral', 'audio': 'Áudio', 'language': 'Idioma',
    'difficulty': 'Dificuldade', 'soundEffects': 'Efeitos sonoros', 'music': 'Música', 'musicTrack': 'Faixa musical',
    'musicTracks': { 'cozy': 'Harmonia aconchegante', 'trance': 'Túnel trance' },
    'close': 'Salvar e fechar',
    'difficulties': { 'easy': 'Fácil', 'medium': 'Médio', 'hard': 'Difícil' },
    'difficultyHints': {
      'easy': 'Ondas menores e bichos mais fracos.',
      'medium': 'O cerco padrão e equilibrado.',
      'hard': 'Ondas mais densas e bichos mais resistentes.'
    }
  },

  'adsBlocked': {
    'title': 'Não foi possível exibir o anúncio',
    'body': 'Tentamos mostrar um vídeo para você ganhar sua recompensa, mas algo no seu navegador está bloqueando anúncios.',
    'allowPrefix': 'Permita anúncios em',
    'allowSuffix': '(ou pause seu bloqueador para este jogo) e tente novamente.',
    'gotIt': 'Entendi'
  },
  'saveStatus': {
    'restoredTitle': 'Salvamento na nuvem restaurado', 'restoredBody': '+{n} moedas de bônus pela recuperação',
    'tap': 'toque', 'pausedTitle': 'Sincronização pausada',
    'pausedBody': 'Jogando offline. Seu progresso está salvo aqui.',
    'retry': 'Tentar de novo', 'dismiss': 'dispensar'
  },
  'loading': { 'tooLong': 'O carregamento está demorando? Desative seu bloqueador de anúncios e recarregue.' },
  'license': { 'denied': 'Acesso negado: adquira uma licença.' }
}
