import React, { useEffect, useState } from 'react';
import Navbar from '../../layout/Navbar';
import apiRequest from '../../utils/helpers/apiRequest';
import toast from 'react-hot-toast';
import { hasAccess, PageSize } from '../../utils/commonFunctions';
import { useDebounce } from '../../utils/useDebounce';
import Table from '../../components/responsTable';
import Pagination from '../../components/Pagination';
import DeletePopup from '../../components/DeletePopup';
import { FaTimes } from 'react-icons/fa';
import TicketDetailsModal from './empDetailsModal';
import Loader from '../../utils/loader';

interface Employee {
    id?: any;
    employeeId?: string;
    name: string;
    position: string;
    department: string;
    email: string;
    phone: string;
    shift: string;
    roleName: string;
    loginAccess: any;
    password?: any;
}

const EmployeeManager: React.FC = () => {

    const canAdd = hasAccess("Employee Manager", "privilegeCreate");
    const canEdit = hasAccess("Employee Manager", "privilegeUpdate");
    const canDelete = hasAccess("Employee Manager", "privilegeDelete");

    const [loader, setLoader] = useState(false);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [roles, setRoles] = useState<[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState<Employee>({
        // employeeId: '',
        id: '',
        name: '',
        position: '',
        department: '',
        email: '',
        phone: '',
        shift: '',
        roleName: '',
        password: '',
        loginAccess: false,
    });
    const [currentPage, setCurrentPage] = useState(0);
    const [searchEmpTerms, setSearchEmpTerms] = useState<any>('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ticketDetails, setTicketDetails] = useState<any>(null);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

    const [empData, setEmpData] = useState({
        pageData: [],
        totalPages: 0,
        totalRows: 0,
    });

    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);

    const debouncedSearchEmpTerm = useDebounce(searchEmpTerms, 600);

    const columnHeader = [
        { key: "name", headerName: "Name" },
        { key: "position", headerName: "position" },
        { key: "department", headerName: "department" },
        { key: "email", headerName: "email" },
        { key: "phone", headerName: "phone" },
        { key: "shift", headerName: "shift" },

    ];

    const [pageSize, setPageSize] = useState<number>(10);

    const selectPages = (e: any) => {
        const { name, value } = e.target;

        setPageSize(value);
        setCurrentPage(0);
    };


    const closeDeletePopup = () => {
        setSelectedId(null);
        setIsDeletePopupOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Update form data unconditionally to allow typing
        // setFormData(prev => ({ ...prev, [name]: value }));

        // Optional: Validate email and phone
        if (name === 'email') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailPattern.test(value)) {
                console.warn('Invalid email format');

            }
        }

        if (name === 'phone') {
            const onlyDigits = value.replace(/\D/g, ''); // Remove non-numeric input
            if (onlyDigits.length > 10) return;

            setFormData(prev => ({ ...prev, [name]: onlyDigits }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };



    const openModal = (employee?: Employee) => {
        if (employee) {
            setEditMode(true);
            setCurrentEmployee(employee);
            setFormData({
                // employeeId: employee.employeeId,
                name: employee.name,
                position: employee.position,
                department: employee.department,
                email: employee.email,
                phone: employee.phone,
                shift: employee.shift,
                roleName: employee.roleName,
                loginAccess: employee.loginAccess,
            });
        } else {
            setEditMode(false);
            setCurrentEmployee(null);
            setFormData({
                // employeeId: '',
                name: '',
                position: '',
                department: '',
                email: '',
                phone: '',
                shift: '',
                roleName: '',
                password: '',
                loginAccess: false,
            });
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setFormData({
            // employeeId: '',
            name: '',
            position: '',
            department: '',
            email: '',
            phone: '',
            shift: '',
            roleName: '',
            password: '',
            loginAccess: false,
        });
        setCurrentEmployee(null);
        setEditMode(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { id, name, position, department, email, phone, shift, loginAccess, roleName, password } = formData;

        // Email & phone validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phonePattern = /^[0-9]{10}$/;

        if (!emailPattern.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        if (!phonePattern.test(phone)) {
            toast.error("Please enter a valid 10-digit phone number.");
            return;
        }

        const payLoad = {
            name,
            position,
            department,
            email,
            phone,
            shift,
            roleName,
            loginAccess,
            password,
            ...(editMode && {
                id
            }),
        };

        //console.log(payLoad, 'payLoad')

        const url = editMode ? 'updateEmployee' : 'addEmployee'
        try {
            const req = await apiRequest(url, payLoad);

            if (req?.error) {
                toast.error(req?.error);
                return;
            }

            if (req?.data) {
                setTicketDetails(req?.data);
                setIsTicketModalOpen(true);
                closeModal();
                getIEmpList();
            }
        } catch (err) {
            toast.error("Something went wrong!");
            console.error(err);
        }
    };


    const getIEmpList = async () => {

        const queryParams = [
            searchEmpTerms ? `employeeName=${debouncedSearchEmpTerm.toLowerCase()}` : '',
            `page=${currentPage}`,
            `size=${pageSize}`,
        ]
            .filter(Boolean)
            .join("&");

        try {
            setLoader(true);
            const req = await apiRequest(`app/getEmployeeList${queryParams ? `?${queryParams}` : ''}`)
            //console.log(req?.data?.pageData)


            if (req?.error) {
                toast.error(req?.error || 'No Data Fount');
            }

            const pageData = req.data.pageData?.filter((data: any) => data?.name !== 'Super_Admin')

            if (req?.data?.pageData) {

                setEmpData({
                    pageData: pageData,
                    totalPages: req.data.totalPages,
                    totalRows: req.data.totalRows,
                })
            }


        } catch (error: any) {
            toast.error(error?.error)
        } finally {
            setLoader(false);
        }
    }

    const deleteRow = async (row: any) => {
        //console.log("Delete row:", row);
        setSelectedId(row?.id);
        setIsDeletePopupOpen(true);
    }

    const handleEdit = (row: any) => {

        //console.log(row);
        setFormData(row);
        setEditMode(true);
        //setEditIndex(index);
        setModalOpen(true);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const deleteEmployee = async () => {
        if (selectedId) {
            setIsDeleteLoading(true);

            try {
                const res = await apiRequest(`deleteEmployee`, null, null, `/${selectedId}`);
                //console.log(res);


                if (res?.error) {
                    toast.error(res?.error)
                }
                else {
                    toast.success(res?.data?.message);
                    closeDeletePopup()


                    setTimeout(() => {

                        if (empData?.totalRows > 10) {
                            getIEmpList();
                        }
                        else {
                            setCurrentPage(0);
                            getIEmpList();
                        }
                    }, 2000);


                }

            } catch (error: any) {
                toast.error(error);
            }
            finally {
                setIsDeleteLoading(false)
            }
        }
    }
    const handleFilterUserChange = (selected: React.ChangeEvent<HTMLInputElement>) => setSearchEmpTerms(selected?.target?.value);

    const clearEmpSearch = () => {
        setSearchEmpTerms("");
    };


    const fetchRoles = async () => {
        try {
            // Step 1: Fetch roles
            const roleResponse = await apiRequest("app/getAllRoles");

            if (roleResponse?.error || !roleResponse?.data) {
                toast.error(roleResponse?.error || "Failed to load roles.");
                return [];
            }

            // Filter roles: exclude ROLE_MERCHANT, ROLE_CUSTOMER, SUPER_ADMIN
            const filteredRoles = roleResponse.data.filter((role: any) => {
                const roleName = role.name?.toUpperCase();
                return (
                    roleName !== "ROLE_MERCHANT" &&
                    roleName !== "ROLE_CUSTOMER" &&
                    roleName !== "SUPER_ADMIN"
                );
            });

            setRoles(filteredRoles);

            //console.log(filteredRoles, 'filteredRoles')



        } catch (error) {
            console.error("Error fetching roles or modules:", error);
            toast.error("Unexpected error fetching role data");
            return [];
        }
    };

    useEffect(() => { fetchRoles() }, [])

    useEffect(() => {
        getIEmpList();
    }, [currentPage, debouncedSearchEmpTerm,])

    const handleDelete = (id: number) => {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
    };

    return (
        <div className=" p-4 md:p-6 xl:p-6 lg:p-6">
            <Navbar />
            <div className="flex justify-self-end  mb-2 gap-2">
                {canAdd && (
                    <button
                        onClick={() => openModal()}
                        className="bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                        + Add Employee
                    </button>

                )}

                <div className="col-span-12 md:col-span-2 flex items-end">
                    <select
                        className="py-2 px-4 w-md border rounded-md focus:outline-none focus:none focus:none"
                        value={pageSize}
                        onChange={selectPages}
                    >
                        <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4 mb-6">

                <div className="col-span-12 md:col-span-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchEmpTerms}
                            placeholder="Search Employee"
                            onChange={handleFilterUserChange}
                            className="w-full mb-2 mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
                        />
                        {debouncedSearchEmpTerm && (
                            <button onClick={clearEmpSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                <FaTimes className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

            </div>

            {loader && <Loader showHide={loader} />}
            {!loader && (
                <>

                    <div className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
                            <Table columns={columnHeader}
                                data={empData?.pageData}
                                viewDetails={undefined}
                                onDelete={canDelete ? deleteRow : undefined}
                                viewTxn={undefined}
                                viewImage={undefined}
                                onEdit={canEdit ? handleEdit : undefined}

                            />
                        </div>

                    </div>
                    <div className="flex items-center justify-self-center border-t border-gray-200 px-4 py-3 sm:px-6">
                        <div className='justify-self-center'>
                            <Pagination currentPage={currentPage} totalPages={empData?.totalPages} handlePageChange={handlePageChange} />
                        </div>
                    </div>
                </>)}

            <DeletePopup
                isOpen={isDeletePopupOpen}
                onClose={closeDeletePopup}
                onConfirm={deleteEmployee}
                loading={isDeleteLoading}
                itemId={selectedId || ''}
            />

            <TicketDetailsModal
                isOpen={isTicketModalOpen}
                onClose={() => setIsTicketModalOpen(false)}
                data={ticketDetails}
            />

            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">
                            {editMode ? 'Edit Employee' : 'Add Employee'}
                        </h2>
                        {/* editMode? updateEmp : handleSubmit */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="max-h-[70vh] p-2 overflow-y-auto pr-2 mb-12">
                                {editMode && (
                                    <input
                                        name="id"
                                        value={formData.id}
                                        placeholder="Employee ID"
                                        className="w-full mb-2 mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
                                        required
                                        readOnly
                                    />
                                )}

                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Name"
                                    className="w-full mb-2 mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
                                    required
                                />
                                <input
                                    name="position"
                                    value={formData.position}
                                    onChange={handleInputChange}
                                    placeholder="Position"
                                    className="w-full mb-2 mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
                                    required
                                />
                                <input
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    placeholder="Department"
                                    className="w-full mb-2 mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
                                    required
                                />
                                <input
                                    type="text"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email"
                                    className="w-full mb-2 mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
                                    required
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Phone"
                                    className="w-full mb-2 mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
                                    required
                                />
                                <select
                                    name="shift"
                                    value={formData.shift}
                                    onChange={handleInputChange}
                                    className="w-full mb-2 mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
                                    required
                                >
                                    <option value="">Select Shift</option>
                                    <option value="Morning">Morning</option>
                                    <option value="Evening">Evening</option>
                                    <option value="Night">Night</option>
                                </select>

                                <select
                                    name="roleName"
                                    value={formData.roleName}
                                    onChange={handleInputChange}
                                    className="w-full mb-2 mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
                                    required
                                >
                                    <option value="">Select Role</option>
                                    {/* <option value="admin">Admin</option>
                                    <option value="employee">Employee</option> */}

                                    {roles.map((role: any, id: number) => {
                                        return (
                                            <option key={id} value={role?.name}>{role?.name}</option>
                                        )
                                    })}
                                </select>
                                <select
                                    name="loginAccess"
                                    value={formData.loginAccess}
                                    onChange={handleInputChange}
                                    className="w-full mb-2 mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
                                    required
                                >
                                    <option value="">Select Login Access</option>
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>

                                </select>
                                {!editMode && (
                                    <input
                                        type="text"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Password"
                                        className="w-full mb-2 mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
                                        required
                                    />
                                )}

                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border text-gray-600 hover:text-red-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    {editMode ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManager;
