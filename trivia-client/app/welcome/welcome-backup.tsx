import { useState } from "react";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";
import { useSala } from "../hooks/useSala";

export function Welcome() {
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [gameMode, setGameMode] = useState<"create" | "join" | null>(null);
  const [roomCode, setRoomCode] = useState("");
  
  const { sala, crearSala, unirseSala } = useSala();

  const handleModeSelect = (mode: "create" | "join") => {
    setGameMode(mode);
    setShowNameInput(true);
  };

  const handleStartGame = async () => {
    if (!playerName.trim()) return;

    try {
      if (gameMode === "create") {
        await crearSala(playerName);
        // Redirigir a la sala después de crearla
        window.location.href = `/sala?code=${sala.codigo}&name=${encodeURIComponent(playerName)}&host=true`;
      } else {
        if (!roomCode.trim()) return;
        await unirseSala(roomCode, playerName);
        // Redirigir a la sala después de unirse
        window.location.href = `/sala?code=${roomCode}&name=${encodeURIComponent(playerName)}&host=false`;
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
    return (
      <main className="flex items-center justify-center pt-16 pb-4">
        <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
          <header className="flex flex-col items-center gap-9">
            <div className="w-[300px] max-w-[100vw] p-4">
              <img
                src={logoLight}
                alt="Trivia Game"
                className="block w-full dark:hidden"
              />
              <img
                src={logoDark}
                alt="Trivia Game"
                className="hidden w-full dark:block"
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
                  {sala.cargando ? 'Cargando...' : (gameMode === "create" ? "Crear Sala" : "Unirse")}
                </button>
              </div>

              {sala.error && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                  {sala.error}
                </div>
              )}
                >
                  {gameMode === "create" ? "Crear Sala" : "Unirse"}
                </button>
              </div>
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
              src={logoLight}
              alt="Trivia Game"
              className="block w-full dark:hidden"
            />
            <img
              src={logoDark}
              alt="Trivia Game"
              className="hidden w-full dark:block"
            />
          </div>
        </header>
        <div className="max-w-[300px] w-full space-y-6 px-4">
          <nav className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4">
            <p className="leading-6 text-gray-700 dark:text-gray-200 text-center">
              ¿Cómo quieres jugar?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleModeSelect("create")}
                className="w-full flex items-center gap-3 p-3 text-left bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                <CreateRoomIcon />
                <span className="text-blue-700 dark:text-blue-300 font-medium">
                  Crear Sala
                </span>
              </button>
              <button
                onClick={() => handleModeSelect("join")}
                className="w-full flex items-center gap-3 p-3 text-left bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg transition-colors"
              >
                <JoinRoomIcon />
                <span className="text-green-700 dark:text-green-300 font-medium">
                  Unirse a Sala
                </span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </main>
  );
}

// Iconos para los botones
function CreateRoomIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-blue-600 dark:text-blue-400"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function JoinRoomIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-green-600 dark:text-green-400"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="m22 11-3-3m0 0-3 3m3-3H13" />
    </svg>
  );
}
