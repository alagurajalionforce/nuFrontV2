import React, { useEffect, useState } from "react";
import Navbar from "../../../layout/Navbar";
import Table from '../../../components/responsTable';
import Pagination from "../../../components/Pagination";
import apiRequest from "../../../utils/helpers/apiRequest";
import toast from "react-hot-toast";
import Loader from "../../../utils/loader";
import CustomSelect from "../../../components/filterSelect";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../../../utils/useDebounce";
import { FaTimes } from "react-icons/fa";

type OptionType = {
    value: string;
    label: string;
};

const AllMerchantList: React.FC = () => {

    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(0);

    const [merData, setMerData] = useState({
        pageData: [],
        totalPages: 0,
        totalRows: 0,
    });

    const [loader, setLoader] = useState(false);
    const [merchantNames, setMerchantNames] = useState<OptionType[]>([]);
    const [searchTerms, setSearchTerms] = useState<any>('');
    const [filterUserValue, setFilterUserValue] = useState<any>('');
    const [pageSize, setPageSize] = useState<number>(10);

    const debouncedSearchTerm = useDebounce(searchTerms, 600);

    const columnHeader = [
        { key: "businessName", headerName: "Merchant Name" },
        { key: "id", headerName: "Merchant ID" },
        { key: "businessPhoneNo", headerName: "Phone" },
        { key: "email", headerName: "Email" },
        { key: "category", headerName: "category" },
        { key: "businessImagePath", headerName: "profileImage" },
        { key: "status", headerName: "Status" },
        // { key: "tin", headerName: "TIN" },
        // { key: "nin", headerName: "NIN" },
        // { key: "cac", headerName: "CAC" },
    ];


    // const getMerData = async () => {

    //     const queryParams = [
    //         searchTerms ? `merchantName=${debouncedSearchTerm}` : '',
    //         `page=${currentPage}`,
    //         `size=${pageSize}`,
    //     ]
    //         .filter(Boolean)
    //         .join("&");

    //     try {
    //         setLoader(true);
    //         const req = await apiRequest(`app/web/allMerchantList${queryParams ? `?${queryParams}` : ""}`);

    //         //console.log(req, 'result')

    //         if (req?.error) {
    //             toast.error(req?.error );
    //             return;
    //         }

    //         if (req?.data?.pageData) {

    //             setMerData({
    //                 pageData: req.data.pageData,
    //                 totalPages: req.data.totalPages,
    //                 totalRows: req.data.totalRows,
    //             });

    //             setLoader(false);
    //         }

    //         setTimeout(() => {
    //             setLoader(false);
    //         }, 5000);

    //     } catch (error: any) {
    //         toast.error(error)
    //     }

    // }

    const getMerData = async () => {
        const queryParams = [
            searchTerms ? `merchantName=${debouncedSearchTerm}` : '',
            `page=${currentPage}`,
            `size=${pageSize}`,
        ]
            .filter(Boolean)
            .join("&");

        try {
            setLoader(true);
            const req = await apiRequest(`app/web/allMerchantList${queryParams ? `?${queryParams}` : ""}`);

            if (req?.error) {
                toast.error(req?.error);
            } else if (req?.data?.pageData) {
                setMerData({
                    pageData: req.data.pageData,
                    totalPages: req.data.totalPages,
                    totalRows: req.data.totalRows,
                });
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch merchant data.');
        } finally {
            setLoader(false);
        }
    }


    const getMerListData = async () => {
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
            //else if (req?.data?.status === 401 || req?.data?.error === "Unauthorized") {
            //     toast.error(req?.data?.error);

            //     setTimeout(() => {
            //         localStorage.clear();
            //         window.location.replace('/login');
            //     }, 2000);

            // }

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

        navigate("/merchant-details", {
            state: { id: row?.userId },
        });
    };

    const handleViewTxn = async (row: any) => {
        //console.log("View row:", row);

        navigate("/merchant-all-transaction-details", {
            state: { id: row?.userId },
        });
    };

    const handleFilterUserChange = async (selected: React.ChangeEvent<HTMLInputElement>) => {

        //console.log(selected)

        // setFilterUserValue(selected)
        setSearchTerms(selected?.target?.value.toLowerCase());

    }

    const clearMerSearch = () => {
        setSearchTerms("");
    };

    const selectPages = (e: any) => {
        const { name, value } = e.target;

        setPageSize(value);
        setCurrentPage(0);
    };

    useEffect(() => {
        getMerListData()
    }, [])

    useEffect(() => {
        getMerData();

    }, [debouncedSearchTerm, currentPage, pageSize])

    return (
        <div className='rounded-lg p-4 md:p-6 xl:p-6 lg:p-6'>
            {loader && <Loader showHide={loader} />}

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
                            options={merchantNames}
                            value={filterUserValue}
                            onChange={handleFilterUserChange}
                            placeholder="Merchant Name"
                            isClearable

                        /> */}

                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerms}
                                placeholder="Search Merchant"
                                onChange={handleFilterUserChange}
                                className="py-2 px-4 w-full border rounded-md focus:outline-none focus:none focus:none"
                            />
                            {debouncedSearchTerm && (
                                <button onClick={clearMerSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                    </div>


                </div>


            </div>
            {!loader && (<>
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
                    <Table columns={columnHeader} data={merData?.pageData} viewDetails={handleView} onDelete={undefined}
                        //viewTxn={handleViewTxn}
                        viewTxn={undefined}
                        viewImage={undefined}
                        onEdit={undefined}
                    />
                </div>

                <div className="flex items-center justify-self-center border-t border-gray-200 px-4 py-3 sm:px-6">
                    <div className='justify-self-center'>
                        <Pagination currentPage={currentPage} totalPages={merData?.totalPages} handlePageChange={handlePageChange} />
                    </div>
                </div>
            </>)}
        </div>
    )
}

export default AllMerchantList;