// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Tipos TypeScript
export interface Jugador {
    id: number;
    nombre: string;
    salaId?: number;
}

export interface Sala {
    id: number;
    nombre: string;
    descripcion?: string;
    capacidad: number;
    creadorId?: number;
    creador?: Jugador;
    jugadores: Jugador[];
    fechaCreacion: string;
}

export interface SalaResponse {
    mensaje: string;
    codigoSala?: string;
    salaId: number;
    jugadores: number;
    capacidad?: number;
}

export interface SalaDetalle {
    id: number;
    codigo: string;
    descripcion?: string;
    jugadores: string[];
    capacidad: number;
    creador?: string;
}

export interface ApiError {
    mensaje: string;
}

// Servicio de API para Salas
export class SalaApiService {
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

    static async crearSala(nombreJugador: string): Promise<SalaResponse> {
        const formData = new FormData();
        formData.append('nombreJugador', nombreJugador);

        return this.request<SalaResponse>('/Sala/CrearSala', {
            method: 'POST',
            body: formData,
            headers: {}, // Remover Content-Type para FormData
        });
    }

    static async unirseSala(codigoSala: string, nombreJugador: string): Promise<SalaResponse> {
        const formData = new FormData();
        formData.append('codigoSala', codigoSala);
        formData.append('nombreJugador', nombreJugador);

        return this.request<SalaResponse>('/Sala/UnirseSala', {
            method: 'POST',
            body: formData,
            headers: {}, // Remover Content-Type para FormData
        });
    }

    static async salirDeSala(nombreJugador: string, salaId: number): Promise<{ mensaje: string }> {
        const formData = new FormData();
        formData.append('nombreJugador', nombreJugador);
        formData.append('salaId', salaId.toString());

        return this.request<{ mensaje: string }>('/Sala/SalirDeSala', {
            method: 'POST',
            body: formData,
            headers: {}, // Remover Content-Type para FormData
        });
    }

    static async obtenerSalaPorCodigo(codigo: string): Promise<SalaDetalle> {
        return this.request<SalaDetalle>(`/Sala/ObtenerSalaPorCodigo?codigo=${encodeURIComponent(codigo)}`);
    }

    static async obtenerSalasDisponibles(): Promise<Array<{
        id: number;
        nombre: string;
        descripcion?: string;
        jugadores: number;
        capacidad: number;
        creador?: string;
    }>> {
        return this.request<Array<{
            id: number;
            nombre: string;
            descripcion?: string;
            jugadores: number;
            capacidad: number;
            creador?: string;
        }>>('/Sala/ObtenerSalasDisponibles');
    }

    static createEventSource(codigo: string): EventSource {
        return new EventSource(`${API_BASE_URL}/Sala/SalaEvents?codigo=${encodeURIComponent(codigo)}`);
    }
}
