import React, { useState } from "react";
import { FaRegEdit, FaTrashAlt, FaRegEye, FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { displayFormatDate } from "../utils/commonFunctions";

interface TableColumn {
    headerName: string;
    key: string;
    sortable?: boolean;
    filterable?: boolean;
}

interface TableProps {
    columns: TableColumn[];
    data: any[];
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
    onRowClick?: (id: string) => void;
    onSelect?: (row: any) => void;
    onDrop?: (row: any) => void;
    onMybidSelect?: (row: any) => void;
    onMybidDrop?: (row: any) => void;
    onMycandidatesDrop?: (row: any) => void;
    onView?: (row: any) => void;
    onTransactionseditSelect?: (row: any) => void;
    onTransactionsdeleteSelect?: (row: any) => void;
    loading?: boolean;
}

const userColorMap = new Map<string, string>();

const getUniqueConsistentColor = (userId: string, name: string) => {
    // If we already assigned a color to this user, return it
    if (userColorMap.has(userId)) {
        return userColorMap.get(userId)!;
    }

    // Extended color palette with 30 distinct colors
    const colors = [
        "bg-red-500", "bg-red-600",
        "bg-blue-500", "bg-blue-600",
        "bg-green-500", "bg-green-600",
        "bg-yellow-500", "bg-yellow-600",
        "bg-purple-500", "bg-purple-600",
        "bg-pink-500", "bg-pink-600",
        "bg-indigo-500", "bg-indigo-600",
        "bg-teal-500", "bg-teal-600",
        "bg-amber-500", "bg-amber-600",
        "bg-rose-500", "bg-rose-600",
        "bg-orange-500", "bg-orange-600",
        "bg-lime-500", "bg-lime-600",
        "bg-cyan-500", "bg-cyan-600",
        "bg-emerald-500", "bg-emerald-600",
        "bg-violet-500", "bg-violet-600"
    ];

    // Find first unused color
    const usedColors = new Set(userColorMap.values());
    let availableColor = colors.find(color => !usedColors.has(color));

    // If all colors are used, start reusing from beginning
    if (!availableColor) {
        availableColor = colors[0];
    }

    // Store the assignment
    userColorMap.set(userId, availableColor);
    return availableColor;
};

// Usage in your component


const PremiumTable: React.FC<TableProps> = ({
    columns,
    data,
    onEdit,
    onDelete,
    onRowClick,
    onMybidSelect,
    onMybidDrop,
    onMycandidatesDrop,
    onView,
    onTransactionseditSelect,
    onTransactionsdeleteSelect,
    loading = false,
}) => {
    const [selectedRow, setSelectedRow] = useState<any | null>(null);
    const [modalContent, setModalContent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    // Sorting functionality
    const sortedData = React.useMemo(() => {
        let sortableData = [...data];
        if (sortConfig !== null) {
            sortableData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [data, sortConfig]);

    // Filtering functionality
    const filteredData = React.useMemo(() => {
        return sortedData.filter(row => {
            // Global search
            const matchesSearch = Object.values(row).some(
                value => String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );

            // Column filters
            const matchesColumnFilters = Object.entries(columnFilters).every(
                ([key, filterValue]) =>
                    !filterValue || String(row[key]).toLowerCase().includes(filterValue.toLowerCase())
            );

            return matchesSearch && matchesColumnFilters;
        });
    }, [sortedData, searchTerm, columnFilters]);

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleOpenModal = (content: string) => {

        setModalContent(content);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
    };

    const toggleRowExpand = (id: string) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const renderCellContent = (column: TableColumn, row: any) => {
        const cellValue = row[column.key];
        const columnKey = column.key.toLowerCase();
        const columnHeader = column.headerName.toLowerCase();

        console.log(column, row, columnKey)

        // Create outside your component to maintain state


        // Usage in your component
        if (columnKey === "profileimage") {
            const userName = row.createdBy || "Anonymous";
            const userId = row.id; // Make sure you have a unique user identifier
            const colorClass = getUniqueConsistentColor(userId, userName);
            const initials = userName.substring(0, 2).toUpperCase();
            const uName = userName.split(" ");

            return (
                <div className="flex items-center space-x-3 min-w-[180px]">
                    <div className={`h-10 w-10 flex items-center justify-center rounded-full ${colorClass} text-white font-semibold shadow-lg`}>
                        {initials}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {uName[0]}
                            {uName.length > 1 && <span className="ml-1">{uName[1].charAt(0)}.</span>}
                        </div>
                        <div className="text-xs text-gray-500">
                            {row.email || row.userEmail }
                        </div>
                    </div>
                </div>
            );
        }

        // if (columnKey === "profileimage") {
        //     const userName = row.createdBy || "Anonymous";
        //     const initials = userName.substring(0, 2).toUpperCase();
        //     const colorClass = getConsistentUniqueColor(userName, row.id); // Pass user ID if available
        //     const uName = userName.split(" ");

        //     return (
        //         <div className="flex items-center space-x-3 min-w-[180px]">
        //             <div className={`h-10 w-10 flex items-center justify-center rounded-full ${colorClass} text-white font-semibold shadow-lg`}>
        //                 {initials}
        //             </div>
        //             <div>
        //                 <div className="text-sm font-medium text-gray-900">
        //                     {uName[0]}
        //                     {uName.length > 1 && <span className="ml-1">{uName[1].charAt(0)}.</span>}
        //                 </div>
        //                 <div className="text-xs text-gray-500">
        //                     {row.email || row.userEmail || 'No email'}
        //                 </div>
        //             </div>
        //         </div>
        //     );
        // }

        if (columnKey === "phone" && cellValue) {
            return `+${String(cellValue).replace(/\D/g, "")}`;
        }

        if (typeof cellValue === "number") {
            return cellValue.toLocaleString();
        }

        if (columnKey === "action") {
            const lowerCaseValue = String(cellValue).toLowerCase();
            let bgColor = "bg-gray-100 text-gray-800";
            if (lowerCaseValue.includes("update")) bgColor = "bg-orange-100 text-orange-800";
            else if (lowerCaseValue.includes("delete")) bgColor = "bg-red-100 text-red-800";
            else if (lowerCaseValue.includes("login")) bgColor = "bg-green-100 text-green-800";

            return (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor}`}>
                    {cellValue}
                </span>
            );
        }

        if (columnKey === "status") {
            let statusClass = "bg-gray-100 text-gray-800";
            if (cellValue?.toLowerCase() === "active") statusClass = "bg-green-100 text-green-800";
            else if (cellValue?.toLowerCase() === "pending") statusClass = "bg-yellow-100 text-yellow-800";
            else if (cellValue?.toLowerCase() === "inactive") statusClass = "bg-red-100 text-red-800";

            return (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                    {cellValue}
                </span>
            );
        }

        if (columnKey === "changelog" && columnHeader === 'changes') {
            const previewText = cellValue.split(/\s+/).slice(0, 2).join(' ');
            const isLongText = cellValue.split(/\s+/).length > 4;

            return (
                <div className="flex flex-col">
                    <div className="text-sm text-gray-700 line-clamp-1">
                        {previewText}
                    </div>
                    {/* {isLongText && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(cellValue);
                            }}
                            className="mt-1 text-sm text-blue-600 hover:text-blue-800 hover:underline self-start"
                        >
                            View more
                        </button>
                    )} */}
                </div>
            );
        }

        if (columnKey === "changelog" && columnHeader === 'view') {
            const previewText = cellValue.split(/\s+/).slice(0, 4).join(' ');
            const isLongText = cellValue.split(/\s+/).length > 4;

            return (
                <div className="flex flex-col">
                    {/* <div className="text-sm text-gray-700 line-clamp-2">
                        {cellValue}
                    </div> */}
                    {isLongText && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(cellValue);
                            }}
                            className="mt-1 text-sm text-blue-600 hover:text-blue-800 hover:underline self-start"
                        >
                            <FaRegEye />
                        </button>
                    )}
                </div>
            );
        }

        // if (columnKey === "changelog") {
        //     const previewText = cellValue.split(/\s+/).slice(0, 4).join(' ');
        //     const isLongText = cellValue.split(/\s+/).length > 4;

        //     return (
        //         <div className="flex flex-col">
        //             <div className="text-sm text-gray-700 line-clamp-2">
        //                 {cellValue}
        //             </div>
        //             {isLongText && (
        //                 <button
        //                     onClick={(e) => {
        //                         e.stopPropagation();
        //                         handleOpenModal(cellValue);
        //                     }}
        //                     className="mt-1 text-sm text-blue-600 hover:text-blue-800 hover:underline self-start"
        //                 >
        //                     View more
        //                 </button>
        //             )}
        //         </div>
        //     );
        // }

        if (typeof cellValue === "string" && (columnKey === "createdtime" || columnKey === "accessdate" || columnKey === 'updateat')) {
            return displayFormatDate(cellValue);
        }

        if (typeof cellValue === "string" && /\.(jpeg|jpg|gif|png|webp|svg|avif)$/i.test(cellValue)) {
            return (
                <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-200">
                    <img src={cellValue} alt="" className="h-full w-full object-cover" />
                </div>
            );
        }

        return cellValue;
    };

    const renderActionButtons = (row: any) => {
        const hasChangeLog = row.changelog && typeof row.changelog === 'string';
        const isLongChangeLog = hasChangeLog && row.changelog.split(/\s+/).length > 10;

        return (
            <div className="flex space-x-2 items-center justify-end">
                {onView && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();

                            // Keep your original onView functionality if needed
                            if (onView) {
                                onView(row);
                            }

                            // Show changelog in modal
                            if (row.changelog && typeof row.changelog === "string") {
                                handleOpenModal(row.changelog);
                            } else {
                                handleOpenModal("No changelog available.");
                            }
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                        aria-label="View"
                    >
                        <FaRegEye />
                    </button>
                )}


                {onEdit && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(row);
                        }}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                        aria-label="Edit"
                    >
                        <FaRegEdit />
                    </button>
                )}

                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(row);
                        }}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                        aria-label="Delete"
                    >
                        <FaTrashAlt />
                    </button>
                )}

                {isLongChangeLog && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(row.changelog);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap ml-2"
                    >
                        View More
                    </button>
                )}
            </div>
        );
    };


    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            {/* Table Controls */}
            {/* <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{filteredData.length} records</span>
                    <span className="hidden md:inline">|</span>
                    <span className="hidden md:inline">Sorted by: {sortConfig ? `${sortConfig.key} (${sortConfig.direction})` : 'None'}</span>
                </div>
            </div> */}

            {/* Table */}
            <div className="overflow-hidden rounded-sm border border-gray-200 shadow-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-green-600 text-white text-sm uppercase tracking-wider px-4 py-3">
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        // scope="col"
                                        className="px-4 py-3 text-left font-semibold"
                                        onClick={() => column.sortable && requestSort(column.key)}
                                    >
                                        <div className="flex items-center h-[40px]">
                                            {column.headerName}
                                            {column.sortable && (
                                                <span className="ml-2">
                                                    {sortConfig?.key === column.key ? (
                                                        sortConfig.direction === 'ascending' ? (
                                                            <FaChevronUp className="w-3 h-3 text-blue-500" />
                                                        ) : (
                                                            <FaChevronDown className="w-3 h-3 text-blue-500" />
                                                        )
                                                    ) : (
                                                        <span className="text-gray-300">
                                                            <FaChevronUp className="w-3 h-3" />
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                        </div>


                                        {/* {column.filterable && (
                                        <input
                                            type="text"
                                            placeholder={`Filter ${column.headerName}`}
                                            className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                                            value={columnFilters[column.key] || ''}
                                            onChange={(e) => setColumnFilters({
                                                ...columnFilters,
                                                [column.key]: e.target.value
                                            })}
                                        />
                                    )} */}
                                    </th>
                                ))}
                                {(onEdit || onDelete || onView) && (
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length + 1} className="px-4 py-3 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 1} className="px-4 py-3 text-center text-gray-500">
                                        No records found
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((row, rowIndex) => (
                                    <React.Fragment key={row.id || rowIndex}>
                                        <tr
                                            className={`hover:bg-gray-50 transition-colors ${selectedRow === row ? 'bg-blue-50' : ''} ${expandedRows[row.id] ? 'bg-gray-50' : ''}`}
                                            onClick={() => {
                                                if (onRowClick) onRowClick(row.id);
                                                setSelectedRow(row);
                                            }}
                                        >
                                            {columns.map((column) => (
                                                <td
                                                    key={column.key}
                                                    className={`px-4 py-3 whitespace-nowrap text-sm ${column.key.toLowerCase() === "changelog" ? "max-w-xs" : ""} ${column.key.toLowerCase() === "accessdate"
                                                        ? "w-[200px] min-w-[200px] max-w-[200px]"
                                                        : ""
                                                        }`}
                                                >
                                                    {renderCellContent(column, row)}
                                                </td>
                                            ))}

                                            {(onEdit || onDelete || onView) && (
                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                    {renderActionButtons(row)}
                                                </td>
                                            )}
                                        </tr>

                                        {expandedRows[row.id] && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={columns.length + 1} className="px-4 py-2">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
                                                        {columns.map(column => (
                                                            <div key={column.key} className="text-sm">
                                                                <span className="font-medium text-gray-500">{column.headerName}: </span>
                                                                <span className="text-gray-800">
                                                                    {renderCellContent(column, row)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination would go here */}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[10001] overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseModal}></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-lg transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                            Change Details
                                        </h3>
                                        <div className="mt-2">
                                            <div className="whitespace-pre-wrap font-mono text-sm">
                                                {modalContent}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-lg px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={handleCloseModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PremiumTable;