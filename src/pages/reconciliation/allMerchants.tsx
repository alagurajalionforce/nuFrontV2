import React, { useEffect, useState } from "react";
import Navbar from "../../layout/Navbar";
import Table from '../../components/responsTable';
import Pagination from "../../components/Pagination";
import apiRequest from "../../utils/helpers/apiRequest";
import toast from "react-hot-toast";
import Loader from "../../utils/loader";
import CustomSelect from "../../components/filterSelect";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import { newFormatDate } from "../../utils/commonFunctions";
import CustomDatePicker from "../../components/datePickernew";
import { useNavigate } from "react-router-dom";

interface FormData {
    customerName: string;
    fromDate: any;
    toDate: string;

}

const AllTxnList = () => {

    const navigate = useNavigate()

    const [currentPage, setCurrentPage] = useState(0);

    const [merData, setMerData] = useState<any[]>([]);

    const [loader, setLoader] = useState(false);
    const [customerNames, setCustomerNames] = useState<{ value: number; label: string }[]>([]);
    const [filterUserValue, setFilterUserValue] = useState<any>('');

    const [selectedDate, setSelectedDate] = useState<any>("");
    const [selectedToDate, setSelectedToDate] = useState<any>("");

    const [formData, setFormData] = useState<FormData>({
        customerName: "",
        fromDate: "",
        toDate: "",
    });

    const columnHeader = [
        { key: "transactionId", headerName: "Txn ID" },
        { key: "merchantName", headerName: "Merchant Name" },
        { key: "customername", headerName: "Customer Name" },
        { key: "type", headerName: "Description" },

        // { key: "trnInAmount", headerName: "IN (CREDIT)" },
        // { key: "trnOutAmount", headerName: "Out (Debit)" },       
        // { key: "balanceAmount", headerName: "Balance" },
        // { key: "status", headerName: "Status" },
    ];

    const getMerData = async () => {

        try {
            setLoader(true);
            const req = await apiRequest(`app/web/merchant/allTransactionList`);

            //console.log(req, 'result')

            if (req?.error) {
                toast.error(req?.error);
                return;
            }

            setMerData(req?.data);

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

        // navigate("/view-customer", {
        //     state: { id: row?.accountId, path: "/clients" },
        // });
    };

    const handleViewTxn = async (row: any) => {
        //console.log("View row:", row);

        navigate("/reconciliation-details", {
            state: { id: row?.transactionId },
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
        getMerData();
    }, [])
    return (
        <div className='rounded-lg'>
            <Navbar />

            <div className="grid grid-cols-12 sm:grid-cols-12 lg:grid-cols-12  md:grid-cols-12   gap-4 justify-between mb-6">


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

                <div className="col-span-12 sm:col-span-12 md:col-span-2 lg:col-span-2 xl:col-span-2 mb-1">
                    <div className='flex gap-1 justify-between'>
                        <button type="button" className="py-2 px-4 bg-green-600 text-white rounded-md">
                            Filter
                        </button>

                    </div>

                </div>

            </div>

            {loader && <Loader showHide={loader} />}
            {!loader && (<>
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
                    <Table columns={columnHeader} data={merData} viewDetails={undefined} onDelete={undefined} viewTxn={handleViewTxn} />
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

export default AllTxnList
