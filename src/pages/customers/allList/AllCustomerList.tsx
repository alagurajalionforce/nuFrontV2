import React, { useEffect, useState } from "react";
import Navbar from "../../../layout/Navbar";
import Table from '../../../components/responsTable';
import Pagination from "../../../components/Pagination";
import apiRequest from "../../../utils/helpers/apiRequest";
import toast from "react-hot-toast";
import Loader from "../../../utils/loader";
import CustomSelect from "../../../components/filterSelect";
import { useNavigate } from "react-router-dom";
import { PageSize } from "../../../utils/commonFunctions";
import { useDebounce } from "../../../utils/useDebounce";
import { FaTimes } from "react-icons/fa";

type OptionType = {
    value: string;
    label: string;
};

const AllCustomerList = () => {
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerms, setSearchTerms] = useState<any>('');
    const debouncedSearchTerm = useDebounce(searchTerms, 600);

    const [customerData, setCustomerData] = useState({
        pageData: [],
        totalPages: 0,
        totalRows: 0,
    });
    const [loader, setLoader] = useState(false);
    const [customerNames, setCustomerNames] = useState<OptionType[]>([]);
    const [filterUserValue, setFilterUserValue] = useState<any>('');

    const columnHeader = [
        { key: "id", headerName: "Customer ID" },
        { key: "name", headerName: "Name" },
        { key: "email", headerName: "Email" },
        { key: "phoneNumber", headerName: "Phone" },

        { key: "createdDt", headerName: "Created Date" },
        { key: "updatedDt", headerName: "Updated Date" },
        { key: "locations", headerName: "Address" },
        { key: "userImagePath", headerName: "profileImage" },
        // { key: "locationCity", headerName: "City" },
    ];

    const [pageSize, setPageSize] = useState<number>(10);

    const selectPages = (e: any) => {
        const { name, value } = e.target;

        setPageSize(value);
        setCurrentPage(0);
    };


    const getCustomerData = async () => {

        const queryParams = [
            searchTerms ? `customerName=${debouncedSearchTerm}` : '',
            `page=${currentPage}`,
            `size=${pageSize}`,
        ]
            .filter(Boolean)
            .join("&");

        try {
            setLoader(true);
            const req = await apiRequest(`app/web/customerList${queryParams ? `?${queryParams}` : ""}`);

            //console.log(req, 'result')


            if (req?.error) {
                toast.error(req?.error);
                return;
            }

            if (req?.data?.pageData) {
                const formattedCustomers = req.data.pageData.map((item: any) => ({
                    value: item.name,
                    label: item.name,
                }));

                setCustomerNames(formattedCustomers);

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



    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleView = async (row: any) => {
        //console.log("View row:", row);

        navigate("/customer-details", {
            state: { id: row?.userId },
        });

    };

    const handleViewTxn = async (row: any) => {
        //console.log("View row:", row?.userId);

        navigate("/customer-transaction-details", {
            state: { id: row?.userId },
        });
    };
    const handleFilterUserChange = async (selected: React.ChangeEvent<HTMLInputElement>) => {

        setSearchTerms(selected?.target?.value?.toLowerCase());

    }
    const clearCusSearch = () => {
        setSearchTerms("");
    };
    useEffect(() => {
        getCustomerListData()
    }, [])

    useEffect(() => {
        getCustomerData();
    }, [currentPage, debouncedSearchTerm, pageSize])

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
            <div className="grid grid-cols-12 sm:grid-cols-12 lg:grid-cols-12  md:grid-cols-12   gap-4 justify-between mb-6">


                <div className="col-span-12 sm:col-span-12 md:col-span-4 lg:col-span-4 xl:col-span-4 mb-1">
                    <div className=''>
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
                                value={searchTerms}
                                placeholder="Search Customer Name"
                                onChange={handleFilterUserChange}
                                className="py-2 px-4 w-full border rounded-md focus:outline-none focus:none focus:none"
                            />
                            {debouncedSearchTerm && (
                                <button onClick={clearCusSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                    </div>
                </div>


            </div>
            {loader && <Loader showHide={loader} />}
            {!loader && (<>
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
                    <Table columns={columnHeader} data={customerData?.pageData}
                        viewDetails={handleView}
                        onDelete={undefined}
                        // viewTxn={handleViewTxn}
                        viewTxn={undefined}
                        viewImage={undefined}
                        onEdit={undefined}
                    />
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

export default AllCustomerList
