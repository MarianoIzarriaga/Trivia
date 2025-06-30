import { useState, useEffect } from "react";
import { JuegoApiService } from "../services/juegoService";
import { useJuegoStream } from "../hooks/useJuegoStream";

export function meta() {
    return [
        { title: "Trivia Game - Jugando" },
        { name: "description", content: "Juego de Trivia en progreso" },
    ];
}

interface Pregunta {
    id: number;
    texto: string;
    respuestas: Array<{
        id: number;
        texto: string;
    }>;
}

interface GameState {
    salaId: number | null;
    codigo: string;
    nombreJugador: string;
    preguntaActual: Pregunta | null;
    respuestaSeleccionada: number | null;
    mostrandoResultado: boolean;
    esRespuestaCorrecta: boolean;
    puntuaciones: Record<string, number>;
    juegoTerminado: boolean;
    ganador: string;
    cargando: boolean;
    error: string | null;
    preguntaNumero: number;
    totalPreguntas: number;
}

export default function JuegoSync() {
    const [gameState, setGameState] = useState<GameState>({
        salaId: null,
        codigo: "",
        nombreJugador: "",
        preguntaActual: null,
        respuestaSeleccionada: null,
        mostrandoResultado: false,
        esRespuestaCorrecta: false,
        puntuaciones: {},
        juegoTerminado: false,
        ganador: "",
        cargando: true,
        error: null,
        preguntaNumero: 1,
        totalPreguntas: 10
    });

    useEffect(() => {
        console.log("Iniciando juego...");
        // Obtener parámetros de la URL
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const name = url.searchParams.get("name");
        const salaId = url.searchParams.get("salaId");

        if (!code || !name || !salaId) {
            window.location.href = "/";
            return;
        }

        setGameState(prev => ({
            ...prev,
            codigo: code,
            nombreJugador: name,
            salaId: parseInt(salaId)
        }));

        // Cargar pregunta inicial
        cargarPreguntaActual(parseInt(salaId));
    }, []);

    // --- SINCRONIZACIÓN EN TIEMPO REAL ---
    useJuegoStream({
        salaId: gameState.salaId,
        onUpdate: (data) => {
            setGameState(prev => {
                // Si cambió la pregunta, recargar la pregunta completa
                if (data.preguntaActual !== prev.preguntaNumero) {
                    if (gameState.salaId) cargarPreguntaActual(gameState.salaId);
                }
                return {
                    ...prev,
                    puntuaciones: data.puntuaciones,
                    preguntaNumero: data.preguntaActual,
                    totalPreguntas: data.totalPreguntas,
                    juegoTerminado: data.juegoTerminado,
                    juegoIniciado: data.juegoIniciado
                };
            });
        },
        onError: (err) => {
            setGameState(prev => ({ ...prev, error: "Conexión perdida con el servidor." }));
        }
    });

    const cargarPreguntaActual = async (salaId: number) => {
        try {
            setGameState(prev => ({ ...prev, cargando: true, error: null }));

            const pregunta = await JuegoApiService.obtenerPreguntaActual(salaId);
            const estado = await JuegoApiService.obtenerEstadoJuego(salaId);
            console.log("ACA");

            setGameState(prev => ({
                ...prev,
                preguntaActual: pregunta,
                puntuaciones: estado.puntuaciones,
                preguntaNumero: estado.preguntaActual,
                totalPreguntas: estado.totalPreguntas,
                juegoTerminado: estado.juegoTerminado,
                cargando: false
            }));

            if (estado.juegoTerminado) {
                await cargarResultados(salaId);
            }
        } catch (error) {
            setGameState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : "Error al cargar la pregunta",
                cargando: false
            }));
        }
    };

    const cargarResultados = async (salaId: number) => {
        try {
            const resultados = await JuegoApiService.obtenerResultados(salaId);
            setGameState(prev => ({
                ...prev,
                juegoTerminado: true,
                ganador: resultados.ganador,
                puntuaciones: resultados.puntuacionesFinal
            }));
        } catch (error) {
            console.error("Error al cargar resultados:", error);
        }
    };

    const responderPregunta = async (respuestaId: number) => {
        if (!gameState.salaId || !gameState.preguntaActual || gameState.respuestaSeleccionada !== null) {
            return;
        }

        try {
            setGameState(prev => ({ ...prev, respuestaSeleccionada: respuestaId }));

            const response = await JuegoApiService.responderPregunta({
                preguntaId: gameState.preguntaActual.id,
                respuestaId,
                nombreJugador: gameState.nombreJugador
            });

            setGameState(prev => ({
                ...prev,
                mostrandoResultado: true,
                esRespuestaCorrecta: response.esCorrecta
            }));

            // Esperar 3 segundos y luego avanzar a la siguiente pregunta o finalizar
            setTimeout(async () => {
                if (gameState.preguntaNumero < gameState.totalPreguntas) {
                    await siguientePregunta();
                } else {
                    await cargarResultados(gameState.salaId!);
                }
            }, 3000);

        } catch (error) {
            setGameState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : "Error al responder",
                respuestaSeleccionada: null
            }));
        }
    };

    const siguientePregunta = async () => {
        if (!gameState.salaId) return;

        try {
            const response = await JuegoApiService.siguientePregunta(gameState.salaId);

            setGameState(prev => ({
                ...prev,
                preguntaActual: response.pregunta ? {
                    id: response.pregunta.id,
                    texto: response.pregunta.texto,
                    respuestas: response.pregunta.respuestas
                } : null,
                respuestaSeleccionada: null,
                mostrandoResultado: false,
                preguntaNumero: prev.preguntaNumero + 1
            }));
        } catch (error) {
            await cargarResultados(gameState.salaId);
        }
    };

    const volverAlInicio = () => {
        window.location.href = "/";
    };

    if (gameState.cargando) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <img
                        src="/images/logo-trivia.png"
                        alt="Trivia Logo"
                        className="mx-auto h-16 w-auto mb-8"
                    />
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Cargando pregunta...</p>
                </div>
            </div>
        );
    }

    if (gameState.juegoTerminado) {
        const puntuacionesOrdenadas = Object.entries(gameState.puntuaciones)
            .sort(([, a], [, b]) => b - a);

        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Header con Logo */}
                    <div className="text-center mb-8">
                        <img
                            src="/images/logo-trivia.png"
                            alt="Trivia Logo"
                            className="mx-auto h-16 w-auto mb-4"
                        />
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            🎉 ¡Juego Terminado! 🎉
                        </h1>
                    </div>

                    {/* Ganador */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6 text-center">
                        <div className="text-6xl mb-4">🏆</div>
                        <h2 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                            Ganador
                        </h2>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            {gameState.ganador}
                        </p>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            {gameState.puntuaciones[gameState.ganador]} puntos
                        </p>
                    </div>

                    {/* Tabla de puntuaciones */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Puntuaciones Finales
                        </h3>
                        <div className="space-y-3">
                            {puntuacionesOrdenadas.map(([nombre, puntos], index) => (
                                <div
                                    key={nombre}
                                    className={`flex items-center justify-between p-3 rounded-lg ${nombre === gameState.nombreJugador
                                        ? "bg-blue-50 border-2 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700"
                                        : "bg-gray-50 dark:bg-gray-700"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">
                                            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}°`}
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {nombre}
                                            {nombre === gameState.nombreJugador && (
                                                <span className="text-blue-600 dark:text-blue-400 text-sm ml-2">(Tú)</span>
                                            )}
                                        </span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        {puntos} pts
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="text-center">
                        <button
                            onClick={volverAlInicio}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!gameState.preguntaActual) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {gameState.error || "No se pudo cargar la pregunta"}
                    </p>
                    <button
                        onClick={volverAlInicio}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header con Logo */}
                <div className="text-center mb-8">
                    <img
                        src="/images/logo-trivia.png"
                        alt="Trivia Logo"
                        className="mx-auto h-12 w-auto mb-4"
                    />
                    <div className="flex justify-between items-center">
                        <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            Pregunta {gameState.preguntaNumero} de {gameState.totalPreguntas}
                        </div>
                        <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            Tu puntuación: {gameState.puntuaciones[gameState.nombreJugador] || 0} pts
                        </div>
                    </div>
                </div>

                {/* Pregunta */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8">
                        {gameState.preguntaActual.texto}
                    </h2>

                    {/* Respuestas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gameState.preguntaActual.respuestas.map((respuesta, index) => {
                            const isSelected = gameState.respuestaSeleccionada === respuesta.id;
                            const isDisabled = gameState.respuestaSeleccionada !== null;

                            let buttonClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ";

                            if (isDisabled) {
                                if (isSelected) {
                                    buttonClass += gameState.mostrandoResultado && gameState.esRespuestaCorrecta
                                        ? "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-600 dark:text-green-400"
                                        : gameState.mostrandoResultado
                                            ? "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-600 dark:text-red-400"
                                            : "bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-400";
                                } else {
                                    buttonClass += "bg-gray-100 border-gray-300 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed";
                                }
                            } else {
                                buttonClass += "bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600 cursor-pointer";
                            }

                            return (
                                <button
                                    key={respuesta.id}
                                    onClick={() => responderPregunta(respuesta.id)}
                                    disabled={isDisabled}
                                    className={buttonClass}
                                >
                                    <div className="flex items-center">
                                        <span className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        {respuesta.texto}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Mensaje de resultado */}
                    {gameState.mostrandoResultado && (
                        <div className="mt-6 text-center">
                            <div className={`text-2xl font-bold ${gameState.esRespuestaCorrecta
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                                }`}>
                                {gameState.esRespuestaCorrecta ? "¡Correcto! 🎉" : "Incorrecto 😢"}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                {gameState.preguntaNumero < gameState.totalPreguntas
                                    ? "Siguiente pregunta en unos segundos..."
                                    : "Calculando resultados finales..."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Puntuaciones de otros jugadores */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Puntuaciones Actuales
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(gameState.puntuaciones)
                            .sort(([, a], [, b]) => b - a)
                            .map(([nombre, puntos]) => (
                                <div
                                    key={nombre}
                                    className={`p-3 rounded-lg text-center ${nombre === gameState.nombreJugador
                                        ? "bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700"
                                        : "bg-gray-50 dark:bg-gray-700"
                                        }`}
                                >
                                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {nombre}
                                        {nombre === gameState.nombreJugador && (
                                            <span className="text-blue-600 dark:text-blue-400 text-xs ml-1">(Tú)</span>
                                        )}
                                    </div>
                                    <div className="text-lg font-bold text-gray-600 dark:text-gray-300">
                                        {puntos} pts
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
