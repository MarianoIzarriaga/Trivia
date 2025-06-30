import { useEffect, useRef } from "react";

export interface JuegoStreamData {
    juegoIniciado: boolean;
    juegoTerminado: boolean;
    preguntaActual: number;
    totalPreguntas: number;
    puntuaciones: Record<string, number>;
}

export function useJuegoStream({ salaId, onUpdate, onError }: {
    salaId: number | null;
    onUpdate: (data: JuegoStreamData) => void;
    onError?: (err: any) => void;
}) {
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        console.log(salaId)
        if (!salaId) return;
        const url = `/api/juego/stream/${salaId}`;
        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Recibí del stream:", data);
                onUpdate(data);
            } catch (err) {
                if (onError) onError(err);
            }
        };
        es.onerror = (err) => {
            if (onError) onError(err);
        };
        return () => {
            es.close();
        };
    }, [salaId]);
}
