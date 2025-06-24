import { useState, useEffect } from "react";

export function meta() {
    return [
        { title: "Trivia Game" },
        { name: "description", content: "Juego de Trivia" },
    ];
}

export default function Juego() {
    // Simulamos obtener los parámetros de la URL
    const [urlParams, setUrlParams] = useState({ code: "", name: "" });

    useEffect(() => {
        // En un entorno real, obtendrías estos parámetros de la URL
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code") ?? "";
        const playerName = url.searchParams.get("name") ?? "";
        setUrlParams({ code, name: playerName });
    }, []);

    const [timeLeft, setTimeLeft] = useState(20);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    // Pregunta y respuestas dummy
    const question = "¿Cuál es la capital de Francia?";
    const answers = [
        "Madrid",
        "París",
        "Roma",
        "Londres"
    ];
    const correctAnswer = 1; // París

    useEffect(() => {
        if (timeLeft > 0 && !isAnswered) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !isAnswered) {
            setIsAnswered(true);
        }
    }, [timeLeft, isAnswered]);

    const handleAnswerSelect = (answerIndex: number) => {
        if (!isAnswered) {
            setSelectedAnswer(answerIndex);
            setIsAnswered(true);
        }
    };

    const getAnswerButtonClass = (answerIndex: number) => {
        if (!isAnswered) {
            return "w-full p-4 text-left border-2 border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors";
        }

        if (answerIndex === correctAnswer) {
            return "w-full p-4 text-left border-2 border-green-500 bg-green-100 dark:bg-green-900/30 rounded-lg";
        }

        if (answerIndex === selectedAnswer && answerIndex !== correctAnswer) {
            return "w-full p-4 text-left border-2 border-red-500 bg-red-100 dark:bg-red-900/30 rounded-lg";
        }

        return "w-full p-4 text-left border-2 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700 rounded-lg opacity-50";
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Trivia Game
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Sala: {urlParams.code} | Jugador: {urlParams.name}
                            </p>
                        </div>
                        <div className="text-center">
                            <div className={`text-4xl font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-blue-600'}`}>
                                {timeLeft}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                segundos
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timer Bar */}
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
                    <div
                        className={`h-3 rounded-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-500' : 'bg-blue-600'
                            }`}
                        style={{ width: `${(timeLeft / 20) * 100}%` }}
                    ></div>
                </div>

                {/* Question */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center">
                        {question}
                    </h2>
                </div>

                {/* Answers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {answers.map((answer, index) => (
                        <button
                            key={`answer-${answer}-${index}`}
                            onClick={() => handleAnswerSelect(index)}
                            disabled={isAnswered}
                            className={getAnswerButtonClass(index)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    {String.fromCharCode(65 + index)}
                                </div>
                                <span className="text-gray-900 dark:text-gray-100">{answer}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Result */}
                {isAnswered && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="text-center">
                            {selectedAnswer === correctAnswer ? (
                                <div className="text-green-600 dark:text-green-400">
                                    <div className="text-2xl font-bold mb-2">¡Correcto! 🎉</div>
                                    <p>Has respondido correctamente</p>
                                </div>
                            ) : selectedAnswer !== null ? (
                                <div className="text-red-600 dark:text-red-400">
                                    <div className="text-2xl font-bold mb-2">Incorrecto 😔</div>
                                    <p>La respuesta correcta era: {answers[correctAnswer]}</p>
                                </div>
                            ) : (
                                <div className="text-yellow-600 dark:text-yellow-400">
                                    <div className="text-2xl font-bold mb-2">¡Tiempo agotado! ⏰</div>
                                    <p>La respuesta correcta era: {answers[correctAnswer]}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
