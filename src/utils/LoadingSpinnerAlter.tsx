import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-black border-solid border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
};

export default LoadingSpinner;
