// components/CustomDatePicker.tsx
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { getYear, getMonth, set } from "date-fns";
import { range } from "lodash";
import { FaCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";

interface CustomDatePickerProps {
    selectedDate: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    maxDate?: Date;
    error?: string;
    className?: string;
    showIcon: boolean;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
    selectedDate,
    onChange,
    placeholder = "dd-mm-yyyy",
    maxDate = new Date(),
    error,
    className,
    showIcon,
}) => {
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear; // Age validation: only allow DOB for 18+
    const years = range(1950, maxYear + 1);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Set default DOB to Jan 1st of maxYear (e.g., 2007)
    // useEffect(() => {
    //     if (!selectedDate) {
    //         const defaultDate = new Date(maxYear, 0, 1); // Jan 1, maxYear
    //         onChange(defaultDate);
    //     }
    // }, [selectedDate, maxYear, onChange]);

    return (
        <div className="relative w-full">
            <DatePicker
                placeholderText={placeholder}
                selected={selectedDate}
                onChange={onChange}
                dateFormat="dd-MM-yyyy"
                maxDate={new Date()}
                className={className}
                popperClassName="custom-datepicker-popper"
                renderCustomHeader={({
                    date,
                    changeYear,
                    changeMonth,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                }) => (
                    <div className="flex w-full justify-center gap-2 py-2 items-center">
                        <button
                            type="button"
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                            className="px-2 py-1 text-sm text-gray-600"
                        >
                            {"<"}
                        </button>
                        <select
                            value={months[getMonth(date)]}
                            onChange={({ target: { value } }) =>
                                changeMonth(months.indexOf(value))
                            }
                            className="px-2 py-1 border rounded"
                        >
                            {months.map((month) => (
                                <option key={month} value={month}>
                                    {month}
                                </option>
                            ))}
                        </select>
                        <select
                            value={getYear(date)}
                            onChange={({ target: { value } }) => changeYear(parseInt(value))}
                            className="px-2 py-1 border rounded"
                        >
                            {years.map((year: number) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                            className="px-2 py-1 text-sm text-gray-600"
                        >
                            {">"}
                        </button>
                    </div>
                )}
            />
            {showIcon && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {/* <FaCalendarAlt className="text-gray-400" /> */}
                </div>
            )}
            {/* {error && <p className="text-red-500 text-xs mt-1">{error}</p>} */}
        </div>
    );
};

export default CustomDatePicker;
