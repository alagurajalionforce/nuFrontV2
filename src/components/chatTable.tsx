import React from "react";
import { FaRegEdit, FaTrashAlt, FaRegEye, FaEllipsisV } from "react-icons/fa";
import { displayFormatDate, formatDatewithSlash, truncateDescription } from "../utils/commonFunctions";
import RowActionsMenu from './RowActionsMenu';
import ImageFetcher from './ImageFetcher';

type ColumnHeader = {
    key: string;
    headerName: string;
    width?: string;
};

interface Props {
    columns: ColumnHeader[];
    data: Record<string, any>[];
    viewDetails?: (record: Record<string, any>) => void;
    viewTxn?: (record: Record<string, any>) => void;
    onDelete?: (record: Record<string, any>) => void;
    onEdit?: (record: Record<string, any>) => void;
    viewImage?: (record: Record<string, any>) => void;
    className?: string;
}

const getConsistentColor = (name: string) => {
    const colors = [
        "bg-red-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-indigo-500",
        "bg-teal-500",
        "bg-amber-500",
        "bg-rose-500"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const renderCellContent = (columnKey: string, value: any, row: Record<string, any>) => {
    // Name columns with avatars
    if (["businessName", "name", "merchantName"].includes(columnKey)) {
        const name = row[columnKey] || "Anonymous";
        const imagePath =
            columnKey === "businessName" ? row.businessImagePath :
                columnKey === "name" ? row.userImagePath :
                    null;

        const initials = name.substring(0, 2).toUpperCase();
        const colorClass = getConsistentColor(name);
        const displayName = truncateDescription(name, 2) ?? "-";

        return (
            <div className="flex items-center space-x-3">
                {imagePath ? (
                    <ImageFetcher
                        fileName={imagePath}
                        altText={`${name}'s image`}
                        className="w-9 h-9 rounded-full object-cover"
                        fallbackText={name}
                    />
                ) : (
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium ${colorClass}`}>
                        {initials}
                    </div>
                )}
                <span className="font-medium text-gray-800">{displayName}</span>
            </div>
        );
    }

    // Locations
    if (columnKey === "locations" && Array.isArray(value)) {
        return (
            <div className="space-y-1">
                {value.map((loc, index) => (
                    <div key={index} className="text-sm">
                        <div className="font-medium text-gray-800">{`${loc.homeNumber || ''}, ${loc.street || ''}`}</div>
                        <div className="text-gray-500">{`${loc.city || ''}, ${loc.country || ''}`}</div>
                    </div>
                ))}
            </div>
        );
    }

    // Phone numbers
    if (["businessPhoneNo", "phoneNumber", "phone"].includes(columnKey)) {
        const phone = row.businessPhoneNo || row.phoneNumber || row.phone;
        return phone ? `+234 ${phone}` : "-";
    }

    // Description
    if (columnKey === "description") {
        return (
            <div className="text-gray-700">
                {truncateDescription(value, 1) || "-"}
            </div>
        );
    }

    // Boolean values
    if (typeof value === "boolean") {
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                {value ? "Yes" : "No"}
            </span>
        );
    }

    // Dates
    if (["createdDt", "updatedDt", "updateAt"].includes(columnKey) && typeof value === "string") {
        return (
            <div className="flex flex-col">
                <span className="text-gray-800">{displayFormatDate(value)}</span>
                <span className="text-xs text-gray-500">{formatDatewithSlash(value)}</span>
            </div>
        );
    }

    // Numbers/currency
    if (typeof value === "number") {
        return columnKey === "noOfDay" ?
            value :
            <span className="font-medium">{value.toLocaleString()}</span>;
    }

    // Default
    return <span className="text-gray-800">{value ?? "-"}</span>;
};

const ResponsiveTable: React.FC<Props> = ({
    columns,
    data,
    viewDetails,
    viewTxn,
    onDelete,
    onEdit,
    viewImage,
    className = ""
}) => {
    const filteredColumns = columns.filter(col => !["businessImagePath", "userImagePath"].includes(col.key));

    return (
        <div className="overflow-hidden rounded-sm border border-gray-200 shadow-lg">
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white divide-y divide-gray-200">
                    <thead className="bg-green-600  h-[50px]">
                        <tr className="bg-green-600 text-white text-sm uppercase tracking-wider px-4 py-3 h-[50px]">
                            {filteredColumns.map((col) => (
                                <th
                                    key={col.key}
                                    //scope="col"
                                    // className={`px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider ${col.width ? col.width : ""
                                    //     }`}
                                    className="px-4 py-3 text-left font-semibold h-[50px]"
                                >
                                    {col.headerName}
                                </th>
                            ))}
                            {(viewDetails || onDelete || viewTxn || viewImage || onEdit) && (
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider h-[50px]">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {data.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                {filteredColumns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={`px-4 py-3 whitespace-nowrap text-sm ${["createdDt", "updatedDt", "updateAt"].includes(col.key) ?
                                                "min-w-[180px]" : ""
                                            }`}
                                    >
                                        {renderCellContent(col.key, row[col.key], row)}
                                    </td>
                                ))}
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

            {data.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    No data available
                </div>
            )}
        </div>
    );
};

export default ResponsiveTable;