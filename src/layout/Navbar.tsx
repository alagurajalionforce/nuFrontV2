import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from './MobileSidebar';
import Loader from '../utils/loader';
import clsx from 'clsx';
import { mainColor } from '../constants/colors';
import { Role } from '../routes/routeConfig';
import { useWindowSize } from './deviceDetect';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/userSlice';
import { DateState } from '../store/userSlice';
// import DefaultProfileImage from '../assets/providerAvatarNew.png';
import { routes } from '../routes/routeConfig';
import apiRequest from '../utils/helpers/apiRequest';
import useLogout from "../components/useLogout";
import { FaSignOutAlt } from "react-icons/fa";

interface UserDetails {
  username?: string;
  token?: string;
  userId?: string;
  roles?: string[];
  firstName: string;
  lastName: string;
}

interface PersonalDetails {
  airports?: string[];
  logo?: string;
}

const Navbar: React.FC = () => {

  const logo = useSelector((state: { user: DateState }) => state.user.logo);
  const loggedRoles = useSelector((state: { user: DateState }) => state.user.roles);
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [userPdetails, setUserPdetails] = useState<PersonalDetails | null>(null);
  const [userAllDetails, setUserAllDetails] = useState<UserDetails>({
    username: '',
    token: '',
    userId: '',
    roles: [],
    firstName: '',
    lastName: '',
  });
  const [isOpen, setIsOpen] = useState(false);
  const [openSideBar, setOpenSideBar] = useState<boolean>(false);
  const [breadCrumb, setBreadCrumb] = useState(location.pathname);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout, loading } = useLogout();

  const { width } = useWindowSize();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const openSideBarContent = () => {
    setOpenSideBar(!openSideBar);
  };


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
    const loginDetails = localStorage.getItem('loginDetails');
    const userPersonalDetails = localStorage.getItem('userPersonalDetails');

    if (loginDetails) {
      try {
        const userDetails: UserDetails = JSON.parse(loginDetails);
        setUserAllDetails(userDetails);

        if (userPersonalDetails) {
          const personalDetails: PersonalDetails = JSON.parse(userPersonalDetails);
          setUserPdetails(personalDetails);
        } else {
          ////console.log('No personal details found in localStorage.');
        }
      } catch (error) {
        console.error('Error parsing user details from localStorage:', error);
      }
    }

    //console.log(routes, 'routes')
  }, []);

  useEffect(() => {
    setBreadCrumb(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const checkData = routes.filter((data) => data?.path === location.pathname);

  const allowedRoles = ['customer'];

  const isRoleAllowed = userAllDetails.roles
    ? allowedRoles.includes(userAllDetails.roles[0])
    : false;
  const isMobile = width < 768;

  return (
    <>
      {loader && <Loader showHide={loader} />}

      {loading && <Loader showHide={loading} />}

      <nav className='bg-white p-4 mb-5 w-[100%] border-b-2 shadow-lg'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center'>
            <div className='block md:hidden lg:hidden'>
              <button onClick={openSideBarContent}>
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <rect y='4' width='24' height='2' fill='black' />
                  <rect y='11' width='24' height='2' fill='black' />
                  <rect y='18' width='24' height='2' fill='black' />
                </svg>
              </button>
            </div>
            <div className='hidden md:block lg:block xl:block ml-2 w-full flex items-center'>
              <h2 className={clsx(mainColor, 'font-bold text-xl')}>
                {/* {capitalizeFirstLetter(firstSegment)} */}
                {checkData.length > 0 && (<>
                  {checkData[0].label}
                </>)}
              </h2>
            </div>
          </div>
          <div className='flex items-center'>
            <div className='relative flex' ref={dropdownRef}>

              {/* <img src={AlertBell} className='ml-1 mr-1' /> */}
              <div
                // onClick={toggleDropdown}
                className='flex items-center text-[#01054C] focus:outline-none'
              >
                <span className='px-2 py-1 font-bold rounded-md'>
                  {userAllDetails?.username?.split('@')[0].toUpperCase()}
                </span>

                <button
                  onClick={logout}
                  className="w-full flex items-center px-1 py-1 text-sm text-red-600  transition-all duration-200"
                  title='Logout'
                >
                  <FaSignOutAlt className="w-6 h-6 mr-2" />

                </button>
                {/* <img
                    src={userPdetails?.logo}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  /> */}
                {logo ? (
                  <img src={logo} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                ) : (''
                  // <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-semibold">
                  //   {userAllDetails?.username?.charAt(0).toUpperCase()}
                  // </div>
                )
                  // (
                  //   <img src={DefaultProfileImage} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                  // )
                }
                {/* <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg> */}
              </div>

              {/* {isOpen && (
                <div className="absolute right-[-20px] mt-[50px] w-52 bg-white border border-gray-200 shadow-lg py-2 z-40">

                  <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600  transition-all duration-200"
                  >
                    <FaSignOutAlt className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )} */}
            </div>
            {openSideBar && userAllDetails.roles && (
              <Sidebar
                role={userAllDetails.roles[0] as Role}
                isOpen={openSideBar}
                onClose={openSideBarContent}
                allowedModules={allowedModules}
              />
            )}
          </div>
        </div>
      </nav>

    </>
  );
};

export default Navbar;