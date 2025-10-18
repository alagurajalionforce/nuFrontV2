import React from 'react';
import LoadingSpinner from '../utils/LoadingSpinner';

interface DeletePopupProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemId: string;
    loading: boolean;
}

const DeletePopup: React.FC<DeletePopupProps> = ({ isOpen, onClose, onConfirm, itemId, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[10000]">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-4 md:mx-auto md:max-w-md">
                <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
                <p className="mb-6">Are you sure you want to delete this item?</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className='flex items-center'>
                                <LoadingSpinner />
                                <span className='ml-1'>Deleting...</span>
                            </div>
                        ) : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeletePopup;
