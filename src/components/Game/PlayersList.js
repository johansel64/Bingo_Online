import React from 'react';

const PlayersList = ({ players, hostId }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-bold text-center mb-3 text-gray-800">
        👥 Jugadores ({players.length})
      </h3>

      <div className="space-y-2">
        {players.map((player) => {
          const isHost = player.id === hostId;
          
          return (
            <div
              key={player.id}
              className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-800">
                  {player.name}
                </span>
              </div>
              
              {isHost && (
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                  HOST
                </span>
              )}
            </div>
          );
        })}
      </div>

      {players.length === 1 && (
        <p className="text-center text-sm text-gray-500 mt-3">
          Esperando más jugadores...
        </p>
      )}
    </div>
  );
};

export default PlayersList;
