import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../backend/src/trpc';

export const trpc = createTRPCReact<AppRouter>();

// Determine API URL based on environment
// In development (port 3000): call backend directly at localhost:3001
// In production/Docker (port 80): use relative path (proxied by nginx)
const getApiUrl = () => {
    if (typeof window === 'undefined') return '/trpc';

    // Development mode: frontend running on port 3000
    if (window.location.port === '3000') {
        return 'http://localhost:3001/trpc';
    }

    // Production/Docker mode: use relative path (nginx proxies to backend)
    return '/trpc';
};

export const trpcClient = trpc.createClient({
    links: [
        httpBatchLink({
            url: getApiUrl(),
        }),
    ],
});
