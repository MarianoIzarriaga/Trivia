import ky from 'ky';

// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Crear instancia de ky con configuración base
const api = ky.create({
    prefixUrl: API_BASE_URL,
    timeout: 10000,
    retry: {
        limit: 2,
        methods: ['get', 'post'],
    },
});

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

// Servicio de API para Salas usando ky
export class SalaApiService {
    static async crearSala(nombreJugador: string): Promise<SalaResponse> {
        const formData = new FormData();
        formData.append('nombreJugador', nombreJugador);

        try {
            return await api.post('Sala/CrearSala', {
                body: formData,
            }).json<SalaResponse>();
        } catch (error: any) {
            const errorData = await error.response?.json?.() ?? {};
            throw new Error(errorData.mensaje || errorData.Message || 'Error al crear sala');
        }
    }

    static async unirseSala(codigoSala: string, nombreJugador: string): Promise<SalaResponse> {
        const formData = new FormData();
        formData.append('codigoSala', codigoSala);
        formData.append('nombreJugador', nombreJugador);

        try {
            return await api.post('Sala/UnirseSala', {
                body: formData,
            }).json<SalaResponse>();
        } catch (error: any) {
            const errorData = await error.response?.json?.() ?? {};
            throw new Error(errorData.mensaje || errorData.Message || 'Error al unirse a la sala');
        }
    }

    static async salirDeSala(nombreJugador: string, salaId: number): Promise<{ mensaje: string }> {
        const formData = new FormData();
        formData.append('nombreJugador', nombreJugador);
        formData.append('salaId', salaId.toString());

        try {
            return await api.post('Sala/SalirDeSala', {
                body: formData,
            }).json<{ mensaje: string }>();
        } catch (error: any) {
            const errorData = await error.response?.json?.() ?? {};
            throw new Error(errorData.mensaje || errorData.Message || 'Error al salir de la sala');
        }
    }

    static async obtenerSalaPorCodigo(codigo: string): Promise<SalaDetalle> {
        try {
            return await api.get(`Sala/ObtenerSalaPorCodigo`, {
                searchParams: { codigo }
            }).json<SalaDetalle>();
        } catch (error: any) {
            const errorData = await error.response?.json?.() ?? {};
            throw new Error(errorData.mensaje || errorData.Message || 'Error al obtener sala');
        }
    }

    static async obtenerSalasDisponibles(): Promise<Array<{
        id: number;
        nombre: string;
        descripcion?: string;
        jugadores: number;
        capacidad: number;
        creador?: string;
    }>> {
        try {
            return await api.get('Sala/ObtenerSalasDisponibles').json<Array<{
                id: number;
                nombre: string;
                descripcion?: string;
                jugadores: number;
                capacidad: number;
                creador?: string;
            }>>();
        } catch (error: any) {
            const errorData = await error.response?.json?.() ?? {};
            throw new Error(errorData.mensaje ?? errorData.Message ?? 'Error al obtener salas');
        }
    }

    static async iniciarCuentaRegresiva(codigo: string): Promise<{ mensaje: string }> {
        try {
            return await api.post(`Sala/iniciar-cuenta-regresiva/${codigo}`).json<{ mensaje: string }>();
        } catch (error: any) {
            const errorData = await error.response?.json?.() ?? {};
            throw new Error(errorData.mensaje ?? errorData.Message ?? 'Error al iniciar cuenta regresiva');
        }
    }

    static createEventSource(codigo: string): EventSource {
        return new EventSource(`${API_BASE_URL}/Sala/SalaEvents?codigo=${encodeURIComponent(codigo)}`);
    }
}
