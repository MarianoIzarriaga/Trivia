import { useState, useEffect } from "react";

export function meta() {
  return [
    { title: "Sala de Espera - Trivia" },
    { name: "description", content: "Sala de espera del juego de trivia" },
  ];
}

export default function Sala() {
  const [urlParams, setUrlParams] = useState({ code: "", name: "" });
  const [players, setPlayers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [gameStarting, setGameStarting] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Obtener parámetros de la URL
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code") ?? "";
    const playerName = url.searchParams.get("name") ?? "";
    const host = url.searchParams.get("host") === "true";
    
    setUrlParams({ code, name: playerName });
    setIsHost(host);

    // Simular jugadores dummy
    const dummyPlayers = [playerName];
    if (!host) {
      dummyPlayers.unshift("Host Player");
    }
    setPlayers(dummyPlayers);

    // Simular nuevos jugadores uniéndose
    const playerInterval = setInterval(() => {
      const newPlayerNames = ["Ana", "Carlos", "María", "Luis", "Sofia", "Pedro"];
      const randomName = newPlayerNames[Math.floor(Math.random() * newPlayerNames.length)];
      
      setPlayers(prev => {
        if (prev.length < 6 && !prev.includes(randomName)) {
          return [...prev, randomName];
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(playerInterval);
  }, []);

  const handleStartGame = () => {
    if (isHost && players.length >= 2) {
      setGameStarting(true);
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            window.location.href = `/juego?code=${urlParams.code}&name=${urlParams.name}`;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleLeaveRoom = () => {
    window.location.href = "/";
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(urlParams.code);
    // Aquí podrías mostrar un toast de confirmación
  };

  if (gameStarting) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {countdown}
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            ¡El juego está comenzando!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Prepárate para la primera pregunta...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Sala de Espera
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Esperando a que se unan más jugadores...
              </p>
            </div>
            <button
              onClick={handleLeaveRoom}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
            >
              Salir de la Sala
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Información de la Sala
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Código de Sala</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {urlParams.code}
                  </p>
                </div>
                <button
                  onClick={copyRoomCode}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Copiar
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tu Nombre</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {urlParams.name}
                  </p>
                </div>
                {isHost && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-medium rounded-full">
                    HOST
                  </span>
                )}
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Jugadores Conectados</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {players.length}
                </p>
              </div>
            </div>
          </div>

          {/* Players List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Jugadores ({players.length})
            </h2>
            
            <div className="space-y-3 mb-6">
              {players.map((player, index) => (
                <div
                  key={`player-${player}-${index}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {player.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {player}
                    </p>
                    {index === 0 && isHost && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        Host
                      </p>
                    )}
                    {player === urlParams.name && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Tú
                      </p>
                    )}
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              ))}
            </div>

            {/* Start Game Button (Only for Host) */}
            {isHost && (
              <div className="border-t dark:border-gray-700 pt-4">
                <button
                  onClick={handleStartGame}
                  disabled={players.length < 2}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                >
                  {players.length < 2 
                    ? "Esperando más jugadores..." 
                    : `Iniciar Juego (${players.length} jugadores)`
                  }
                </button>
                {players.length < 2 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                    Se necesitan al menos 2 jugadores para comenzar
                  </p>
                )}
              </div>
            )}

            {/* Waiting Message (For non-hosts) */}
            {!isHost && (
              <div className="border-t dark:border-gray-700 pt-4">
                <div className="text-center">
                  <div className="animate-pulse text-blue-600 dark:text-blue-400 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Esperando a que el host inicie el juego...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Instrucciones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>Comparte el código de sala con tus amigos para que se unan</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>El host puede iniciar el juego cuando haya al menos 2 jugadores</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>Cada pregunta tiene un tiempo límite de 20 segundos</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>Gana puntos por responder correctamente y rápido</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
