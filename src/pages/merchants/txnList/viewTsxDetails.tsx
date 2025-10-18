import React, { useState, useEffect, useCallback } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { FaFilter, FaRedo, FaDownload, FaRegArrowAltCircleLeft } from 'react-icons/fa';
import Navbar from '../../../layout/Navbar';
import CustomDatePicker from "../../../components/datePickernew";
import CustomSelect from "../../../components/filterSelect";
import apiRequest from '../../../utils/helpers/apiRequest';
import { Transaction, ReconciliationFilters, SelectOption } from '../../../types/reconciliation';
import Table from '../../../components/responsTable';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const ReconciliationPage: React.FC = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const [allFetchedTransactions, setAllFetchedTransactions] = useState<Transaction[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<ReconciliationFilters>({
    merchantId: null,
    customerId: null,
    transactionType: null,
    transactionId: '',
    invoiceNo: '',
    fromDate: null,
    toDate: null,
  });

  // NOW ALL DROPDOWN OPTIONS ARE DERIVED FROM `allFetchedTransactions`
  const [merchantOptions, setMerchantOptions] = useState<SelectOption[]>([]);
  const [customerOptions, setCustomerOptions] = useState<SelectOption[]>([]);
  const [transactionTypeOptions, setTransactionTypeOptions] = useState<SelectOption[]>([]);

  const columnHeader = [
    { key: "transactionId", headerName: "Txn ID" },
    { key: "invoiceNo", headerName: "Invoice No" },
    { key: "type", headerName: "Description" },
    // { key: "merchantName", headerName: "Merchant Name" },
    // { key: "customername", headerName: "Customer Name" },
    { key: "trnInAmount", headerName: "IN (CREDIT)" },
    { key: "trnOutAmount", headerName: "Out (Debit)" },
    { key: "balanceAmount", headerName: "Balance" },
    { key: "createdDt", headerName: "Created" },
    // { key: "status", headerName: "Status" },
  ];

  // --- Primary API Call for Transactions ---
  // This function now fetches based on current filters.
  // It's crucial that 'app/web/transactionDetails' can return a list
  // based on these query parameters, and a broad list if no transactionId is given.
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      let queryParams = new URLSearchParams();

      // Handle initial transaction ID from location state
      const initialTxnId = location?.state?.id;
      if (initialTxnId) {
        queryParams.append('transactionId', initialTxnId);
        // Optionally, if you want the initial ID to be a sticky filter
        // setFilters(prev => ({ ...prev, transactionId: initialTxnId }));
      }

      // Append other filters if they are present
      if (filters.merchantId) queryParams.append('merchantId', filters.merchantId);
      if (filters.customerId) queryParams.append('customerId', filters.customerId);
      if (filters.transactionType) queryParams.append('type', filters.transactionType);
      if (filters.transactionId) queryParams.append('transactionId', filters.transactionId); // For explicit transaction ID search
      if (filters.invoiceNo) queryParams.append('invoiceNo', filters.invoiceNo);
      if (filters.fromDate) queryParams.append('fromDate', format(filters.fromDate, 'yyyy-MM-dd'));
      if (filters.toDate) queryParams.append('toDate', format(filters.toDate, 'yyyy-MM-dd'));

      const req = await apiRequest(`app/web/transactionDetails?${queryParams.toString()}`);


      if (req?.error) {
        toast.error(req?.error || 'Failed to fetch transactions.');
        setTransactions([]);
        setAllFetchedTransactions([]);
        return;
      }

      if (Array.isArray(req?.data)) {
        setAllFetchedTransactions(req.data); // Store the raw data
        applyClientSideFilters(req.data, filters); // Apply client-side filters for display
        // toast.success('Transactions loaded successfully!');
      } else {
        toast.error('API response is not an array of transactions.');
        setTransactions([]);
        setAllFetchedTransactions([]);
      }

    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error(error.message || 'Failed to fetch transactions.');
      setTransactions([]);
      setAllFetchedTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [filters, location?.state?.id]); // Re-run when filters or initial ID changes


  // --- Client-Side Filtering Logic ---
  const applyClientSideFilters = useCallback((data: Transaction[], currentFilters: ReconciliationFilters) => {
    let filtered = data.filter((tx: Transaction) => {
      let match = true;
      // Apply all filters here to the provided 'data'
      if (currentFilters.merchantId && tx.merchantId !== currentFilters.merchantId) match = false;
      if (currentFilters.customerId && tx.customerId !== currentFilters.customerId) match = false;
      if (currentFilters.transactionType && tx.type !== currentFilters.transactionType) match = false;
      if (currentFilters.transactionId && !tx.transactionId.toLowerCase().includes(currentFilters.transactionId.toLowerCase())) match = false;
      if (currentFilters.invoiceNo && (!tx.invoiceNo || !tx.invoiceNo.toLowerCase().includes(currentFilters.invoiceNo.toLowerCase()))) match = false;

      const txDate = parseISO(tx.createdDt);
      if (currentFilters.fromDate && txDate < currentFilters.fromDate) match = false;
      if (currentFilters.toDate) {
        const endOfDayToDate = new Date(currentFilters.toDate.getFullYear(), currentFilters.toDate.getMonth(), currentFilters.toDate.getDate(), 23, 59, 59, 999);
        if (txDate > endOfDayToDate) match = false;
      }
      return match;
    });
    setTransactions(filtered); // Update the displayed transactions
  }, []);


  // --- Effects for Data Fetching and Chained Selects ---

  // Effect 1: Fetch initial transactions on mount
  useEffect(() => {
    fetchTransactions(); // Fetch initial transactions (could be specific ID or general list)
  }, [fetchTransactions]); // Depend on memoized function

  // Effect 2: Derive ALL Dropdown Options (Merchant, Customer, Type)
  // whenever `allFetchedTransactions` or `filters.merchantId` changes
  useEffect(() => {
    const uniqueMerchants = new Map<string, SelectOption>();
    const uniqueCustomers = new Map<string, SelectOption>();
    const uniqueTransactionTypes = new Map<string, SelectOption>();

    allFetchedTransactions.forEach(tx => {
      // Always collect all unique merchants from the full dataset
      if (!uniqueMerchants.has(tx.merchantId)) {
        uniqueMerchants.set(tx.merchantId, { value: tx.merchantId, label: `${tx.merchantName} (ID: ${tx.merchantId})` });
      }

      // Apply chaining logic for Customers and Transaction Types
      // If a merchant is selected, only add customers/types from that merchant's transactions
      if (!filters.merchantId || tx.merchantId === filters.merchantId) {
        if (!uniqueCustomers.has(tx.customerId)) {
          uniqueCustomers.set(tx.customerId, { value: tx.customerId, label: `${tx.customername} (ID: ${tx.customerId})` });
        }
        if (!uniqueTransactionTypes.has(tx.type)) {
          uniqueTransactionTypes.set(tx.type, { value: tx.type, label: tx.type });
        }
      }
    });

    // Convert Maps to arrays and sort them alphabetically by label
    setMerchantOptions(Array.from(uniqueMerchants.values()).sort((a, b) => a.label.localeCompare(b.label)));
    setCustomerOptions(Array.from(uniqueCustomers.values()).sort((a, b) => a.label.localeCompare(b.label)));
    setTransactionTypeOptions(Array.from(uniqueTransactionTypes.values()).sort((a, b) => a.label.localeCompare(b.label)));

  }, [allFetchedTransactions, filters.merchantId]); // Re-run when base data or merchant filter changes


  // --- Filter Handlers ---

  const handleFilterChange = useCallback((name: keyof ReconciliationFilters, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };

      // Logic for chained selects: If merchant changes, clear dependent filters
      if (name === 'merchantId') {
        newFilters.customerId = null;
        newFilters.transactionType = null;
      }
      return newFilters;
    });
  }, []);

  const handleDateChange = useCallback((name: 'fromDate' | 'toDate', date: Date | null) => {
    setFilters(prev => ({ ...prev, [name]: date }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      merchantId: null,
      customerId: null,
      transactionType: null,
      transactionId: '',
      invoiceNo: '',
      fromDate: null,
      toDate: null,
    });
    // After clearing filters, trigger a re-fetch of transactions with no filters (or defaults)
    setTimeout(() => fetchTransactions(), 0);
  }, [fetchTransactions]);

  const totalInAmount = transactions.reduce((sum, tx) => sum + (tx.trnInAmount || 0), 0);
  const totalOutAmount = transactions.reduce((sum, tx) => sum + (tx.trnOutAmount || 0), 0);

  const goBack = async () => {
    navigate(location?.state?.path, { state: { id: '' } });
  }

  return (
    <div className='rounded-lg p-4 md:p-6 xl:p-6 lg:p-6'>
      <Navbar />

      {/* <Link to={'/merchants/transactions'} className="text-blue-600 hover:underline mb-4 inline-block">Back</Link> */}

      <div className='flex gap-1 '>
        <FaRegArrowAltCircleLeft className='mt-1' /> 
        {/* <Link to={locations?.state?.path} className="text-gray-800 hover:underline mb-4 inline-block">Back</Link> */}
        <button onClick={goBack} className="text-gray-800 hover:underline mb-4 inline-block">Back</button>
      </div>

      

      {/* <div className="grid grid-cols-12 sm:grid-cols-12 lg:grid-cols-12 md:grid-cols-12 gap-4 justify-between mb-6 p-4">

        <div className="col-span-12 sm:col-span-12 md:col-span-4 lg:col-span-3 xl:col-span-3 mb-1">
          <label htmlFor="merchantFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Merchant
          </label>
          <CustomSelect
            id="merchantFilter"
            options={merchantOptions} // Now uses dynamically derived merchant options
            value={filters.merchantId ? merchantOptions.find(opt => opt.value === filters.merchantId) : null}
            onChange={(selectedOption: unknown) => {
              const selected = selectedOption as SelectOption | null;
              handleFilterChange('merchantId', selected ? selected.value : null);
            }}
            placeholder="Select Merchant"
            isClearable
          />
        </div>

        <div className="col-span-12 sm:col-span-12 md:col-span-4 lg:col-span-3 xl:col-span-3 mb-1">
          <label htmlFor="customerFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Customer
          </label>
          <CustomSelect
            id="customerFilter"
            options={customerOptions}
            value={filters.customerId ? customerOptions.find(opt => opt.value === filters.customerId) : null}
            onChange={(selectedOption: unknown) => {
              const selected = selectedOption as SelectOption | null;
              handleFilterChange('customerId', selected ? selected.value : null);
            }}
            placeholder="Select Customer"
            isClearable
            isDisabled={!filters.merchantId && merchantOptions.length > 0} // Uses merchantOptions now
          />
        </div>

        <div className="col-span-12 sm:col-span-12 md:col-span-4 lg:col-span-3 xl:col-span-3 mb-1">
          <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Type
          </label>
          <CustomSelect
            id="typeFilter"
            options={transactionTypeOptions}
            value={filters.transactionType ? transactionTypeOptions.find(opt => opt.value === filters.transactionType) : null}
            onChange={(selectedOption: unknown) => {
              const selected = selectedOption as SelectOption | null;
              handleFilterChange('transactionType', selected ? selected.value : null);
            }}
            placeholder="Select Type"
            isClearable
            isDisabled={!filters.merchantId && merchantOptions.length > 0} // Uses merchantOptions now
          />
        </div>

        <div className="col-span-12 sm:col-span-12 md:col-span-4 lg:col-span-3 xl:col-span-3 mb-1">
          <label htmlFor="fromDateFilter" className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <CustomDatePicker
            selectedDate={filters.fromDate}
            onChange={(date: Date | null) => handleDateChange('fromDate', date)}
            placeholder="dd-mm-yyyy"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            showIcon={false}
          />
        </div>

        <div className="col-span-12 sm:col-span-12 md:col-span-4 lg:col-span-3 xl:col-span-3 mb-1">
          <label htmlFor="toDateFilter" className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <CustomDatePicker
            selectedDate={filters.toDate}
            onChange={(date: Date | null) => handleDateChange('toDate', date)}
            placeholder="dd-mm-yyyy"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            showIcon={false}
          />
        </div>

        <div className="col-span-12 sm:col-span-12 md:col-span-4 lg:col-span-3 xl:col-span-3 mb-1">
          <label htmlFor="transactionIdFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Transaction ID
          </label>
          <input
            type="text"
            id="transactionIdFilter"
            name="transactionId"
            value={filters.transactionId}
            onChange={(e) => handleFilterChange('transactionId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Enter Transaction ID"
          />
        </div>

        <div className="col-span-12 sm:col-span-12 md:col-span-4 lg:col-span-3 xl:col-span-3 mb-1">
          <label htmlFor="invoiceNoFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Invoice No.
          </label>
          <input
            type="text"
            id="invoiceNoFilter"
            name="invoiceNo"
            value={filters.invoiceNo}
            onChange={(e) => handleFilterChange('invoiceNo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Enter Invoice No."
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 mb-6 p-4">
        <button
          onClick={fetchTransactions}
          className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center gap-2"
          disabled={loading}
        >
          <FaFilter /> {loading ? 'Applying...' : 'Apply Filters'}
        </button>
        <button
          onClick={handleClearFilters}
          className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
          disabled={loading}
        >
          <FaRedo /> Clear Filters
        </button>
        <button
                    onClick={() => toast.info('Export functionality not implemented yet.')}
                    className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
                    disabled={loading}
                >
                    <FaDownload /> Export CSV
                </button>
      </div> */}

      {/* <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md mb-6 flex flex-wrap justify-around text-center font-semibold">
        <p className="w-1/2 md:w-auto mb-2 md:mb-0">Total In Amount: <span className="text-green-700">₹{totalInAmount.toFixed(2)}</span></p>
        <p className="w-1/2 md:w-auto mb-2 md:mb-0">Total Out Amount: <span className="text-red-700">₹{totalOutAmount.toFixed(2)}</span></p>
        <p className="w-full md:w-auto">Net Balance: <span className={`${(totalInAmount - totalOutAmount) >= 0 ? 'text-green-700' : 'text-red-700'}`}>₹{(totalInAmount - totalOutAmount).toFixed(2)}</span></p>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
        {loading ? (
          <div className="text-center p-8 text-lg text-gray-600">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center p-8 text-lg text-gray-600">No transactions found for the applied filters.</div>
        ) : (
          <Table columns={columnHeader} data={transactions} viewDetails={undefined} onDelete={undefined} viewTxn={undefined} />
        )}
      </div>

      <div className="flex items-center justify-self-center border-t border-gray-200 px-4 py-3 sm:px-6">
        <div className='justify-self-center'>
          {/* <Pagination currentPage={currentPage} totalPages={empList?.rowData?.length || 0} handlePageChange={handlePageChange} /> */}
        </div>
      </div>

    </div>
  );
};

export default ReconciliationPage;