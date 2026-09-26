export default {
  'gameName': 'Sandbox Tower',
  'cancel': 'Cancelar',
  'close': 'Cerrar',
  'ok': 'Ok',
  'continue': 'Continuar',
  'tapToContinue': 'Toca para continuar',
  'clickToContinue': 'Haz clic para continuar',
  'rewards': 'RECOMPENSAS',
  'tip': 'Consejo',
  'crazyGamesOnly': 'Este juego solo está disponible en',

  // ─── Mobile-fit game (Drop & Merge) ───────────────────────────────────────
  'gift': {
    'free': 'Gratis',
    'tile': '{name} gratis, nivel {n}: tócalo y luego toca el tablero para colocarlo',
    'pair': 'Pareja de {name} gratis: tócala y luego toca el tablero para colocarla',
    'tilePaid': '{name}, nivel {n}, a mitad de precio: tócalo y luego toca el tablero para colocarlo',
    'pairPaid': 'Pareja de {name} a mitad de precio: tócala y luego toca el tablero para colocarla',
    'discount': '-{n} %',
    'chest': 'Cofre volador: tócalo para abrirlo',
    'firstClear': '¡Oleada {n} superada! Un regalo para ti'
  },

  'mobile': {
    'rotatePortrait': 'Sostén el móvil en vertical para jugar',
    'columnFull': 'Columna llena',
    'repairAll': 'Reparar todo',
    'volley': 'Descarga',
    'swap': 'Cambiar',
    'menu': 'Menú',
    'materials': 'materiales',
    'zoom': 'Zoom'
  },

  'hud': {
    'wave': 'Oleada', 'enemies': 'Bichos', 'callWave': 'Llamar oleada', 'callBoss': 'Llamar jefe',
    'monstersIncoming': '¡Llegan los bichos!',
    'skip': 'Saltar',
    'speed': 'Velocidad {n}×',
    'speedOffer': 'Desbloquear velocidad {n}×',
    'speedGroup': 'Velocidad del juego', 'recenter': 'Centrar la vista',
    'rotateLeft': 'Girar a la izquierda',
    'rotateRight': 'Girar a la derecha',
    'arrowRain': 'Lluvia de dardos',
    'arrowRainAim': 'Toca el campo de batalla para lanzar la descarga',
    'extendRange': '+{n}% de alcance'
  },


  // ─── The opening cutscene ─────────────────────────────────────────────────
  // Three lines across the ten-second fly-over west of the tower, one per beat:
  // the tower, the horde, the siege train. The fourth thing the player reads is
  // `hud.monstersIncoming`, shown over the engines rather than over the board.
  'intro': {
    'premise': 'Tu castillo de arena es lo último que sigue en pie.',
    'horde': 'Los bichos ya están en marcha.',
    'siege': 'Y han construido artilugios.'
  },

  'warnings': {
    'hoard': 'Reservas +{n}%',
    'air': 'Aire ×{n}',
    'sea': 'Agua ×{n}',
    'bombers': 'Explosivos ×{n}',
    'siege': 'Asedio ×{n}',
    'outOfReach': 'Fuera de alcance ×{n} — necesitas {m} de alcance'
  },
  'hints': {
    'dropBlock': {
      'touch': 'Toca una columna para soltar la pieza',
      'desktop': 'Haz clic en una columna para soltar la pieza'
    },
    'mergeBlock': {
      'touch': 'Deja caer una pieza sobre su gemela para fusionarlas',
      'desktop': 'Deja caer una pieza sobre su gemela para fusionarlas'
    },
    'selectBlock': { 'touch': 'Toca un bloque de abajo para elegirlo', 'desktop': 'Haz clic en un bloque de abajo para elegirlo' },
    'placeBlock': { 'touch': 'Ahora toca una casilla iluminada para construir', 'desktop': 'Ahora haz clic en una casilla iluminada para construir' },
    'camera': { 'touch': 'Arrastra para mover · Pellizca para acercar', 'desktop': 'Arrastra para mover · Rueda para acercar' },
    'callWave': { 'touch': 'Toca «Llamar oleada» cuando tu torre esté lista', 'desktop': 'Pulsa Espacio para adelantar la oleada' },
    'inspect': { 'touch': 'Mantén pulsado un bloque para inspeccionarlo', 'desktop': 'Haz clic en un bloque para inspeccionarlo' }
  },

  'tips': {
    'eco': 'Los cedazos de arena y las excavadoras de guijarros pagan cada oleada. Dos o tres cambian lo que puedes permitirte.',
    'buff': 'Las banderitas de papel refuerzan todo lo contiguo, y se multiplican. Rodea un arma de juguete en vez de repartirlas.',
    'merge': 'Dos armas iguales contiguas se fusionan. Apila dos de esas para formar un 2×2.',
    'spend': 'Te sobran monedas. Los rangos del árbol son permanentes: valen en todas tus partidas.',
    'branches': 'Tres árboles separados: el castillo, la piscina y el taller. Ninguno depende de otro.',
    'shape': 'Muros delante, armas detrás. Un bloque al que nunca golpean es un bloque que nunca reconstruyes.',
    'gold': 'El oro compra mejoras de bloque: toca un bloque para gastarlo. Las huchas acuñan más cada oleada.',
    'siegeReach': 'Los trabuquetes de lápiz se sitúan más lejos de lo que alcanzan la lanzadardos, la pistola de agua o el lanzaglobos. Respóndeles con un Mortero de barro, o con un Barco pirata de juguete de la piscina.'
  },
  'blocks': {
    'fortify': 'Añadir palillos',
    'sell': 'Vender',
    'mergeTier': 'Fusionado {n}×',
    'upgrade': 'Mejorar',
    'upgradeMax': 'Mejora máxima',
    'rank': 'Nv {n}/{max}',
    'reinforced': 'Reforzado',
    'roofed': 'Con tejado',
    'roofNote': 'Con tejado: el doble de PV y triple defensa desde arriba. Necesita cielo libre.',
    'enhancedNote': 'Reforzado: +{hp} % de PV y +{dmg} % de daño.',
    'enhancedHand': 'Mano reforzada',
    'reroll': 'Cambiar esta pieza',
    'kinds': {
      'buff': 'Mejora', 'core': 'Núcleo', 'structure': 'Estructura', 'weapon': 'Arma', 'economy': 'Economía', 'utility': 'Utilidad', 'ship': 'Bote' },
    'stats': {
      'yieldGold': 'Oro / oleada',
      'buff': 'Mejora contigua',
      'topDefense': 'Defensa superior',
      'hp': 'PV', 'armor': 'Armadura', 'dmg': 'Daño', 'cooldown': 'Recarga', 'range': 'Alcance',
      'splash': 'Área', 'yieldWood': 'Arena / oleada', 'yieldStone': 'Guijarros / oleada', 'yieldCoins': 'Monedas / oleada',
      'repair': 'Reparación / oleada', 'blast': 'Explosión',
      'thorns': 'Púas'
    },
    'names': {
      'banner': 'Banderita de papel',
      'obelisk': 'Concha mágica',
      'lumberHut': 'Cedazo de arena',
      'stonepit': 'Excavadora de guijarros',
      'coffer': 'Hucha',
      'skiff': 'Barco de papel', 'longship': 'Pato de goma', 'galley': 'Barco pirata de juguete',
      'gate': 'Puerta del castillo', 'wood': 'Bloque de arena', 'brace': 'Arena compactada', 'stone': 'Muro de guijarros',
      'archer': 'Lanzadardos', 'cannon': 'Pistola de agua', 'mortar': 'Mortero de barro', 'tesla': 'Matabichos',
      'frost': 'Paleta helada', 'repair': 'Cubo y pala',
      'spikes': 'Muro de palillos',
      'bombard': 'Lanzaglobos'
    },
    'descriptions': {
      'banner': 'Refuerza todos los bloques contiguos. Dos banderitas en un bloque se acumulan.',
      'obelisk': 'Una banderita más fuerte. Las auras se multiplican: dos valen mucho más que el doble.',
      'lumberHut': 'Criba arena al final de cada oleada superada.',
      'stonepit': 'Excava guijarros al final de cada oleada superada.',
      'coffer': 'Acuña oro cada oleada: la moneda que cuestan las mejoras de bloque.',
      'skiff': 'Flota en la piscina. Alcanza a los bichos sumergidos.',
      'longship': 'Arpón de dardo pesado. Resistente y con más alcance que la orilla.',
      'galley': 'Cañones de corcho y un nido de cuervo. La piscina es tuya.',
      'gate': 'El corazón de tu castillo de arena. Si cae, el asedio termina.',
      'wood': 'Relleno barato. La columna vertebral de todo castillo inicial.',
      'brace': 'El doble de arena y más del doble de resistencia.',
      'stone': 'Pesado y blindado. Mejor en la base.',
      'archer': 'Dardos de espuma rápidos a un objetivo. Alcanza a los voladores.',
      'cannon': 'Lento, con daño en área. Empapa multitudes.',
      'mortar': 'Bolas de barro en arco de largo alcance, pero no alcanza a los voladores.',
      'tesla': 'Chispazos que saltan entre bichos cercanos.',
      'frost': 'Congela grupos enteros y los deja al ralentí.',
      'repair': 'Repara los bloques vecinos entre oleadas.',
      'spikes': 'Los atacantes se pinchan con él en cada golpe.',
      'bombard': 'Lanza un globo de agua casi vertical. Splash pequeño, solo bichos terrestres.'
    },
    'repair': 'Reparar',
    'repairCooldown': '{n} s',
    'reposition': 'Mover este bloque'
  },

  'enemies': {
    'names': {
      'grunt': 'Hormiga', 'runner': 'Cucaracha', 'slinger': 'Araña', 'brute': 'Escarabajo rinoceronte',
      'bomber': 'Escarabajo bombardero', 'bat': 'Mosca', 'bulwark': 'Cochinilla', 'golem': 'Ciervo volante',
      'wyvern': 'Avispón',
      'eel': 'Tigre de agua',
      'shark': 'Escarabajo buceador',
      'kraken': 'Chinche gigante',
      'seadrake': 'Ninfa de libélula',
      'ram': 'Ariete de lápiz',
      'ballista': 'Ballesta de goma',
      'catapult': 'Catapulta de cuchara',
      'siegeTower': 'Torre de cartón de jugo',
      'trebuchet': 'Trabuquete de lápiz',
      'ironRam': 'Ariete de lata',
      'bombardier': 'Abejorro',
      'firebug': 'Luciérnaga'
    }
  },

  // ─── Allies ───────────────────────────────────────────────────────────────
  'allies': {
    'cavalry': 'Caballeros de juguete',
    'cavalryFree': 'Carga gratis de caballeros de juguete',
    'free': 'Gratis',
    'outOfReachHint': 'Fuera de alcance: envía a los caballeros o amplía tu alcance'
  },

  'result': {
    'towerFell': '¡Destruida!',
    'reachedWave': 'Sobreviviste hasta la oleada {n}',
    'newRecord': '¡Nuevo récord!',
    'upgrade': '¡Mejorar!',
    'defendAgain': 'Defender otra vez',
    'continueRun': 'Reconstruir y seguir',
    'continueWave': 'Oleada {n}',
    'tripleCoins': 'Triplicar monedas',
    'tripleWave': '3× monedas: {n}',
    'waveCleared': '¡Oleada {n} resistida!',
    'scoreLabel': 'Puntos',
    'bestLabel': 'Récord',
    'scoreCurrent': '({n} esta partida)',
    'rankLabel': 'Puesto',
    'rankOf': 'de {n}'
  },

  'tech': {
    'blueprints': {
      'title': 'Planos'
    },
    'intro1': 'Todo lo que compras aquí es permanente y se mantiene en cada partida futura.',
    'intro2': 'Las monedas llegan tras cada asedio, ganes o pierdas. Aquí es donde se gastan.',
    'intro3': 'Los nodos dorados ya puedes pagarlos. Los azules piden más monedas; los apagados, el nodo anterior.',
    'introNext': 'Siguiente',
    'introDone': 'Entendido',
    'sell': 'Vender rango',
    'sellBlocked': 'Vende antes {n}: lo necesita.',
    'title': 'Árbol tecnológico',
    'rank': 'Rango {current}/{total}',
    'maxed': 'Al máximo',
    'rankOpen': 'Rango {n}',
    'atRank': 'En rango {r}: {n} en total',
    'owned': 'Desbloqueado',
    'requires': 'Requiere {n}',
    'spotlight': '¡Gasta!',
    'names': {
      'm2_lumberHut': 'Cedazo de arena',
      'logistics': 'Equipo de Excavación',
      'unlockCoffer': 'Huchas',
      'yields': 'Rendimientos',
      'unlockObelisk': 'Conchas mágicas',
      'rallyCry': 'Grito de guerra',
      'stockpiles': 'Reservas',
      'forgeWelds': 'Superpegamento',
      'harbour': 'Piscina', 'dockWorks': 'Piscina más grande',
      'unlockLongship': 'Pato de goma', 'seasonedHulls': 'Barcos resistentes',
      'navalGunnery': 'Cañones de barco', 'unlockGalley': 'Barco pirata de juguete',
      'admiralty': 'Almirante Pato',
      'foundations': 'Cimientos', 'sharpBolts': 'Dardos puntiagudos', 'unlockBrace': 'Arena compactada',
      'lumberStock': 'Reserva de arena', 'longSight': 'Vista larga', 'rapidFire': 'Fuego rápido',
      'reinforced': 'Mezcla de arena húmeda', 'unlockSawmill': 'Arena rica', 'quarryStock': 'Reserva de guijarros',
      'unlockMortar': 'Mortero de barro', 'heavyOrdnance': 'Splash más grande', 'unlockTesla': 'Matabichos',
      'gateArmor': 'Blindaje del portón', 'unlockQuarry': 'Excavación profunda', 'richHauls': 'Botín abundante',
      'wideFoundation': 'Cimiento amplio', 'siegeShells': 'Súper pistolas de agua', 'unlockFrost': 'Paleta helada',
      'forkedBolts': 'Chispazos bifurcados', 'ironPlating': 'Arena endurecida', 'unlockRepair': 'Cubo y pala',
      'unlockMint': 'Mapa del tesoro', 'looting': 'Saqueo', 'overcharge': 'Sobrecarga',
      'masterwork': 'Obra maestra', 'fieldRepairs': 'Reparaciones de campo', 'greatFoundation': 'Gran cimiento',
      'warChest': 'Cofre del tesoro',
      'unlockSpikes': 'Muro de palillos',
      'unlockBombard': 'Lanzaglobos',
      'sharpSpikes': 'Palillos afilados',
      'cavalryDrill': 'Entrenamiento de caballeros',
      'artilleryDoctrine': 'Tiros largos'
    },
    'descriptions': {
      'm2_lumberHut': 'Desbloquea el Cedazo de arena: produce arena tras cada oleada.',
      'logistics': 'Desbloquea la Excavadora de guijarros: un productor barato que puedes costear en la partida en que importa.',
      'unlockCoffer': 'Desbloquea la hucha, el único bloque que acuña oro.',
      'yields': 'Cada bloque de economía rinde un +{n} % más.',
      'unlockObelisk': 'Desbloquea la concha mágica, una mejora contigua mucho más fuerte.',
      'rallyCry': 'Los bloques de mejora son un +{n} % más fuertes.',
      'stockpiles': 'Cada bloque de economía rinde un +{n} % más.',
      'forgeWelds': 'Los bloques fusionados rinden +{n} % más por rango: daño, púas y producción.',
      'harbour': 'Pon barcas a flotar en la piscina. Solo ellas alcanzan a los sumergidos.',
      'dockWorks': 'Las barcas flotan {n} casilla más lejos por rango.',
      'unlockLongship': 'Un pato de goma resistente con un arpón de dardo pesado.',
      'seasonedHulls': 'Las barcas empiezan con +{n} % de PV.',
      'navalGunnery': 'Las armas de las barcas causan +{n} % de daño.',
      'unlockGalley': 'Cañones de corcho, un nido de cuervo y una pasarela.',
      'admiralty': 'Las armas de las barcas causan +{n} % de daño adicional.',
      'foundations': 'Cada bloque del castillo empieza con +{n} % de PV.',
      'sharpBolts': 'Las armas del castillo hacen +{n} % de daño por rango.',
      'unlockBrace': 'Desbloquea la arena compactada: el doble de PV que un bloque de arena normal.',
      'lumberStock': 'Empieza cada asedio con +{n} de arena por rango.',
      'longSight': 'Todas las armas alcanzan un +{n} % más por rango.',
      'rapidFire': 'Todas las armas disparan un {n} % más rápido por rango.',
      'reinforced': 'Cada bloque del castillo gana +{n} % de PV por rango.',
      'unlockSawmill': 'Cada productor rinde un +{n}% más por rango.',
      'quarryStock': 'Empieza cada asedio con +{n} de guijarros por rango.',
      'unlockMortar': 'Desbloquea el mortero de barro: daño en área a larga distancia.',
      'heavyOrdnance': 'Radio de área +{n} % por rango.',
      'unlockTesla': 'Desbloquea el matabichos: los chispazos saltan entre bichos.',
      'gateArmor': 'La puerta del castillo gana +{n} % de PV por rango.',
      'unlockQuarry': 'Cada productor rinde un +{n}% adicional por rango.',
      'richHauls': 'Recompensas de oleada +{n} % por rango.',
      'wideFoundation': 'Construye {n} columnas más anchas por rango.',
      'siegeShells': 'Las armas del castillo hacen +{n} % de daño por rango.',
      'unlockFrost': 'Desbloquea la paleta helada: ralentiza grupos enteros.',
      'forkedBolts': 'El chispazo salta a {n} bicho más por rango.',
      'ironPlating': 'Cada bloque gana +{n} de armadura por rango.',
      'unlockRepair': 'Desbloquea el cubo y pala: cura a los vecinos cada oleada.',
      'unlockMint': 'Cada productor rinde un +{n}% adicional por rango.',
      'looting': 'Los bichos sueltan un +{n} % más de monedas por rango.',
      'overcharge': 'Todas las armas disparan un {n} % más rápido por rango.',
      'masterwork': 'Las armas del castillo hacen +{n} % de daño por rango.',
      'fieldRepairs': 'Cada bloque cura un {n} % de sus PV máximos por oleada resistida y rango.',
      'greatFoundation': 'Construye {n} columnas más anchas por rango.',
      'warChest': 'Recompensas de oleada +{n} % por rango.',
      'unlockSpikes': 'Desbloquea el Muro de palillos: los atacantes se pinchan con él.',
      'unlockBombard': 'Desbloquea el Lanzaglobos: globos de agua a corta distancia contra bichos terrestres.',
      'sharpSpikes': 'Los muros de palillos reflejan un +{n} % más de daño por rango.',
      'cavalryDrill': 'Los caballeros de juguete salen con +{n} % de PV y daño por rango.',
      'artilleryDoctrine': 'Todas las armas alcanzan un +{n} % más lejos por rango.'
    }
  },

  'resources': {
    'wood': 'arena',
    'stone': 'guijarros',
    'gold': 'oro'
  },

  'ads': {
    'watch': 'Ver', 'revive': 'Revivir', 'secondChance': 'Segunda oportunidad',
    'doubleCoins': '2× monedas', 'plusCoins': '+{n} monedas'
  },

  'achievements': {
    'title': 'Logros', 'subtitle': 'Alcanza hitos históricos para ganar monedas.',
    'claim': 'Reclamar', 'claimed': 'Reclamado', 'progress': '{c} / {t}',
    'items': {
      'wave5': { 'name': 'Primera defensa', 'desc': 'Sobrevive hasta la oleada 5.' },
      'wave10': { 'name': 'Fortaleza', 'desc': 'Sobrevive hasta la oleada 10.' },
      'wave20': { 'name': 'Baluarte', 'desc': 'Sobrevive hasta la oleada 20.' },
      'wave30': { 'name': 'Inquebrantable', 'desc': 'Sobrevive hasta la oleada 30.' },
      'waves50': { 'name': 'Rompeolas', 'desc': 'Resiste 50 oleadas en total.' },
      'waves250': { 'name': 'Veterano de asedios', 'desc': 'Resiste 250 oleadas en total.' },
      'kills500': { 'name': 'Defensor', 'desc': 'Aplasta a 500 bichos en total.' },
      'kills5k': { 'name': 'Aplastabichos', 'desc': 'Aplasta a 5.000 bichos en total.' },
      'kills50k': { 'name': 'Leyenda', 'desc': 'Aplasta a 50.000 bichos en total.' },
      'height10': { 'name': 'Hacia el cielo', 'desc': 'Construye una torre de 10 bloques de alto.' },
      'height20': { 'name': 'Rompenubes', 'desc': 'Construye una torre de 20 bloques de alto.' },
      'blocks250': { 'name': 'Constructor', 'desc': 'Coloca 250 bloques en total.' },
      'blocks2k': { 'name': 'Arquitecto', 'desc': 'Coloca 2.000 bloques en total.' },
      'coins5k': { 'name': 'Coleccionista', 'desc': 'Gana 5.000 monedas en total.' },
      'coins50k': { 'name': 'Tesorero', 'desc': 'Gana 50.000 monedas en total.' },
      'runs25': { 'name': 'Persistente', 'desc': 'Comienza 25 asedios.' }
    }
  },

  'missions': {
    'title': 'Misiones diarias', 'subtitle': 'Cumple objetivos cada día para ganar monedas.',
    'claim': 'Reclamar', 'done': 'Reclamado',
    'types': {
      'coins': 'Gana {n} monedas hoy',
      'waves': 'Sobrevive hasta la oleada {n} en un asedio',
      'kills': 'Aplasta a {n} bichos hoy',
      'blocks': 'Coloca {n} bloques hoy'
    }
  },

  'battlePass': {
    'title': 'Pase de batalla', 'progress': '{current} / {total}', 'daysLeft': 'Quedan {n} d',
    'maxed': 'PASE DE BATALLA COMPLETADO', 'xpProgress': '{current} / {total} XP',
    'howToEarn': 'Cómo ganar XP', 'perRun': 'por asedio', 'perWave': 'por oleada resistida',
    'unlockHint': 'Alcanza {n} XP para desbloquear la siguiente recompensa; las no reclamadas se conservan.'
  },

  'dailyRewards': {
    'title': 'Recompensas diarias', 'subtitle': 'Entra cada día para mantener tu racha.',
    'day': 'Día {n}', 'dayShort': 'D{n}'
  },

  'options': {
    'title': 'Opciones', 'general': 'General', 'audio': 'Audio', 'language': 'Idioma',
    'difficulty': 'Dificultad', 'soundEffects': 'Efectos de sonido', 'music': 'Música', 'musicTrack': 'Pista de música',
    'musicTracks': { 'cozy': 'Armonía acogedora', 'trance': 'Túnel trance' },
    'close': 'Guardar y cerrar',
    'difficulties': { 'easy': 'Fácil', 'medium': 'Media', 'hard': 'Difícil' },
    'difficultyHints': {
      'easy': 'Oleadas más pequeñas y bichos más débiles.',
      'medium': 'El asedio estándar y equilibrado.',
      'hard': 'Oleadas más densas y bichos más duros.'
    }
  },

  'adsBlocked': {
    'title': 'No se pudo mostrar el anuncio',
    'body': 'Intentamos mostrarte un vídeo para que ganaras tu recompensa, pero algo en tu navegador bloquea los anuncios.',
    'allowPrefix': 'Permite los anuncios en',
    'allowSuffix': '(o pausa tu bloqueador para este juego) e inténtalo de nuevo.',
    'gotIt': 'Entendido'
  },
  'saveStatus': {
    'restoredTitle': 'Guardado en la nube restaurado', 'restoredBody': '+{n} monedas de bonificación por la recuperación',
    'tap': 'toca', 'pausedTitle': 'Sincronización pausada',
    'pausedBody': 'Jugando sin conexión. Tu progreso se guarda aquí.',
    'retry': 'Reintentar', 'dismiss': 'descartar'
  },
  'loading': { 'tooLong': '¿La carga tarda demasiado? Desactiva tu bloqueador de anuncios y recarga.' },
  'license': { 'denied': 'Acceso denegado: adquiere una licencia.' }
}
