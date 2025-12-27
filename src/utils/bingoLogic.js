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

// Obtener número aleatorio del bingo (1-75) que no haya salido
export const drawNumber = (drawnNumbers) => {
  const availableNumbers = [];
  for (let i = 1; i <= 75; i++) {
    if (!drawnNumbers.includes(i)) {
      availableNumbers.push(i);
    }
  }
  
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
