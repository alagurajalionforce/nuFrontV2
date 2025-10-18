import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { differenceInDays, format, parse } from 'date-fns'; // Import 'parse'
import toast from 'react-hot-toast';
import apiRequest from '../../../utils/helpers/apiRequest';
import { FaRegArrowAltCircleLeft, FaTimes } from 'react-icons/fa';
// import CustomDatePicker from "../../../components/chatDatePicker"; // You are using DatePicker directly now, so this might be commented out or removed
import Navbar from '../../../layout/Navbar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CustomSelect from "../../../components/filterSelect";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Loader from '../../../utils/loader';
import { PageSize } from '../../../utils/commonFunctions';
import { useDebounce } from '../../../utils/useDebounce';

interface MerchantPostData {
    merchantId: string;
    merchantName: string;
    userId: string;
    noOfDays: number | '';
    fromDate: Date | null; // Changed to Date | null
    toDate: Date | null;   // Changed to Date | null
}

type OptionType = {
    value: string;
    label: string;
};

const PostMerchantDealForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isEditMode = location?.state?.id; // Determine if it's edit mode

    const [formData, setFormData] = useState<MerchantPostData>({
        merchantId: '',
        merchantName: '',
        userId: '',
        noOfDays: '',
        fromDate: null, // Initialized to null
        toDate: null,   // Initialized to null
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [loader, setLoader] = useState(false);
    const [merData, setMerData] = useState<any[]>([]); // Raw merchant data for lookups

    const debouncedFromDate = useDebounce(formData?.fromDate, 500);
    const debouncedToDate = useDebounce(formData?.toDate, 500);

    const [merchantNames, setMerchantNames] = useState<OptionType[]>([]);
    const [filterUserValue, setFilterUserValue] = useState<any>(null); // Initialize to null for CustomSelect

    // Static options for demonstration (if not fetched from API)
    // const merchantOptions = [
    //     { label: 'Breeztek Ltd (ID: 032782)', value: '032782' },
    //     { label: 'Tech Solutions (ID: 001234)', value: '001234' },
    //     { label: 'Global Retail (ID: 005678)', value: '005678' },
    // ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'noOfDays' ? (value === '' ? '' : Number(value)) : value,
        }));
    };

    const changeStartDate = (date: Date | null) => {
        setFormData(prev => ({ ...prev, fromDate: date }));
    };

    const clearFromDate = () => {
        setFormData(prev => ({ ...prev, fromDate: null })); // Set to null
    };

    const changeToDate = (date: Date | null) => {
        setFormData(prev => ({ ...prev, toDate: date }));
    };

    const clearToDate = () => {
        setFormData(prev => ({ ...prev, toDate: null })); // Set to null
    };

    useEffect(() => {
        const { fromDate, toDate } = formData;
        if (fromDate && toDate) {
            // Ensure toDate is not before fromDate
            if (toDate < fromDate) {
                setFormData(prev => ({ ...prev, noOfDays: 0 }));
                return;
            }
            // differenceInDays calculates full days. Add 1 to include both start and end day.
            const days = differenceInDays(toDate, fromDate) + 1;
            setFormData(prev => ({ ...prev, noOfDays: days }));
        } else {
            setFormData(prev => ({ ...prev, noOfDays: '' }));
        }
    }, [formData.fromDate, formData.toDate, , debouncedFromDate, debouncedToDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        //console.log(formData, 'formData')
        // Basic validation before forming payload
        if (!formData.merchantId || !formData.merchantName || !formData.userId || !formData.fromDate || !formData.toDate || formData.noOfDays === '') {
            toast.error('Please fill in all required fields.');
            return; // Exit early
        }

        setLoading(true);

        const postPayload = {
            merchantId: formData.merchantId,
            merchantName: formData.merchantName,
            userId: formData.userId,
            noOfDays: formData.noOfDays,
            fromDate: format(formData.fromDate, 'dd-MM-yyyy'),
            toDate: format(formData.toDate, 'dd-MM-yyyy'),
        };

        //console.log(postPayload, 'Form submit payload');

        try {

            const response = await apiRequest('saveConfiguration', postPayload);

            //console.log('API Response:', response);

            if (response?.error) {
                toast.error(response.error || 'Failed to Save/Update.');
            } else {
                toast.success(response?.data?.message || `Configuration ${isEditMode ? 'Updated' : 'Saved'} successfully!`);

                if (!isEditMode) {
                    setFormData({
                        merchantId: '',
                        merchantName: '',
                        userId: '',
                        noOfDays: '',
                        fromDate: null,
                        toDate: null,
                    });
                    setFilterUserValue(null);
                }

                setTimeout(() => {
                    navigate('/chat/chat-configuration');
                }, 1500);
            }
        } catch (error: any) {
            console.error('Error posting/updating merchant deal:', error);
            toast.error(error.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const getMerListData = async () => {
        // const queryParams = [
        //     `page=${currentPage}`,
        //     `size=${PageSize}`,
        // ].filter(Boolean).join("&");

        try {
            setLoader(true);
            const req = await apiRequest(`app/web/merchant/allTransactionList`);

            if (req?.error) {
                toast.error(req?.error);
                return;
            }

            if (req?.data?.pageData) {

                const formattedMerchants: OptionType[] = Array.from(
                    new Map<string, OptionType>(
                        req.data.pageData.map((item: any) => [item.merchantName, { value: String(item.merchantId), label: item.merchantName }])
                    ).values()
                );

                setMerchantNames(formattedMerchants);
                setMerData(req?.data?.pageData || []);
            }
        } catch (error: any) {
            toast.error(error?.message || "Something went wrong");
        } finally {
            setLoader(false);
        }
    };

    const handleFilterUserChange = (selected: any) => {
        setFilterUserValue(selected); // Update the state for CustomSelect

        //console.log(selected, merData, 'selected')

        if (selected) {
            const selectedMerchant = merData.find((data: any) => String(data.merchantId) === String(selected.value));
            //console.log(selectedMerchant, 'selected')
            if (selectedMerchant) {
                setFormData(prev => ({
                    ...prev,
                    merchantId: String(selectedMerchant.merchantId),
                    merchantName: selectedMerchant.merchantName,
                    userId: selectedMerchant.customerUserid,
                }));
            }
        } else {
            // If the select is cleared
            setFormData(prev => ({
                ...prev,
                merchantId: '',
                merchantName: '',
                userId: '',
            }));
        }
    };

    // const getMerData = async () => {
    //     try {
    //         const req = await apiRequest(`app/allMerchantList`);
    //         if (req?.error) {
    //             toast.error(req?.error );
    //             return;
    //         }
    //         const formattedMerchants = req?.data?.map((user: any) => ({
    //             value: String(user.id), // Ensure value is string if MerchantID is string
    //             label: `${user.businessName} (ID: ${user.id})` // More descriptive label
    //         })) || []; // Handle case where data might be undefined

    //         setMerData(req?.data || []);
    //         setMerchantNames(formattedMerchants);

    //     } catch (error: any) {
    //         toast.error(error?.message || 'Failed to fetch merchant list.');
    //     }
    // };

    const getIndividualMerData = async (id: string) => {
        try {
            setLoader(true); // Start loading when fetching individual data
            const req = await apiRequest(`app/chatConfig/${id}`); // Assuming this endpoint gives back single config


            if (req?.error) {
                toast.error(req?.error);
                navigate('/chat/chat-configuration'); // Redirect if ID not found or error
                return;
            }

            const data = req?.data;
            if (data) {
                // Parse date strings from API response into Date objects
                const parsedFromDate = data.fromDate ? parse(data.fromDate, 'dd-MM-yyyy', new Date()) : null;
                const parsedToDate = data.toDate ? parse(data.toDate, 'dd-MM-yyyy', new Date()) : null;

                setFormData({
                    merchantId: data.merchantId || '',
                    merchantName: data.merchantName || '',
                    userId: data.userId || '',
                    noOfDays: data.noOfDays || '',
                    fromDate: parsedFromDate,
                    toDate: parsedToDate,
                });

                // Set the value for the CustomSelect component
                setFilterUserValue({
                    value: String(data.merchantId),
                    label: `${data.merchantName} - (${data.merchantId})`
                });
            } else {
                toast.error("No data found for this Merchant ID.");
                navigate('/chat/chat-configuration'); // Redirect if no data
            }
        } catch (error: any) {
            console.error("Error fetching individual merchant data:", error);
            toast.error(error?.message || 'An error occurred while fetching configuration.');
            navigate('/chat/chat-configuration'); // Redirect on error
        } finally {
            setLoader(false); // Stop loading regardless of outcome
        }
    };




    useEffect(() => {
        getMerListData()
    }, [])

    useEffect(() => {
        if (isEditMode) {
            getIndividualMerData(isEditMode);
        } else {
            // If not in edit mode, ensure form is clean for adding new config
            setFormData({
                merchantId: '',
                merchantName: '',
                userId: '',
                noOfDays: '',
                fromDate: null,
                toDate: null,
            });
            setFilterUserValue(null);
        }
    }, [isEditMode, navigate]); // Added navigate to dependency array

    return (
        <div className='p-4'>
            <Navbar />

            <div className='grid'>

            </div>
            <div className='flex gap-1 '>
                <FaRegArrowAltCircleLeft className='mt-1' /> <Link to={'/chat/chat-configuration'} className="text-gray-800 hover:underline mb-4 inline-block">Back</Link>
            </div>


            <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg mt-1">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">{isEditMode ? 'Edit Chat Configuration' : 'Add Chat Configuration'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Merchant ID */}
                    <div>
                        <label htmlFor="merchantIdSelect" className="block text-sm font-medium text-gray-700">
                            Merchant ID <span className="text-red-500">*</span>
                        </label>
                        <CustomSelect
                            id="merchantIdSelect"
                            options={merchantNames}
                            value={filterUserValue}
                            onChange={handleFilterUserChange}
                            placeholder="Select Merchant ID or Name"
                            isClearable
                            isDisabled={isEditMode} // Disable selection in edit mode if ID is unchangeable
                        />
                    </div>

                    <div>
                        <label htmlFor="merchantName" className="block text-sm font-medium text-gray-700">
                            Merchant Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="merchantName"
                            name="merchantName"
                            value={formData.merchantName}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 cursor-not-allowed"
                            placeholder="e.g., Breeztek Ltd"
                            readOnly
                        />
                    </div>

                    <div>
                        <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                            Merchant User ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="userId"
                            name="userId"
                            value={formData.userId}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 cursor-not-allowed"
                            placeholder="e.g., 686cdf8ec6a6329b4ee138ef"
                            readOnly
                        />
                    </div>

                    <div>
                        <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
                            From Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative w-full">
                            <DatePicker
                                placeholderText="From Date"
                                selected={formData.fromDate}
                                onChange={changeStartDate}
                                dateFormat="dd-MM-yyyy"
                                minDate={new Date()}
                                className="w-full border border-gray-300 text-gray-600 text-sm py-3 px-3 rounded focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className='col-span-12 sm:col-span-12 mb-1'>
                        <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1 w-full">
                            To Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative w-full">
                            <DatePicker
                                placeholderText="To Date"
                                selected={formData.toDate}
                                onChange={changeToDate}
                                dateFormat="dd-MM-yyyy"
                                minDate={formData.fromDate || new Date()}
                                className="w-full border border-gray-300 text-gray-600 text-sm py-3 px-3 rounded focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="noOfDays" className="block text-sm font-medium text-gray-700">
                            Number of Days
                        </label>
                        <input
                            type="number"
                            id="noOfDays"
                            name="noOfDays"
                            value={formData.noOfDays}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 cursor-not-allowed"
                            placeholder="Calculated automatically"
                            min="0" // Can be 0 if fromDate > toDate
                            readOnly
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-md flex item-place-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (isEditMode ? 'Update Configuration' : 'Save Configuration')}
                    </button>
                </form>
            </div>

        </div>
    );
};

export default PostMerchantDealForm;