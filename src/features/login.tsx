import React, { useEffect, useState } from 'react';
import Logo from '../assets/images/logo.svg'
import { Link, useNavigate } from 'react-router-dom';
import apiRequest from '../utils/helpers/apiRequest';
import { useDispatch } from 'react-redux';
import { authSuccessful, userProfileImage } from '../store/userSlice';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import LoadingSpinner from '../utils/LoadingSpinner';
import BG from '../assets/images/bgNewbg.jpg';
import { getUserIP } from '../utils/commonFunctions';
import { baseUrl } from '../constants/baseURL';
import axios from 'axios';

interface RequestHeader {
    [key: string]: string;
}

interface FormData {
    userName: string;
    password: string;
}

interface Permission {
    roleId: any;
    roleName: string;
    moduleId: any;
    moduleName: string;
    privilegeCreate: boolean;
    privilegeUpdate: boolean;
    privilegeView: boolean;
    privilegeDelete: boolean;

}

const LoginPage = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // const userIP = getUserIP();

    const [userIp, setUserIp] = useState('Loading...');

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPw, setShowPw] = useState<boolean>(false);
    const [formDatas, setFormDatas] = useState<FormData>({
        userName: '',
        password: ''
    });
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [tempData, setTempData] = useState<any[]>([]);

    const [rememberMe, setRememberMe] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormDatas({
            ...formDatas,
            [name]: value
        });

        setEmailError('');
        setPasswordError('');

    };

    const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRememberMe(e.target.checked);
    };

    const showPassword = () => {
        setShowPw(!showPw);
    }

    const validate = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailRegex.test(email);
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        // console.log(formDatas, 'formDatas');
        setIsLoading(true);

        try {
            // Validate email
            if (!formDatas?.userName || !validate(formDatas?.userName)) {
                setEmailError('Invalid email address');
                setIsLoading(false);
            } else {
                setEmailError('');
            }

            // Validate password
            if (!formDatas?.password) {
                setPasswordError('Password required');
                setIsLoading(false);
            } else {
                setPasswordError('');
            }

            // console.log(formDatas?.userName, formDatas?.password, emailError, passwordError)

            // If no validation errors, proceed
            if (
                validate(formDatas?.userName) &&
                formDatas?.password &&
                emailError === '' &&
                passwordError === ''
            ) {
                const toastId = toast.loading('Signing in...');
                const reqBody = {
                    username: formDatas.userName,
                    password: formDatas.password,
                    deviceId: userIp,
                };

                const url = baseUrl + 'auth/signin';
                await axios.post(url, reqBody)
                    .then((res: any) => {

                        if (res?.error) {
                            toast.error(res?.error, { id: toastId });
                            return;
                        }

                        const { token, username, userId, roles, usertype, refreshToken } = res.data;
                        dispatch(authSuccessful({ token, username, userId, roles }));

                        if (usertype === 'NUMONI' && token) {

                            const headers: RequestHeader = {
                                'Authorization': `Bearer ${token}`,
                            };
                            const newUrl = baseUrl + 'app/getModulePrivileges'
                            axios.get(newUrl, { headers: headers })
                                .then((newRes: any) => {

                                    const permissionData = newRes?.data || [];

                                    if (permissionData) {
                                        try {
                                            const permissions: Permission[] = permissionData;

                                            const seen = new Set<string>();
                                            const moduleNames = permissions
                                                .filter((p) => {
                                                    const key = `${p.roleName}:${p.moduleName}`;
                                                    const isValid =
                                                        roles.includes(p.roleName) &&
                                                        p.privilegeView &&
                                                        !seen.has(key);
                                                    if (isValid) seen.add(key);
                                                    return isValid;
                                                })
                                                .map((p) => p.moduleName);

                                            //  console.log(moduleNames, roles, 'moduleNames');

                                            localStorage.setItem(
                                                'modulePermissions',
                                                JSON.stringify(moduleNames)
                                            );
                                        } catch (error) {
                                            console.error(
                                                'Failed to parse permissions from localStorage:',
                                                error
                                            );
                                        }
                                    }

                                    localStorage.setItem('permissions', JSON.stringify(permissionData));

                                    localStorage.setItem('accessToken', token);
                                    localStorage.setItem('refreshToken', refreshToken);

                                    localStorage.setItem('loginDetails', JSON.stringify(res?.data));

                                    localStorage.setItem('userRole', JSON.stringify(roles));

                                    if (rememberMe) {
                                        localStorage.setItem('rememberMeUserName', formDatas.userName);
                                    } else {
                                        localStorage.removeItem('rememberMeUserName');
                                    }

                                    setTimeout(() => {
                                        toast.success('Successfully Sign In', { id: toastId });
                                        setIsLoading(false);
                                        navigate('/dashboard');
                                        // console.log('logged in');
                                        getModules()

                                    }, 4000);

                                });


                        }



                    });


            }
        } catch (e) {
            console.log('Login error:', e);
            toast.error('Something went wrong');
        }
        // finally {
        //     setIsLoading(false);
        // }
    };

    const getModules = async () => {
        const permissionsRes = await apiRequest(`app/getModulePrivileges`);
        const permissionData = permissionsRes?.data || [];

        try {
            const permissions: Permission[] = permissionData;

            const roles = localStorage.getItem('userRole');

            const seen = new Set<string>();
            const moduleNames = permissions
                .filter((p) => {
                    const key = `${p.roleName}:${p.moduleName}`;
                    const isValid =
                        roles?.includes(p.roleName) &&
                        p.privilegeView &&
                        !seen.has(key);
                    if (isValid) seen.add(key);
                    return isValid;
                })
                .map((p) => p.moduleName);

            // console.log(moduleNames, 'moduleNames');



            localStorage.setItem('modulePermissions', JSON.stringify(moduleNames));
            localStorage.setItem('permissions', JSON.stringify(permissionData));



        } catch (error) {
            console.error('Failed to parse permissions:', error);
            toast.error('Error processing permission data');
        }
    }


    useEffect(() => {
        const fetchIp = async () => {
            const ip = await getUserIP();
            setUserIp(ip);
        };

        fetchIp();
    }, []);

    useEffect(() => {
        // Check local storage for saved username
        const savedUserName = localStorage.getItem('rememberMeUserName');
        if (savedUserName) {
            setFormDatas(prev => ({ ...prev, userName: savedUserName }));
            setRememberMe(true);
        }
    }, []);


    return (
        <div className="min-h-screen flex">
            {/* Left Image Section */}
            <div className="hidden md:block w-1/2">
                <img
                    src={BG} // Replace with your actual image path
                    alt="Login Visual"
                    className="object-cover w-full h-full"
                />
            </div>

            {/* Right Login Panel */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-4">
                <div className="max-w-md w-full p-8 md:p-12 rounded-lg shadow-lg bg-white">
                    <div className="mb-6 flex justify-center">
                        <img src={Logo} alt="Logo" className="h-16" /> {/* Replace with your logo */}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h2>
                    <p className="text-sm text-gray-500 mb-6">Enter your Email and password to login</p>

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-1">Email</label>
                            <input
                                type="text"
                                name="userName"
                                value={formDatas?.userName}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:none focus:none"
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-4 relative">
                            <label className="block text-sm text-gray-600 mb-1">Password</label>
                            <input
                                type={showPw ? 'text' : 'password'}
                                name="password"
                                value={formDatas?.password}
                                onChange={handleInputChange}
                                placeholder="Enter your password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:none focus:none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                className="absolute top-9 right-3 text-gray-500"
                            >
                                {showPw ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center text-sm mb-6">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={handleRememberMeChange}
                                className="mr-2"
                            />
                            <span className="text-gray-600">Remember me</span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-2 text-white rounded-full bg-green-500 hover:bg-green-600 transition"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>

    );
};

export default LoginPage;
