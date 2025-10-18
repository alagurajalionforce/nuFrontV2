import React from "react";
import { FaEye, FaEyeSlash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { displayFormatDate, truncateDescription } from "../utils/commonFunctions";
import RowActionsMenu from './RowActionsMenu';
import ImageFetcher from './ImageFetcher';
import { FiMapPin } from "react-icons/fi";
import { GiRotaryPhone } from "react-icons/gi";
import { MdOutlineAttachEmail, MdComputer } from "react-icons/md";
import { IoMdRadioButtonOn, IoIosTimer } from "react-icons/io";
import { BiCategory } from "react-icons/bi";
import { GrUserWorker } from "react-icons/gr";





// --- Type Definitions ---
type ColumnHeader = {
    key: string;
    headerName: string;
    sortable?: boolean;
};

interface Props {
    columns: ColumnHeader[];
    data: Record<string, any>[];
    viewDetails?: (record: Record<string, any>) => void;
    viewTxn?: (record: Record<string, any>) => void;
    onDelete?: (record: Record<string, any>) => void;
    onEdit?: (record: Record<string, any>) => void;
    viewImage?: (record: Record<string, any>) => void;
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
}

const getConsistentColor = (name: string) => {
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
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const isNameColumn = (key: string) => ["businessName", "employeeName", "name"].includes(key);

// --- Component ---
const ResponsiveTable: React.FC<Props> = ({
    columns,
    data,
    viewDetails,
    viewTxn,
    onDelete,
    onEdit,
    viewImage,
    onSort,
    sortColumn,
    sortDirection
}) => {
    // Filter out the businessImagePath column from the list of columns
    const filteredColumns = columns.filter(
        (col) => col.key !== 'businessImagePath' && col.key !== 'userImagePath'
    );

    const handleSort = (key: string) => {
        if (!onSort || !columns.find(c => c.key === key)?.sortable) return;

        if (sortColumn === key) {
            onSort(key, sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            onSort(key, 'asc');
        }
    };

    return (
        <div className="overflow-hidden rounded-sm border border-gray-200 shadow-lg">
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white divide-y divide-gray-200">
                    <thead>
                        <tr className="bg-green-600 text-white text-sm uppercase tracking-wider">
                            {filteredColumns.flatMap((col) =>
                                isNameColumn(col.key)
                                    ? [
                                        <th
                                            key={`${col.key}-combined`}
                                            className="px-4 py-3 text-left font-semibold"
                                            colSpan={2}
                                        >
                                            <div className="flex items-center">
                                                {col.headerName}
                                                {col.sortable && onSort && (
                                                    <button
                                                        onClick={() => handleSort(col.key)}
                                                        className="ml-2 focus:outline-none"
                                                    >
                                                        {sortColumn === col.key ? (
                                                            sortDirection === 'asc' ? (
                                                                <FaChevronUp className="w-3 h-3" />
                                                            ) : (
                                                                <FaChevronDown className="w-3 h-3" />
                                                            )
                                                        ) : (
                                                            <FaChevronDown className="w-3 h-3 opacity-50" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </th>
                                    ]
                                    : [
                                        <th
                                            key={col.key}
                                            className="px-4 py-3 text-left font-semibold"
                                        >
                                            <div className="flex items-center">
                                                {col.headerName}
                                                {col.sortable && onSort && (
                                                    <button
                                                        onClick={() => handleSort(col.key)}
                                                        className="ml-2 focus:outline-none"
                                                    >
                                                        {sortColumn === col.key ? (
                                                            sortDirection === 'asc' ? (
                                                                <FaChevronUp className="w-3 h-3" />
                                                            ) : (
                                                                <FaChevronDown className="w-3 h-3" />
                                                            )
                                                        ) : (
                                                            <FaChevronDown className="w-3 h-3 opacity-50" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </th>
                                    ]
                            )}
                            {(viewDetails || onDelete || viewTxn || viewImage || onEdit) && (
                                <th className="px-4 py-3 text-left font-semibold">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                className={`transition-colors ${rowIndex % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-50"}`}
                            >
                                {filteredColumns.flatMap((col) => {
                                    const value = row[col.key];
                                    const key = col.key;

                                    if (isNameColumn(key)) {
                                        const nameValue = row[key];
                                        const imagePath =
                                            key === "businessName"
                                                ? row.businessImagePath
                                                : key === "name"
                                                    ? row.userImagePath
                                                    : undefined;

                                        const initials = nameValue?.substring(0, 2).toUpperCase() || "";
                                        const colorClass = getConsistentColor(nameValue || "");

                                        return [
                                            <td key={`${key}-img`} className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {imagePath ? (
                                                            <ImageFetcher
                                                                fileName={imagePath}
                                                                altText={`${nameValue}'s image`}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                                fallbackText={nameValue || "N/A"}
                                                            />
                                                        ) : (
                                                            <div
                                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${initials === '' ? 'bg-gray-300' : colorClass}`}
                                                            >
                                                                {initials}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>,
                                            <td key={`${key}-text`} className="px-1 py-1 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {nameValue}
                                                </div>
                                            </td>
                                        ];
                                    }

                                    // Handle dates
                                    if (typeof value === "string" && ["createdDt", "updatedDt", "updateAt"].includes(key)) {
                                        return (
                                            <td key={key} className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {displayFormatDate(value)}
                                                </div>
                                            </td>
                                        );
                                    }

                                    // Phone number merge
                                    if (["businessPhoneNo", "phoneNumber", "phone"].includes(key)) {
                                        const phone = row.businessPhoneNo || row.phoneNumber || row.phone;
                                        return (
                                            <td key={key} className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex gap-2 text-sm text-gray-900">
                                                    <GiRotaryPhone className="mt-1" /> <span>+234 {phone}</span> 
                                                </div>
                                            </td>
                                        );
                                    }

                                    // Description
                                    if (key === "description") {
                                        return (
                                            <td key={key} className="px-4 py-3">
                                                <div className="text-sm text-gray-900">
                                                    {truncateDescription(value, 1)}
                                                </div>
                                            </td>
                                        );
                                    }

                                    // Boolean
                                    if (typeof value === "boolean") {
                                        return (
                                            <td key={key} className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {value ? "Yes" : "No"}
                                                </span>
                                            </td>
                                        );
                                    }

                                    // Locations
                                    // if (key === "locations" && Array.isArray(value)) {
                                    //     return (
                                    //         <td key={key} className="px-4 py-3">
                                    //             {value.map((loc: any, index: number) => (
                                    //                 <div key={index} className="text-sm">
                                    //                     <div className="font-medium text-gray-900">{`${loc.homeNumber}, ${loc.street}`}</div>
                                    //                     <div className="text-gray-500">{`${loc.city}, ${loc.country}`}</div>
                                    //                 </div>
                                    //             ))}
                                    //         </td>
                                    //     );
                                    // }
                                    if (key === "locations" && Array.isArray(value)) {
                                        return (
                                            <td key={key} className=" px-4 py-3 min-w-[300px] max-w-[400px]">
                                                <div className="flex gap-3 space-y-2">
                                                    <FiMapPin className="mt-2"/>
                                                    {value.map((loc: any, index: number) => (
                                                        <div key={index} className="text-sm">
                                                            <div className="font-medium text-gray-900">
                                                                {loc.homeNumber && loc.street
                                                                    ? `${loc.homeNumber}, ${loc.street}`
                                                                    : 'Address not specified'}
                                                            </div>
                                                            {loc.city && loc.country && (
                                                                <div className="text-gray-500">
                                                                    {`${loc.city}, ${loc.country}`}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        );
                                    }

                                    if (
                                        key.toLowerCase() === 'created' ||
                                        key.toLowerCase() === 'raisedate' ||
                                        key.toLowerCase() === 'closingdate' ||
                                        key.toLowerCase() === 'updateat'
                                    ) {
                                        return (
                                            <td key={key} className="px-4 py-3 min-w-[250px]">
                                                <div className="text-sm text-gray-900">
                                                    {value}
                                                </div>
                                            </td>
                                        );
                                    }

                                    // Number / Money formatting
                                    if (typeof value === "number") {
                                        const formatted = key === "noOfDay" ? value : `₦ ${value.toLocaleString()}`;
                                        return (
                                            <td key={key} className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatted}
                                                </div>
                                            </td>
                                        );
                                    }
                                    //MdComputer

                                    if (key === "department") {
                                        return (
                                            <td key={key} className="px-4 py-3">
                                                <div className="flex gap-2 text-sm text-gray-900">
                                                    <MdComputer className="mt-1" />
                                                    <span>{value}</span>
                                                </div>
                                            </td>
                                        );
                                    }

                                    if (key === "shift") {
                                        return (
                                            <td key={key} className="px-4 py-3">
                                                <div className="flex gap-2 text-sm text-gray-900">
                                                    <IoIosTimer className="mt-1" />
                                                    <span>{value}</span>
                                                </div>
                                            </td>
                                        );
                                    }

                                    if (key === "email") {
                                        return (
                                            <td key={key} className="px-4 py-3">
                                                <div className="flex gap-2 text-sm text-gray-900">
                                                    <MdOutlineAttachEmail className="mt-1" />
                                                    <span>{value}</span>
                                                </div>
                                            </td>
                                        );
                                    }

                                    if (key === "position") {
                                        return (
                                            <td key={key} className="px-4 py-3">
                                                <div className="flex gap-2 text-sm text-gray-900">
                                                    <GrUserWorker className="mt-1" />
                                                    <span>{value}</span>
                                                </div>
                                            </td>
                                        );
                                    }

                                    if (key === "status") {
                                        const normalizedValue = value ? value.toString().toLowerCase() : "";

                                        const statusColor =
                                            normalizedValue === "pending"
                                                ? "text-orange-600"
                                                : normalizedValue === "verified" || normalizedValue === "completed"
                                                    ? "text-green-600"
                                                    :  normalizedValue === "open"
                                                            ? "text-blue-600"
                                                            : "text-gray-400";


                                        return (
                                            <td key={key} className="px-4 py-3">
                                                <div className="flex gap-2 text-sm">
                                                    <IoMdRadioButtonOn className={`mt-1 ${statusColor}`} />
                                                    <span className={statusColor}>{value ?? "N/A"}</span>
                                                </div>
                                            </td>
                                        );
                                    }


                                    //category

                                    if (key === "category") {
                                        return (
                                            <td key={key} className="px-4 py-3">
                                                <div className="flex gap-2 text-sm text-gray-900">
                                                    <BiCategory className="mt-1" />
                                                    <span>{value}</span>
                                                </div>
                                            </td>
                                        );
                                    }


                                    // Default fallback
                                    return (
                                        <td
                                            key={key}
                                            className={`px-4 py-3 whitespace-nowrap `}
                                        >
                                            <div className="text-sm text-gray-900">
                                                {value ?? "-"}
                                            </div>
                                        </td>
                                    );
                                })}

                                {/* Actions column */}
                                {(viewDetails || onDelete || viewTxn || viewImage || onEdit) && (
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <RowActionsMenu
                                            row={row}
                                            viewDetails={viewDetails}
                                            viewTxn={viewTxn}
                                            onDelete={onDelete}
                                            viewImage={viewImage}
                                            onEdit={onEdit}
                                            rowIndex={rowIndex}
                                            totalRows={data.length}
                                        />
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResponsiveTable;