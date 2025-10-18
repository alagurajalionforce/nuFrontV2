import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from "react-icons/fa";
import toast from 'react-hot-toast';
import { getRoutes, routes, Role, RouteConfig } from '../routes/routeConfig';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/userSlice';
// import DefaultProfileImage from '../assets/providerAvatarNew';
import { DateState } from '../store/userSlice';
import Loader from '../utils/loader';
import Logo from '../assets/images/logo.svg'
import { hasAccess } from '../utils/commonFunctions';

interface SidebarProps {
    role: Role;
    isOpen: boolean;
    allowedModules: any;
    onClose: () => void;
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

const Sidebar: React.FC<SidebarProps> = ({ role, allowedModules, isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // const [roleNew, setRole] = useState<any>('ROLE_ADMIN');

    const logo = useSelector((state: { user: DateState }) => state.user.logo);
    const loggedRoles = useSelector((state: { user: DateState }) => state.user.roles);
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

    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    const getNavItemClasses = (isActive: boolean) =>
        `flex items-center p-2 ${isActive
            ? 'rounded-md shadow-lg bg-green-600  text-white text-[14px] font-semibold'
            : 'hover:bg-green-600 rounded-md hover:shadow-lg hover:text-white text-[14px] font-semibold'
        }`;

    // Function to get CSS classes for icon
    const getIconClasses = (isActive: boolean) =>
        `mr-3 ml-3 w-[23px] h-[23px] ${isActive ? 'text-white' : 'hover:text-white'}`;

    const logout = () => {
        localStorage.clear();
        toast.success('Successfully Sign Out');
        setLoader(true);

        const urls = loggedRoles[0] === 'customer' ? '/customers/login' : '/login';

        setTimeout(() => {
            setLoader(false);
            navigate(urls)
        }, 1000);

        setTimeout(() => {
            dispatch(
                logoutUser()
            );

        }, 3000);
    };

    const rolesAre = JSON.parse(localStorage.getItem('userRole') || '[]');

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

    const childRoutes = routes.filter(route => route.label && route.parent);

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <>
            {loader && <Loader showHide={loader} />}

            <div className={`fixed top-0 w-64 left-0 h-full text-[#000] z-[9999] transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 bg-white shadow-[4px_0_10px_rgba(0,0,0,0.1)]`} ref={dropdownRef}>

                {/* <div className="hidden md:flex flex-col w-64 h-full  text-black fixed top-0 left-0 min-h-screen z-[9999] justify-between overflow-auto bg-white scrollbar-hide hover:scrollbar-default"> */}
                <div className="flex flex-col h-full justify-between overflow-auto">
                    <div className="flex flex-col flex-grow">
                        <div className="items-center mb-8">
                            <div className="flex bg-white justify-center">
                                <div className="w-32 h-32  flex justify-center items-center">
                                    <img
                                        src={Logo}
                                        alt="Profile"
                                        className="rounded-full object-cover"
                                    />
                                    {/* {logo ? (
                                        <img src={logo} alt="Profile" className="w-28 h-28 rounded-full object-cover" />
                                    ) :
                                        (
                                         <img src={DefaultProfileImage} alt="Profile" className="w-28 h-28 rounded-full object-cover" />
                                        ) 
                                    
                                    } */}
                                </div>
                            </div>
                            <div className='flex justify-center'>
                                <h1>{roleSideBar?.firstName} {roleSideBar?.lastName}</h1>
                            </div>
                        </div>
                        <nav className='pl-4 pr-0'>
                            <ul>
                                {/* {routes.filter(route => route.roles.includes(role) && route.linkType === 'menu').map((parentRoute) => {
                                    const isActiveParent =
                                        location.pathname === parentRoute.path ||
                                        childRoutes.some(
                                            child =>
                                                child.parent === parentRoute.label &&
                                                location.pathname === child.path
                                        );

                                    return (
                                        <li key={parentRoute.path} className="mb-4">
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
                        <div className="pl-4 mb-4">
                            <Link to={''} onClick={() => logout()} className='flex items-center p-2 font-semibold hover:bg-green-600 rounded-md  hover:text-white text-[14px] mr-4'>
                                <FaSignOutAlt className='mr-3 ml-3 w-[23px] h-[23px]' />
                                Logout
                            </Link>

                        </div>
                    </div>

                </div>
                {/* Close button for mobile view */}
                <button className="md:hidden absolute top-4 right-4 text-[#000]" onClick={onClose}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </>
    );
};

export default Sidebar;
