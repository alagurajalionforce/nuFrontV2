import React, { useEffect, useState } from "react";
import apiRequest from "../../utils/helpers/apiRequest";
import toast from "react-hot-toast";
import { FaCheck, FaEdit, FaRegArrowAltCircleLeft, FaTimes, FaTrash } from "react-icons/fa";
import Navbar from "../../layout/Navbar";
import DeletePopup from "../../components/DeletePopup";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface Module {
  id: string;
  moduleName: string;
}



const ModuleManagement: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [moduleName, setModuleName] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);

  const [editModuleId, setEditModuleId] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);


  // Fetch modules
  const getAllModules = async () => {
    setLoading(true);
    const res = await apiRequest("app/getAllModules");
    if (res?.data) {
      setModules(res.data);
    } else {
      toast.error("Failed to fetch modules");
    }
    setLoading(false);
  };

  // Create module
  const handleCreateModule = async () => {
    if (!moduleName.trim()) {
      toast.error("Module name is required");
      return;
    }

    const payLoad = {
      moduleName: moduleName,
      ...(isEdit && {
        id: editModuleId
      }),
    }

    const url = isEdit ? 'updateModule' : 'saveModule';
    const res = await apiRequest(url, payLoad);

    if (res?.data) {
      toast.success("Module created");
      setModuleName("");
      getAllModules();
      setIsEdit(false);
    } else {
      toast.error("Failed to create module");
    }
  };

  const deleteRow = async (row: any) => {
    ////console.log("Delete row:", row);
    setSelectedId(row);
    setIsDeletePopupOpen(true);
  }

  const closeDeletePopup = () => {
    setSelectedId(null);
    setIsDeletePopupOpen(false);
  };

  // Delete module
  const handleDelete = async () => {
    if (selectedId) {

      //console.log(selectedId);
      setIsDeleteLoading(true);

      const payLoad = {
        roleId: selectedId
      }

      try {
        const res = await apiRequest(`deleteModule`, null, null, `?moduleId=${selectedId}`);
        //console.log(res);


        if (res?.error) {
          toast.error(res?.error)
        }
        else {
          toast.success(res?.data?.message);
          closeDeletePopup()


          setTimeout(() => {

            getAllModules()
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

  const handleEdit = (module: any) => {
    setEditModuleId(module);
    setModuleName(module.moduleName);
    setIsEdit(true);
  };

  const goBack = () => {
    navigate(location.state.path, { state: { tab: location.state.tab } })
  }

  useEffect(() => {
    getAllModules();
  }, []);

  return (
    <>
      <div className="p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 rounded-lg">
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
          {/* Input + Button Section */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
            <input
              type="text"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              placeholder="Enter module name"
              className="border rounded-md focus:outline-none focus:none focus:none px-4 py-2 w-full sm:w-1/2 lg:w-1/3"
            />
            <button
              onClick={handleCreateModule}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto"
            >
              {isEdit ? 'Update Module' : 'Add Module'}
            </button>
          </div>

          {/* Content Section */}
          {loading ? (
            <div className="text-center py-6 text-gray-500">Loading modules...</div>
          ) : (
            <div className="space-y-3">
              {modules.length === 0 ? (
                <p className="text-gray-500">No modules found.</p>
              ) : (
                modules.map((module) => (
                  <div
                    key={module?.id}
                    className="flex flex-col sm:flex-row justify-between sm:items-center border p-3 rounded shadow-sm bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex justify-between gap-2">
                      <span className="text-md font-medium">{module.moduleName}</span>

                      <div className="flex justify-end gap-3 mt-2 sm:mt-0">
                        {/* <button
                    onClick={() => handleEdit(module)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button> */}
                        <button
                          onClick={() => deleteRow(module?.id)}
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

export default ModuleManagement;
