import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import apiRequest from '../../../utils/helpers/apiRequest';
import toast from 'react-hot-toast';
import Navbar from '../../../layout/Navbar';
import { BsQrCode } from "react-icons/bs";
import ImageFetcher from '../../../components/ImageFetcher';
import { FaRegArrowAltCircleLeft } from "react-icons/fa";

// Define interfaces for the data structure
interface Location {
    id: string;
    customerId: string;
    homeNumber: string;
    street: string;
    city: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
    createdDt: string;
    updatedDt: string;
}

interface CustomerDetails {
    id: string;
    customerId: string;
    name: string;
    email: string;
    termAndCondition: boolean;
    userId: string;
    createdDt: string | null;
    updatedDt: string;
    userImagePath: string | null;
    notification: boolean;
    locations: Location[];
    wallet?: Wallet;
    qrCode?: any;
    phoneNumber: any;
}
interface Wallet {
    userId: string;
    amount: number;
    createdDt: string;
}

const ViewDetails: React.FC = () => {

    const loation = useLocation();
    const navigate = useNavigate();

    //console.log(loation)

    const [customerData, setCustomerData] = useState<CustomerDetails | null>(null);
    const [loader, setLoader] = useState<boolean>(true); // Start loading when component mounts

    const getCustomerData = async (id: string) => {

        //console.log(id)
        try {
            setLoader(true);
            // Use the customerId from useParams or prop
            const req = await apiRequest(`app/customerDetails?customerId=${id}`);

            console.log(req, 'result');


            // Assuming req has an 'error' property on failure, and 'data' on success
            if (req?.error) {
                toast.error(req.error || 'Failed to fetch customer data');
                setCustomerData(null); // Clear data on error
                return;
            }

            setCustomerData(req.data);

        } catch (error: any) {
            console.error("Error fetching customer data:", error);
            toast.error(error.message || 'An unexpected error occurred');
            setCustomerData(null); // Clear data on error
        } finally {
            // Ensure loader is set to false regardless of success or failure
            // If you need a fixed 3-second delay, integrate it here.
            // For general fetching, it's better to hide loader immediately after data is received or error occurs.
            setTimeout(() => {
                setLoader(false);
            }, 500); // Small delay for UX, or remove if not desired
        }
    };

    const handleViewTxn = (ids: any) => {
        //console.log(ids, 'payLoad')
        navigate("/customer-all-transaction-details", {
            state: { path: '/customers/list', id: ids, },
        });
    };

    useEffect(() => {
        if (loation?.state?.id) {
            getCustomerData(loation?.state?.id);
        } else {
            // Handle case where customerId is not present in URL
            toast.error("Customer ID not found in URL.");
            setLoader(false);
        }
    }, [loation?.state?.id]); // Re-fetch if customerId changes

    if (loader) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Loading customer details...</p>
            </div>
        );
    }

    if (!customerData) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <p className="text-red-600">Failed to load customer details.</p>
                <Link to={'/customers/list'} className="mt-4 text-blue-600 hover:underline">
                    Back
                </Link>
            </div>
        );
    }

    // Destructure data for easier access
    const { id, name, email, notification, termAndCondition, locations, wallet, qrCode, userImagePath, phoneNumber } = customerData;

    return (
        <div className="p-4 md:p-6 xl:p-6 lg:p-6"> {/* Added padding to the main container */}
            <Navbar />
            <div className='flex gap-1 '>
                <FaRegArrowAltCircleLeft className='mt-1' /> <Link to={'/customers/list'} className="text-gray-800 hover:underline mb-4 inline-block">Back</Link>
            </div>


            <div className='gap-6 p-6 bg-white rounded shadow'>
                <div className='flex justify-end'>

                    <div>
                        <button onClick={() => { handleViewTxn(id) }} className='mb-5 text-blue-500'>View Transaction Details </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded shadow">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-500 text-sm">Profile Image</label>
                            <p className="text-gray-800 font-medium">
                                <ImageFetcher
                                    fileName={userImagePath}
                                    altText={`${name || 'Profile'}'s image`}
                                    className="w-20 h-20 rounded-full object-cover mr-[10px]"
                                    fallbackText={name || 'N/A'}
                                />

                            </p>
                        </div>
                        <div>
                            <label className="block text-gray-500 text-sm">Name</label>
                            <p className="text-gray-800 font-medium">{name}</p>
                        </div>

                        <div>
                            <label className="block text-gray-500 text-sm">Email</label>
                            <p className="text-gray-800 font-medium">{email}</p>
                        </div>

                        <div>
                            <label className="block text-gray-500 text-sm">Phone No.</label>
                            <p className="text-gray-800 font-medium">{phoneNumber ? '+234 ' + phoneNumber : ''}</p>
                        </div>

                        <div>
                            <label className="block text-gray-500 text-sm">Notifications Enabled</label>
                            <p className="text-gray-800 font-medium">{notification ? 'Yes' : 'No'}</p>
                        </div>

                        <div>
                            <label className="block text-gray-500 text-sm">Agreed to Terms</label>
                            <p className="text-gray-800 font-medium">{termAndCondition ? 'Yes' : 'No'}</p>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-700">Location Details</h2> {/* Changed heading slightly */}
                        {locations && locations.length > 0 ? (
                            locations.map((loc, index) => (
                                <div
                                    key={loc.id || index} // Use loc.id if available, fallback to index
                                    className="bg-gray-50 p-4 rounded border border-gray-200"
                                >
                                    <p className="text-gray-700 font-medium">
                                        {loc.homeNumber}, {loc.street}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        {loc.city}, {loc.country}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600">No location details available.</p>
                        )}

                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-700">Wallet Details</h2>

                            {wallet && (
                                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                    <p className="text-gray-700 font-medium">Balance:
                                        {/* {wallet.amount.toLocaleString()} */}
                                        {wallet.amount ? '₦ ' + wallet?.amount.toLocaleString() : ''}

                                    </p>
                                    <p className="text-gray-600 text-sm">Created: {new Date(wallet.createdDt).toLocaleString()}</p>
                                </div>
                            )}

                        </div>



                        <div className="space-y-4 pt-4 border-t"> {/* Separator for visual clarity */}
                            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">QR Code</h2>
                            {qrCode && (
                                <ImageFetcher
                                    fileName={qrCode}
                                    altText={`${name || 'Profile'}'s image`}
                                    className="w-32 h-auto object-cover mr-[10px]"
                                    fallbackText={name || 'N/A'}
                                />
                            )}
                        </div>

                    </div>



                </div>
            </div>
        </div>
    );
};

export default ViewDetails;