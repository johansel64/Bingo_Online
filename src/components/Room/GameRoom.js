import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, updateDoc, onSnapshot, arrayUnion } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { generateBingoCard, drawNumber, checkWin, GAME_MODES, getGameModeDescription } from '../../utils/bingoLogic';
import BingoCard from '../Game/BingoCard';
import Tombola from '../Game/Tombola';
import NumberHistory from '../Game/NumberHistory';
import PlayersList from '../Game/PlayersList';
import confetti from 'canvas-confetti';

const GameRoom = () => {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState(null);
  const [markedNumbers, setMarkedNumbers] = useState([]);
  const [hasWon, setHasWon] = useState(false);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState('');
  const [spinning, setSpinning] = useState(false);

  const roomId = location.state?.roomId;
  const isHost = location.state?.isHost || false;

  // Cargar sala y escuchar cambios en tiempo real
  useEffect(() => {
    if (!roomId) {
      setError('ID de sala no válido');
      setLoading(false);
      return;
    }

    const roomRef = doc(db, 'rooms', roomId);

    // Listener en tiempo real
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.data();
        setRoom(roomData);

        // ✅ CORREGIDO: Sincronizar winner con Firebase SIEMPRE
        if (roomData.winner) {
          // Hay un ganador
          setWinner(roomData.winner);
          
          // Si soy el ganador y aún no he celebrado
          if (roomData.winner.id === currentUser.uid && !hasWon) {
            setHasWon(true);
            triggerConfetti();
          }
        } else {
          // ✅ NUEVO: Si no hay ganador en Firebase, limpiar estado local
          setWinner(null);
          setHasWon(false);
        }
      } else {
        setError('Sala no encontrada');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId, currentUser.uid]);  // ✅ CORREGIDO: Removido hasWon de dependencias

  // Generar cartón al entrar
  useEffect(() => {
    if (room && !card) {
      setCard(generateBingoCard());
    }
  }, [room, card]);

  // Unirse a la sala si no eres el host
  useEffect(() => {
    const joinRoom = async () => {
      if (!isHost && room && roomId) {
        try {
          const roomRef = doc(db, 'rooms', roomId);
          
          // Verificar si ya estoy en la lista
          const alreadyJoined = room.players.some(p => p.id === currentUser.uid);
          
          if (!alreadyJoined) {
            await updateDoc(roomRef, {
              players: arrayUnion({
                id: currentUser.uid,
                name: currentUser.displayName || currentUser.email,
                isHost: false
              })
            });
          }
        } catch (err) {
          console.error('Error joining room:', err);
        }
      }
    };

    joinRoom();
  }, [room, isHost, roomId, currentUser]);

  useEffect(() => {
    if (!isHost && room?.currentNumber) {
      setSpinning(true);
      
      const timer = setTimeout(() => {
        setSpinning(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [room?.currentNumber, isHost]);

  // Girar tómbola (solo host)
  const handleDrawNumber = async () => {
    if (!isHost || !room) return;

    const newNumber = drawNumber(room.drawnNumbers, room.gameMode);
    
    if (newNumber === null) {
      alert('Todos los números ya salieron');
      return;
    }

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        currentNumber: newNumber,
        drawnNumbers: arrayUnion(newNumber)
      });
    } catch (err) {
      console.error('Error drawing number:', err);
      setError('Error al sacar número');
    }
  };

  // Marcar número en el cartón
  const handleMarkNumber = (number) => {
    if (!room.drawnNumbers.includes(number)) {
      alert('Este número aún no ha salido');
      return;
    }

    if (markedNumbers.includes(number)) {
      setMarkedNumbers(markedNumbers.filter(n => n !== number));
    } else {
      const newMarked = [...markedNumbers, number];
      setMarkedNumbers(newMarked);

      // Verificar victoria
      if (checkWin(card, newMarked, room.gameMode)) {
        handleWin();
      }
    }
  };

  // Declarar victoria
  const handleWin = async () => {
    if (hasWon) return;

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        winner: {
          id: currentUser.uid,
          name: currentUser.displayName || currentUser.email,
          pattern: room.gameMode
        },
        status: 'finished'
      });
      
      setHasWon(true);
      triggerConfetti();
    } catch (err) {
      console.error('Error declaring win:', err);
    }
  };

  // Jugar de nuevo
  const handlePlayAgain = async () => {
    if (!isHost) return;

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        status: 'waiting',
        currentNumber: null,
        drawnNumbers: [],
        winner: null  // ✅ Esto dispara el reset en todos los clientes
      });
      
      // Resetear estados locales
      setCard(generateBingoCard());
      setMarkedNumbers([]);
      setWinner(null);  // ✅ Reset local inmediato
      setHasWon(false);  // ✅ Reset local inmediato
    } catch (err) {
      console.error('Error restarting game:', err);
    }
  };

  // Cambiar cartón (regenerar)
  const handleChangeCard = () => {
    setCard(generateBingoCard());
    setMarkedNumbers([]);
  };

  // Cambiar modo de juego (solo host)
  const handleChangeGameMode = async (mode) => {
    if (!isHost) return;

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        gameMode: mode
      });
    } catch (err) {
      console.error('Error changing game mode:', err);
    }
  };

  // Iniciar juego (solo host)
  const handleStartGame = async () => {
    if (!isHost) return;

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        status: 'playing'
      });
    } catch (err) {
      console.error('Error starting game:', err);
    }
  };

  // Confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Copiar código
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert('Código copiado: ' + roomCode);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="text-white text-2xl">Cargando sala...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error || 'Sala no encontrada'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Sala: {roomCode}
              </h1>
              <p className="text-gray-600">
                Modo: <span className="font-semibold text-purple-600">
                  {GAME_MODES[room.gameMode]}
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {getGameModeDescription(room.gameMode)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyCode}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                📋 Copiar Código
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                🚪 Salir
              </button>
            </div>
          </div>
        </div>

        {/* Lobby - Esperando jugadores */}
        {room.status === 'waiting' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Panel principal del lobby */}
            <div className="lg:col-span-2 space-y-6">
              {/* Configuración del juego */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-center mb-4">
                  Esperando jugadores...
                </h2>
                
                {isHost && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Selecciona el modo de juego:
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {Object.entries(GAME_MODES).map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => handleChangeGameMode(key)}
                            className={`
                              px-4 py-2 rounded-lg font-semibold transition
                              ${room.gameMode === key
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }
                            `}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleStartGame}
                      disabled={room.players.length < 1}
                      className="w-full bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🎮 Iniciar Juego
                    </button>
                  </div>
                )}

                {!isHost && (
                  <p className="text-center text-gray-600">
                    Esperando que el host inicie el juego...
                  </p>
                )}
              </div>

              {/* Mostrar cartón en el lobby con botón para cambiarlo */}
              {card && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      Vista Previa de tu Cartón
                    </h3>
                    <button
                      onClick={handleChangeCard}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                    >
                      🔄 Cambiar Cartón
                    </button>
                  </div>
                  <BingoCard
                    card={card}
                    markedNumbers={[]}
                    onMarkNumber={() => {}}
                    disabled={true}
                  />
                  <p className="text-center text-sm text-gray-500 mt-3">
                    Puedes cambiar tu cartón antes de que inicie el juego
                  </p>
                </div>
              )}
            </div>

            {/* Mostrar jugadores en el lobby */}
            <div className="lg:col-span-1">
              <PlayersList
                players={room.players}
                hostId={room.hostId}
              />
            </div>
          </div>
        )}

        {/* Modal de ganador */}
        {winner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                ¡BINGO!
              </h2>
              <p className="text-xl text-gray-700 mb-6">
                <span className="font-semibold text-purple-600">
                  {winner.name}
                </span>
                {' '}ganó con patrón{' '}
                <span className="font-semibold">{GAME_MODES[winner.pattern]}</span>
              </p>

              {/* Botones */}
              <div className="flex flex-col gap-3">
                {isHost && (
                  <button
                    onClick={handlePlayAgain}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    🔄 Jugar de Nuevo
                  </button>
                )}
                <button
                  onClick={() => navigate('/')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  🏠 Volver al Menú Principal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Juego activo */}
        {room.status === 'playing' && card && (
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* EN MÓVIL: Tómbola/Número ARRIBA */}
            <div className="lg:hidden space-y-6">
              {isHost && (
               <Tombola
                onDrawNumber={handleDrawNumber}
                drawnNumbers={room.drawnNumbers}
                currentNumber={room.currentNumber}
                disabled={!!winner}
                gameMode={room.gameMode}
              />
              )}

              {!isHost && room.currentNumber && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-center mb-4">
                    🎰 Último Número
                  </h3>
                  <div className={`
                    w-32 h-32 mx-auto rounded-full flex items-center justify-center 
                    text-5xl font-bold text-white shadow-2xl
                    bg-gradient-to-br from-yellow-400 to-orange-500
                    transition-all duration-500
                    ${spinning ? 'animate-spin' : ''}
                  `}>
                    {spinning ? '?' : room.currentNumber}
                  </div>
                </div>
              )}
            </div>

            {/* Cartón */}
            <div className="lg:col-span-2">
              <BingoCard
                card={card}
                markedNumbers={markedNumbers}
                onMarkNumber={handleMarkNumber}
                disabled={!!winner}
              />
            </div>

            {/* EN DESKTOP: Columna derecha */}
            <div className="hidden lg:block space-y-6">
              {isHost && (
              <Tombola
                onDrawNumber={handleDrawNumber}
                drawnNumbers={room.drawnNumbers}
                currentNumber={room.currentNumber}
                disabled={!!winner}
                gameMode={room.gameMode}
              />
              )}

              {!isHost && room.currentNumber && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-center mb-4">
                    🎰 Último Número
                  </h3>
                  <div className={`
                    w-32 h-32 mx-auto rounded-full flex items-center justify-center 
                    text-5xl font-bold text-white shadow-2xl
                    bg-gradient-to-br from-yellow-400 to-orange-500
                    transition-all duration-500
                    ${spinning ? 'animate-spin' : ''}
                  `}>
                    {spinning ? '?' : room.currentNumber}
                  </div>
                </div>
              )}

              <NumberHistory
                drawnNumbers={room.drawnNumbers}
                currentNumber={room.currentNumber}
              />

              <PlayersList
                players={room.players}
                hostId={room.hostId}
              />
            </div>

            {/* EN MÓVIL: Historial y jugadores ABAJO */}
            <div className="lg:hidden space-y-6">
              <NumberHistory
                drawnNumbers={room.drawnNumbers}
                currentNumber={room.currentNumber}
              />

              <PlayersList
                players={room.players}
                hostId={room.hostId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameRoom;