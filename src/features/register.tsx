import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Logo from '../assets/images/logo.svg'
import { Link } from 'react-router-dom';

const RegisterPage = () => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[rgb(240 240 240)]">
            <div className="w-[450px] p-6 bg-white rounded-lg shadow-md">
                <h1 className="place-items-center mb-4">
                    <img className='place-items-center' src={Logo} alt='Logo' />
                </h1>

                <h2 className="text-xl font-semibold text-gray-700 mb-2 text-left mt-8">Sign Up</h2>
                <p className="text-sm text-[#18181866] mb-4">Create your account to get started</p>

                <form>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#18181866] mb-1">Full Name</label>
                        <input
                            type="text"
                            placeholder=""
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:none focus:none"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#18181866] mb-1">Mobile Number</label>
                        <input
                            type="text"
                            placeholder=""
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:none focus:none"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#18181866] mb-1">Email</label>
                        <input
                            type="email"
                            placeholder=""
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:none focus:none"
                        />
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <label className="flex items-center text-[12px]">
                            <input type="checkbox" className="mr-2" />
                            <span className='text-[#18181866] '>Remember me</span>
                        </label>
                        <Link to={'/forgot-password'} className="text-sm text-green-600 hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 text-white rounded-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 transition"
                    >
                        Next
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account??{' '}
                    <Link to={'/'} className="text-black text-[#18181866] font-medium hover:underline">
                        Signin
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
