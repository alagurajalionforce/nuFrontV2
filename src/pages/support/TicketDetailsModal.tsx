import React from "react";

interface TicketDetailsModalProps {
    isOpen: boolean;
    isStatus:boolean;
    onClose: () => void;
    data: {
        id: string;
        name: string;
        userType: string;
        category: string;
        description: string;
        employeeName: string;
        employeeId: string | null;
        closingDate: string;
        raiseDate: string;
        status: string | null;
        createAt: string;
        updateAt: string;
        savePathList: string[];
        viewPathList: string[] | null;
    };
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ isOpen, onClose, data, isStatus }) => {
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
                <h2 className="text-xl font-semibold mb-4 text-green-700">Ticket Details</h2>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>ID:</strong> {data.id}</div>
                    <div><strong>Name:</strong> {data.name}</div>
                    <div><strong>User Type:</strong> {data.userType}</div>
                    <div><strong>Category:</strong> {data.category}</div>
                    <div><strong>Description:</strong> {data.description}</div>
                    <div><strong>Employee:</strong> {data.employeeName || "Unassigned"}</div>
                    <div><strong>Raise Date:</strong> {data.raiseDate}</div>
                    {isStatus && (<>
                        <div><strong>Closing Date:</strong> {data.closingDate}</div>
                        <div><strong>Status:</strong> {data.status || "Pending"}</div>
                    </>)}
                    
                </div>

                {data.viewPathList && data.viewPathList.length > 0 && (
                    <div className="mt-4">
                        <p className="font-semibold mb-2">Screenshots:</p>
                        <div className="flex gap-2 flex-wrap">
                            {data.viewPathList.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`screenshot-${index}`}
                                    className="w-20 h-20 object-cover border rounded"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketDetailsModal;
