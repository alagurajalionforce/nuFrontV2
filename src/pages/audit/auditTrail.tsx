import React, { useEffect, useState } from "react";
import apiRequest from "../../utils/helpers/apiRequest";
import toast from "react-hot-toast";
import Table from "../../components/AuditTable";
import Pagination from "../../components/Pagination";

import DatePicker from "react-datepicker";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import CustomSelect from "../../components/filterSelect";
import { newFormatDate, normalFormatDate } from "../../utils/commonFunctions";
import Loader from "../../utils/loader";
// Reload
import { GrRefresh } from "react-icons/gr";
import Navbar from "../../layout/Navbar";

interface RowData {
    id: number;
    userName: string;
    profileImage: string;
    userEmail: string;
    method: string;
    action: string;
    statusCode: number;
    ipAddress: string;
    createdDateTime: string;
    employeeName: string;
    changesLog: string;
}

interface AuditTrailDatas {
    pageData: RowData[];
    totalPages: number;
    totalRows: number;
}

const formatTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
};

const AuditTrail: React.FC = () => {

    const today = new Date();
    const test = today.toISOString();

    const newTodayDate = normalFormatDate(test);
    const changedNewDate = String(newTodayDate).split('T')[0];

    const [auditTrailData, setAuditTrailData] = useState<AuditTrailDatas>({
        pageData: [],
        totalPages: 0,
        totalRows: 0,
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState<number>(10);

    const [userName, setuserName] = useState<any>("");
    const [action, setAction] = useState<any>("");

    const [selectedFromdate, setSelectedFromdate] = useState<any>(
        formatTodayDate()
    );
    const [selectedToDate, setSelectedTodate] = useState<any>(formatTodayDate());
    const [employeeNames, setEmployeeNames] = useState<
        { value: any; label: string }[]
    >([]);
    const [filterUserValue, setFilterUserValue] = useState<any>("");
    const [filterStatusValue, setFilterStatusValue] = useState<any>("");

    const [fromDate, setFromDate] = useState<any>(changedNewDate);
    const [toDate, setToDate] = useState<any>(changedNewDate);

    const [loader, setLoader] = useState(false);


    const columnHeader = [
        // { key: "serialNo", headerName: "S.No" },
        //  { key: "userName", headerName: "User Name" },
        { key: "profileImage", headerName: "Performed by" },
        { key: "action", headerName: "Action" },

        // { key: "createdBy", headerName: "Email" },
        { key: "accessDate", headerName: "Access Date" },
        { key: "systemIp", headerName: "IP Address" },
        { key: "changeLog", headerName: "Changes" },
        { key: "changeLog", headerName: "view" },
        // { key: "createdTime", headerName: "Created Date" },
    ];

    const getUserName = async () => {

        try {

            const req = await apiRequest(`app/web/allAuthUserList`);

            if (req?.error) {
                toast.error(req?.error);
                return;
            }

            // console.log(req?.data)

            const data = req?.data?.map((user: any) => {
                return {
                    name: user?.name.toLowerCase(),
                    email: user?.email.toLowerCase(),
                }
            })

            const formattedCustomers = data?.map((user: any) => ({
                value: user.email, // Use ID as value
                label: user.name, // Use firstName as label
            }));

            // console.log(formattedCustomers, 'formattedCustomers');

            setEmployeeNames(formattedCustomers);


        } catch (error: any) {

        }
    }


    const getAuditData = async () => {

        const queryParams = [
            fromDate ? `fromDate=${fromDate}` : "",
            toDate ? `toDate=${toDate}` : "",
            filterUserValue?.value ? `userName=${filterUserValue.value}` : null,
            filterStatusValue?.value ? `action=${filterStatusValue.value}` : "",
            `page=${currentPage}`,
            `size=${pageSize}`,
        ]
            .filter(Boolean)
            .join("&");

        try {
            setLoader(true);
            const req = await apiRequest(`app/web/auditTrailList${queryParams ? `?${queryParams}` : ""}`);

            //console.log(req, 'result')

            if (req?.error) {
                toast.error(req?.error);
                return;
            }

            if (req?.data?.pageData) {

                setAuditTrailData({
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


    // Format Date & Time Header
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    // From Date
    const changeScheduleDate = async (e: any) => {
        const formattedDate = newFormatDate(e);
        const changedDate = String(formattedDate).split("T");
        // console.log(changedDate[0]);
        setSelectedFromdate(changedDate[0]);

        const newStartDate = normalFormatDate(e);
        const changedNewDate = String(newStartDate).split('T')[0];

        setFromDate(changedNewDate);
    };

    // To Date
    const changeScheduleDateto = async (e: any) => {
        const formattedDate = newFormatDate(e);
        const changedDate = String(formattedDate).split("T");
        // console.log(changedDate[0]);
        setSelectedTodate(changedDate[0]);

        const newStartDate = normalFormatDate(e);
        const changedNewDate = String(newStartDate).split('T')[0];

        setToDate(changedNewDate);

    };


    const handleFilterUserChange = async (selected: any) => {
        console.log(selected)
        setFilterUserValue(selected);
    };

    // Actions
    const statusOptions = [
        // { value: "GET", label: "GET" },
        { value: "POST", label: "ADD" },
        { value: "PUT", label: "UPDATE" },
        { value: "DELETE", label: "DELETE" },
    ];

    const handleFilterStatusChange = async (selected: any) => {
        setFilterStatusValue(selected); // Store the entire object
    };

    // Top Bar - Clear Filter
    const clearFilter = () => {
        setSelectedFromdate("");
        setSelectedTodate("");
        setFilterUserValue([]);
        setFilterStatusValue("");
        setSelectedFromdate("");
        setFromDate('');
        setSelectedTodate("");
        setToDate('');
    };
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };
    const clearFromDate = () => {
        setSelectedFromdate("");
    };

    const clearToDate = () => {
        setSelectedTodate("");
    };

    const selectPages = (e: any) => {
        const { name, value } = e.target;

        setPageSize(value);
        setCurrentPage(0);
    };

    // Reload Action
    const reloadData = async () => {
        setLoader(true);

        setTimeout(() => {
            // getAuditTrailData();
            setLoader(false);
        }, 3000);
    };

    const onView = async (row: any) => {
        console.log(row);
    }



    useEffect(() => {
        getUserName();
    }, [])

    useEffect(() => {
        getAuditData();
    }, [
        currentPage,
        pageSize,
        fromDate,
        toDate,
        filterUserValue,
        filterStatusValue,
    ]);
    return (
        <div className="p-4">

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
            {loader && <Loader showHide={loader} />}

            {!loader && (
                <>
                    <div className="grid grid-cols-12 sm:grid-cols-12 lg:grid-cols-12  md:grid-cols-12   gap-4 justify-between mb-6">
                        <div className="col-span-12 md:col-span-3">
                            <div className="relative w-full">
                                <DatePicker
                                    placeholderText="dd-mm-yyyy"
                                    selected={selectedFromdate}
                                    onChange={changeScheduleDate}
                                    dateFormat="dd-MM-yyyy"
                                    className="py-2 px-4 w-full border rounded-md focus:outline-none focus:none focus:none"
                                />
                                {selectedFromdate && (
                                    <button
                                        onClick={clearFromDate}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        <FaTimes className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-3">
                            <div className="text-left md:text-center lg:text-center relative">
                                <div className="relative w-full">
                                    <DatePicker
                                        placeholderText="dd-mm-yyyy"
                                        selected={selectedToDate}
                                        onChange={changeScheduleDateto}
                                        minDate={selectedFromdate}
                                        dateFormat="dd-MM-yyyy"
                                        className="py-2 px-4 w-full border rounded-md focus:outline-none focus:none focus:none"
                                    />
                                    {selectedToDate && (
                                        <button
                                            onClick={clearToDate}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            <FaTimes className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* <div className="col-span-12 md:col-span-3">
                            <div className="flex gap-1 justify-between">
                                <CustomSelect
                                    options={employeeNames}
                                    value={filterUserValue}
                                    onChange={handleFilterUserChange}
                                    placeholder="Username"
                                    isClearable
                                />
                            </div>
                        </div> */}

                        <div className="col-span-12 md:col-span-3">
                            <div className="flex gap-1 justify-between">
                                {/* <CustomSelect
                                    options={statusOptions}
                                    value={filterStatusValue}
                                    onChange={handleFilterStatusChange}
                                    placeholder="Action"
                                    isClearable
                                /> */}

                                <div className="justify-self-end flex gap-2">
                                    {/* <button className="m-1"><img src={Bellicon} alt="Bellicon" /></button> */}
                                    <button
                                        className="bg-white border-2 rounded-md py-[7px] px-4"
                                        onClick={clearFilter}
                                    >
                                        Clear
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1">
                        {/* Reload Icon */}
                        <div className="justify-self-end">
                            <button
                                className="m-2 border px-2 py-1 shadow-md"
                                title="Reload"
                                onClick={reloadData}
                            >
                                <GrRefresh />
                            </button>
                        </div>
                        <Table
                            data={auditTrailData?.pageData}
                            columns={columnHeader}
                            onEdit={undefined}
                            onDelete={undefined}
                            onView={undefined}
                        />
                    </div>
                    <div className="flex items-center justify-self-center border-t border-gray-200 px-4 py-3 sm:px-6">
                        <div className="justify-self-center flex gap-2">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={auditTrailData.totalPages}
                                handlePageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default AuditTrail
