import React from "react";

interface TicketDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        id: number;
        employeeId?: string;
        name: string;
        position: string;
        department: string;
        email: string;
        phone: string;
        shift: string;
    };
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ isOpen, onClose, data }) => {
    if (!data) return null;
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-[10000] flex items-center justify-center">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative">
                <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-black"
                    onClick={onClose}
                >
                    ✕
                </button>
                <h2 className="text-xl font-semibold mb-4 text-green-700">Employee Details</h2>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>ID:</strong> {data.id}</div>
                    <div><strong>Name:</strong> {data.name}</div>
                    <div><strong>Position:</strong> {data.position}</div>
                    <div><strong>Department:</strong> {data.department}</div>
                    <div><strong>Email:</strong> {data.email}</div>
                    <div><strong>Phone:</strong> {data.phone}</div>
                    <div><strong>Shift:</strong> {data.shift}</div>

                </div>


            </div>
        </div>
    );
};

export default TicketDetailsModal;
