// Generar números aleatorios únicos
export const getRandomNumbers = (min, max, count) => {
  const numbers = [];
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
};

// Generar un cartón de bingo (5x5)
export const generateBingoCard = () => {
  const card = [];
  const ranges = [
    [1, 15],   // Columna B
    [16, 30],  // Columna I
    [31, 45],  // Columna N
    [46, 60],  // Columna G
    [61, 75]   // Columna O
  ];

  for (let col = 0; col < 5; col++) {
    const [min, max] = ranges[col];
    const column = getRandomNumbers(min, max, 5);
    
    // Centro libre en la columna N
    if (col === 2) {
      column[2] = 'FREE';
    }
    
    card.push(column);
  }

  // Convertir a formato de filas
  const cardByRows = [];
  for (let row = 0; row < 5; row++) {
    const rowData = [];
    for (let col = 0; col < 5; col++) {
      rowData.push(card[col][row]);
    }
    cardByRows.push(rowData);
  }

  return cardByRows;
};

// Generar código único para sala
export const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// ✅ MEJORADO: Obtener rangos de números válidos según el modo de juego
export const getValidNumberRanges = (gameMode) => {
  switch (gameMode) {
    case 'corners':
      // 4 Esquinas: Solo columnas B (1-15) y O (61-75)
      // Esquinas: [0][0], [0][4], [4][0], [4][4]
      return [
        [1, 15],    // Columna B
        [61, 75]    // Columna O
      ];

    case 'X':
      // Modo X: Ambas diagonales
      // Diagonal principal: [0][0], [1][1], [2][2], [3][3], [4][4]
      // Diagonal secundaria: [0][4], [1][3], [2][2], [3][1], [4][0]
      // Centro [2][2] es FREE en ambas diagonales
      // Solo necesita: B, I, G, O (NO necesita N porque es FREE)
      return [
        [1, 15],    // Columna B
        [16, 30],   // Columna I
        [46, 60],   // Columna G
        [61, 75]    // Columna O
        // ❌ NO incluye [31, 45] (Columna N) porque [2][2] es FREE
      ];

    case 'full':
    case 'line':
    case 'L':
    default:
      // Todos los demás modos necesitan cualquier número
      return [
        [1, 75]     // Todos los números
      ];
  }
};

// ✅ MEJORADO: Obtener número aleatorio según el modo de juego
export const drawNumber = (drawnNumbers, gameMode = 'full') => {
  const ranges = getValidNumberRanges(gameMode);
  const availableNumbers = [];
  
  // Generar lista de números disponibles según los rangos del modo
  ranges.forEach(([min, max]) => {
    for (let i = min; i <= max; i++) {
      if (!drawnNumbers.includes(i)) {
        availableNumbers.push(i);
      }
    }
  });
  
  if (availableNumbers.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * availableNumbers.length);
  return availableNumbers[randomIndex];
};

// Verificar si hay victoria según el patrón
export const checkWin = (card, markedNumbers, pattern) => {
  const isMarked = (num) => {
    return num === 'FREE' || markedNumbers.includes(num);
  };

  switch (pattern) {
    case 'full':
      // Todas las casillas marcadas
      return card.every(row => row.every(num => isMarked(num)));

    case 'line':
      // Una fila horizontal completa
      let isRowFull = card.some(row => row.every(num => isMarked(num)));
      // Una Columna Vertical completa
      let isColumFull = Array.from({ length: 5 }).some((_, col) => 
                          card.every(row => isMarked(row[col]))
                    )
      return isRowFull || isColumFull;

    case 'L':
      // Forma de L: primera columna y última fila
      const firstColumn = card.every((row, i) => isMarked(row[0]));
      const lastRow = card[4].every(num => isMarked(num));
      return firstColumn && lastRow;

    case 'X':
      // Diagonal principal y secundaria
      const diagonal1 = card.every((row, i) => isMarked(row[i]));
      const diagonal2 = card.every((row, i) => isMarked(row[4 - i]));
      return diagonal1 && diagonal2;

    case 'corners':
      // Las 4 esquinas
      return (
        isMarked(card[0][0]) &&
        isMarked(card[0][4]) &&
        isMarked(card[4][0]) &&
        isMarked(card[4][4])
      );

    default:
      return false;
  }
};

// Obtener letra del número del bingo
export const getBingoLetter = (number) => {
  if (number >= 1 && number <= 15) return 'B';
  if (number >= 16 && number <= 30) return 'I';
  if (number >= 31 && number <= 45) return 'N';
  if (number >= 46 && number <= 60) return 'G';
  if (number >= 61 && number <= 75) return 'O';
  return '';
};

// Nombres de los patrones en español
export const GAME_MODES = {
  full: 'Cartón Lleno',
  line: 'Línea',
  L: 'L',
  X: 'X',
  corners: '4 Esquinas'
};

// ✅ MEJORADO: Obtener descripción de los números que saldrán según el modo
export const getGameModeDescription = (gameMode) => {
  switch (gameMode) {
    case 'corners':
      return 'Solo saldrán números B (1-15) y O (61-75) - ¡Juego rápido! (~5-7 min)';
    case 'X':
      return 'Solo saldrán números B (1-15), I (16-30), G (46-60) y O (61-75) - ¡Juego rápido! (~8-10 min)';
    case 'full':
      return 'Saldrán todos los números del 1 al 75 - Juego completo (~20-25 min)';
    case 'line':
      return 'Saldrán todos los números del 1 al 75 - Juego medio (~15-20 min)';
    case 'L':
      return 'Saldrán todos los números del 1 al 75 - Juego medio (~15-20 min)';
    default:
      return 'Saldrán todos los números del 1 al 75';
  }
};

// ✅ NUEVO: Obtener total de números disponibles según el modo
export const getTotalNumbers = (gameMode) => {
  const ranges = getValidNumberRanges(gameMode);
  let total = 0;
  
  ranges.forEach(([min, max]) => {
    total += (max - min + 1);
  });
  
  return total;
};

// ✅ NUEVO: Obtener estadísticas del modo de juego
export const getGameModeStats = (gameMode) => {
  switch (gameMode) {
    case 'corners':
      return {
        totalNumbers: 30,
        numbersNeeded: 4,
        averageTime: '5-7 min',
        speed: 'Muy Rápido',
        difficulty: 'Fácil'
      };
    case 'X':
      return {
        totalNumbers: 60,
        numbersNeeded: 8,
        averageTime: '8-10 min',
        speed: 'Rápido',
        difficulty: 'Medio'
      };
    case 'full':
      return {
        totalNumbers: 75,
        numbersNeeded: 24,
        averageTime: '20-25 min',
        speed: 'Normal',
        difficulty: 'Difícil'
      };
    case 'line':
      return {
        totalNumbers: 75,
        numbersNeeded: 5,
        averageTime: '15-20 min',
        speed: 'Medio',
        difficulty: 'Medio'
      };
    case 'L':
      return {
        totalNumbers: 75,
        numbersNeeded: 9,
        averageTime: '15-20 min',
        speed: 'Medio',
        difficulty: 'Medio'
      };
    default:
      return {
        totalNumbers: 75,
        numbersNeeded: 0,
        averageTime: 'Variable',
        speed: 'Normal',
        difficulty: 'Medio'
      };
  }
};