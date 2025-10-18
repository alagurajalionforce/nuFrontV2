import React from "react";
import DatePicker from "react-datepicker";
import { getYear, getMonth } from "date-fns"; // Removed `set` as it wasn't used, and `lodash`'s `range` is often replaced by simple JS array generation or used directly if lodash is a dependency.
import { FaCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
// You might need to import your own global styles or create a separate CSS file for these
// import "../CustomDatePicker.css"; 

interface CustomDatePickerProps {
    selectedDate: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    // maxDate?: Date; // Removed as you are setting minDate below, and maxDate is not used in this specific context (it's for DOB, not deal dates)
    error?: string;
    className?: string;
    showIcon: boolean;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
    selectedDate,
    onChange,
    placeholder = "dd-mm-yyyy",
    // maxDate = new Date(), // This default to new Date() makes it unsuitable for "to date" fields that can be in the future. Better to pass it explicitly from parent.
    error,
    className,
    showIcon,
}) => {
    const currentYear = new Date().getFullYear();
    // For deal dates, `years` should likely go beyond the current year.
    // Let's assume you want to allow a few years into the future for deals.
    const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i); // From 10 years ago to 10 years in future

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="relative w-full">
            <DatePicker
                placeholderText={placeholder}
                selected={selectedDate}
                onChange={onChange}
                dateFormat="dd-MM-yyyy"
                minDate={new Date()} // Ensures only today or future dates can be selected
                className={className}
                // popperClassName="custom-datepicker-popper" // Consider removing this if it's problematic
                // popperPlacement="auto" // Let react-datepicker try to find the best placement
                withPortal // <-- ADD THIS FOR BETTER MOBILE BEHAVIOR
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
                    <FaCalendarAlt className="text-gray-400" />
                </div>
            )}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default CustomDatePicker;