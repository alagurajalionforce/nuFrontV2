import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface PrivateRouteProps {
    children?: React.ReactNode;
}

interface Auth {
    role: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {

    let auth: Auth = { role: '' };
    const loginDetailsString = localStorage.getItem('loginDetails');
    if (loginDetailsString) {
        const loginDetails = JSON.parse(loginDetailsString);
        // console.log(loginDetails.token);
        if (loginDetails.token) {
            auth = { role: loginDetails.roles[0] };
        }
        else {
            auth = { role: '' };
        }
    } else {
        console.log('No login details found in localStorage');
        auth = { role: '' };
    }

    // console.log(roles, auth.role, 'Role')

    if (!auth.role) {
        return <Navigate to="/login" />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
