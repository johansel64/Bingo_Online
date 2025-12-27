import React from 'react';

const BingoCard = ({ card, markedNumbers, onMarkNumber, disabled }) => {
  const letters = ['B', 'I', 'N', 'G', 'O'];

  const isMarked = (number) => {
    return number === 'FREE' || markedNumbers.includes(number);
  };

  const handleCellClick = (number) => {
    if (disabled || number === 'FREE') return;
    onMarkNumber(number);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-xl font-bold text-center mb-4 text-gray-800">
        Tu Cartón
      </h3>
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        {/* Header con letras B-I-N-G-O */}
        {letters.map((letter) => (
          <div
            key={letter}
            className="bg-purple-600 text-white font-bold text-xl py-3 text-center rounded-t-lg"
          >
            {letter}
          </div>
        ))}

        {/* Números del cartón */}
        {card.map((row, rowIndex) =>
          row.map((number, colIndex) => {
            const marked = isMarked(number);
            const isFree = number === 'FREE';

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(number)}
                disabled={disabled || isFree}
                className={`
                  aspect-square flex items-center justify-center
                  text-lg font-bold rounded transition-all duration-200
                  ${marked
                    ? 'bg-green-500 text-white scale-95'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }
                  ${isFree ? 'bg-yellow-400 text-gray-800' : ''}
                  ${!disabled && !isFree ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {isFree ? '★' : number}
              </button>
            );
          })
        )}
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Haz clic en los números para marcarlos</p>
      </div>
    </div>
  );
};

export default BingoCard;
