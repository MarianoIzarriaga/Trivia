import { useState, useEffect } from "react";
import { useJuego } from "../hooks/useJuego";

export function meta() {
    return [
        { title: "Trivia Game" },
        { name: "description", content: "Juego de Trivia" },
    ];
}

export default function Juego() {
    const [urlParams, setUrlParams] = useState({ code: "", name: "", salaId: "" });
    const { juego, responderPregunta, finalizarJuego, limpiarError } = useJuego();

    useEffect(() => {
        // Obtener parámetros de la URL
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code") ?? "";
        const playerName = url.searchParams.get("name") ?? "";
        const salaId = url.searchParams.get("salaId") ?? "";

        setUrlParams({ code, name: playerName, salaId });

        // Si no hay parámetros válidos, redirigir al home
        if (!code || !playerName) {
            window.location.href = "/";
        }
    }, []);

    const handleRespuesta = (respuestaId: number) => {
        if (urlParams.name && !juego.esperandoRespuesta) {
            responderPregunta(respuestaId, urlParams.name);
        }
    };

    const handleVolverSala = () => {
        window.location.href = `/sala?code=${urlParams.code}&name=${encodeURIComponent(urlParams.name)}&host=false`;
    };

    const handleVolverInicio = () => {
        window.location.href = "/";
    };

    // Loading state
    if (juego.cargando) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Cargando pregunta...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (juego.error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center max-w-md p-6">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error en el Juego</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{juego.error}</p>
                    <div className="space-y-3">
                        <button
                            onClick={limpiarError}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Reintentar
                        </button>
                        <button
                            onClick={handleVolverSala}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Volver a la Sala
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Game ended state
    if (juego.juegoTerminado) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center max-w-md p-6">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
                        ¡Juego Terminado!
                    </h1>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
                        <p className="text-gray-600 dark:text-gray-400 mb-2">Tu puntuación final:</p>
                        <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                            {juego.puntuacion} puntos
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Respondiste {juego.puntuacion / 10} preguntas correctamente
                        </p>
                    </div>
                    <div className="space-y-3">
                        <button
                            onClick={handleVolverSala}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Volver a la Sala
                        </button>
                        <button
                            onClick={handleVolverInicio}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Jugar de Nuevo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Game not started or no current question
    if (!juego.juegoIniciado || !juego.preguntaActual) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center max-w-md p-6">
                    <h1 className="text-2xl font-bold text-orange-600 mb-4">Esperando...</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        El juego aún no ha comenzado o no hay preguntas disponibles.
                    </p>
                    <button
                        onClick={handleVolverSala}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Volver a la Sala
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-left">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Jugador</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{urlParams.name}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Pregunta</p>
                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {juego.indicePregunta} / {juego.totalPreguntas}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Puntuación</p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">{juego.puntuacion}</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-8 dark:bg-gray-700">
                    <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(juego.indicePregunta / juego.totalPreguntas) * 100}%` }}
                    ></div>
                </div>

                {/* Question Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
                        {juego.preguntaActual.texto}
                    </h2>

                    {/* Answer Options */}
                    <div className="grid gap-4">
                        {juego.preguntaActual.respuestas.map((respuesta) => {
                            const isSelected = juego.respuestaSeleccionada === respuesta.id;
                            const isDisabled = juego.esperandoRespuesta || juego.mostrarResultado;

                            let buttonClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ";

                            if (isDisabled) {
                                if (isSelected && juego.mostrarResultado) {
                                    buttonClass += juego.esRespuestaCorrecta
                                        ? "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-400 dark:text-green-200"
                                        : "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-400 dark:text-red-200";
                                } else {
                                    buttonClass += "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400";
                                }
                            } else {
                                buttonClass += "bg-gray-50 border-gray-300 text-gray-900 hover:bg-purple-50 hover:border-purple-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-purple-900/20 dark:hover:border-purple-500 cursor-pointer";
                            }

                            return (
                                <button
                                    key={respuesta.id}
                                    onClick={() => handleRespuesta(respuesta.id)}
                                    disabled={isDisabled}
                                    className={buttonClass}
                                >
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center mr-4 text-sm font-bold">
                                            {String.fromCharCode(65 + (juego.preguntaActual!.respuestas.indexOf(respuesta)))}
                                        </div>
                                        <span className="font-medium">{respuesta.texto}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Result Message */}
                    {juego.mostrarResultado && (
                        <div className={`mt-6 p-4 rounded-lg text-center ${juego.esRespuestaCorrecta
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                            }`}>
                            <p className="font-semibold">
                                {juego.esRespuestaCorrecta ? "¡Correcto! 🎉" : "Incorrecto 😔"}
                            </p>
                            <p className="text-sm mt-1">
                                {juego.esRespuestaCorrecta ? "+10 puntos" : "Mejor suerte en la próxima"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={handleVolverSala}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Volver a la Sala
                    </button>
                    <button
                        onClick={() => finalizarJuego()}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Terminar Juego
                    </button>
                </div>
            </div>
        </div>
    );
}
