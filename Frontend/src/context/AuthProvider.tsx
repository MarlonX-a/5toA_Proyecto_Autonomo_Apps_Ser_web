import { useState, type  ReactNode, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { getUsers } from '../api/usersApi';
import { authenticateSocket, disconnectSocket } from '../websocket/socket';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) setToken(savedToken);
    }, []);

    const login = async (newToken: string) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);

        try {
            const profileRes = await getUsers(newToken);
            const { id, rol } = profileRes.data as { id: number; rol: 'cliente' | 'proveedor' | 'admin' | null };
            if (id && rol && (rol === 'cliente' || rol === 'proveedor' || rol === 'admin')) {
                await authenticateSocket({ token: newToken, userId: String(id), role: rol });
            }
        } catch (e) {
            // Silenciar errores de auth WS para no romper la UX de login
            console.error('WebSocket auth failed:', e);
        }
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
        disconnectSocket();
    };

    useEffect(() => {
        // Auto-autenticar WebSocket si hay token guardado al cargar
        const savedToken = localStorage.getItem('token');
        if (!savedToken) return;
        (async () => {
            try {
                const profileRes = await getUsers(savedToken);
                const { id, rol } = profileRes.data as { id: number; rol: 'cliente' | 'proveedor' | 'admin' | null };
                if (id && rol && (rol === 'cliente' || rol === 'proveedor' || rol === 'admin')) {
                    await authenticateSocket({ token: savedToken, userId: String(id), role: rol });
                }
            } catch (e) {
                console.warn('Auto WebSocket auth skipped:', e);
            }
        })();
    }, []);

    return(
        <AuthContext.Provider value = {{token, login, logout }} >
            {children}
        </AuthContext.Provider>
    )
}