import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Navbar from '../../../layout/Navbar'
import apiRequest from '../../../utils/helpers/apiRequest';
import toast from 'react-hot-toast';
import Table from '../../../components/responsTable';
import Pagination from '../../../components/Pagination';
import { useDebounce } from '../../../utils/useDebounce';
import { FaRegArrowAltCircleLeft, FaTimes } from 'react-icons/fa';
import Loader from '../../../utils/loader';

const ViewDetails: React.FC = () => {

  const locations = useLocation();
  const [loader, setLoader] = useState(false);
  const [searchTerms, setSearchTerms] = useState<any>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerms, 600);

  const [merData, setMerData] = useState({
    pageData: [],
    totalPages: 0,
    totalRows: 0,
  });

  const columnHeader = [
    { key: "transactionId", headerName: "Txn ID" },
    // { key: "invoiceNo", headerName: "Invoice No" },
    { key: "type", headerName: "Description" },
    { key: "merchantName", headerName: "Merchant Name" },
    { key: "customername", headerName: "Customer Name" },
    { key: "trnInAmount", headerName: "IN (CREDIT)" },
    { key: "trnOutAmount", headerName: "Out (Debit)" },
    { key: "balanceAmount", headerName: "Balance" },
    { key: "createdDt", headerName: "Created" },
    // { key: "status", headerName: "Status" },
  ];

  const getMerData = async (id: any) => {
    console.log(id)
    const queryParams = [
      searchTerms ? `merchantName=${debouncedSearchTerm}` : '',
      id ? `customerId=${id}` : '',
      `page=${currentPage}`,
      `size=${pageSize}`,
    ]
      .filter(Boolean)
      .join("&");

    try {
      setLoader(true);
      const req = await apiRequest(`app/web/customer/allTransactionList${queryParams ? `?${queryParams}` : ""}`);

      //console.log(req, 'result')

      if (req?.error) {
        toast.error(req?.error);
        return;
      }

      if (req?.data?.pageData) {

        setMerData({
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

  const handleFilterUserChange = async (selected: React.ChangeEvent<HTMLInputElement>) => {

    //console.log(selected)

    // setFilterUserValue(selected)
    setSearchTerms(selected?.target?.value.toLowerCase());

  }

  const clearMerSearch = () => {
    setSearchTerms("");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const selectPages = (e: any) => {
    const { name, value } = e.target;

    setPageSize(value);
    setCurrentPage(0);
  };

  useEffect(() => {
    getMerData(locations?.state?.id)
  }, [currentPage, pageSize, debouncedSearchTerm, locations?.state?.id])

  useEffect(() => {
    //console.log(locations?.state?.id)
    if (locations?.state?.id) {
      getMerData(locations?.state?.id)
    } else {
      console.log('No Merchant details fount')
    }

  }, [locations?.state?.id])

  return (
    <div>
      <div className='rounded-lg p-4 md:p-6 xl:p-6 lg:p-6'>


        <Navbar />
        <div className='flex gap-1 '>
          <FaRegArrowAltCircleLeft className='mt-1' /> <Link to={locations?.state?.path} className="text-gray-800 hover:underline mb-4 inline-block">Back</Link>
        </div>

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
            <div className='flex gap-1 justify-between'>
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
        {loader && <Loader showHide={loader} />}
        {!loader && (<>
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
            <Table columns={columnHeader} data={merData?.pageData} viewDetails={undefined} onDelete={undefined}
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
    </div>
  )
}

export default ViewDetails
