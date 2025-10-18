import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from "react-icons/fa";
import toast from 'react-hot-toast';
import Loader from '../utils/loader';
import { getRoutes, routes, Role, RouteConfig } from '../routes/routeConfig';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/userSlice';
import { DateState } from '../store/userSlice';
import Logo from '../assets/images/logo.svg';
import apiRequest from '../utils/helpers/apiRequest';
import useLogout from "../components/useLogout";
import { hasAccess } from '../utils/commonFunctions';


interface SidebarProps {
    role: Role;
    allowedModules: string[];
}

interface UserDetails {
    username?: string;
    token?: string;
    userId?: string;
    roles?: string;
    firstName: string;
    lastName: string;
}

interface PersonalDetails {
    airports?: string[];
    logo?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role, allowedModules }) => {

    const logo = useSelector((state: { user: DateState }) => state.user.logo);
    const loggedRoles = useSelector((state: { user: DateState }) => state.user.roles);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loader, setLoader] = useState(false);
    const [roleSideBar, setRoleSideBar] = useState<UserDetails>({
        username: '',
        token: '',
        userId: '',
        roles: '',
        firstName: '',
        lastName: ''
    });
    const [userPdetails, setUserPdetails] = useState<PersonalDetails | null>(null);
    const [routes, setRoutes] = useState<RouteConfig[]>([]);

    const location = useLocation();
    const { logout, loading } = useLogout();

    const rolesAre = JSON.parse(localStorage.getItem('userRole') || '[]');

    // Function to get CSS classes for nav item
    const getNavItemClasses = (isActive: boolean) =>
        `flex items-center p-2 ${isActive
            ? 'rounded-md shadow-lg bg-green-600  text-white text-[14px] font-semibold'
            : 'hover:bg-green-600 rounded-md hover:shadow-lg hover:text-white text-[14px] font-semibold'
        }`;

    // Function to get CSS classes for icon
    const getIconClasses = (isActive: boolean) =>
        `mr-3 ml-3 w-[23px] h-[23px] ${isActive ? 'text-white' : 'hover:text-white'}`;

    const filteredRoutesNew = routes.filter((route: any) => {
        // console.log(route.label, 'filteredRoutes')
        if (route.linkType !== 'menu') {
            return false;
        }

        if (rolesAre.includes('SUPER_ADMIN')) {
            return true;
        }

        // if (rolesAre.includes('ROLE_ADMIN')) {
        //     return true;
        // }

        // return hasAccess(route.label, route.label, 'privilegeView');
        return (
            allowedModules.includes(route.label) &&
            hasAccess(route.label, 'privilegeView')
        );
    });

    // const finalRoutes = filteredRoutesNew.filter(route => !route.roles?.includes('customer'));

    useEffect(() => {
        const loadRoutes = async () => {
            const fetchedRoutes = await getRoutes();
            setRoutes(fetchedRoutes);
        };

        loadRoutes();
    }, []);

    useEffect(() => {
        const loginDetails = localStorage.getItem('loginDetails');
        const userPersonalDetails = localStorage.getItem('userPersonalDetails');

        if (loginDetails) {
            try {
                const userDetails: UserDetails = JSON.parse(loginDetails);
                setRoleSideBar(userDetails);

                if (userPersonalDetails) {
                    const personalDetails: PersonalDetails = JSON.parse(userPersonalDetails);
                    setUserPdetails(personalDetails);
                } else {
                    console.log('No personal details found in localStorage.');
                }
            } catch (error) {
                console.error('Error parsing user details from localStorage:', error);
            }
        }
    }, []);

    // All child routes with parent
    const childRoutes = routes.filter(route => route.label && route.parent);

    return (
        <>
            {loader && <Loader showHide={loader} />}

            {loading && <Loader showHide={loading} />}

            <div className="hidden md:flex flex-col w-64 h-full  text-black fixed top-0 left-0 min-h-screen z-[9999] justify-between overflow-auto bg-white scrollbar-hide hover:scrollbar-default shadow-[4px_0_10px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col flex-grow">
                    <div className="items-center mb-3">
                        <div className="flex bg-white justify-center">
                            <div className="w-32 h-24 flex justify-center items-center">
                                <img src={Logo} alt="Logo" className="rounded-md object-cover" />
                            </div>
                        </div>
                        <div className='flex justify-center mt-2 text-yellow-500 font-bold text-lg'>
                            <h1>{roleSideBar?.firstName} {roleSideBar?.lastName}</h1>
                        </div>
                    </div>

                    <nav className='pl-4 pr-0'>
                        <ul>
                            {/* {routes
                                .filter(route => route.roles.includes(role) && route.linkType === 'menu')
                                .map((parentRoute) => {
                                    const isActiveParent =
                                        location.pathname === parentRoute.path ||
                                        childRoutes.some(
                                            child =>
                                                child.parent === parentRoute.label &&
                                                location.pathname === child.path
                                        );

                                    return (
                                        <li key={parentRoute.path} className="mb-2">
                                            <Link to={parentRoute.path} className={getNavItemClasses(isActiveParent)}>
                                                <parentRoute.icon className={getIconClasses(isActiveParent)} />
                                                {parentRoute.label}
                                            </Link>
                                        </li>
                                    );
                                })} */}

                            {filteredRoutesNew.map((parentRoute: any) => {
                                const isActiveParent =
                                    location.pathname === parentRoute.path ||
                                    childRoutes.some(
                                        child =>
                                            child.parent === parentRoute.label &&
                                            location.pathname === child.path
                                    );

                                return (
                                    <li key={parentRoute.path} className="mb-2 mr-4">
                                        <Link to={parentRoute.path} className={getNavItemClasses(isActiveParent)}>
                                            <parentRoute.icon className={getIconClasses(isActiveParent)} />
                                            {parentRoute.label}
                                        </Link>
                                    </li>
                                );
                            })}

                        </ul>
                    </nav>
                </div>

                <div className="pl-4 ">
                    <Link
                        to=""
                        onClick={logout}
                        // className="flex items-center p-2 hover:bg-[#F3F4FE] rounded-md shadow-lg rounded-r-none hover:text-[#01054C] text-[14px] font-semibold mb-4"

                        className='flex items-center p-2 font-semibold hover:bg-green-600 rounded-md  hover:text-white text-[14px] mr-4 mb-4'
                    >
                        <FaSignOutAlt className="mr-3 ml-3 w-[23px] h-[23px]" />
                        Logout
                    </Link>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
