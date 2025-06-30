import { useState, useEffect, useCallback, useRef } from 'react';
import { SalaApiService } from '../services/salaService';

export interface SalaState {
    id?: number;
    codigo: string;
    nombreJugador: string;
    jugadores: string[];
    capacidad: number;
    esHost: boolean;
    cargando: boolean;
    error: string | null;
    conectado: boolean;
    // Nuevos campos para la cuenta regresiva
    countdown?: {
        isActive: boolean;
        value: number;
        startTime: string;
    };
}

export interface UseSalaReturn {
    sala: SalaState;
    crearSala: (nombreJugador: string) => Promise<void>;
    unirseSala: (codigo: string, nombreJugador: string) => Promise<void>;
    cargarSalaPorCodigo: (codigo: string, nombreJugador: string, esHost: boolean) => Promise<void>;
    salirDeSala: () => Promise<void>;
    actualizarSala: () => Promise<void>;
    iniciarCuentaRegresiva: () => Promise<void>;
    limpiarError: () => void;
}

export function useSala(): UseSalaReturn {
    const [sala, setSala] = useState<SalaState>({
        codigo: '',
        nombreJugador: '',
        jugadores: [],
        capacidad: 10,
        esHost: false,
        cargando: false,
        error: null,
        conectado: false,
    });

    const eventSourceRef = useRef<EventSource | null>(null);

    // Función para inicializar EventSource
    const initEventSource = useCallback((codigo: string) => {
        // Cerrar conexión anterior si existe
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        try {
            const eventSource = SalaApiService.createEventSource(codigo);
            eventSourceRef.current = eventSource;

            eventSource.onmessage = (event) => {
                try {
                    const salaData = JSON.parse(event.data);
                    setSala(prev => ({
                        ...prev,
                        id: salaData.id,
                        jugadores: salaData.jugadores,
                        capacidad: salaData.capacidad,
                        countdown: salaData.countdown,
                        conectado: true,
                        cargando: false,
                    }));
                } catch (error) {
                    console.error('Error parsing SSE data:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('EventSource error:', error);
                setSala(prev => ({
                    ...prev,
                    error: 'Error de conexión en tiempo real',
                }));
            };

        } catch (error) {
            console.error('Error creating EventSource:', error);
            setSala(prev => ({
                ...prev,
                error: 'No se pudo establecer conexión en tiempo real',
            }));
        }
    }, []);

    // Función para cerrar EventSource
    const closeEventSource = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
    }, []);

    // Función para cargar sala por código (nueva funcionalidad principal)
    const cargarSalaPorCodigo = useCallback(async (codigo: string, nombreJugador: string, esHost: boolean) => {
        setSala(prev => ({ ...prev, cargando: true, error: null }));

        try {
            // Obtener datos iniciales de la sala
            const salaData = await SalaApiService.obtenerSalaPorCodigo(codigo);

            setSala(prev => ({
                ...prev,
                id: salaData.id,
                codigo: salaData.codigo,
                nombreJugador,
                jugadores: salaData.jugadores,
                capacidad: salaData.capacidad,
                esHost,
                conectado: true,
                cargando: false,
            }));

            // Inicializar conexión SSE para actualizaciones en tiempo real
            initEventSource(codigo);

        } catch (error) {
            setSala(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Error al cargar la sala',
                cargando: false,
                conectado: false,
            }));
        }
    }, [initEventSource]);

    // Función para crear una nueva sala
    const crearSala = useCallback(async (nombreJugador: string) => {
        setSala(prev => ({ ...prev, cargando: true, error: null }));

        try {
            const response = await SalaApiService.crearSala(nombreJugador);

            setSala(prev => ({
                ...prev,
                id: response.salaId,
                codigo: response.codigoSala ?? '',
                nombreJugador,
                jugadores: [nombreJugador], // El creador es el primer jugador
                esHost: true,
                conectado: true,
                cargando: false,
            }));

            // Inicializar conexión SSE
            if (response.codigoSala) {
                initEventSource(response.codigoSala);
            }

        } catch (error) {
            setSala(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Error al crear la sala',
                cargando: false,
            }));
        }
    }, []);

    // Función para unirse a una sala existente
    const unirseSala = useCallback(async (codigo: string, nombreJugador: string) => {
        setSala(prev => ({ ...prev, cargando: true, error: null }));

        try {
            const response = await SalaApiService.unirseSala(codigo, nombreJugador);

            setSala(prev => ({
                ...prev,
                id: response.salaId,
                codigo,
                nombreJugador,
                esHost: false,
                conectado: true,
                cargando: false,
                capacidad: response.capacidad ?? 10,
            }));

            // Inicializar conexión SSE
            initEventSource(codigo);

        } catch (error) {
            setSala(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Error al unirse a la sala',
                cargando: false,
            }));
        }
    }, []);

    // Función para salir de la sala
    const salirDeSala = useCallback(async () => {
        if (!sala.id || !sala.nombreJugador) return;

        setSala(prev => ({ ...prev, cargando: true }));

        try {
            await SalaApiService.salirDeSala(sala.nombreJugador, sala.id);

            // Cerrar conexión SSE
            closeEventSource();

            // Limpiar el estado
            setSala({
                codigo: '',
                nombreJugador: '',
                jugadores: [],
                capacidad: 10,
                esHost: false,
                cargando: false,
                error: null,
                conectado: false,
            });

        } catch (error) {
            setSala(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Error al salir de la sala',
                cargando: false,
            }));
        }
    }, [sala.id, sala.nombreJugador]);

    // Función para actualizar manualmente la sala
    const actualizarSala = useCallback(async () => {
        if (!sala.codigo) return;

        try {
            const salaData = await SalaApiService.obtenerSalaPorCodigo(sala.codigo);
            setSala(prev => ({
                ...prev,
                jugadores: salaData.jugadores,
                capacidad: salaData.capacidad,
            }));
        } catch (error) {
            console.error('Error al actualizar sala:', error);
        }
    }, [sala.codigo]);

    // Función para limpiar errores
    const limpiarError = useCallback(() => {
        setSala(prev => ({ ...prev, error: null }));
    }, []);

    // Función para iniciar cuenta regresiva del juego
    const iniciarCuentaRegresiva = useCallback(async () => {
        if (!sala.codigo) return;

        try {
            await SalaApiService.iniciarCuentaRegresiva(sala.codigo);
        } catch (error) {
            setSala(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Error al iniciar cuenta regresiva',
            }));
        }
    }, [sala.codigo]);

    // Efecto para cargar sala desde URL al montar el componente
    useEffect(() => {
        const url = new URL(window.location.href);
        const codigo = url.searchParams.get("code");
        const nombreJugador = url.searchParams.get("name");
        const esHost = url.searchParams.get("host") === "true";

        if (codigo && nombreJugador) {
            cargarSalaPorCodigo(codigo, nombreJugador, esHost);
        }
    }, [cargarSalaPorCodigo]);

    // Limpiar EventSource al desmontar el componente
    useEffect(() => {
        return () => {
            closeEventSource();
        };
    }, [closeEventSource]);

    return {
        sala,
        crearSala,
        unirseSala,
        cargarSalaPorCodigo,
        salirDeSala,
        actualizarSala,
        iniciarCuentaRegresiva,
        limpiarError,
    };
}
