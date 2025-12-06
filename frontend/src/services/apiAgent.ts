import axios from 'axios';

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.data?.error) {
            const errorData = error.response.data.error;
            // Create a more user-friendly error message
            const message = typeof errorData === 'string' ? errorData : errorData.message;
            const details = typeof errorData === 'object' ? errorData.details : undefined;

            const customError = new Error(message);
            (customError as any).details = details;
            (customError as any).statusCode = error.response.status;
            throw customError;
        }
        throw error;
    }
);
