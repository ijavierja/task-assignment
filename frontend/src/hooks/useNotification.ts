import { useState } from 'react';

export interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

export const useNotification = () => {
    const [notification, setNotification] = useState<Notification | null>(null);

    const showNotification = (
        message: string,
        type: 'success' | 'error' | 'info' | 'warning' = 'info',
        duration: number = 3000
    ) => {
        const id = Date.now().toString();
        setNotification({ id, message, type });

        if (duration > 0) {
            setTimeout(() => {
                setNotification(null);
            }, duration);
        }
    };

    const closeNotification = () => {
        setNotification(null);
    };

    return {
        notification,
        showNotification,
        closeNotification,
    };
};
