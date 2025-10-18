import axios from 'axios';
import { baseUrl } from '../../constants/baseURL';
import urls from '../../constants/requestURL';
import { store } from '../../store';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useLogout from "../../components/useLogout";
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/userSlice';
import { handleLogoutCleanup } from '../../components/logoutHelper';

const apiRequest = async (
  path: string,
  body?: object | null,
  params?: { [key: string]: any } | null,
  extraUrl?: string | null,
  isMultipart: boolean = false,
  responseType?: any,
) => {
  let data;
  let error;
  let status;

  let requestPath = urls[path] ? urls[path].path : path;

  if (extraUrl) {
    requestPath += extraUrl;
  }

  if (params && typeof params === 'object') {
    const urlSearchParams = new URLSearchParams();
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        urlSearchParams.append(key, String(params[key]));
      }
    }
    const queryString = urlSearchParams.toString();
    if (queryString) {
      requestPath += `?${queryString}`;
    }
  }

  const method = urls[path]?.method || 'GET';

  try {
    const res = await axiosInstance.request({
      baseURL: baseUrl,
      url: requestPath,
      method,
      data: body,
      headers: isMultipart
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' },
    });

    console.log(res, 'check error');
    status = res.status;
    data = res.data;

    // This block is now removed. The interceptor handles all 401/500 errors
    // if (data?.status === 401 || data?.error === 'Unauthorized' || status === 401 || status === 500) {
    //   toast.error(`${data?.error} Access. Please Login Again`);
    //   setTimeout(() => {
    //     // localStorage.clear();
    //     // window.location.replace('/login');
    //   }, 3000);
    // }

  } catch (err: any) {
    // Extract from error.response
    // const responseStatus = err?.response?.status;
    // const responseData = err?.response?.data;
    error = err?.response?.data;

    // console.error('API Error:', responseStatus, responseData);

    // // This block is now removed. The interceptor handles all 401 responses
    // if (responseStatus !== 401) {
    //   toast.error(responseData?.error || 'Something went wrong');
    // }
  }

  return { data, error, status };
};

export default apiRequest;