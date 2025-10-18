import React from 'react';
import Navbar from '../../layout/Navbar';
import { useState, useEffect } from 'react';
import { BarChart, PieChart, LineChart } from '../../components/Charts';
import { FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import apiRequest from '../../utils/helpers/apiRequest';
import { useDebounce } from '../../utils/useDebounce';
import toast from 'react-hot-toast';
import { newFormatDate, normalFormatDate } from '../../utils/commonFunctions';
import Loader from '../../utils/loader';

interface DateRange {
    fromDate: any;
    toDate: any;
}

// Define the structure of the API response
interface ApiResponse {
    tickets: {
        pendingTickets: string;
        processingTickets: string;
        totalTickets: number;
        completedTickets: string;
    };
    customers: {
        total: string;
        datePeriod: string;
    };
    merchants: {
        total: string;
        datePeriod: string;
    };
    transaction: {
        serviceFee: number;
        loadMoney: any;
        totalLoadMoney: number;
        bonus: any;
        totalBonus: number;
        shareMoneyDebit: number;
        totalCredit: number;
        shareMoneyCredit: number;
        bankBalance: string;
        totalDebit: number;
        purchase: any;
        totalPurchase: number;
        totalSales: number;
        payOut: number;
        totalServiceFee: any;
        totalPayOut: any;
        credit: any;
        debit: any;
    };
}

// Refactored API call function
async function fetchDashboardData(dateRange?: DateRange): Promise<ApiResponse> {
    const format = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    let url = 'app/web/dashboard';

    if (dateRange && dateRange.fromDate && dateRange.toDate) {
        const fromDate = format(dateRange.fromDate);
        const toDate = format(dateRange.toDate);
        url += `?fromDate=${fromDate}&toDate=${toDate}`;
    }

    try {
        const response = await apiRequest(url);
        if (!response.error) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        //console.log(response, 'formattedData')
        const apiData: ApiResponse = await response.data;
        return apiData;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
}

// Function to transform API data to the format your components expect
const transformApiData = (apiData: ApiResponse) => {
    return {
        // Customer and Merchant Stats
        totalCustomers: parseInt(apiData.customers.total),
        newCustomer: parseInt(apiData.customers.datePeriod),
        totalMerchants: parseInt(apiData.merchants.total),
        newMerchants: parseInt(apiData.merchants.datePeriod),

        // Ticket Stats
        totalTickets: apiData.tickets.totalTickets,
        resolvedTickets: parseInt(apiData.tickets.completedTickets),
        pendingTickets: parseInt(apiData.tickets.pendingTickets),
        processingTickets: parseInt(apiData.tickets.processingTickets),

        // Transactional Data
        totalTopUp: apiData.transaction.totalLoadMoney, // Total load money from API
        totalLoadMoney: apiData.transaction.totalLoadMoney, // Duplicate key for clarity
        serviceFees: apiData.transaction.totalServiceFee, // Total service fee
        totalServiceFee: apiData.transaction.totalServiceFee, // Duplicate key for clarity
        bankBalance: parseFloat(apiData.transaction.bankBalance),
        merchantBonus: apiData.transaction.totalBonus,
        totalBonus: apiData.transaction.totalBonus, // Duplicate key for clarity

        // Customer-specific transactions
        customerCredit: apiData.transaction.credit,
        totalCredit: apiData.transaction.totalCredit, // Duplicate key for clarity
        customerDebit: apiData.transaction.debit,
        totalDebit: apiData.transaction.totalDebit, // Duplicate key for clarity

        // Merchant-specific transactions
        totalSales: apiData.transaction.totalSales, // Total sales for merchants
        totalPayOut: apiData.transaction.totalPayOut, // Total payouts for merchants
        totalPurchase: apiData.transaction.totalPurchase, // Total purchase transactions
    };
};

export default function Dashboard() {

    const today = new Date();
    const test = today.toISOString();

    const newTodayDate = normalFormatDate(test);
    const changedNewDate = String(newTodayDate).split('T')[0];

    const [dateRange, setDateRange] = useState({
        fromDate: changedNewDate || null,
        toDate: changedNewDate || null,
    });
    const [timeRange, setTimeRange] = useState<string>('today');
    const [data, setData] = useState<ReturnType<typeof transformApiData> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);



    const [selectedDate, setSelectedDate] = useState<any>(today);
    const [selectedToDate, setSelectedToDate] = useState<any>(today);

    // const [selectedDate, setSelectedDate] = useState<any>("");
    // const [selectedToDate, setSelectedToDate] = useState<any>("");
    const [fromDate, setFromDate] = useState<any>("");
    const [toDate, setToDate] = useState<any>("");

    const debouncedFromDate = useDebounce(dateRange?.fromDate, 500);
    const debouncedToDate = useDebounce(dateRange?.toDate, 500);

    // Fetch data based on selected time range or custom date range
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {

            const queryParams = [
                dateRange?.fromDate ? `fromDate=${dateRange?.fromDate}` : '',
                dateRange?.toDate ? `toDate=${dateRange?.toDate}` : '',
            ].filter(Boolean).join("&");

            const req = await apiRequest(`app/web/dashboard${queryParams ? `?${queryParams}` : ""}`);


            if (req?.error) {
                toast.error(req?.error)
            }

            const formattedData = transformApiData(req?.data);
            //console.log(formattedData, req?.data, 'formattedData')
            setData(formattedData);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {

        fetchData();
    }, [timeRange, dateRange, debouncedFromDate, debouncedToDate,]);

    const formatDate = (date: Date | null): string | null => {
        if (!date) return null;
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // month is 0-based
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Handle time range change
    const handleTimeRangeChange = (range: string) => {
        setTimeRange(range);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let from: Date | null = null;
        let to: Date | null = null;

        switch (range) {
            case 'today':
                from = today;
                to = new Date();
                setSelectedDate("");
                setFromDate('');
                setSelectedToDate("");
                setToDate('');
                break;
            case 'week':
                from = new Date(today);
                from.setDate(today.getDate() - 7);
                to = today;
                setSelectedDate("");
                setFromDate('');
                setSelectedToDate("");
                setToDate('');
                break;
            case 'month':
                from = new Date(today);
                from.setMonth(today.getMonth() - 1);
                to = today;
                setSelectedDate("");
                setFromDate('');
                setSelectedToDate("");
                setToDate('');
                break;
            case 'year':
                from = new Date(today);
                from.setFullYear(today.getFullYear() - 1);
                to = today;
                setSelectedDate("");
                setFromDate('');
                setSelectedToDate("");
                setToDate('');
                break;
            case 'custom':
                setDateRange({ fromDate: null, toDate: null });
                return;
        }

        setDateRange({
            fromDate: formatDate(from),
            toDate: formatDate(to),
        });

        const formattedFrom = formatDate(from);
        const formattedTo = formatDate(to);
        //console.log("Quick Range Selected:", { from: formattedFrom, to: formattedTo });
    };


    const changeFromDate = (date: any) => {
        if (!date) return;
        const formattedDate = newFormatDate(date);
        const changedDate = String(formattedDate).split("T")[0];
        setSelectedDate(changedDate);

        const newStartDate = normalFormatDate(date);
        const changedNewDate = String(newStartDate).split('T')[0];

        setFromDate(changedNewDate);

        setDateRange((prev: any) => ({
            ...prev,
            fromDate: changedNewDate,
        }))

    };

    const changeToDate = (date: any) => {
        if (!date) return;
        const formattedDate = newFormatDate(date);
        const changedDate = String(formattedDate).split("T")[0];
        setSelectedToDate(changedDate);

        const newStartDate = normalFormatDate(date);
        const changedNewDate = String(newStartDate).split('T')[0];

        setToDate(changedNewDate);
        setDateRange((prev: any) => ({
            ...prev,
            toDate: changedNewDate,
        }))
    };

    const clearFromDate = () => {
        setSelectedDate("");
        setFromDate('');
    };

    const clearToDate = () => {
        setSelectedToDate("");
        setToDate('');
    };

    const customDateRange = () => {
        fetchData();
    }

    return (
        <div className="p-4 md:p-6">
            <Navbar />

            {/* Date Range Selector */}
            <div className="mb-8 bg-white rounded-lg shadow-lg p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                    {['today', 'week', 'month', 'year', 'custom'].map((range) => (
                        <button
                            key={range}
                            onClick={() => handleTimeRangeChange(range)}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${timeRange === range
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>

                {timeRange === 'custom' && (
                    <div className="grid grid-cols-12 gap-2 mb-6">
                        <div className="col-span-12 md:col-span-3">
                            <div className="relative">
                                <DatePicker
                                    placeholderText="Start Date"
                                    selected={selectedDate}
                                    onChange={changeFromDate}
                                    // selectsStart
                                    // startDate={dateRange.fromDate}
                                    // endDate={dateRange.toDate}
                                    //maxDate={dateRange?.toDate || undefined}
                                    dateFormat="dd-MM-yyyy"
                                    className="w-full p-2 border rounded-md focus:outline-none focus:none focus:none"
                                    showIcon={false}
                                />
                                {selectedDate && (
                                    <button onClick={clearFromDate} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                        <FaTimes className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-1">
                            <span className="hidden sm:block p-2 items-center">to</span>
                        </div>
                        <div className="col-span-12 md:col-span-3">
                            <div className="relative">
                                <DatePicker
                                    placeholderText="End Date"
                                    selected={selectedToDate}
                                    onChange={changeToDate}
                                    selectsEnd
                                    // startDate={dateRange.fromDate}
                                    // endDate={dateRange.toDate}
                                    minDate={selectedDate || undefined}
                                    maxDate={new Date()}
                                    dateFormat="dd-MM-yyyy"
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                                    showIcon={false}
                                />
                                {selectedToDate && (
                                    <button onClick={clearToDate} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                        <FaTimes className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* <div className="col-span-12 md:col-span-3">
                            <button onClick={customDateRange} className="px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white">
                               Filter
                            </button>
                        </div> */}
                    </div>
                )}
            </div>
            {isLoading && <Loader showHide={isLoading} />}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">

                </div>
            ) : error ? (
                <div className="text-center py-10 text-red-500">
                    {error}
                </div>
            ) : data ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {/* Summary Cards */}
                        <DashboardCard title="New Customers" value={data.newCustomer} icon={<UsersIcon />} moneyDetail='' />
                        <DashboardCard title="Total Customers" value={data.totalCustomers} icon={<UsersIcon />} moneyDetail='' />
                        <DashboardCard title="New Merchants" value={data.newMerchants} icon={<StoreIcon />} moneyDetail='' />
                        <DashboardCard title="Total Merchants" value={data.totalMerchants} icon={<StoreIcon />} moneyDetail='' />
                        <DashboardCard title="Bonus Points Issued" value={data.merchantBonus} icon={<GiftIcon />} moneyDetail='money' />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <DashboardCard title="Total Tickets" value={data.totalTickets} icon={<TicketIcon />} moneyDetail='' />
                        <DashboardCard title="Resolved Tickets" value={data.resolvedTickets} icon={<CheckCircleIcon />} moneyDetail='' />
                        <DashboardCard title="Pending Tickets" value={data.pendingTickets} icon={<ClockIcon />} moneyDetail='' />

                        <DashboardCard title="Open Tickets" value={data.processingTickets} icon={<TicketIcon />} moneyDetail='' />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <DashboardCard title="Bank Balance" value={data.bankBalance} icon={<BankIcon />} moneyDetail='money' />
                        <DashboardCard title="Total Topup Amount" value={data.totalTopUp} icon={<CashIcon />} moneyDetail='money' />
                        <DashboardCard title="Service Fees Collected" value={data.serviceFees} icon={<ServiceIcon />} moneyDetail='money' />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">

                        <div className="bg-white rounded-lg shadow p-4 md:col-span-2 shadow-lg">
                            <h2 className="text-lg font-semibold mb-4">Customer Transactions</h2>
                            <BarChart
                                data={[
                                    { name: 'Credit', value: data.customerCredit },
                                    { name: 'Total Credit', value: data.totalCredit },
                                    { name: 'Debit', value: data.customerDebit },
                                    { name: 'Total Debit', value: data.totalDebit },
                                    { name: 'Total Purchase', value: data.totalPurchase },
                                ]}
                                colors={['#4ade80', '#f87171', '#ef4444', '#2c93g6', '#3b82f6']}
                            />
                        </div>

                        <div className="bg-white rounded-lg shadow p-4 md:col-span-1 shadow-lg">
                            <h2 className="text-lg font-semibold mb-4">Merchant Transactions</h2>
                            <BarChart
                                data={[
                                    { name: 'Total Sales', value: data.totalSales },
                                    { name: 'Total Payout', value: data.totalPayOut },
                                    { name: 'Total ServiceFee', value: data.totalServiceFee },
                                ]}
                                colors={['#60a5fa', '#fbbf24', '#ef4444',]}
                            />
                        </div>





                        <div className="bg-white rounded-lg shadow p-4 md:col-span-2 lg:col-span-3 shadow-lg">
                            <div className="bg-white rounded-lg shadow p-4 md:col-span-1">
                                <h2 className="text-lg font-semibold mb-4">Tickets Status</h2>
                                <PieChart
                                    data={[
                                        { name: 'Resolved', value: data.resolvedTickets },
                                        { name: 'Pending', value: data.pendingTickets },
                                        { name: 'Total', value: data.totalTickets },
                                        { name: 'Open', value: data.processingTickets },
                                    ]}
                                    colors={[
                                        '#10b981', // Green (Resolved)
                                        '#f59e0b', // Amber (Pending)
                                        '#3b82f6', // Blue (Total)
                                        '#ef4444', // Red (Processing)
                                    ]}
                                />
                            </div>
                            {/* <h2 className="text-lg font-semibold mb-4">Transaction Trends</h2>
                            <LineChart
                                data={[
                                    {
                                        name: 'Customer Credit',
                                        data: data.customerCreditTrend,
                                    },
                                    {
                                        name: 'Customer Debit',
                                        data: data.customerDebitTrend,
                                    },
                                    {
                                        name: 'Merchant Credit',
                                        data: data.merchantCreditTrend,
                                    },
                                    {
                                        name: 'Merchant Debit',
                                        data: data.merchantDebitTrend,
                                    },
                                ]}
                            /> */}
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    No data available for the selected range.
                </div>
            )}
        </div>
    );
}

// Helper components for the cards
// function DashboardCard({ title, value, change, icon, moneyDetail }: { title: string; value: number; change?: number; icon: React.ReactNode, moneyDetail: any; }) {
//     return (
//         <div className="bg-white rounded-lg shadow p-4">
//             <div className="flex justify-between items-start">
//                 <div>
//                     <p className="text-gray-500 text-sm">{title}</p>
//                     <div className='flex gap-1'>
//                         <span className='font-[10px] mt-[9px]'>{moneyDetail === 'money' ? '₦' : ''}</span>
//                         <p className="text-2xl font-bold mt-1"> {isNaN(value) ? 0 : moneyDetail === 'money' ? value.toLocaleString() : value}</p>
//                     </div>

//                 </div>
//                 <div className="p-2 rounded-full bg-blue-100 text-blue-600">
//                     {icon}
//                 </div>
//             </div>
//             {change !== undefined && (
//                 <p className={`mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'
//                     }`}>
//                     {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from previous period
//                 </p>
//             )}
//         </div>
//     );
// }

function DashboardCard({
    title,
    value,
    change,
    icon,
    moneyDetail
}: {
    title: string;
    value: number;
    change?: number;
    icon: React.ReactNode,
    moneyDetail?: any;
}) {
    const iconContainerClasses = {
        'On route vehicles': 'bg-[#f0eefd] text-[#7f63f4]',
        'Vehicles with errors': 'bg-[#fef4e8] text-[#f29f43]',
        'Deviated from route': 'bg-[#ffeef0] text-[#f46376]',
        'Late vehicles': 'bg-[#e7f9fb] text-[#2fc6d8]',
    };

    // Dynamic color mapping based on title
    const iconColorClass = iconContainerClasses[(title as keyof typeof iconContainerClasses)] || 'bg-gray-200 text-gray-800';
    const changePercentage = change !== undefined ? Math.abs(change) : 0;
    const isIncrease = change !== undefined && change >= 0;

    return (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 min-w-[220px] shadow-xl">
            <div className="flex items-center gap-4 mb-2">
                <div className={`p-3 w-12 h-12 rounded-lg flex items-center justify-center ${iconColorClass}`}>
                    {icon}
                </div>
                <div className="flex gap-2">
                    <span className='font-[10px] mt-[6px]'>{moneyDetail === 'money' ? '₦' : ''}</span> <p className="text-2xl font-bold flex gap-2 text-gray-600">{isNaN(value) ? 0 : value.toLocaleString()}</p>
                </div>
            </div>
            <p className="text-sm text-gray-500">
                {title}
            </p>
            {change !== undefined && (
                <p className={`mt-2 text-sm ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                    {isIncrease ? `+${changePercentage}%` : `-${changePercentage}%`} than last week
                </p>
            )}
        </div>
    );
}

// Mock icons (replace with actual icons from your library)
function UsersIcon() {
    return (
        <div className="p-2 rounded-full bg-green-100 text-green-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        </div>
    );
}

function StoreIcon() {
    return (
        <div className="p-2 rounded-full bg-green-100 text-green-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
        </div>
    );
}

function TicketIcon() {
    return (
        <div className="p-2 rounded-full bg-green-100 text-green-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
        </div>
    );
}

function CheckCircleIcon() {
    return (
        <div className="p-2 rounded-full bg-green-100 text-green-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
    );
}

function ClockIcon() {
    return (
        <div className="p-2 rounded-full bg-green-100 text-green-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
    );
}

function GiftIcon() {
    return (
        <div className="p-2 rounded-full bg-green-100 text-green-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
        </div>
    );
}

function CashIcon() {
    return (
        <div className="p-2 rounded-full bg-green-100 text-green-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
    );
}

function BankIcon() {
    return (
        <div className="p-2 rounded-full bg-green-100 text-green-800">
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M5 10v10m4-10v10m6-10v10m4-10v10M2 10l10-6 10 6M4 20h16"
                />
            </svg>
        </div>
    );
}

function ServiceIcon() {
    return (
        <div className="p-2 rounded-full bg-green-100 text-green-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </div>
    );
}

function CashBalanceIcon() {
    return (
        <div className="p-2 rounded-full bg-green-100 text-green-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
        </div>
    );
}

// Mock API function
