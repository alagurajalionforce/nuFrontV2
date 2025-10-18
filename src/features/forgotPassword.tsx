import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Logo from '../assets/images/logo.svg'
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[rgb(240 240 240)]">
            <div className="w-[450px] p-6 bg-white rounded-lg shadow-md">
                <h1 className="place-items-center mb-4">
                    <img className='place-items-center' src={Logo} alt='Logo' />
                </h1>

                <h2 className="text-xl font-semibold text-gray-700 mb-2 text-left mt-8">Forgot Password</h2>
                <p className="text-sm text-[#18181866] mb-4">Enter your Email associated with your account</p>

                <form>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#18181866] mb-1">Email</label>
                        <input
                            type="text"
                            placeholder=""
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:none focus:none"
                        />
                    </div>


                    <button
                        type="submit"
                        className="w-full py-2 text-white rounded-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 transition"
                    >
                        Continue
                    </button>

                    <p className="text-center text-sm text-gray-600 mt-6">
                        Already have an account?{' '}
                        <Link to={'/'} className="text-black text-[#18181866] font-medium hover:underline">
                            Signin
                        </Link>
                    </p>
                </form>


            </div>
        </div>
    );
};

export default ForgotPasswordPage;
