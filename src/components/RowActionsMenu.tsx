// RowActionsMenu.tsx
import React, { useState, useRef, useEffect } from "react";
import { FaRegEdit, FaTrashAlt, FaRegEye, FaEllipsisV, FaImage } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";

// Define the Customer type (make sure it matches ResponsiveTable.tsx)
interface RowActionsMenuProps {
    row: any;
    viewDetails?: (record: any) => void;
    viewTxn?: (record: any) => void;
    onDelete?: (record: any) => void;
    viewImage?: (record: any) => void;
    onEdit?: (record: any) => void;
    rowIndex: number;   // New prop: current row index
    totalRows: number;  // New prop: total number of rows
}

const RowActionsMenu: React.FC<RowActionsMenuProps> = ({ row, viewDetails, viewTxn, onDelete, viewImage, onEdit, rowIndex, totalRows }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Determine if this is the last row
    const isLastRow = rowIndex === totalRows - 1;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = () => {
        setIsOpen(prev => !prev);
    };

    const handleActionClick = (actionFn: ((record: any) => void) | undefined) => {
        actionFn?.(row);
        setIsOpen(false);
    };

    // Dynamically apply classes for positioning
    const menuPositionClasses = isLastRow
        ? 'bottom-0 mb-0' : 'top-0 mt-0';
    const menuHorizontalAlignmentClass = 'left-0 ml-[-8rem]'; // Adjust ml-[-8rem] as needed

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={toggleMenu}
                className="p-2 text-gray-600 hover:text-black"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <FaEllipsisV />
            </button>

            {isOpen && (
                <div
                    // Combine dynamic positioning classes
                    className={`absolute w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 ${menuPositionClasses} ${menuHorizontalAlignmentClass}`}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby={`actions-menu-button-${row.id}`}
                >
                    <div className="py-1 text-sm text-gray-700" role="none">
                        {viewDetails && (
                            <button
                                onClick={() => handleActionClick(viewDetails)}
                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                                role="menuitem"
                            >
                                <FaRegEye /> View Info
                            </button>
                        )}
                        {viewTxn && (
                            <button
                                onClick={() => handleActionClick(viewTxn)}
                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                                role="menuitem"
                            >
                                <GrTransaction /> View Txn
                            </button>
                        )}
                        {viewImage && (
                            <button
                                onClick={() => handleActionClick(viewImage)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100"
                                role="menuitem"
                            >
                                <FaImage /> View Image
                            </button>
                        )}
                        {onEdit && (
                            <button
                                onClick={() => handleActionClick(onEdit)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-gray-100"
                                role="menuitem"
                            >
                                <FaRegEdit /> Edit
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => handleActionClick(onDelete)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100"
                                role="menuitem"
                            >
                                <FaTrashAlt /> Delete
                            </button>
                        )}
                        
                    </div>
                </div>
            )}
        </div>
    );
};

export default RowActionsMenu;