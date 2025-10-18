// RootApp.tsx
import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { routes, defaultRoute } from './routeConfig';
import PrivateRoute from './PrivateRoutes';
import Layout from '../layout/templates';
import Login from '../features/login';
// import HomeAdmin from '../pages/home-admin/index';
// import LoginPage from '../pages/authentication/login';
// import CustomerRegister from '../pages/customers/authentication/UserRegistration';
import Register from '../features/register';
import ForgotPassword from "../features/forgotPassword";
import Home from '../pages/merchants/allList/AllMerchants';
// import CustomerLogin from "../pages/customers/authentication/login";

const RootApp: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<PrivateRoute>
                    <Layout />
                </PrivateRoute>}>
                    {routes.map((route) => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                <PrivateRoute>
                                    <route.component />
                                </PrivateRoute>
                            }
                        />
                    ))}
                    <Route path="*" element={<Navigate to={defaultRoute} />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default RootApp;
