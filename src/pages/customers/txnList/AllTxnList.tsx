import React, { useEffect, useState } from "react";
import Navbar from "../../../layout/Navbar";
import Table from '../../../components/responsTable';
import Pagination from "../../../components/Pagination";
import apiRequest from "../../../utils/helpers/apiRequest";
import toast from "react-hot-toast";
import Loader from "../../../utils/loader";
import CustomSelect from "../../../components/filterSelect";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import { newFormatDate, normalFormatDate, PageSize } from "../../../utils/commonFunctions";
import CustomDatePicker from "../../../components/datePickernew";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { useDebounce } from "../../../utils/useDebounce";

interface FormData {
    fromDate: any;
    toDate: string;

}

type OptionType = {
    value: string;
    label: string;
};

const AllTxnList = () => {

    const navigate = useNavigate()

    const [currentPage, setCurrentPage] = useState(0);

    const [customerData, setCustomerData] = useState({
        pageData: [],
        totalPages: 0,
        totalRows: 0,
    });

    const [loader, setLoader] = useState(false);
    const [customerNames, setCustomerNames] = useState<OptionType[]>([]);
    const [merchantNames, setMerchantNames] = useState<OptionType[]>([]);
    const [filterUserValue, setFilterUserValue] = useState<any>(null);
    const [filterMerchantValue, setFilterMerchantValue] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<any>("");
    const [selectedToDate, setSelectedToDate] = useState<any>("");
    const [searchCusTerms, setSearchCusTerms] = useState<any>('');
    const [searchMerTerms, setSearchMerTerms] = useState<any>('');

    const [fromDate, setFromDate] = useState<any>("");
    const [toDate, setToDate] = useState<any>("");

    const debouncedFromDate = useDebounce(fromDate, 500);
    const debouncedToDate = useDebounce(toDate, 500);
    const debouncedSearchCusTerm = useDebounce(searchCusTerms, 600);
    const debouncedSearchMerTerm = useDebounce(searchMerTerms, 600);

    const columnHeader = [
        { key: "transactionId", headerName: "Txn ID" },
        { key: "type", headerName: "Description" },
        { key: "trnInAmount", headerName: "IN (CREDIT)" },
        { key: "trnOutAmount", headerName: "Out (Debit)" },
        { key: "merchantName", headerName: "Merchant Name" },
        { key: "customername", headerName: "Customer Name" },
        { key: "balanceAmount", headerName: "Balance" },
        { key: "createdDt", headerName: "Created" },
        { key: "status", headerName: "Status" },
    ];

    const [pageSize, setPageSize] = useState<number>(10);

    const selectPages = (e: any) => {
        const { name, value } = e.target;

        setPageSize(value);
        setCurrentPage(0);
    };


    const getCustomerData = async () => {

        const queryParams = [
            searchCusTerms ? `customername=${debouncedSearchCusTerm}` : '',
            searchMerTerms ? `merchantName=${debouncedSearchMerTerm}` : '',
            fromDate ? `fromDate=${fromDate}` : '',
            toDate ? `toDate=${toDate}` : '',
            `page=${currentPage}`,
            `size=${pageSize}`,
        ].filter(Boolean).join("&");

        try {
            setLoader(true);
            const req = await apiRequest(`app/web/customer/allTransactionList${queryParams ? `?${queryParams}` : ""}`);

            //console.log(req, 'result')

            if (req?.error) {
                toast.error(req?.error);
                return;
            }

            if (req?.data?.pageData) {
                setCustomerData({
                    pageData: req.data.pageData,
                    totalPages: req.data.totalPages,
                    totalRows: req.data.totalRows,
                });
            }


            setTimeout(() => {
                setLoader(false);
            }, 3000);

        } catch (error: any) {
            toast.error(error)
        }

    }

    const getCustomerListData = async () => {

        const queryParams = [
            `page=${currentPage}`,
            `size=${pageSize}`,
        ].filter(Boolean).join("&");

        try {
            setLoader(true);
            const req = await apiRequest(`app/web/customer/allTransactionList${queryParams ? `?${queryParams}` : ""}`);

            //console.log(req, 'result')

            if (req?.error) {
                toast.error(req?.error);
                return;
            }

            if (req?.data?.pageData) {
                const formattedCustomers: OptionType[] = Array.from(
                    new Map<string, OptionType>(
                        req.data.pageData.map((item: any) => [item.customername, { value: item.customername, label: item.customername }])
                    ).values()
                );

                setCustomerNames(formattedCustomers);

            }


            setTimeout(() => {
                setLoader(false);
            }, 3000);

        } catch (error: any) {
            toast.error(error)
        }

    }

    const getMerData = async () => {
        const queryParams = [
            `page=${currentPage}`,
            `size=${pageSize}`,
        ].filter(Boolean).join("&");

        try {
            setLoader(true);
            const req = await apiRequest(`app/web/merchant/allTransactionList${queryParams ? `?${queryParams}` : ""}`);

            if (req?.error) {
                toast.error(req?.error);
                return;
            }

            if (req?.data?.pageData) {
                const formattedMerchants: OptionType[] = Array.from(
                    new Map<string, OptionType>(
                        req.data.pageData.map((item: any) => [item.merchantName, { value: item.merchantName, label: item.merchantName }])
                    ).values()
                );

                setMerchantNames(formattedMerchants);

            }
        } catch (error: any) {
            toast.error(error?.message || "Something went wrong");
        } finally {
            setLoader(false);
        }
    };


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

        navigate("/customer-transaction-details", {
            state: { id: row?.transactionId },
        });
    };


    const handleFilterUserChange = (selected: React.ChangeEvent<HTMLInputElement>) => setSearchCusTerms(selected?.target?.value);

    const handleFilterMerchantChange = (selected: React.ChangeEvent<HTMLInputElement>) => setSearchMerTerms(selected?.target?.value);

    const changeFromDate = (date: any) => {
        if (!date) return;
        const formattedDate = newFormatDate(date);
        const changedDate = String(formattedDate).split("T")[0];
        setSelectedDate(changedDate);

        const newStartDate = normalFormatDate(date);
        const changedNewDate = String(newStartDate).split('T')[0];

        setFromDate(changedNewDate);

    };

    const changeToDate = (date: any) => {
        if (!date) return;
        const formattedDate = newFormatDate(date);
        const changedDate = String(formattedDate).split("T")[0];
        setSelectedToDate(changedDate);

        const newStartDate = normalFormatDate(date);
        const changedNewDate = String(newStartDate).split('T')[0];

        setToDate(changedNewDate);
    };

    const clearCusSearch = () => {
        setSearchCusTerms("");
    };
    const clearMerSearch = () => {
        setSearchMerTerms("");
    };

    const clearFromDate = () => {
        setSelectedDate("");
        setFromDate('');
    };

    const clearToDate = () => {
        setSelectedToDate("");
        setToDate('');
    };

    useEffect(() => {
        getMerData();
        getCustomerData();
        getCustomerListData();
    }, [])

    // const filterData = () => {
    //     // setCurrentPage(0);
    //     // getCustomerData();
    // }

    useEffect(() => {
        getCustomerData();
    }, [debouncedSearchCusTerm, debouncedSearchMerTerm, currentPage, debouncedFromDate, debouncedToDate, pageSize]);

    return (
        <div className='rounded-lg p-4 md:p-6 xl:p-6 lg:p-6'>
            <Navbar />
            <div className="flex justify-end mb-4 gap-2">
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
            <div className="grid grid-cols-12 gap-4 mb-6">
                <div className="col-span-12 md:col-span-3">
                    {/* <CustomSelect
                        options={merchantNames}
                        value={filterMerchantValue}
                        onChange={handleFilterMerchantChange}
                        placeholder="Merchant Name"
                        isClearable
                    /> */}
                    <div className="relative">

                        <input
                            type="text"
                            value={searchMerTerms}
                            placeholder="Search Merchant"
                            onChange={handleFilterMerchantChange}
                            className="py-2 px-4 w-full border rounded-md focus:outline-none focus:none focus:none"
                        />
                        {debouncedSearchMerTerm && (
                            <button onClick={clearMerSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                <FaTimes className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="col-span-12 md:col-span-3">
                    {/* <CustomSelect
                        options={customerNames}
                        value={filterUserValue}
                        onChange={handleFilterUserChange}
                        placeholder="Customer Name"
                        isClearable
                    /> */}

                    <div className="relative">
                        <input
                            type="text"
                            value={searchCusTerms}
                            placeholder="Search Customer"
                            onChange={handleFilterUserChange}
                            className="py-2 px-4 w-full border rounded-md focus:outline-none focus:none focus:none"
                        />
                        {debouncedSearchCusTerm && (
                            <button onClick={clearCusSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                <FaTimes className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                </div>
                <div className="col-span-12 md:col-span-3">
                    <div className="relative">
                        <DatePicker
                            placeholderText="From Date"
                            selected={selectedDate}
                            onChange={changeFromDate}
                            maxDate={new Date()}
                            dateFormat="dd-MM-yyyy"
                            className="border w-full border-gray-300 text-gray-600 text-sm py-[10px] px-3 rounded focus:outline-none"
                            showIcon={false}
                        />
                        {selectedDate && (
                            <button onClick={clearFromDate} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                <FaTimes className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="col-span-12 md:col-span-3">
                    <div className="relative">
                        <DatePicker
                            placeholderText="To Date"
                            selected={selectedToDate}
                            onChange={changeToDate}
                            maxDate={new Date()}
                            dateFormat="dd-MM-yyyy"
                            className="border w-full border-gray-300 text-gray-600 text-sm py-[10px] px-3 rounded focus:outline-none"
                            showIcon={false}
                        />
                        {selectedToDate && (
                            <button onClick={clearToDate} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                <FaTimes className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                {/* <div className="col-span-12 md:col-span-2 flex items-end">
                    <button type="button" className="py-2 px-4 bg-green-600 text-white rounded-md w-full"
                        onClick={filterData}
                    >
                        Filter
                    </button>
                </div> */}

            </div>

            {loader && <Loader showHide={loader} />}
            {!loader && (<>
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
                    <Table columns={columnHeader} data={customerData?.pageData} viewDetails={undefined} onDelete={undefined} viewTxn={handleViewTxn} viewImage={undefined}
                        onEdit={undefined} />
                </div>

                <div className="flex items-center justify-self-center border-t border-gray-200 px-4 py-3 sm:px-6">
                    <div className='justify-self-center'>
                        <Pagination currentPage={currentPage} totalPages={customerData?.totalPages} handlePageChange={handlePageChange} />
                    </div>
                </div>
            </>)}
        </div>
    )
}

export default AllTxnList
