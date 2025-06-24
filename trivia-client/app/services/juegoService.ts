// Configuración de la API
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

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

// Servicio de API para el Juego
export class JuegoApiService {
    private static async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensaje || data.Message || 'Error en la API');
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Error de conexión con el servidor');
        }
    }

    static async iniciarJuego(salaId: number): Promise<JuegoResponse> {
        return this.request<JuegoResponse>(`/Juego/iniciar/${salaId}`, {
            method: 'POST',
        });
    }

    static async responderPregunta(request: ResponderRequest): Promise<ResponderResponse> {
        return this.request<ResponderResponse>('/Juego/responder', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    static async obtenerPreguntaActual(salaId: number): Promise<Pregunta> {
        return this.request<Pregunta>(`/Juego/pregunta-actual/${salaId}`);
    }

    static async siguientePregunta(salaId: number): Promise<JuegoResponse> {
        return this.request<JuegoResponse>(`/Juego/siguiente-pregunta/${salaId}`, {
            method: 'POST',
        });
    }

    static async finalizarJuego(salaId: number): Promise<{ mensaje: string }> {
        return this.request<{ mensaje: string }>(`/Juego/finalizar/${salaId}`, {
            method: 'POST',
        });
    }
}
