import { useState, useEffect, useCallback } from 'react';
import { JuegoApiService, type Pregunta, type ResponderRequest } from '../services/juegoService';

export interface JuegoState {
    salaId?: number;
    juegoIniciado: boolean;
    preguntaActual?: Pregunta;
    indicePregunta: number;
    totalPreguntas: number;
    respuestaSeleccionada?: number;
    esperandoRespuesta: boolean;
    mostrarResultado: boolean;
    esRespuestaCorrecta: boolean;
    puntuacion: number;
    juegoTerminado: boolean;
    cargando: boolean;
    error: string | null;
}

export interface UseJuegoReturn {
    juego: JuegoState;
    iniciarJuego: (salaId: number) => Promise<void>;
    responderPregunta: (respuestaId: number, nombreJugador: string) => Promise<void>;
    siguientePregunta: () => Promise<void>;
    finalizarJuego: () => Promise<void>;
    limpiarError: () => void;
}

export function useJuego(): UseJuegoReturn {
    const [juego, setJuego] = useState<JuegoState>({
        juegoIniciado: false,
        indicePregunta: 0,
        totalPreguntas: 10,
        esperandoRespuesta: false,
        mostrarResultado: false,
        esRespuestaCorrecta: false,
        puntuacion: 0,
        juegoTerminado: false,
        cargando: false,
        error: null,
    });

    const iniciarJuego = useCallback(async (salaId: number) => {
        setJuego(prev => ({ ...prev, cargando: true, error: null }));

        try {
            const response = await JuegoApiService.iniciarJuego(salaId);

            if (response.pregunta) {
                setJuego(prev => ({
                    ...prev,
                    salaId,
                    juegoIniciado: true,
                    preguntaActual: response.pregunta,
                    indicePregunta: 1,
                    cargando: false,
                }));
            } else {
                throw new Error(response.mensaje || 'No se pudo obtener la primera pregunta');
            }
        } catch (error) {
            setJuego(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Error al iniciar el juego',
                cargando: false,
            }));
        }
    }, []);

    const responderPregunta = useCallback(async (respuestaId: number, nombreJugador: string) => {
        if (!juego.preguntaActual || juego.esperandoRespuesta) return;

        setJuego(prev => ({
            ...prev,
            respuestaSeleccionada: respuestaId,
            esperandoRespuesta: true,
            error: null
        }));

        try {
            const request: ResponderRequest = {
                preguntaId: juego.preguntaActual.id,
                respuestaId,
                nombreJugador,
            };

            const response = await JuegoApiService.responderPregunta(request);

            setJuego(prev => ({
                ...prev,
                esperandoRespuesta: false,
                mostrarResultado: true,
                esRespuestaCorrecta: response.esCorrecta,
                puntuacion: response.esCorrecta ? prev.puntuacion + 10 : prev.puntuacion,
            }));

            // Mostrar resultado por 3 segundos antes de continuar
            setTimeout(() => {
                siguientePregunta();
            }, 3000);

        } catch (error) {
            setJuego(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Error al responder pregunta',
                esperandoRespuesta: false,
            }));
        }
    }, [juego.preguntaActual, juego.esperandoRespuesta]);

    const siguientePregunta = useCallback(async () => {
        if (!juego.salaId) return;

        setJuego(prev => ({
            ...prev,
            cargando: true,
            mostrarResultado: false,
            respuestaSeleccionada: undefined,
            error: null
        }));

        try {
            const response = await JuegoApiService.siguientePregunta(juego.salaId);

            if (response.pregunta) {
                setJuego(prev => ({
                    ...prev,
                    preguntaActual: response.pregunta,
                    indicePregunta: prev.indicePregunta + 1,
                    cargando: false,
                }));
            } else {
                // Juego terminado
                setJuego(prev => ({
                    ...prev,
                    juegoTerminado: true,
                    juegoIniciado: false,
                    cargando: false,
                }));
            }
        } catch (error) {
            setJuego(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Error al cargar siguiente pregunta',
                cargando: false,
            }));
        }
    }, [juego.salaId]);

    const finalizarJuego = useCallback(async () => {
        if (!juego.salaId) return;

        setJuego(prev => ({ ...prev, cargando: true, error: null }));

        try {
            await JuegoApiService.finalizarJuego(juego.salaId);

            setJuego(prev => ({
                ...prev,
                juegoTerminado: true,
                juegoIniciado: false,
                cargando: false,
            }));
        } catch (error) {
            setJuego(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Error al finalizar el juego',
                cargando: false,
            }));
        }
    }, [juego.salaId]);

    const limpiarError = useCallback(() => {
        setJuego(prev => ({ ...prev, error: null }));
    }, []);

    // Auto-inicializar si hay parámetros de URL
    useEffect(() => {
        const url = new URL(window.location.href);
        const salaIdParam = url.searchParams.get("salaId");

        if (salaIdParam && !juego.juegoIniciado && !juego.cargando) {
            const salaId = parseInt(salaIdParam);
            if (!isNaN(salaId)) {
                iniciarJuego(salaId);
            }
        }
    }, [juego.juegoIniciado, juego.cargando, iniciarJuego]);

    return {
        juego,
        iniciarJuego,
        responderPregunta,
        siguientePregunta,
        finalizarJuego,
        limpiarError,
    };
}
