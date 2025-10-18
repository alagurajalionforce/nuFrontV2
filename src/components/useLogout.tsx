// hooks/useLogout.ts
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiRequest from "../utils/helpers/apiRequest";
import { logoutUser } from "../store/userSlice";

const useLogout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const logout = async () => {
        try {
            setLoading(true);

            const req = await apiRequest(`app/logout`);

            if (req?.error) {
                toast.error(req?.error);
            } else {
                setTimeout(() => {
                    dispatch(logoutUser());
                }, 3000);

                const rememberedUsername = localStorage.getItem('rememberMeUserName');

                localStorage.clear();

                if (rememberedUsername) {
                    localStorage.setItem('rememberMeUserName', rememberedUsername);
                }

                setTimeout(() => {
                    toast.success(req?.data?.message || "Logged out successfully");
                    setLoading(false);
                    navigate("/login");
                }, 1000);
            }
        } catch (error) {
            console.error("Logout failed", error);
            toast.error("Something went wrong during logout");
            setLoading(false);
        }
    };

    return { logout, loading };
};

export default useLogout;
