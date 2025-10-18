import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    handlePageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    handlePageChange,
}) => {
    // Helper function to generate page numbers with ellipsis
    const generatePageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxPagesToShow = 3; // Number of pages to show at a time
        const halfMaxPages = Math.floor(maxPagesToShow / 2);

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total is less than maxPagesToShow
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Add first page
            pages.push(0);

            let startPage = Math.max(1, currentPage - halfMaxPages);
            let endPage = Math.min(totalPages - 2, currentPage + halfMaxPages);

            // Adjust if at the beginning or end
            if (currentPage < halfMaxPages) {
                endPage = maxPagesToShow - 2;
            } else if (currentPage > totalPages - halfMaxPages - 2) {
                startPage = totalPages - maxPagesToShow + 1;
            }

            // Add ellipsis if needed
            if (startPage > 1) {
                pages.push('...');
            }

            // Add range of pages
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Add ellipsis if needed
            if (endPage < totalPages - 2) {
                pages.push('...');
            }

            // Add last page
            pages.push(totalPages - 1);
        }

        return pages;
    };

    const pageNumbers = generatePageNumbers();

    return (
        <div className="flex justify-center items-center">

            {Number(pageNumbers) === 0 ? '' : (
                <nav
                    className="isolate  inline-flex -space-x-px rounded-md shadow-sm py-2"
                    aria-label="Pagination"
                >
                    {/* First Button */}
                    {/* <button
                        onClick={() => handlePageChange(0)}
                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${currentPage !== 0
                            ? 'text-blue-400 hover:bg-gray-200 cursor-pointer'
                            : 'cursor-not-allowed'
                            }`}
                        disabled={currentPage === 0}
                    >
                        First
                    </button> */}

                    {/* Previous Button */}
                    <button
                        onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                        className={`relative border inline-flex items-center px-2 py-2 ${currentPage !== 0
                            ? 'text-blue-600 hover:bg-gray-200 cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed'
                            }`}
                        disabled={currentPage === 0}
                    >
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>

                    {/* Page Numbers with Ellipsis */}
                    {pageNumbers.map((page, index) =>
                        typeof page === 'number' ? (
                            <button
                                key={index + 1}
                                onClick={() => handlePageChange(page)}
                                aria-current={currentPage === page ? 'page' : undefined}
                                className={`relative border rounded-md inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === page
                                    ? 'bg-green-600 text-white'
                                    : 'text-gray-900 hover:bg-gray-200'
                                    }`}
                                style={{ margin: '4px' }}
                            >
                                {page + 1}
                            </button>
                        ) : (
                            <span
                                key={index + 1}
                                className="relative inline-flex items-center px-4 py-2 gap-2 text-sm text-gray-500"
                            >
                                {page}
                            </span>
                        )
                    )}

                    {/* Next Button */}
                    <button
                        onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                        className={`relative border inline-flex items-center px-2 py-2 ${currentPage !== totalPages - 1
                            ? 'text-blue-600 hover:bg-gray-200 cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed'
                            }`}
                        disabled={currentPage === totalPages - 1}
                    >
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>

                    {/* Last Button */}
                    {/* <button
                        onClick={() => handlePageChange(totalPages - 1)}
                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${currentPage !== totalPages - 1
                            ? 'text-blue-600 hover:bg-gray-200 cursor-pointer'
                            : 'cursor-not-allowed'
                            }`}
                        disabled={currentPage === totalPages - 1}
                    >
                        Last
                    </button> */}
                </nav>
            )}
        </div>
    );
};

export default Pagination;



