import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { generateRoomCode } from '../../utils/bingoLogic';

const Home = () => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Crear nueva sala
  const handleCreateRoom = async () => {
    try {
      setLoading(true);
      setError('');

      const code = generateRoomCode();
      
      const roomData = {
        code,
        hostId: currentUser.uid,
        hostName: currentUser.displayName || currentUser.email,
        gameMode: 'full',
        status: 'waiting',
        currentNumber: null,
        drawnNumbers: [],
        createdAt: new Date(),
        players: [{
          id: currentUser.uid,
          name: currentUser.displayName || currentUser.email,
          isHost: true
        }]
      };

      const docRef = await addDoc(collection(db, 'rooms'), roomData);
      
      navigate(`/room/${code}`, { state: { roomId: docRef.id, isHost: true } });
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Error al crear la sala. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Unirse a sala existente
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!roomCode.trim()) {
      return setError('Ingresa un código de sala');
    }

    try {
      setLoading(true);
      setError('');

      // Buscar sala con el código
      const roomsRef = collection(db, 'rooms');
      const q = query(roomsRef, where('code', '==', roomCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Sala no encontrada. Verifica el código.');
        return;
      }

      const roomDoc = querySnapshot.docs[0];
      const roomData = roomDoc.data();

      // Verificar si el juego ya comenzó
      if (roomData.status === 'playing') {
        setError('Esta sala ya está jugando');
        return;
      }

      navigate(`/room/${roomCode.toUpperCase()}`, { 
        state: { roomId: roomDoc.id, isHost: false } 
      });
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Error al unirse a la sala. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🎰 Bingo Online</h1>
              <p className="text-gray-600 mt-1">
                Bienvenido, <span className="font-semibold">{currentUser?.displayName}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-200"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Crear Sala */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎲</div>
              <h2 className="text-2xl font-bold text-gray-800">Crear Sala</h2>
              <p className="text-gray-600 mt-2">
                Inicia un nuevo juego y comparte el código con tus amigos
              </p>
            </div>
            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="w-full bg-purple-600 text-white font-bold py-4 rounded-lg hover:bg-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Nueva Sala'}
            </button>
          </div>

          {/* Unirse a Sala */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-gray-800">Unirse a Sala</h2>
              <p className="text-gray-600 mt-2">
                Ingresa el código de sala para unirte a un juego
              </p>
            </div>
            <form onSubmit={handleJoinRoom}>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 text-center text-2xl font-bold uppercase"
                placeholder="ABC123"
                maxLength={6}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Buscando...' : 'Unirse'}
              </button>
            </form>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Cómo Jugar</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-purple-600 font-bold mr-2">1.</span>
              <span>Crea una sala o únete con un código</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 font-bold mr-2">2.</span>
              <span>El host selecciona el modo de juego (Lleno, L, X, etc.)</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 font-bold mr-2">3.</span>
              <span>El host gira la tómbola y salen los números</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 font-bold mr-2">4.</span>
              <span>Marca los números en tu cartón cuando salgan</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 font-bold mr-2">5.</span>
              <span>¡El primero en completar el patrón gana!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
