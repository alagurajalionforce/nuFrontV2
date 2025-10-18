import { useState, useEffect } from 'react';

interface Auth {
    role: string;
}

export const useAuth = () => {
    const [auth, setAuth] = useState<Auth>({ role: '' });

    useEffect(() => {
        const loginDetailsString = localStorage.getItem('loginDetails');
        if (loginDetailsString) {
            const loginDetails = JSON.parse(loginDetailsString);
            if (loginDetails.token) {
                setAuth({ role: loginDetails?.roles });
            }
        }
    }, []);

    return auth;
};
