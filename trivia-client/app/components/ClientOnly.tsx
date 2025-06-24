import { useEffect, useState } from 'react';

interface ClientOnlyProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Componente que solo renderiza en el cliente para evitar problemas de hidratación
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Hook para detectar si estamos en el cliente
 */
export function useIsClient() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient;
}

/**
 * Hook para manejar valores que pueden diferir entre servidor y cliente
 */
export function useClientValue<T>(serverValue: T, clientValue: T): T {
    const [value, setValue] = useState(serverValue);

    useEffect(() => {
        setValue(clientValue);
    }, [clientValue]);

    return value;
}
