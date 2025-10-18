import React, { useEffect, useState } from 'react';
import { FaEye, FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useLocation, useNavigate } from 'react-router-dom';
import apiRequest from '../../utils/helpers/apiRequest';
import Loader from '../../utils/loader';
import toast from 'react-hot-toast';
import { useDebounce } from '../../utils/useDebounce';
import Table from '../../components/responsTable';
import Pagination from '../../components/Pagination';
import Navbar from '../../layout/Navbar';
import { hasAccess, mapApiPermissionsToState } from '../../utils/commonFunctions';

interface Role {
    id: number;
    name: string;
    items: {
        id: number;
        name: string;
    }[];
}


const fetchRoles = async (): Promise<Role[]> => {
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

        // Step 2: Fetch modules
        const moduleResponse = await apiRequest("app/getAllModules");

        if (moduleResponse?.error || !moduleResponse?.data) {
            toast.error(moduleResponse?.error || "Failed to load modules.");
            return [];
        }

        // Map modules for use in role structure
        const roleItems = moduleResponse.data.map((module: any) => ({
            id: module.id,
            name: module.moduleName.replace(/([A-Z])/g, ' $1').trim() // Add space before capital letters
        }));

        // Step 3: Combine roles with modules
        const roles: Role[] = filteredRoles.map((role: any) => ({
            id: role.id,
            name: role.name,
            //name: role.name.replace(/^ROLE_/, '').replace(/_/g, ' '), // Remove 'ROLE_' and format
            items: roleItems
        }));

        return roles;

    } catch (error) {
        console.error("Error fetching roles or modules:", error);
        toast.error("Unexpected error fetching role/module data");
        return [];
    }
};


const UsersRole: React.FC = () => {

    const canAdd = hasAccess("User Role", "privilegeCreate");
    const canEdit = hasAccess("User Role", "privilegeUpdate");
    const canDelete = hasAccess("User Role", "privilegeDelete");

    const navigate = useNavigate();

    const location = useLocation();

    const [loader, setLoader] = useState(false);
    const [isUserView, setIsUserView] = useState<any>(location?.state?.tab ? location?.state?.tab : 'user');
    const [openSubItems, setOpenSubItems] = useState<{ [key: string]: boolean }>({});

    const [empData, setEmpData] = useState({
        pageData: [],
        totalPages: 0,
        totalRows: 0,
    });

    const [searchEmpTerms, setSearchEmpTerms] = useState<any>('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState<number>(10);

    const [openRoles, setOpenRoles] = useState<number[]>([]);
    const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
    const [checkedPermissions, setCheckedPermissions] = useState<{
        [roleName: string]: { [itemName: string]: { [perm: string]: boolean } };
    }>({});
    const [checkedSubItems, setCheckedSubItems] = useState<{
        [roleId: string]: {
            [moduleId: string]: {
                [perm: string]: boolean; // e.g., View, Add, Edit, Delete, All
            };
        };
    }>({});

    const [allChecked, setAllChecked] = useState<{
        [roleName: string]: { [itemName: string]: boolean };
    }>({});

    const [isSaveEnabled, setIsSaveEnabled] = useState(false);
    const [roles, setRoles] = useState<any[]>([]);

    const [modulesList, setModulesList] = useState<{ id: string; moduleName: string }[]>([]);

    const debouncedSearchEmpTerm = useDebounce(searchEmpTerms, 600);

    const selectPages = (e: any) => {
        const { name, value } = e.target;

        setPageSize(value);
        setCurrentPage(0);
    };

    const columnHeader = [
        { key: "name", headerName: "Name" },
        { key: "position", headerName: "position" },
        { key: "department", headerName: "department" },
        { key: "email", headerName: "email" },
        // { key: "phone", headerName: "phone" },
        { key: "shift", headerName: "shift" },
        { key: "Role", headerName: "Role" },

    ];


    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const canViewUser = hasAccess("User Role", "privilegeView");
    const canViewRole = hasAccess("Roles", "privilegeView")

    const subModules = ['user', 'role'];

    // const settings = subModules.map(name => ({
    //     name,
    //     //canView: name,
    //     canView: hasAccess("Roles", "privilegeView"),
    // }));

    const settings = subModules.map(name => {
        if (name === 'user') {
            return { name, canView: canViewUser };
        }
        if (name === 'role') {
            return { name, canView: canViewRole };
        }
        return { name, canView: false }; // fallback
    });

    const validTabs = settings.filter((s) => s.canView).map((s) => s.name);
    const initialTab = validTabs.includes(location?.state?.tab)
        ? location.state.tab
        : validTabs[0] || "";

    const [viewPage, setViewPage] = useState(initialTab);

    //console.log(location?.state?.tab, validTabs, initialTab, "LoationTab");

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

            if (req?.data?.pageData) {

                setEmpData({
                    pageData: req.data.pageData,
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


    const toggleRoleAccordion = (index: number) => {
        //console.log(index)
        if (openRoles.includes(index)) {
            setOpenRoles(openRoles.filter((i) => i !== index));
        } else {
            setOpenRoles([...openRoles, index]);
        }
    };

    const toggleItemAccordion = (roleId: number, itemId: number) => {
        const key = `${roleId}-${itemId}`;
        //console.log(key)
        setOpenItems({ ...openItems, [key]: !openItems[key] });
    };

    const toggleSubItemAccordion = (roleId: number, itemId: number, subItemId: number) => {
        const key = `${roleId}-${itemId}-${subItemId}`;
        //console.log(key)
        setOpenSubItems((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const togglePermissionCheckbox = (roleId: string, moduleId: string, perm: string) => {
        setCheckedSubItems(prev => {
            const updated = { ...prev };
            const perms = updated[roleId]?.[moduleId] || {};

            if (perm === "All") {
                const newValue = !perms["All"];
                ["View", "Add", "Edit", "Delete"].forEach(p => {
                    perms[p] = newValue;
                });
                perms["All"] = newValue;
            } else {
                perms[perm] = !perms[perm];
                const allChecked = ["View", "Add", "Edit", "Delete"].every(p => perms[p]);
                perms["All"] = allChecked;
            }

            if (!updated[roleId]) updated[roleId] = {};
            updated[roleId][moduleId] = perms;
            return { ...updated };
        });
    };

    const initializeData = async () => {
        try {
            const roles = await fetchRoles();
            const permissionsRes = await apiRequest(`app/getModulePrivileges`);
            const permissionData = permissionsRes?.data || [];

            // This should return an empty object if no permissions exist
            const mappedPermissions = mapApiPermissionsToState(permissionData);

            //console.log(roles, 'roles')

            setRoles(roles);
            setCheckedSubItems(mappedPermissions);
            // Only enable save if there are actual changes
            setIsSaveEnabled(Object.keys(mappedPermissions).length >= 0);
        } catch (error) {
            console.error("Failed to initialize data:", error);
        }
    };

    const addModules = () => {
        navigate('/modules', { state: { path: '/user-role', tab: 'role' } })
    }

    const addRoles = () => {
        navigate('/roles', { state: { path: '/user-role', tab: 'role' } })
    }

    const fetchModules = async () => {
        const res = await apiRequest("app/getAllModules"); // Adjust endpoint if needed
        if (res?.data) {
            setModulesList(res.data);
        }
    };





    const buildPayload = async () => {
        const payload: any[] = [];

        // Object.entries(checkedSubItems).forEach(([roleId, modules]) => {
        //     Object.entries(modules).forEach(([moduleId, perms]) => {
        //         // Get the module from modulesList to ensure it exists
        //         const module = modulesList.find(m => m.id === moduleId);

        //         // Only proceed if the module exists
        //         if (module) {
        //             // Check if any permission is EXPLICITLY true (not just defined)
        //             const hasExplicitPermission = Object.entries(perms).some(
        //                 ([perm, value]) => value === true && perm !== "All"
        //             );

        //             if (hasExplicitPermission) {
        //                 const role = roles.find(r => r.id === roleId);
        //                 payload.push({
        //                     roleId,
        //                     roleName: role?.name || "",
        //                     moduleId,
        //                     moduleName: module.moduleName || "",
        //                     privilegeView: perms.View === true,
        //                     privilegeCreate: perms.Add === true,
        //                     privilegeUpdate: perms.Edit === true,
        //                     privilegeDelete: perms.Delete === true,
        //                 });
        //             }
        //         }
        //     });
        // });

        Object.entries(checkedSubItems).forEach(([roleId, modules]) => {
            Object.entries(modules).forEach(([moduleId, perms]) => {
                const module = modulesList.find(m => m.id === moduleId);
                if (module) {
                    const role = roles.find(r => r.id === roleId);

                    payload.push({
                        roleId,
                        roleName: role?.name || '',
                        moduleId,
                        moduleName: module.moduleName || '',
                        privilegeView: perms.View === true,
                        privilegeCreate: perms.Add === true,
                        privilegeUpdate: perms.Edit === true,
                        privilegeDelete: perms.Delete === true,
                    });
                }
            });
        });

        console.log("Final Permission Payload", payload);

        try {
            const res = await apiRequest('modulePrivilege', payload);

            if (res?.error) {
                toast.error(res?.error);
            } else {
                const toastId = toast.loading("Saving...");
                setTimeout(() => {
                    toast.success(res?.data?.message || "Permissions saved successfully", { id: toastId });
                }, 3000);
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong.");
        }
    };

    useEffect(() => {
        fetchModules();
    }, []);
    useEffect(() => {
        getIEmpList();
        initializeData();
    }, [currentPage, debouncedSearchEmpTerm,])


    return (
        <div className=" p-4 md:p-6 xl:p-6 lg:p-6">
            {/* Toggle View Buttons */}
            <Navbar />

            <ul className="flex mb-4 gap-2">
                {settings
                    .filter((tab) => tab.canView)
                    .map((tab) => (
                        <li key={tab.name}>
                            <button
                                onClick={() => setViewPage(tab.name)}
                                className={`px-4 py-2 rounded ${viewPage === tab.name
                                    ? "bg-green-600  text-white"
                                    : "bg-gray-200"
                                    }`}
                            >
                                {tab.name}
                            </button>
                        </li>
                    ))}
            </ul>


            {(viewPage === 'user') && (
                <>
                    {loader && <Loader showHide={loader} />}
                    {!loader && (
                        <>

                            <div className="mt-6">
                                {/* <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
                                    <Table columns={columnHeader}
                                        data={empData?.pageData}
                                        viewDetails={undefined}
                                        onDelete={undefined}
                                        viewTxn={undefined}
                                        viewImage={undefined}
                                        onEdit={undefined}

                                    />
                                </div> */}

                                <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {empData?.pageData?.map((user: any, index: any) => (
                                        <div key={user?.id} className="bg-white border rounded-lg shadow-md p-4">
                                            <div className='flex justify-between'>
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white bg-teal-500`}>
                                                    {user.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                {/* <button type='button' className='flex gap-1' onClick={() => { editRole(user?.id) }}><FaEdit className='mt-1' />Edit Role</button> */}
                                            </div>
                                            {/* <h2 className="text-lg font-semibold mt-2">{user.firstName} {user.lastName}</h2> */}
                                            <p className="text-sm text-gray-500">Email: {user.email}</p>
                                            <p className="text-sm text-gray-500">Department: {user.department}</p>
                                            <p className="text-sm text-gray-500">Position: {user.position}</p>
                                            <p className="text-sm text-gray-500">Roles: {user?.roles}</p>
                                            <p className="text-sm text-gray-500">Contact: {user?.phone ? '+234 ' + user?.phone : ''}</p>
                                        </div>
                                    ))}
                                </div>

                            </div>
                            <div className="flex items-center justify-self-center border-t border-gray-200 px-4 py-3 sm:px-6">
                                <div className='justify-self-center'>
                                    <Pagination currentPage={currentPage} totalPages={empData?.totalPages} handlePageChange={handlePageChange} />
                                </div>
                            </div>
                        </>)}
                </>
            )}

            {(viewPage === 'role') && (
                <div>
                    {loader && <Loader showHide={loader} />}

                    {!loader && (<>
                        <h2 className="text-lg font-semibold mb-4">Default Roles
                            ({roles.length} Roles)
                        </h2> {/* Use roleAll.length */}
                        {canAdd && (<>
                            <div className='flex gap-2 mb-4'>
                                <button type='button' className='border px-4 py-2 bg-white rounded-md'
                                    onClick={addModules}
                                >+ Add/View Modules</button>

                                <button type='button' className='border px-4 py-2 bg-white rounded-md'
                                    onClick={addRoles}
                                >+ Add/View Role</button>
                            </div>
                        </>)}

                        {roles.map((role: any, roleIndex: number) => (
                            <div key={role.id} className="border border-gray-300 rounded-lg mb-4 shadow-md">
                                <button
                                    onClick={() => toggleRoleAccordion(roleIndex)}
                                    className="flex justify-between items-center cursor-pointer py-3 px-4 bg-gray-300 hover:bg-gray-400 w-full text-left rounded-t-lg"
                                >
                                    <span className="font-semibold">{role.name}</span>
                                    {openRoles.includes(roleIndex) ? <FaChevronUp /> : <FaChevronDown />}
                                </button>

                                {openRoles.includes(roleIndex) && (
                                    <div className="p-4 bg-white rounded-b-lg">
                                        {role.items.length > 0 ? (
                                            role.items.map((item: any) => {
                                                const itemKey = `${role.id}-${item.id}`;
                                                const isItemOpen = openItems[itemKey];

                                                return (
                                                    <div key={item.id} className="mb-4">
                                                        <button
                                                            onClick={() => toggleItemAccordion(role.id, item.id)}
                                                            className="flex justify-between items-center w-full bg-gray-200 p-2 rounded-md hover:bg-gray-300"
                                                        >
                                                            <span className="font-semibold">{item.name}</span>
                                                            {isItemOpen ? <FaChevronUp /> : <FaChevronDown />}
                                                        </button>

                                                        {isItemOpen && (
                                                            <div className="mt-2 p-2 border rounded-md bg-gray-50">
                                                                <div className="font-bold text-gray-800 text-md mb-3">Permissions for: {item.name}</div>
                                                                <div className="grid grid-cols-5 gap-2 pl-4 mb-4">
                                                                    {["View", "Add", "Edit", "Delete", "All"].map((perm, permIndex) => (
                                                                        <label key={permIndex} className="flex items-center space-x-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={!!checkedSubItems?.[role.id]?.[item.id]?.[perm]}
                                                                                onChange={() =>
                                                                                    togglePermissionCheckbox(
                                                                                        role.id,
                                                                                        item.id,
                                                                                        perm
                                                                                    )
                                                                                }
                                                                                className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300"
                                                                            />
                                                                            <span className="text-sm text-gray-600">{perm}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}


                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="py-2 italic text-gray-500">No modules available</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                    </>)}

                    <div className='justify-self-end m-2'>
                        <button
                            onClick={buildPayload}
                            className={`bg-[#110260] rounded-md px-4 py-2 text-white ${!isSaveEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!isSaveEnabled}
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UsersRole
