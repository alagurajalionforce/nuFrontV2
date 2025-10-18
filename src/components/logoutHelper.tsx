// utils/logoutHelper.ts
import { store } from "../store/index";
import { logoutUser } from "../store/userSlice";
import { toast } from "react-hot-toast";

export const handleLogoutCleanup = (message?: string) => {
    
    const rememberedUsername = localStorage.getItem('rememberMeUserName');
    localStorage.clear();
    if (rememberedUsername) {
        localStorage.setItem('rememberMeUserName', rememberedUsername);
    }
    store.dispatch(logoutUser());
    if (message) {
        toast.success(message);
    } 
    else {
        toast.error(message || "Session expired. Please login again");
    }
    

    setTimeout(() => {
        window.location.href = "/login"; // or use navigate if in hook
    }, 1000);
};
