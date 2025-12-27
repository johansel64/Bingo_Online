import React from 'react';
import { getBingoLetter } from '../../utils/bingoLogic';

const NumberHistory = ({ drawnNumbers, currentNumber }) => {
  // Mostrar últimos 10 números en orden inverso
  const recentNumbers = [...drawnNumbers].reverse().slice(0, 10);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-bold text-center mb-3 text-gray-800">
        📋 Números Sacados
      </h3>

      {drawnNumbers.length === 0 ? (
        <p className="text-center text-gray-500 py-4">
          Aún no se han sacado números
        </p>
      ) : (
        <div className="space-y-2">
          {recentNumbers.map((number, index) => {
            const isLatest = number === currentNumber;
            return (
              <div
                key={number}
                className={`
                  flex items-center justify-between px-4 py-2 rounded-lg
                  transition-all duration-200
                  ${isLatest
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold scale-105'
                    : 'bg-gray-100 text-gray-800'
                  }
                `}
              >
                <span className="text-2xl font-bold">
                  {getBingoLetter(number)}-{number}
                </span>
                {isLatest && (
                  <span className="text-xs bg-white text-orange-600 px-2 py-1 rounded">
                    NUEVO
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {drawnNumbers.length > 10 && (
        <p className="text-center text-sm text-gray-500 mt-3">
          +{drawnNumbers.length - 10} números más
        </p>
      )}
    </div>
  );
};

export default NumberHistory;
