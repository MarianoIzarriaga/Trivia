import { useState, useEffect } from "react";
import { useSala } from "../hooks/useSala";

export function Welcome() {
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [gameMode, setGameMode] = useState<"create" | "join" | null>(null);
  const [roomCode, setRoomCode] = useState("");

  const { sala, crearSala, unirseSala } = useSala();

  // Efecto para navegar automáticamente cuando se crea o se une a una sala exitosamente
  useEffect(() => {
    if (sala.conectado && sala.codigo && playerName) {
      const isHost = sala.esHost;
      window.location.href = `/sala?code=${sala.codigo}&name=${encodeURIComponent(playerName)}&host=${isHost}`;
    }
  }, [sala.conectado, sala.codigo, sala.esHost, playerName]);

  const handleModeSelect = (mode: "create" | "join") => {
    setGameMode(mode);
    setShowNameInput(true);
  };

  const handleStartGame = async () => {
    if (!playerName.trim()) return;

    try {
      if (gameMode === "create") {
        await crearSala(playerName);
      } else {
        if (!roomCode.trim()) return;
        await unirseSala(roomCode, playerName);
      }
    } catch (error) {
      // El error ya se maneja en el hook
      console.error('Error al iniciar juego:', error);
    }
  };

  const handleBack = () => {
    setShowNameInput(false);
    setGameMode(null);
    setPlayerName("");
    setRoomCode("");
  };

  if (showNameInput) {
    let buttonText = "Unirse";
    if (sala.cargando) {
      buttonText = 'Cargando...';
    } else if (gameMode === "create") {
      buttonText = "Crear Sala";
    }

    return (
      <main className="flex items-center justify-center pt-16 pb-4">
        <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
          <header className="flex flex-col items-center gap-9">
            <div className="w-[300px] max-w-[100vw] p-4">
              <img
                src="/images/logo-trivia.png"
                alt="Trivia Game"
                className="block w-full"
              />
            </div>
          </header>
          <div className="max-w-[400px] w-full space-y-6 px-4">
            <div className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center">
                {gameMode === "create" ? "Crear Sala" : "Unirse a Sala"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Jugador
                  </label>
                  <input
                    id="playerName"
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Ingresa tu nombre"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                {gameMode === "join" && (
                  <div>
                    <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Código de Sala
                    </label>
                    <input
                      id="roomCode"
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="Ingresa el código"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  disabled={sala.cargando}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Volver
                </button>
                <button
                  onClick={handleStartGame}
                  disabled={!playerName.trim() || (gameMode === "join" && !roomCode.trim()) || sala.cargando}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {buttonText}
                </button>
              </div>

              {sala.error && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                  {sala.error}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[500px] max-w-[100vw] p-4">
            <img
              src="/images/logo-trivia.png"
              alt="Trivia Game"
              className="block w-full"
            />
          </div>
        </header>
        <div className="max-w-[500px] w-full space-y-6 px-4">
          <div className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
              ¡Bienvenido a Trivia!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Pon a prueba tus conocimientos en este emocionante juego de preguntas y respuestas
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleModeSelect("create")}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Crear Nueva Sala
              </button>
              <button
                onClick={() => handleModeSelect("join")}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 font-medium"
              >
                Unirse a Sala
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
