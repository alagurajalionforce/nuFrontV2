import React, { useEffect, useState } from "react";
import Navbar from "../../../layout/Navbar";
import Table from '../../../components/chatTable';
import Pagination from "../../../components/Pagination";
import apiRequest from "../../../utils/helpers/apiRequest";
import toast from "react-hot-toast";
import Loader from "../../../utils/loader";
import CustomSelect from "../../../components/filterSelect";
import { Link, useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import CustomDatePicker from "../../../components/chatDatePicker";
import { hasAccess, newFormatDate } from "../../../utils/commonFunctions";


interface FormData {
    merchantName: string;
    fromDate: any;
    toDate: string;

}

const AllMerchantList: React.FC = () => {

    const canAdd = hasAccess("Chat Configuration", "privilegeCreate");
    const canEdit = hasAccess("Chat Configuration", "privilegeUpdate");
    const canDelete = hasAccess("Chat Configuration", "privilegeDelete");

    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(0);

    const [chatData, setChatData] = useState<any[]>([]);


    const [loader, setLoader] = useState(false);
    const [customerNames, setCustomerNames] = useState<{ value: number; label: string }[]>([]);
    const [filterUserValue, setFilterUserValue] = useState<any>('');

    const [selectedDate, setSelectedDate] = useState<any>("");
    const [selectedToDate, setSelectedToDate] = useState<any>("");

    const [formData, setFormData] = useState<FormData>({
        merchantName: "",
        fromDate: "",
        toDate: "",
    });

    const columnHeader = [
        { key: "merchantId", headerName: "Merchant ID" },
        { key: "merchantName", headerName: "Merchant Name" },
        { key: "noOfDays", headerName: " Remaining Days" },
        { key: "fromDate", headerName: "Start Date" },
        { key: "toDate", headerName: "End Date" },
    ];
    const [pageSize, setPageSize] = useState<number>(10);

    const selectPages = (e: any) => {
        const { name, value } = e.target;

        setPageSize(value);
        setCurrentPage(0);
    };


    const getData = async () => {

        try {
            setLoader(true);
            const req = await apiRequest(`app/chatConfigList`);

            ////console.log(req, 'result')


            if (req?.error) {
                toast.error(req?.error);
                return;
            }

            setChatData(req?.data);

            setTimeout(() => {
                setLoader(false);
            }, 3000);

        } catch (error: any) {
            toast.error(error)
        }

    }


    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleView = async (row: any) => {
        //console.log("View row:", row);

        navigate("/chat/add", {
            state: { id: row?.userId },
        });
    };

    const handleViewTxn = async (row: any) => {
        //console.log("View row:", row);

        navigate("/merchant-all-transaction-details", {
            state: { id: row?.accountId },
        });
    };

    const handleFilterUserChange = async (selected: any) => {

        setFilterUserValue(selected)

    }

    const changeStartDate = async (e: any) => {
        const formattedDate = newFormatDate(e);
        const changedDate = String(formattedDate).split("T");
        //console.log(changedDate[0]);
        setSelectedDate(changedDate[0]);

        setFormData({ ...formData, fromDate: changedDate[0] });
    };

    const changeToDate = async (e: any) => {
        const formattedDate = newFormatDate(e);
        const changedDate = String(formattedDate).split("T");
        //console.log(changedDate[0]);
        setSelectedToDate(changedDate[0]);

        setFormData({ ...formData, toDate: changedDate[0] });
    };

    const clearFromDate = () => {
        setSelectedDate('');
    };
    const clearToDate = () => {
        setSelectedToDate('');
    };

    useEffect(() => {
        getData();
    }, [])

    return (
        <div className="rounded-lg p-4 md:p-6 xl:p-6 lg:p-6">
            {loader && <Loader showHide={loader} />}

            <Navbar />
            <div className="flex justify-end mb-5 gap-2">
                {canAdd && (
                    <Link to={'/chat/add'} className="py-2 px-4 bg-green-600 text-white rounded-md">Add Configuration</Link>
                )}


                <div className="col-span-12 md:col-span-2 flex items-end">
                    <select
                        className="py-2 px-4 w-md border rounded-md focus:outline-none focus:none focus:none"
                        value={pageSize}
                        onChange={selectPages}
                    >
                        <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            {/* <div className="grid grid-cols-12 sm:grid-cols-12 lg:grid-cols-12  md:grid-cols-12   gap-4 justify-between mb-6">


                <div className="col-span-12 sm:col-span-12 md:col-span-3 lg:col-span-3 xl:col-span-3 mb-1">
                    <div className='flex gap-1 justify-between'>
                        <CustomSelect
                            options={customerNames}
                            value={filterUserValue}
                            onChange={handleFilterUserChange}
                            placeholder="Merchant Name"
                            isClearable

                        />

                    </div>

                </div>

                <div className="col-span-12 sm:col-span-12 md:col-span-2 lg:col-span-2 xl:col-span-2 mb-1">
                    <div className='flex gap-1 w-full justify-between'>
                        <div className='relative w-full'>

                            <CustomDatePicker
                                selectedDate={selectedDate}
                                onChange={changeStartDate}
                                error={''}
                                // className={`border w-full border-gray-300 text-gray-600 text-sm py-3 px-3 rounded-full focus:outline-none  ${formErrors.dob ? "border-red-500" : "border-gray-300"} `}

                                className='border w-full border-gray-300 text-gray-600 text-sm py-3 px-3 rounded focus:outline-none'
                                showIcon={true}
                            />
                            {selectedDate && (
                                <button
                                    onClick={clearFromDate}
                                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
                                >
                                    <FaTimes className='w-4 h-4' />
                                </button>
                            )}

                        </div>

                    </div>

                </div>

                <div className="col-span-12 sm:col-span-12 md:col-span-2 lg:col-span-2 xl:col-span-2 mb-1">
                    <div className='flex gap-1 justify-between'>
                        <div className='relative w-full'>

                            <CustomDatePicker
                                selectedDate={selectedToDate}
                                onChange={changeToDate}
                                //minDate={selectedDate}
                                error={''}
                                // className={`border w-full border-gray-300 text-gray-600 text-sm py-3 px-3 rounded-full focus:outline-none  ${formErrors.dob ? "border-red-500" : "border-gray-300"} `}

                                className='border w-full border-gray-300 text-gray-600 text-sm py-3 px-3 rounded focus:outline-none'
                                showIcon={true}
                            />
                            {selectedToDate && (
                                <button
                                    onClick={clearToDate}
                                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
                                >
                                    <FaTimes className='w-4 h-4' />
                                </button>
                            )}

                        </div>

                    </div>

                </div>

                <div className="col-span-12 sm:col-span-12 md:col-span-2 lg:col-span-2 xl:col-span-2  mb-1">
                    <div className=''>
                        <input type="text" placeholder="No. Of Days" readOnly className="w-full border border-gray-300 text-sm py-3 px-3 rounded bg-gray-100" />

                    </div>

                </div>

                <div className="col-span-12 sm:col-span-12 md:col-span-1 lg:col-span-1 xl:col-span-1  mb-1">
                    <div className='flex gap-1 justify-between'>
                        <button type="button" className="py-2 px-4 bg-green-600 text-white rounded-md">
                            Filter
                        </button>

                    </div>

                </div>

            </div> */}

            {!loader && (<>
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
                    <Table columns={columnHeader} data={chatData} viewDetails={undefined} onDelete={undefined} viewTxn={undefined} viewImage={undefined}
                        onEdit={canEdit ? handleView : undefined} />
                </div>

                <div className="flex items-center justify-self-center border-t border-gray-200 px-4 py-3 sm:px-6">
                    <div className='justify-self-center'>
                        {/* <Pagination currentPage={currentPage} totalPages={empList?.rowData?.length || 0} handlePageChange={handlePageChange} /> */}
                    </div>
                </div>
            </>)}
        </div>
    )
}

export default AllMerchantList;