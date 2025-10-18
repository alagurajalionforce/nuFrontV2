import React, { useEffect, useState } from "react";
import apiRequest from "../../utils/helpers/apiRequest";
import toast from "react-hot-toast";
import { FaCheck, FaEdit, FaRegArrowAltCircleLeft, FaTimes, FaTrash } from "react-icons/fa";
import Navbar from "../../layout/Navbar";
import DeletePopup from "../../components/DeletePopup";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface Role {
    id: string;
    name: string;
}

const RoleManagement: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [roleName, setRoleName] = useState("");
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);

    const [editRoleId, setEditRoleId] = useState<string | null>(null);
    const [isEdit, setIsEdit] = useState(false);

    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);


    // Fetch roles
    const getAllRoles = async () => {
        setLoading(true);
        const res = await apiRequest("app/getAllRoles");
        if (res?.data) {
            setRoles(res.data);
        } else {
            toast.error("Failed to fetch roles");
        }
        setLoading(false);
    };

    // Create role
    const handleCreateRole = async () => {
        if (!roleName.trim()) {
            toast.error("Role name is required");
            return;
        }

        const payLoad = {
            name: roleName,
            ...(isEdit && {
                id: editRoleId
            }),
        }

        const url = isEdit ? 'updateRole' : 'saveRole';
        const res = await apiRequest(url, payLoad);

        if (res?.data) {
            toast.success("Role created");
            setRoleName("");
            getAllRoles();
            setIsEdit(false);
        } else {
            toast.error("Failed to create role");
        }
    };

    const deleteRow = async (row: any) => {
        //console.log("Delete row:", row);
        setSelectedId(row);
        setIsDeletePopupOpen(true);
    }

    const closeDeletePopup = () => {
        setSelectedId(null);
        setIsDeletePopupOpen(false);
    };

    // Delete role
    const handleDelete = async () => {
        if (selectedId) {

            //console.log(selectedId);
            setIsDeleteLoading(true);

            const payLoad = {
                roleId: selectedId
            }

            try {
                const res = await apiRequest(`deleteRole`, null, null, `?roleId=${selectedId}`);
                //console.log(res);


                if (res?.error) {
                    toast.error(res?.error)
                }
                else {
                    toast.success(res?.data?.message);
                    closeDeletePopup()


                    setTimeout(() => {

                        getAllRoles()
                    }, 2000);


                }

            } catch (error: any) {
                toast.error(error);
            }
            finally {
                setIsDeleteLoading(false)
            }
        }
    };

    const handleEdit = (role: any) => {
        setEditRoleId(role);
        setRoleName(role.name);
        setIsEdit(true);
    };

    const goBack = () => {
        navigate(location.state.path, { state: { tab: location.state.tab } })
    }

    useEffect(() => {
        getAllRoles();
    }, []);

    return (
        <>
            <div className="p-4 sm:p-5 md:p-6 lg:p-6 xl:p-6 rounded-lg">
                <Navbar />

                <div className='flex gap-1 '>
                    <FaRegArrowAltCircleLeft className='mt-1' />
                    <button
                        onClick={goBack}
                        className="text-gray-800 hover:underline mb-4 inline-block"
                    >
                        Back
                    </button>

                </div>



                <div className="md:max-w-2xl lg:max-w-2xl xl:max-w-2xl bg-white shadow rounded-lg mt-6 p-4 sm:p-5 md:p-6">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                        <input
                            type="text"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            placeholder="Enter role name"
                            className="border border-gray-300 rounded-md focus:outline-none focus:none focus:none px-4 py-2 w-full sm:w-80"
                        />
                        <button
                            onClick={handleCreateRole}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto"
                        >
                            {isEdit ? 'Update Role' : 'Add Role'}
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-6 text-gray-500">Loading roles...</div>
                    ) : (
                        <div className="space-y-3">
                            {roles.length === 0 ? (
                                <p className="text-gray-500">No roles found.</p>
                            ) : (
                                roles.map((role) => (
                                    <div
                                        key={role?.id}
                                        className="flex flex-col sm:flex-row justify-between sm:items-center border p-3 rounded shadow-sm"
                                    >
                                        <div className="flex justify-between gap-2">
                                            <span className="text-md font-medium">{role.name}</span>

                                            <div className="flex justify-end gap-3 mt-2 sm:mt-0">
                                                <button
                                                    onClick={() => deleteRow(role?.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>

                                        <DeletePopup
                                            isOpen={isDeletePopupOpen}
                                            onClose={closeDeletePopup}
                                            onConfirm={handleDelete}
                                            loading={isDeleteLoading}
                                            itemId={selectedId || ''}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

        </>

    );
};

export default RoleManagement;
