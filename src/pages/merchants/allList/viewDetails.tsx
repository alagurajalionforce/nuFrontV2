import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import apiRequest from '../../../utils/helpers/apiRequest'; // Assuming the path to your apiRequest utility
import toast from 'react-hot-toast';
import Navbar from '../../../layout/Navbar';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaTwitter, FaLinkedin, FaSnapchatGhost, FaTiktok, FaGlobe, FaLinkedinIn, FaFilePdf, FaRegArrowAltCircleLeft } from 'react-icons/fa';
import ImageFetcher from '../../../components/ImageFetcher';
import { BsQrCode } from "react-icons/bs";
import { RiVerifiedBadgeFill } from "react-icons/ri";

// --- INTERFACES FOR MERCHANT DATA ---

interface UserInformation {
  id: string;
  userName: string;
  phoneNumber: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  businessName: string;
  tin: string;
  category: string[];
  location: string | null;
  merchantDetailsId: string;
  startDate: string | null;
  endDate: string | null;
  image: string | null;
  imageUrl: string | null;
  businessimage: string | null;
  businessimageUrl: string | null;
  website: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  snapchat: string;
  tiktok: string;
  deviceId: string | null;
  idCardNo: string;
  nationalIdCardNo: string;
  businessReqNo: string;
  cacDocumentPath: string;
  reqCertificatePath: string | null;
  tinNo: string;
  tinPath: string;
  menuPath: string;
  notification: boolean;
}

interface MerchantLocation {
  id: string;
  merchantId: string;
  storeNo: string;
  street: string;
  city: string;
  country: string;
  latitude: string | null;
  longitude: string | null;
  createdDt: string;
  updatedDt: string;
}

interface BankInformation {
  id: string;
  merchantId: string;
  bankname: string;
  accountNo: string;
  createdDt: string;
  updatedDt: string;
}

interface MerchantDetails {
  merchantId: string;
  image: string | null;
  merchantName: string;
  businessImagePath: string | null;
  businessPhoneNo: string;
  businessEmail: string;
  idCardNo: string;
  nationalIdCardNo: string;
  registeredBusiness: boolean;
  businessReqNo: string;
  spendMinimumAmount: string;
  cacDocumentPath: string;
  reqCertificatePath: string;
  tinNo: string;
  tinPath: string;
  menuPath: string;
  userInformation: UserInformation;
  menu: string | null;
  menuInJpg: string | null;
  averageRating: number;
  numberOfReviews: number;
  reviews: string | null; // Assuming 'reviews' can be null or a more specific type if known
  description: string;
  locations: MerchantLocation[]; // Renamed to avoid conflict with customer location type if used together
  bankInformation: BankInformation[];
  deals: string | null; // Assuming 'deals' can be null or a more specific type if known
  percentage: number;
  rewardPoints: number;
  availablePoints: number;
  qrCode: any,
  status: any,
  wallet: any
}

// --- REACT COMPONENT ---

const ViewMerchantDetails: React.FC = () => {

  const navigate = useNavigate();

  const location = useLocation();

  const [merchantData, setMerchantData] = useState<MerchantDetails | null>(null);
  const [loader, setLoader] = useState<boolean>(true);

  const getMerchantData = async (id: string) => {
    try {
      setLoader(true);
      // Construct the API URL using the merchantId from URL params
      const req = await apiRequest(`app/web/getMerchantDetail?merchantId=${id}`);

      //console.log(req, 'merchant_result');


      if (req?.error) {
        toast.error(req.error?.error || 'Failed to fetch merchant data');
        setMerchantData(null);
        // setTimeout(() => {
        //   localStorage.clear();
        //   window.location.replace('/login');
        // }, 3000);
        return;
      }

      setMerchantData(req.data);

    } catch (error: any) {
      console.error("Error fetching merchant data:", error);
      toast.error(error.message || 'An unexpected error occurred');
      setMerchantData(null);
    } finally {
      setTimeout(() => { // Optional delay
        setLoader(false);
      }, 500);
    }
  };

  const verifyMerchant = async () => {
    try {
      const req = await apiRequest('updateVerified', null, { status: 'Verified' }, `/${location?.state?.id}`);

      if (req?.error) {
        toast.error(req.error?.error || 'Failed to fetch merchant data');
        return;
      }

      toast.success(req.data.message);
      getMerchantData(location?.state?.id);

    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred');

    }
  }


  useEffect(() => {
    if (location?.state?.id) {
      getMerchantData(location?.state?.id);
      // getMerchantStatus(location?.state?.id);
    } else {
      toast.error("Merchant ID not found in URL.");
      setLoader(false);
    }
  }, [location?.state?.id]); // Re-fetch if merchantId changes

  const handleViewTxn = (ids: any) => {
    //console.log(ids, 'payLoad')
    navigate("/merchant-all-transaction-details", {
      state: { path: '/merchant/lists', id: ids },
    });
  };

  if (loader) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading merchant details...</p> {/* Or a spinner */}
      </div>
    );
  }

  if (!merchantData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-red-600">Failed to load merchant details.</p>
        <Link to={'/merchant/lists'} className="mt-4 text-blue-600 hover:underline">
          Back
        </Link>
      </div>
    );
  }

  // Destructure data for easier access
  const {
    merchantId,
    merchantName,
    businessPhoneNo,
    businessEmail,
    idCardNo,
    nationalIdCardNo,
    registeredBusiness,
    businessReqNo,
    spendMinimumAmount,
    tinNo,
    description,
    locations,
    bankInformation,
    businessImagePath,
    qrCode,
    status,
    wallet,
    userInformation // Contains more details related to the user who is the merchant
  } = merchantData;

  return (
    <div className="p-4 md:p-6 xl:p-6 lg:p-6">
      <Navbar />


      <div className='flex justify-between m-2 p-2'>

        <div className='flex gap-1 '>
          <FaRegArrowAltCircleLeft className='mt-1' /> <Link to={'/merchant/lists'} className="text-gray-800 hover:underline mb-4 inline-block">Back</Link>
        </div>
        <div>
          {status === 'Pending' ? (
            <button onClick={verifyMerchant} className='bg-green-600 p-2 text-white rounded-md'>Verify</button>
          ) : ('')}

        </div>

      </div>

      <div className='gap-6 p-6 bg-white rounded shadow'>
        <div className='flex justify-between'>
          <div>
            {status === 'Verified' && (<div className='flex gap-2' ><RiVerifiedBadgeFill className='h-6 w-6 text-green-600' /> Verified</div>)}
          </div>
          <div>
            <button onClick={() => { handleViewTxn(merchantId) }} className='mb-5 text-blue-500'>View Transaction Details</button>
          </div>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ">

          {/* General Merchant Information */}
          <div className="space-y-4">
            <div className='flex justify-between'>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Merchant Information</h2>
              </div>

            </div>


            <div>
              <label className="block text-gray-500 text-sm">Merchant Business Image</label>
              <p className="text-gray-800 font-medium">
                <ImageFetcher
                  fileName={businessImagePath}
                  altText={`${merchantName || 'Profile'}'s image`}
                  className="w-20 h-20 rounded-full object-cover mr-[10px]"
                  fallbackText={merchantName || 'N/A'}
                />
              </p>
            </div>

            <div>
              <label className="block text-gray-500 text-sm">Merchant Name</label>
              <p className="text-gray-800 font-medium">{merchantName}</p>
            </div>
            <div>
              <label className="block text-gray-500 text-sm">Business Email</label>
              <p className="text-gray-800 font-medium">{businessEmail}</p>
            </div>
            <div>
              <label className="block text-gray-500 text-sm">Business Phone No.</label>
              <p className="text-gray-800 font-medium">{businessPhoneNo ? '+234 ' + businessPhoneNo : ''}</p>
            </div>
            <div>
              <label className="block text-gray-500 text-sm">Description</label>
              <p className="text-gray-800 font-medium">{description}</p>
            </div>
            <div>
              <label className="block text-gray-500 text-sm">Registered Business</label>
              <p className="text-gray-800 font-medium">{registeredBusiness ? 'Yes' : 'No'}</p>
            </div>
            {registeredBusiness && (
              <>
                <div>
                  <label className="block text-gray-500 text-sm">Business Reg. No.</label>
                  <p className="text-gray-800 font-medium">{businessReqNo}</p>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">TIN No.</label>
                  <p className="text-gray-800 font-medium">{tinNo}</p>
                </div>
              </>
            )}
            <div>
              <label className="block text-gray-500 text-sm">National ID Card No.</label>
              <p className="text-gray-800 font-medium">{nationalIdCardNo}</p>
            </div>
            <div>
              <label className="block text-gray-500 text-sm">Spend Minimum Amount</label>
              <p className="text-gray-800 font-medium">{spendMinimumAmount}</p>
            </div>
          </div>

          {/* User Information (nested object) */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">User Information</h2>
            <div>
              <label className="block text-gray-500 text-sm">User Name</label>
              <p className="text-gray-800 font-medium">{userInformation.businessName}</p>
            </div>
            <div>
              <label className="block text-gray-500 text-sm">Phone Number</label>
              <p className="text-gray-800 font-medium">

                {userInformation.phoneNumber ? '+234 ' + userInformation.phoneNumber : ''}
              </p>
            </div>
            <div>
              <label className="block text-gray-500 text-sm">Full Name</label>
              <p className="text-gray-800 font-medium">{userInformation.name}</p>
            </div>
            <div>
              <label className="block text-gray-500 text-sm">Categories</label>
              <p className="text-gray-800 font-medium">
                {userInformation.category && userInformation.category.length > 0
                  ? userInformation.category.join(', ')
                  : 'N/A'}
              </p>
            </div>
            {/* <div>
            <label className="block text-gray-500 text-sm">Website</label>
            <p className="text-gray-800 font-medium">
              {userInformation.website ? <a href={userInformation.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{userInformation.website}</a> : 'N/A'}
            </p>
          </div> */}
            <label className="block text-gray-500 text-sm mb-2">Social Media</label>
            <div className="flex flex-wrap gap-3">
              {userInformation.website && (
                <a href={userInformation.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-blue-100">
                  <FaGlobe className="text-lg" /> Website
                </a>
              )}
              {userInformation.whatsapp && (
                <a href={`https://wa.me/${userInformation.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200">
                  <FaWhatsapp className="text-lg" /> WhatsApp
                </a>
              )}
              {userInformation.facebook && (
                <a href={userInformation.facebook} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                  <FaFacebookF className="text-lg" /> Facebook
                </a>
              )}
              {userInformation.instagram && (
                <a href={userInformation.instagram} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-pink-100 text-pink-800 rounded hover:bg-pink-200">
                  <FaInstagram className="text-lg" /> Instagram
                </a>
              )}
              {userInformation.twitter && (
                <a href={userInformation.twitter} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                  <FaTwitter className="text-lg" /> Twitter
                </a>
              )}
              {userInformation.linkedin && (
                <a href={userInformation.linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-200 text-blue-900 rounded hover:bg-blue-300">
                  <FaLinkedinIn className="text-lg" /> LinkedIn
                </a>
              )}
              {userInformation.snapchat && (
                <a href={userInformation.snapchat} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200">
                  <FaSnapchatGhost className="text-lg" /> Snapchat
                </a>
              )}
              {userInformation.tiktok && (
                <a href={userInformation.tiktok} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded hover:bg-gray-800">
                  <FaTiktok className="text-lg" /> TikTok
                </a>
              )}
            </div>

          </div>



          {/* Locations and Bank Information */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className='flex gap-3'>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Locations</h2>
                </div>
                <div>

                </div>
              </div>

              {locations && locations.length > 0 ? (
                locations.map((loc, index) => (
                  <div
                    key={loc.id || index}
                    className="bg-gray-50 p-4 rounded border border-gray-200"
                  >
                    <p className="text-gray-700 font-medium">
                      Store No: {loc.storeNo}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {loc.street}, {loc.city}, {loc.country}
                    </p>
                    {loc.latitude && loc.longitude && (
                      <p className="text-gray-600 text-xs">
                        Lat: {loc.latitude}, Lon: {loc.longitude}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No merchant locations available.</p>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t"> {/* Separator for visual clarity */}
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Bank Information</h2>
              {bankInformation && bankInformation.length > 0 ? (
                bankInformation.map((bank, index) => (
                  <div
                    key={bank.id || index}
                    className="bg-gray-50 p-4 rounded border border-gray-200"
                  >
                    <p className="text-gray-700 font-medium">
                      Bank: {bank.bankname}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Account No: {bank.accountNo}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No bank information available.</p>
              )}
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Wallet Details</h2>


              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                {wallet ? (
                  <>
                    <p className="text-gray-700 font-medium">Balance:
                      {wallet.amount ? '₦ ' + wallet?.amount.toLocaleString() : ''}</p>
                    <p className="text-gray-600 text-sm">Created: {new Date(wallet.createdDt).toLocaleString()}</p>
                  </>
                ) : (<p className="text-gray-700 font-medium">No details Found</p>)}
              </div>


            </div>

            <div className="space-y-4 pt-4 border-t"> {/* Separator for visual clarity */}
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Status</h2>

              <div
                className="bg-gray-50 p-4 rounded border border-gray-200"
              >
                <p className="text-gray-700 font-medium">
                  {status ? status : 'Not Verified'}
                </p>

              </div>

            </div>

            {qrCode && (
              <div className="space-y-4 pt-4 border-t"> {/* Separator for visual clarity */}
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">QR Code</h2>
                <ImageFetcher
                  fileName={qrCode}
                  altText={`${merchantName || 'Profile'}'s image`}
                  className="w-32 h-auto object-cover mr-[10px]"
                  fallbackText={merchantName || 'N/A'}
                />
              </div>
            )}



          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Certificates</h2>
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col items-center">
                  <label htmlFor="cacDocumentPath" className="block text-gray-500 text-sm mb-2">CAC Document</label> <a href={userInformation?.cacDocumentPath} download> <FaFilePdf className="h-16 w-16 text-red-600" /> </a> </div>
                <div className="flex flex-col items-center">
                  <label htmlFor="tinPath" className="block text-gray-500 text-sm mb-2">Tin Document</label>
                  <a href={userInformation?.tinPath} download> <FaFilePdf className="h-16 w-16 text-red-600" /> </a>
                </div>
                <div className="flex flex-col items-center">
                  <label htmlFor="menuPath" className="block text-gray-500 text-sm mb-2">Menu Document</label>
                  <a href={userInformation?.menuPath} download> <FaFilePdf className="h-16 w-16 text-red-600" /> </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMerchantDetails;