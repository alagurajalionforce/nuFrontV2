import React from 'react';
import Select, { Props as SelectProps, StylesConfig } from 'react-select';

const customStyles: StylesConfig = {
    control: (provided, state) => ({
        ...provided,
        textAlign: 'left',
        padding: '3px 4px',
        borderRadius: '8px',
        border: state.isFocused ? '2px solid #6EE7B7' : '2px solid #E5E7EB', // gray-200 when not focused
        boxShadow: 'none',
        fontSize: '14px',
        transition: 'border-color 0.2s ease',
        '&:hover': {
            borderColor: state.isFocused ? '#6EE7B7' : '#D1D5DB', // green on focus, gray-300 on hover
        },
    }),
    option: (provided, state) => ({
        ...provided,
        padding: '6px 10px',
        textAlign: 'left',
        backgroundColor: state.isSelected ? '#ECFDF5' : 'white',
        color: state.isSelected ? '#065F46' : provided.color,
        '&:hover': {
            backgroundColor: '#D1FAE5',
        },
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 20,
    }),
};



interface CustomSelectProps extends SelectProps {
    label?: string;
}

const CustomerSelect: React.FC<CustomSelectProps> = ({ label, value, ...props }) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <Select
                styles={customStyles}
                value={value}
                className="react-select-container"
                classNamePrefix="react-select"
                {...props}
            />
        </div>
    );
};

export default CustomerSelect;