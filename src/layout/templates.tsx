import React, { useEffect, useState } from 'react';
import Sidebar from './sidebar';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../routes/useAuth';
import { Role } from '../routes/routeConfig';

interface UserDetails {
    username?: string;
    token?: string;
    userId?: string;
    roles?: string[];
    firstName: string;
    lastName: string;
}

const Layout: React.FC = () => {
    const [role, setRole] = useState<string>('');
    const [userAllDetails, setUserAllDetails] = useState<UserDetails>({
        username: '',
        token: '',
        userId: '',
        roles: [],
        firstName: '',
        lastName: '',
    });

    const [allowedModules, setAllowedModules] = useState<string[]>([]);

    useEffect(() => {
        const permissionsString = localStorage.getItem('modulePermissions');

        if (permissionsString) {
            try {
                setAllowedModules(JSON.parse(permissionsString))
            } catch (error) {
                console.error('Failed to parse permissions from localStorage:', error);
            }
        }
    }, []);

    useEffect(() => {
        const loginDetailsString = localStorage.getItem('loginDetails');
        if (loginDetailsString) {
            const loginDetails = JSON.parse(loginDetailsString);
            if (loginDetails.token) {
                setRole(loginDetails?.roles[0]);
            }
        }
    }, []);
    

    useEffect(() => {
        const loginDetailsString = localStorage.getItem('loginDetails');

        if (loginDetailsString) {
            const loginDetails = JSON.parse(loginDetailsString);
            if (loginDetails.token) {
                setRole(loginDetails?.roles[0]);
               // console.log(loginDetails?.roles[0], 'loginDetails')
            }
        }

        const loginDetails = localStorage.getItem('loginDetails');
        if (loginDetails) {
            try {
                const userDetails: UserDetails = JSON.parse(loginDetails);
                setUserAllDetails(userDetails);
            } catch (error) {
                console.error('Error parsing user details from localStorage:', error);
            }
        }
    }, []);


    return (
        <div className="flex h-screen">
            {/* <Sidebar /> */}
            <div className="flex-1 flex flex-col md:ml-64 lg:ml-64 xl:ml-64">
                <Sidebar role={role as Role} allowedModules={allowedModules} />
                <main className="md:p-4 lg:p-4 xl:p-4 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;