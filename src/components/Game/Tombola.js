import React, { useState } from 'react';
import { getBingoLetter, getTotalNumbers } from '../../utils/bingoLogic';

const Tombola = ({ onDrawNumber, drawnNumbers, currentNumber, disabled, gameMode }) => {
  const [spinning, setSpinning] = useState(false);

  const handleDraw = async () => {
    if (disabled || spinning) return;
    
    setSpinning(true);
    
    // Animación de giro
    setTimeout(() => {
      onDrawNumber();
      setSpinning(false);
    }, 3000);
  };

  // ✅ CORREGIDO: Calcular según el modo de juego
  const totalNumbers = getTotalNumbers(gameMode);
  const numbersLeft = totalNumbers - drawnNumbers.length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">
        🎰 Tómbola
      </h3>

      {/* Número actual */}
      <div className="mb-6">
        <div className={`
          mx-auto w-40 h-40 rounded-full flex items-center justify-center
          text-6xl font-bold transition-all duration-500
          ${currentNumber
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-2xl'
            : 'bg-gray-200 text-gray-400'
          }
          ${spinning ? 'animate-spin' : ''}
        `}>
          {currentNumber ? (
            <div className="text-center">
              <div className="text-2xl">{getBingoLetter(currentNumber)}</div>
              <div>{currentNumber}</div>
            </div>
          ) : (
            '?'
          )}
        </div>
      </div>

      {/* Botón girar */}
      <button
        onClick={handleDraw}
        disabled={disabled || spinning || numbersLeft === 0}
        className={`
          w-full py-4 rounded-lg font-bold text-lg
          transition duration-200 transform
          ${disabled || spinning || numbersLeft === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105 hover:shadow-lg active:scale-95'
          }
        `}
      >
        {spinning ? '🎰 Girando...' : numbersLeft === 0 ? 'Todos los números salieron' : '🎲 Girar Tómbola'}
      </button>

      {/* Contador */}
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Números restantes: <span className="font-bold text-purple-600">{numbersLeft}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Números sacados: {drawnNumbers.length} / {totalNumbers}
        </p>
      </div>
    </div>
  );
};

export default Tombola;