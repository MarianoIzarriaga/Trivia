import ky from 'ky';

// Configuración de la API
const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api`;

// Crear instancia de ky con configuración base
const api = ky.create({
    prefixUrl: API_BASE_URL,
    timeout: 10000,
    retry: {
        limit: 2,
        methods: ['get', 'post'],
    },
});

// Tipos TypeScript para el juego
export interface Pregunta {
    id: number;
    texto: string;
    respuestas: Respuesta[];
}

export interface Respuesta {
    id: number;
    texto: string;
}

export interface ResponderRequest {
    preguntaId: number;
    respuestaId: number;
    nombreJugador: string;
}

export interface JuegoResponse {
    mensaje: string;
    pregunta?: {
        id: number;
        texto: string;
        respuestas: Array<{
            id: number;
            texto: string;
        }>;
    };
}

export interface ResponderResponse {
    mensaje: string;
    esCorrecta: boolean;
}

export interface EstadoJuegoResponse {
    juegoIniciado: boolean;
    juegoTerminado: boolean;
    preguntaActual: number;
    totalPreguntas: number;
    puntuaciones: Record<string, number>;
}

export interface ResultadosResponse {
    ganador: string;
    puntuacionesFinal: Record<string, number>;
}

// Servicio de API para el Juego usando ky
export class JuegoApiService {
    static async iniciarJuego(salaId: number): Promise<JuegoResponse> {
        try {
            return await api.post(`Juego/iniciar/${salaId}`).json<JuegoResponse>();
        } catch (error: any) {
            const errorData = await error.response?.json?.() ?? {};
            throw new Error(errorData.mensaje ?? errorData.Message ?? 'Error al iniciar juego');
        }
    }

    static async responderPregunta(request: ResponderRequest): Promise<ResponderResponse> {
        try {
            return await api.post('Juego/responder', {
                json: request,
            }).json<ResponderResponse>();
        } catch (error: any) {
            const errorData = await error.response?.json?.() ?? {};
            throw new Error(errorData.mensaje ?? errorData.Message ?? 'Error al responder pregunta');
        }
    }

    static async obtenerPreguntaActual(salaId: number): Promise<Pregunta> {
        try {
            return await api.get(`Juego/pregunta-actual/${salaId}`).json<Pregunta>();
        } catch (error: any) {
            const errorData = await error.response?.json?.() ?? {};
            throw new Error(errorData.mensaje ?? errorData.Message ?? 'Error al obtener pregunta');
        }
    }

    static async siguientePregunta(salaId: number): Promise<JuegoResponse> {
        try {
            return await api.post(`Juego/siguiente-pregunta/${salaId}`).json<JuegoResponse>();
        } catch (error: any) {
            const errorData = await error.response?.json?.() ?? {};
            throw new Error(errorData.mensaje ?? errorData.Message ?? 'Error al obtener siguiente pregunta');
        }
    }

    static async finalizarJuego(salaId: number): Promise<{ mensaje: string }> {
        try {
            return await api.post(`Juego/finalizar/${salaId}`).json<{ mensaje: string }>();
        } catch (error: any) {
            const errorData = await error.response?.json?.() ?? {};
            throw new Error(errorData.mensaje ?? errorData.Message ?? 'Error al finalizar juego');
        }
    }

    static async obtenerEstadoJuego(salaId: number): Promise<EstadoJuegoResponse> {
        try {
            return await api.get(`Juego/estado/${salaId}`).json<EstadoJuegoResponse>();
        } catch (error: any) {
            const errorData = await error.response?.json?.() ?? {};
            throw new Error(errorData.mensaje ?? errorData.Message ?? 'Error al obtener estado del juego');
        }
    }

    static async obtenerResultados(salaId: number): Promise<ResultadosResponse> {
        try {
            return await api.get(`Juego/resultados/${salaId}`).json<ResultadosResponse>();
        } catch (error: any) {
            const errorData = await error.response?.json?.() ?? {};
            throw new Error(errorData.mensaje ?? errorData.Message ?? 'Error al obtener resultados');
        }
    }
}
