import { useEffect } from "react";
import { useSala } from "../hooks/useSala";

export function meta() {
    return [
        { title: "Sala de Espera - Trivia" },
        { name: "description", content: "Sala de espera del juego de trivia" },
    ];
}

export default function Sala() {
    const { sala, salirDeSala, iniciarCuentaRegresiva, limpiarError, cargarSalaPorCodigo } = useSala();

    useEffect(() => {
        // Verificar que estamos conectados a una sala
        if (!sala.conectado && !sala.cargando) {
            // Intentar recuperar datos de la URL
            const url = new URL(window.location.href);
            const code = url.searchParams.get("code");
            const playerName = url.searchParams.get("name");
            const isHost = url.searchParams.get("host") === "true";

            if (!code || !playerName) {
                // Redirigir al home si no hay datos válidos
                window.location.href = "/";
                return;
            }

            // Llama a cargarSalaPorCodigo para restaurar el estado esHost
            cargarSalaPorCodigo(code, playerName, isHost);
        }
    }, [sala.conectado, sala.cargando, cargarSalaPorCodigo]);

    // Efecto para manejar la redirección cuando termine la cuenta regresiva
    useEffect(() => {
        const goToGame = () => {
            window.location.href = `/juego?code=${sala.codigo}&name=${encodeURIComponent(sala.nombreJugador)}&salaId=${sala.id}`;
        };

        const iniciarJuego = async () => {
            try {
                const response = await fetch(`/api/juego/iniciar/${sala.id}`, {
                    method: "POST"
                });

                if (!response.ok) {
                    const error = await response.json();
                    console.error("Error al iniciar el juego:", error.mensaje);
                    return;
                }

                setTimeout(goToGame, 1000);
            } catch (error) {
                console.error("Fallo al iniciar juego:", error);
            }
        };

        if (sala.countdown?.value === 1) {
            if (sala.esHost) {
                iniciarJuego();
            } else {
                goToGame();
            }
        }
    }, [sala.countdown, sala.codigo, sala.nombreJugador, sala.id, sala.esHost]);

    const handleStartGame = async () => {
        if (sala.esHost && sala.jugadores.length >= 2) {
            try {
                // Iniciar cuenta regresiva sincronizada
                await iniciarCuentaRegresiva();
            } catch (error) {
                console.error('Error al iniciar cuenta regresiva:', error);
                // Aquí podrías mostrar un mensaje de error al usuario
            }
        }
    };

    const copyRoomCode = () => {
        navigator.clipboard.writeText(sala.codigo);
        // Podrías mostrar una notificación aquí
    };

    const handleLeaveSala = async () => {
        await salirDeSala();
        window.location.href = "/";
    };

    // Mostrar loading si está cargando
    if (sala.cargando) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Conectando a la sala...</p>
                </div>
            </div>
        );
    }

    // Mostrar error si no está conectado
    if (!sala.conectado) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Conexión</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {sala.error ?? "No se pudo conectar a la sala"}
                    </p>
                    <button
                        onClick={() => window.location.href = "/"}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    // Mostrar cuenta regresiva si está activa
    if (sala.countdown?.isActive) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <img
                        src="/images/logo-trivia.png"
                        alt="Trivia Logo"
                        className="mx-auto h-20 w-auto mb-8"
                    />
                    <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                        {sala.countdown.value}
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        ¡El juego comienza en...!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Prepárate para demostrar tus conocimientos
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
            {/* Header con Logo */}
            <div className="container mx-auto px-4 max-w-4xl mb-8">
                <div className="text-center">
                    <img
                        src="/images/logo-trivia.png"
                        alt="Trivia Logo"
                        className="mx-auto h-16 w-auto mb-4"
                    />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Sala de Espera
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Esperando que todos los jugadores se unan
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Room Information */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Información de la Sala
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Código de Sala</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {sala.codigo}
                                    </p>
                                </div>
                                <button
                                    onClick={copyRoomCode}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                >
                                    Copiar
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Tu Nombre</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {sala.nombreJugador}
                                        {sala.esHost && (
                                            <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                                                HOST
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Jugadores</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {sala.jugadores.length}/{sala.capacidad}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Players List */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Jugadores en la Sala ({sala.jugadores.length})
                        </h2>

                        <div className="space-y-3 mb-6">
                            {sala.jugadores.map((player) => (
                                <div
                                    key={player}
                                    className={`flex items-center p-3 rounded-lg ${player === sala.nombreJugador
                                        ? "bg-blue-50 border-2 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700"
                                        : "bg-gray-50 dark:bg-gray-700"
                                        }`}
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                        {player.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {player}
                                            {player === sala.nombreJugador && (
                                                <span className="text-blue-600 dark:text-blue-400 text-sm ml-2">(Tú)</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Start Game Button (Only for Host) */}
                        {sala.esHost && (
                            <div className="border-t dark:border-gray-700 pt-4">
                                <button
                                    onClick={handleStartGame}
                                    disabled={sala.jugadores.length < 2}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${sala.jugadores.length >= 2
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    {sala.jugadores.length < 2
                                        ? "Esperando más jugadores..."
                                        : "¡Iniciar Juego!"
                                    }
                                </button>
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                                    Mínimo 2 jugadores para comenzar
                                </p>
                            </div>
                        )}

                        {/* Waiting Message (For non-hosts) */}
                        {!sala.esHost && (
                            <div className="border-t dark:border-gray-700 pt-4 text-center">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Esperando a que el host inicie el juego...
                                </p>
                                <div className="flex justify-center mt-3">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Leave Room Button */}
                        <div className="mt-4 pt-4 border-t dark:border-gray-700">
                            <button
                                onClick={handleLeaveSala}
                                className="w-full py-2 px-4 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                            >
                                Salir de la Sala
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {sala.error && (
                    <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
                        <div className="flex justify-between items-center">
                            <span>{sala.error}</span>
                            <button
                                onClick={limpiarError}
                                className="text-red-500 hover:text-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
