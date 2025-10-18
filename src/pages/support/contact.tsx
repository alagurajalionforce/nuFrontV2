import React, { useCallback, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import Navbar from '../../layout/Navbar';
import apiRequest from '../../utils/helpers/apiRequest';
import { changeFormatDate, hasAccess, newFormatDate, normalFormatDate, PageSize } from '../../utils/commonFunctions';
import toast from 'react-hot-toast';
import Table from '../../components/responsTable';
import TicketDetailsModal from "./TicketDetailsModal";
import Pagination from '../../components/Pagination';
import ImageViewerModal from './ImageViewerModal';
import DeletePopup from '../../components/DeletePopup';
import { FaTimes } from 'react-icons/fa';
import { useDebounce } from '../../utils/useDebounce';
import Loader from '../../utils/loader';
import AsyncSelect from 'react-select/async';
import ImageFetcher from '../../components/ImageFetcher';
import { TrashIcon } from '@heroicons/react/24/outline';

type IssueType = {
  id?: any;
  selectedUserId: string;
  name: string;
  userType: '';
  employeeName: string;
  category: string;
  raiseDate: any;
  closingDate?: any;
  description: string;
  transferpin?: string;
  status?: string;
  remarks?: string;
  imagepath?: { imagePath: string }[];
};


interface ImageObject {
  imagePath: string;
}

interface ImageFile {
  id: string; // Unique identifier for each file
  file: File;
  preview: string;
  uploadedPath?: string; // Will be set after successful upload
}


interface IssueListResponse {
  pageData: IssueType[]; // Array of issue details
  totalPages: number;
  totalRows: number;
}


interface EmployeeListItem {
  id: string;        // Matches "id" from your response
  name: string;      // Matches "name" from your response
  position: string;  // Matches "position"
  department: string; // Matches "department"
  email: string;     // Matches "email"
  phone: string;     // Matches "phone"
  shift: string;     // Matches "shift"
  createdAt: string; // Matches "createdAt"
  updatedAt: string; // Matches "updatedAt"
  // Add other properties if they are relevant to your component logic
}

interface EmployeeListResponse {
  data: {
    pageData: EmployeeListItem[];
    // Include other pagination info if your API provides it
  };
  error?: {
    error: string;
  };
}

interface SelectOption {
  label: string;
  value: string;
}

const employees = ['Alice', 'Bob', 'Charlie'];
const status = ['Open', 'Pending', 'Completed'];

// const issueCategories = {
//   Customer: ['Login Issue', 'Payment Failure', 'Order Not Received', 'Refund Delay', 'Account Verification Issue'],
//   Merchent: ['Login Issue', 'Payout Delay', 'Order Not Showing', 'Account Verification Issue'],
// };

const userTypeMap: Record<'Customer' | 'Merchent', 'Customer' | 'Merchent'> = {
  Customer: 'Customer',
  Merchent: 'Merchent',
};

interface UserListItem {
  id: string;
  name?: string; // For customers
  businessName?: string;      // For merchants

}

interface UserListResponse {
  pageData: UserListItem[];
  totalPages: number;
  totalRows: number;
}

interface IssueListResponse {
  pageData: IssueType[]; // Array of issue details
  totalPages: number;
  totalRows: number;
}

const IssueFormModal: React.FC = () => {

  const canAdd = hasAccess("support", "privilegeCreate");
  const canEdit = hasAccess("support", "privilegeUpdate");
  const canDelete = hasAccess("support", "privilegeDelete");
  const canView = hasAccess("support", "privilegeView");

  const [formData, setFormData] = useState<IssueType>({
    id: '',
    selectedUserId: '',
    name: '',
    userType: '',
    employeeName: '',
    category: '',
    raiseDate: '',
    closingDate: '',
    description: '',
    transferpin: '',
    remarks: '',
    imagepath: [],
  });

  const [issueCategories, setIssueCategories] = useState<[]>([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState<any[]>([]);
  const [initialSlideIndex, setInitialSlideIndex] = useState(0);
  const [selectedIssueDetails, setSelectedIssueDetails] = useState<IssueType | null>(null);
  const [loader, setLoader] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [issues, setIssues] = useState<IssueType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedCloseDate, setSelectedCloseDate] = useState<any>('');
  const [selectedStartDate, setSelectedStartDate] = useState<any>('');
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<any>("");
  const [closeDate, setCloseDate] = useState<any>("");
  const [selectedCreatedDate, setSelectedCreateDate] = useState<any>("");
  const [createDate, setCreateDate] = useState<any>("");

  const [searchEmpTerms, setSearchEmpTerms] = useState<any>('');
  const [userType, setUserType] = useState<any>('');
  const [filterStatus, setFilterStatus] = useState<any>('');

  const debouncedCloseDate = useDebounce(closeDate, 500);
  const debouncedCreateDate = useDebounce(createDate, 500);
  const debouncedSearchEmpTerm = useDebounce(searchEmpTerms, 600);



  const [pageSize, setPageSize] = useState<number>(10);

  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [newImages, setNewImages] = useState<ImageObject[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);


  const columnHeader = [
    { key: "employeeName", headerName: "Employee Name" },
    { key: "name", headerName: "Username" },
    { key: "userType", headerName: "User Type" },
    { key: "description", headerName: "Issue" },
    { key: "status", headerName: "Status" },
    { key: "raiseDate", headerName: "Ticket Created Date" },
    { key: "closingDate", headerName: "Close Date" },
    { key: "updateAt", headerName: "Update At" },

  ];

  const [supportData, setSupportData] = useState({
    pageData: [],
    totalPages: 0,
    totalRows: 0,
  });
  const [selectUserType, setSelectUserType] = useState('')

  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);

  const [dynamicUserList, setDynamicUserList] = useState<UserListItem[]>([]);
  //const [userListLoading, setUserListLoading] = useState(false);

  const [userListLoading, setUserListLoading] = useState(false);
  const [selectedUserNameOption, setSelectedUserNameOption] = useState<SelectOption | null>(null);
  const [selectedEmployeeOption, setSelectedEmployeeOption] = useState<SelectOption | null>(null);
  const [employeeListLoading, setEmployeeListLoading] = useState(false);

  const closeDeletePopup = () => {
    setSelectedId(null);
    setIsDeletePopupOpen(false);
  };

  const selectPages = (e: any) => {
    const { name, value } = e.target;

    setPageSize(value);
    setCurrentPage(0);
  };



  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));


    if (name === 'userType') {
      setSelectUserType(value)
      const req = await apiRequest(`app/ticketTypeList?type=${value}`);

      if (req?.error) {
        toast.error(req?.error);
        return;
      }

      setIssueCategories(req?.data)
      //  loadOptions('', () => { });

      //console.log(req?.data);
    }
  };

  const changeDate = (date: any, key: 'raiseDate' | 'closingDate') => {
    if (!date) return;

    const formattedDate = newFormatDate(date);
    const changedDate = String(formattedDate).split('T');

    const newStartDate = normalFormatDate(date);
    const changedNewDate = String(newStartDate).split('T');

    if (key === 'closingDate') {
      setSelectedCloseDate(changedDate[0]);
    } else {
      setSelectedStartDate(changedDate[0]);
    }

    setFormData((prev) => ({ ...prev, [key]: changedNewDate[0] }));
  };

  const resetForm = () => {
    setFormData({
      id: '',
      selectedUserId: '',
      name: '',
      userType: '',
      employeeName: '',
      category: '',
      raiseDate: '',
      closingDate: '',
      description: '',
      transferpin: '',
      remarks: '',
      imagepath: [],
    });

    setIsEditMode(false);
    setEditIndex(null);
  };

  // const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files;
  //   if (!files || files.length === 0) {

  //     console.log("No files selected for upload.");
  //     return;
  //   }
  //   setIsLoading(true);
  //   const filesArray = Array.from(files);
  //   const currentFilePreviews: string[] = []; // Temporary array for previews of THIS selection

  //   // --- Client-side preview generation ---
  //   let processedFilesCount = 0;
  //   filesArray.forEach((file) => {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       currentFilePreviews.push(reader.result as string);
  //       processedFilesCount++;

  //       // If all files are processed, update the previewImages state
  //       if (processedFilesCount === filesArray.length) {
  //         setPreviewImages((prev) => [...prev, ...currentFilePreviews]);
  //         console.log(currentFilePreviews, 'Local previews generated');
  //       }
  //     };
  //     reader.readAsDataURL(file); // Read file as Data URL for immediate display
  //   });

  //   // --- Server-side upload ---
  //   const uploadFormData = new FormData(); // Use a distinct name for FormData instance

  //   // Append each file using the same key `file`
  //   filesArray.forEach((file) => {
  //     uploadFormData.append("file", file);
  //   });

  //   // Append the userName (consider making this dynamic, e.g., from user context/auth)
  //   uploadFormData.append("userName", "admin@gmail.com");

  //   try {
  //     // CALLING apiRequest WITH THE CORRECT FormData INSTANCE: uploadFormData
  //     const response = await apiRequest("fileUpload", uploadFormData, null, null, true);

  //     // Assuming response.data is a comma-separated string of filenames
  //     const uploadedFilenames = response?.data?.split(",") || [];

  //     const newImagePathsObjects = uploadedFilenames.map((filename: string) => ({
  //       imagePath: filename.trim() // trim to remove any whitespace
  //     }));

  //     console.log(newImagePathsObjects, uploadedFilenames, 'Server uploaded filenames payload');

  //     setNewImages((prev: any) => [
  //       ...(Array.isArray(prev) ? prev : []), // handle initial state (empty array or undefined)
  //       ...newImagePathsObjects
  //     ]);

  //     // toast.success("Image(s) uploaded successfully.");
  //   } catch (err) {
  //     console.error("Upload failed:", err);
  //     toast.error("Image upload failed.");

  //   } finally {
  //     setIsLoading(false);
  //   }

  // };


  // 👇 Function to remove an image by index
  // const handleRemoveImage = (index: number) => {
  //   setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  //   setNewImages((prev: ImageObject[]) => (prev || []).filter((_, i) => i !== index));
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newIssue = { ...formData };

    //console.log(formData, 'payLoad')


    const payLoad = {
      name: formData?.name,
      userType: formData?.userType,
      employeeName: formData?.employeeName,
      category: formData?.category,
      description: formData?.description,
      imagepath: newImages, // Using your state name
      ...(isEditMode && {
        closingDate: formData?.closingDate || null,
        raiseDate: formData?.raiseDate || null,
        status: formData?.status || null,
        id: formData?.id,
        remarks: formData?.remarks || null,
      }),
    };




    //console.log(payLoad, 'payLoad');

    const url = isEditMode ? 'updateTicket' : 'supportTicket';

    try {

      const req = await apiRequest(url, payLoad);

      if (req?.error) {
        toast.error(req?.error);
      }
      else {
        toast.success(req?.data?.message || 'The ticket has been successfully assigned.');
        setTicketDetails(req?.data);
        resetForm();
        setIsModalOpen(false);
        setSelectedCloseDate('');
        setPreviewImages([]);
        setSelectedUserNameOption(null)

        setIsTicketModalOpen(true);
        setTimeout(() => {
          getIssueList();
        }, 1000);
      }

    } catch (error: any) {
      toast.error(error)
    }

  };

  const handleView = (row: any) => {

    //console.log(row);
    setIsEditMode(true);
    setFormData(row);
    setIsViewModalOpen(true);
  }

  const handleEdit = (row: any) => {

    //console.log(row);
    setFormData(row);
    setIsEditMode(true);
    //setEditIndex(index);
    setIsModalOpen(true);
  };

  const deleteRow = async (row: any) => {
    //console.log("Delete row:", row);
    setSelectedId(row?.id);
    setIsDeletePopupOpen(true);
  }


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleImageClick = (img: string) => setSelectedImage(img);

  const viewImages = (row: any) => {

    //console.log(row);
    openImagesModal(row)

  }


  const openImagesModal = (issue: IssueType, initialImageIndex: number = 0) => {
    if (issue?.imagepath && issue.imagepath.length > 0) {
      setSelectedIssueDetails(issue); // Store the entire issue details if you need them later
      setCurrentImages(issue.imagepath); // Set the images array for the modal
      setInitialSlideIndex(initialImageIndex);
      setIsImageModalOpen(true);
    } else {
      toast.error("No images available for this issue.");
    }
  };

  const closeImagesModal = () => {
    setIsImageModalOpen(false);
    setCurrentImages([]); // Clear images when closing to prevent showing old images
    setInitialSlideIndex(0); // Reset initial slide
    setSelectedIssueDetails(null); // Clear selected issue details
  };

  const deleteTicket = async () => {
    if (selectedId) {
      setIsDeleteLoading(true);

      try {
        const res = await apiRequest(`deleteSupportRow`, null, null, `/${selectedId}`);
        //console.log(res);

        if (res?.error) {
          toast.error(res?.error)
        }
        else {
          toast.success(res?.data?.message);
          closeDeletePopup()

          setTimeout(() => {

            if (supportData?.totalRows > 10) {
              getIssueList();
            }
            else {
              setCurrentPage(0);
              getIssueList();
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

  const changeCreatedDate = (date: any) => {
    if (!date) return;
    const formattedDate = newFormatDate(date);
    const changedDate = String(formattedDate).split("T")[0];
    setSelectedCreateDate(changedDate);

    //console.log(changedDate, 'changedDate')

    const newStartDate = normalFormatDate(date);
    const changedNewDate = String(newStartDate).split('T')[0];

    setCreateDate(changedNewDate);

  };

  const clearCreateDate = () => {
    setSelectedCreateDate("");
    setCreateDate('');
  };

  const clearCloseDate = () => {
    setSelectedDate("");
    setCloseDate('');
  };

  const changeCloseDate = (date: any) => {
    if (!date) return;
    const formattedDate = newFormatDate(date);
    const changedDate = String(formattedDate).split("T")[0];
    setSelectedDate(changedDate);

    //console.log(changedDate, 'changedDate')

    const newStartDate = normalFormatDate(date);
    const changedNewDate = String(newStartDate).split('T')[0];

    setCloseDate(changedNewDate);

  };



  const handleFilterUserChange = (selected: React.ChangeEvent<HTMLInputElement>) => setSearchEmpTerms(selected?.target?.value);

  const clearEmpSearch = () => {
    setSearchEmpTerms("");
  };

  const handleFilterChange = async (selected: any) => {
    //console.log(selected?.target?.value, 'selected')
    setUserType(selected?.target?.value)


  };
  const handleStatusChange = (selected: any) => setFilterStatus(selected?.target?.value);

  useEffect(() => {
    if (isEditMode && formData?.raiseDate && formData?.closingDate) {

      const check1 = changeFormatDate(formData?.raiseDate)
      const check2 = changeFormatDate(formData?.closingDate)

      const formattedRaiseDate = check1.split('T')[0];
      const formattedClosingDate = check2.split('T')[0];

      console.log(formattedRaiseDate, formData?.raiseDate, 'raiseDate');

      setSelectedStartDate(formattedRaiseDate);
      setSelectedCloseDate(formattedClosingDate);
    }
  }, [isEditMode, formData]);

  const getIssueList = async () => {

    const queryParams = [
      userType ? `userType=${userType}` : '',
      createDate ? `createDate=${debouncedCreateDate}` : '',
      closeDate ? `closingDate=${debouncedCloseDate}` : '',
      searchEmpTerms ? `empName=${debouncedSearchEmpTerm.toLowerCase()}` : '',
      filterStatus ? `status=${filterStatus}` : '',
      `page=${currentPage}`,
      `size=${pageSize}`,
    ]
      .filter(Boolean)
      .join("&");

    try {
      setLoader(true);
      const req = await apiRequest(`app/supportTicketList${queryParams ? `?${queryParams}` : ''}`)
      //console.log(req?.data?.pageData)

      if (req?.error) {
        toast.error(req?.error || 'No Data Fount');
      }

      if (req?.data?.pageData) {

        setSupportData({
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



  const loadOptions = useCallback(
    async (inputValue: string, callback: (options: SelectOption[]) => void): Promise<SelectOption[]> => { // <-- Change return type here
      const { userType } = formData;
      if (!userType) {
        callback([]);
        return []; // <-- Return an empty array here
      }

      setUserListLoading(true);
      let apiUrl = '';

      const queryParams = `page=0&size=20&search=${encodeURIComponent(selectUserType)}`; // Encode inputValue for URL

      if (selectUserType === 'Customer') {
        apiUrl = `app/web/customerList${queryParams ? `?${queryParams}` : ''}`;
      } else if (selectUserType === 'Merchent') {
        apiUrl = `app/web/allMerchantList${queryParams ? `?${queryParams}` : ''}`;
      } else {
        setUserListLoading(false);
        callback([]);
        return []; // <-- Return an empty array here
      }

      console.log('User loadOptions - inputValue:', inputValue); // ADD THIS LOG
      console.log('User loadOptions - API URL:', apiUrl);       // ADD THIS LOG


      try {
        const req: UserListResponse | any = await apiRequest(apiUrl);
        let options: SelectOption[] = []; // Initialize options array

        if (req?.error) {
          toast.error(req?.error || `Failed to fetch ${userType} list.`);
          options = []; // Ensure options is empty on error
        } else if (req?.data?.pageData) {
          const seenIds = new Set<string>();
          const uniqueUsers: UserListItem[] = [];

          req.data.pageData.forEach((user: UserListItem) => {
            if (user.id && !seenIds.has(user.id)) {
              seenIds.add(user.id);
              uniqueUsers.push(user);
            }
          });

          options = uniqueUsers.map((user) => ({
            label: user.name || user.businessName || user.id,
            value: user.id,
          }));
        } else {
          toast.error(`No ${userType} found.`);
          options = []; // Ensure options is empty if no pageData
        }

        callback(options); // Always call callback with the final options
        return options; // <-- IMPORTANT: Return the options here
      } catch (error: any) {
        toast.error(error?.message || `An unexpected error occurred while fetching ${userType} list.`);
        callback([]); // Call callback even on error
        return []; // <-- Return an empty array on error
      } finally {
        setUserListLoading(false);
      }
    },
    [formData.userType],
  );

  const loadEmployeeOptions = useCallback(
    async (inputValue: string, callback: (options: SelectOption[]) => void): Promise<SelectOption[]> => {
      setEmployeeListLoading(true);
      let apiUrl = '';

      const queryParams = `page=0&size=15&search=${encodeURIComponent(inputValue)}`;
      apiUrl = `app/getEmployeeList?${queryParams}`;

      try {
        const req: EmployeeListResponse | any = await apiRequest(apiUrl);
        let options: SelectOption[] = [];

        if (req?.error) {
          toast.error(req?.error || `Failed to fetch employee list.`);
          options = [];
        } else if (req?.data?.pageData) {
          const seenIds = new Set<string>(); // Use 'id' for deduplication as it's truly unique
          const uniqueEmployees: EmployeeListItem[] = [];

          req.data.pageData.forEach((employee: EmployeeListItem) => {
            // Deduplicate based on 'id' which is guaranteed to be unique
            if (!seenIds.has(employee.id)) {
              seenIds.add(employee.id);
              uniqueEmployees.push(employee);
            }
          });

          // Map the unique employee data to the SelectOption format
          options = uniqueEmployees.map((employee) => ({
            label: employee.name, // Display the employee's name
            value: employee.id,   // Use the unique 'id' as the option's value
          }));
        } else {
          toast.error(`No employees found.`);
          options = [];
        }

        callback(options);
        return options;
      } catch (error: any) {
        toast.error(error?.message || `An unexpected error occurred while fetching employee list.`);
        callback([]);
        return [];
      } finally {
        setEmployeeListLoading(false);
      }
    },
    [],
  );

  const handleEmployeeSelectChange = (selectedOption: SelectOption | null) => {
    setSelectedEmployeeOption(selectedOption);

    //console.log(selectedOption, 'payLoad');

    setFormData((prev) => ({
      ...prev,
      employeeId: selectedOption ? selectedOption.value : '', // Set the employee's unique ID
      employeeName: selectedOption ? selectedOption.label : '', // Set the employee's display name
    }));
  };
  useEffect(() => {
    if (selectUserType) {
      loadOptions('', () => { });
    }
    if (formData?.userType) {
      loadOptions('', () => { });
      getTicketList(formData?.userType)

    }
  }, [selectUserType, formData?.userType]);

  const getTicketList = async (data: any) => {

    const userTy = data === 'Merchant' ? 'Merchent' : 'Customer';

    setSelectUserType(data)
    const req = await apiRequest(`app/ticketTypeList?type=${userTy}`);

    if (req?.error) {
      toast.error(req?.error);
      return;
    }

    setIssueCategories(req?.data)
  }

  useEffect(() => {
    getIssueList();
  }, [currentPage, debouncedCloseDate, debouncedCreateDate, debouncedSearchEmpTerm, userType, filterStatus, pageSize])


  const handleRemoveExistingImage = (imagePath: string) => {
    if (window.confirm('Are you sure you want to remove this image?')) {
      setFormData((prev: any) => ({
        ...prev,
        imagepath: prev.imagepath.filter((img: any) => img.imagePath !== imagePath)
      }));
    }
  };

  const handleUserSelectChange = (selectedOption: SelectOption | null) => {
    setSelectedUserNameOption(selectedOption); // Update state for AsyncSelect's display

    //console.log(selectedOption, 'payLoad');

    setFormData((prev) => ({
      ...prev,
      name: selectedOption ? selectedOption.label : '', // Set the display name as a string
      selectedUserId: selectedOption ? selectedOption.value : '', // Set the unique ID
    }));
  };

  // useEffect(() => {
  //   // Only trigger if userType is customer/merchant AND we have both name and selectedUserId
  //   if ((formData.userType === 'Customer' || formData.userType === 'Merchent') && formData.name && formData.selectedUserId) {
  //     const initialOption: SelectOption = {
  //       label: formData.name, // Use the name from formData
  //       value: formData.selectedUserId, // Use the selectedUserId from formData
  //     };
  //     setSelectedUserNameOption(initialOption);
  //   } else {
  //     // Clear selection if userType changes or data is missing
  //     setSelectedUserNameOption(null);
  //   }
  // }, [formData.name, formData.selectedUserId, formData.userType]);

  useEffect(() => {
    if (formData.employeeName) {
      const initialOption: SelectOption = {
        label: formData.employeeName, // Use 'name' for the display label
        value: formData.employeeName,   // Use 'id' for the unique value
      };
      setSelectedEmployeeOption(initialOption);
    } else {
      setSelectedEmployeeOption(null);
    }
  }, [formData.employeeName]);

  // useEffect(() => {
  //   if (isEditMode && Array.isArray(formData.imagepath)) {
  //     const images = formData.imagepath
  //       .map((img: any) => typeof img === 'string' ? img : img?.imagePath)
  //       .filter((url: string) => typeof url === 'string' && url.trim() !== '');

  //     setExistingImages(images);
  //   }
  // }, [formData.imagepath, isEditMode]);


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const filesArray = Array.from(files);
    const currentFilePreviews: string[] = [];

    // Generate local previews
    let processedFilesCount = 0;
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        currentFilePreviews.push(reader.result as string);
        processedFilesCount++;

        if (processedFilesCount === filesArray.length) {
          setPreviewImages(prev => [...prev, ...currentFilePreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Upload to server
    const uploadFormData = new FormData();
    filesArray.forEach((file) => {
      uploadFormData.append("file", file);
    });
    uploadFormData.append("userName", "admin@gmail.com");

    try {
      const response = await apiRequest("fileUpload", uploadFormData, null, null, true);
      const uploadedFilenames = response?.data?.split(",") || [];

      const newImagePathsObjects = uploadedFilenames.map((filename: string) => ({
        imagePath: filename.trim()
      }));

      setNewImages(prev => [...prev, ...newImagePathsObjects]);
      //toast.success("Image(s) uploaded successfully.");

    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Image upload failed.");
      // Remove the previews if upload fails
      setPreviewImages(prev => prev.slice(0, -filesArray.length));
    } finally {
      setIsUploading(false);
      setFileInputKey(prev => prev + 1); // Reset file input
    }
  };

  const handleRemoveImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setFileInputKey(prev => prev + 1);
  };



  return (
    <div className=" p-4 md:p-6 xl:p-6 lg:p-6">
      <Navbar />

      <div className="flex justify-end mb-4 gap-2">
        {canAdd && (
          <button
            onClick={() => {
              setIsModalOpen(true);
              resetForm();
            }}
            className="py-2 px-4 bg-green-600 text-white rounded-md"
          >
            + Add Issue
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

      {isViewModalOpen && (
        <>
          <div className="fixed inset-0 z-[10000]  bg-black bg-opacity-50 flex items-center justify-center ">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative overflow-y-auto">
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setIsEditMode(false);
                  }}
                  className="px-1 py-1 text-gray-600 hover:text-red-600"
                >
                  X
                </button>

              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usertype</p>
                  <p className="mt-1 text-base text-gray-900">{formData.userType || '-'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="mt-1 text-base text-gray-900">{formData.name || '-'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Allocating Employee</p>
                  <p className="mt-1 text-base text-gray-900">{formData.employeeName || '-'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Issue Type</p>
                  <p className="mt-1 text-base text-gray-900">{formData.category || '-'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Ticket Created On</p>
                  <p className="mt-1 text-base text-gray-900">{formData?.raiseDate || '-'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Close Date</p>
                  <p className="mt-1 text-base text-gray-900">{formData?.closingDate || '-'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="mt-1 text-base text-gray-900">{formData.status || '-'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Remarks</p>
                  <p className="mt-1 text-base text-gray-900">{formData.remarks || '-'}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Issue Description</p>
                <p className="mt-1 text-base text-gray-900 whitespace-pre-line">{formData.description || '-'}</p>
              </div>


            </div>
          </div>

        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[10000]  bg-black bg-opacity-50 flex items-center justify-center ">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">{isEditMode ? 'Update Issue' : 'Raise an Issue'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="max-h-[70vh] p-2 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Usertype</label>
                    {!isEditMode && (
                      <select
                        name="userType"
                        value={formData.userType}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 custom-select border rounded-md focus:outline-none focus:none focus:none"
                      >
                        <option value={''}>Select Usertype</option>
                        <option value="Customer">Customer</option>
                        <option value="Merchent">Merchent</option>
                      </select>
                    )}

                    {isEditMode && (
                      <div>
                        <input type='text'
                          value={formData?.userType}
                          className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
                          readOnly
                        />
                      </div>
                    )}
                  </div>

                  <div>


                    <div>
                      <label className="block text-sm font-medium">Name</label>
                      {isEditMode ? (
                        <input type='text'
                          name="name"
                          value={formData?.name}
                          className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
                          readOnly
                        />
                      ) : (
                        <AsyncSelect
                          name="name"
                          value={selectedUserNameOption}
                          onChange={handleUserSelectChange}
                          loadOptions={loadOptions} // This is where the magic happens
                          defaultOptions={true} // Prevents loading all options initially (useful for large lists)
                          cacheOptions // Caches options for the same input
                          placeholder={userListLoading ? 'Loading...' : 'Search Character'}
                          isDisabled={!formData.userType} // Disable until userType is selected
                          isSearchable={true}
                          isClearable={true}
                          className="w-full mt-1 mb-2 focus:outline-none focus:none focus:none"
                          classNamePrefix="react-select"
                          // Your existing styles go here
                          styles={{
                            control: (baseStyles) => ({
                              ...baseStyles,
                              minHeight: '42px',
                              borderColor: '#D1D5DB',
                              borderRadius: '0.375rem',
                              boxShadow: 'none',
                              '&:hover': {
                                borderColor: '#D1D5DB',
                              },
                            }),
                            placeholder: (baseStyles) => ({
                              ...baseStyles,
                              color: '#6B7280',
                            }),
                            singleValue: (baseStyles) => ({
                              ...baseStyles,
                              color: '#1F2937',
                            }),
                          }}
                          required={true}
                        />
                      )}
                    </div>



                  </div>



                  <div>
                    <label className="block text-sm font-medium">Allocating Employee</label>
                    {/* <select
                    name="employeeName"
                    value={formData.employeeName}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp} value={emp}>{emp}</option>
                    ))}
                  </select> */}
                    <AsyncSelect
                      name="employeeName"
                      value={selectedEmployeeOption}
                      onChange={handleEmployeeSelectChange}
                      loadOptions={loadEmployeeOptions}
                      defaultOptions={true}
                      cacheOptions
                      placeholder={employeeListLoading ? 'Loading employees...' : 'Select Employee'}
                      isDisabled={false}
                      isSearchable={true}
                      isClearable={true}
                      className="w-full mt-1 mb-2 focus:outline-none focus:none focus:none"
                      classNamePrefix="react-select"
                      styles={{
                        control: (baseStyles) => ({
                          ...baseStyles,
                          minHeight: '42px',
                          borderColor: '#D1D5DB',
                          borderRadius: '0.375rem',
                          boxShadow: 'none',
                          '&:hover': {
                            borderColor: '#D1D5DB',
                          },
                        }),
                        placeholder: (baseStyles) => ({
                          ...baseStyles,
                          color: '#6B7280',
                        }),
                        singleValue: (baseStyles) => ({
                          ...baseStyles,
                          color: '#1F2937',
                        }),
                      }}
                      required={true}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Issue Type</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full mt-1 p-2 custom-select border rounded-md focus:outline-none focus:none focus:none"
                    // required
                    >
                      <option value="">Select Issue</option>
                      {issueCategories?.map((cat: any, index: number) => (
                        <option key={index + 1} value={cat?.name}>
                          {cat?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {isEditMode && (
                    <>
                      <div>
                        <label className="block text-sm font-medium">Ticket Created On</label>
                        <DatePicker
                          placeholderText="Start Date"
                          selected={selectedStartDate}
                          onChange={(date) => changeDate(date, 'raiseDate')}
                          dateFormat="dd-MM-yyyy"
                          className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Close Date</label>
                        <DatePicker
                          placeholderText="Closing Date"
                          selected={selectedCloseDate}
                          onChange={(date) => changeDate(date, 'closingDate')}
                          dateFormat="dd-MM-yyyy"
                          className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
                        />
                      </div>
                    </>
                  )}

                  {isEditMode && (
                    <div>
                      <label className="block text-sm font-medium">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
                        required
                      >
                        <option value={''}>Select Status</option>
                        {status.map((status: any) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {isEditMode && (
                    <div>
                      <label className="block text-sm font-medium">Remarks</label>
                      <textarea
                        name="remarks"
                        placeholder="Remarks"
                        rows={2}
                        value={formData.remarks}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"

                      />
                    </div>
                  )}
                </div>



                <textarea
                  name="description"
                  placeholder="Issue Description"
                  rows={2}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full mt-2 p-2 border rounded-md focus:outline-none focus:none focus:none"
                  required
                />

                {/* <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:text-sm file:rounded-full file:bg-green-100 file:text-green-700"
                /> */}

                <div className="space-y-4">
                  {/* File input button */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Images
                      {isUploading && (
                        <span className="ml-2 text-blue-600 text-sm">
                          <svg className="inline animate-spin -ml-1 mr-1 h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </span>
                      )}
                    </label>
                    <input
                      key={fileInputKey}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:text-sm file:rounded-full file:bg-green-100 file:text-green-700 hover:file:bg-green-200 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Preview and upload section */}
                {/* <div className="grid grid-cols-3 gap-4 mt-4">
                  {previewImages.map((preview, index) => (
                    <div key={`preview-${index}`} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />

                      
                      {newImages[index] && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-xs truncate">
                          {newImages[index].imagePath}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div> */}

                {/* {isLoading && (
                  <div style={{ marginTop: '10px', color: 'blue' }}>
                    Uploading image(s)... Please wait.
                    
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                  </div>
                )} */}
                {previewImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previewImages.map((preview, index) => (
                      <div key={`preview-${index}`} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 object-cover rounded cursor-pointer"
                        />

                        {/* Show server path if available */}
                        {newImages[index] && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-xs truncate">
                            {newImages[index].imagePath}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          // className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* {previewImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previewImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={img}
                          alt={`preview-${idx}`}
                          className="w-16 h-16 object-cover rounded cursor-pointer"
                          onClick={() => setSelectedImage(img)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )} */}





                {isEditMode &&
                  Array.isArray(formData?.imagepath) &&
                  formData.imagepath.some((img: any) => typeof img?.imagePath === 'string' && img.imagePath.trim() !== '') && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">Uploaded Images</label>
                      <div className="flex flex-wrap gap-2">
                        {formData.imagepath
                          .filter((img: any) => typeof img?.imagePath === 'string' && img.imagePath.trim() !== '')
                          .map((img: any) => {
                            const uniqueId = img.imagePath.split('/').pop() || img.imagePath;
                            return (
                              <div key={`existing-${uniqueId}`} className="relative">
                                <img
                                  src={`${img.imagePath}`}
                                  alt={`uploaded-image-${uniqueId}`}
                                  className="w-16 h-16 object-cover rounded cursor-pointer border"
                                  onClick={() => setSelectedImage(img.imagePath)}
                                  onError={(e) => {
                                    e.currentTarget.alt = 'Image not found';
                                    e.currentTarget.src = '';
                                  }}
                                />
                                {/* <button
                                  type="button"
                                  onClick={() => handleRemoveExistingImage(img.imagePath)}
                                  className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                                >
                                  ×
                                </button> */}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}


              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border text-gray-600 hover:text-red-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  disabled={isUploading}
                >
                  {isEditMode ? 'Update' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[10001] bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-xl relative max-w-3xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-black hover:text-red-600"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              className="max-h-[80vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}


      <TicketDetailsModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        data={ticketDetails}
        isStatus={isEditMode}
      />


      <div className="grid grid-cols-12 gap-4 mb-6">

        <div className="col-span-12 md:col-span-2">
          <select
            name="userType"
            value={userType}
            onChange={handleFilterChange}
            className="w-full mt-1 custom-select p-2 border rounded-md focus:outline-none focus:none focus:none"
          >
            <option value={''} className='text-gray-200'>Select Usertype</option>
            <option value="Customer">Customer</option>
            <option value="Merchent">Merchent</option>
          </select>
        </div>

        <div className="col-span-12 md:col-span-2">

          <div className="relative">
            <input
              type="text"
              value={searchEmpTerms}
              placeholder="Search Employee"
              onChange={handleFilterUserChange}
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
            />
            {debouncedSearchEmpTerm && (
              <button onClick={clearEmpSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                <FaTimes className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="col-span-12 md:col-span-2">
          <select
            name="category"
            value={filterStatus}
            onChange={handleStatusChange}
            className="w-full mt-1 p-2 custom-select border rounded-md focus:outline-none focus:none focus:none"
            required
          >
            <option value={''}>Select Status</option>
            {status.map((status: any) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="col-span-12 md:col-span-2">
          <div className="relative">
            <DatePicker
              placeholderText="Created Date"
              selected={selectedCreatedDate}
              onChange={changeCreatedDate}
              dateFormat="dd-MM-yyyy"
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
              showIcon={false}
            />
            {selectedCreatedDate && (
              <button onClick={clearCreateDate} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                <FaTimes className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="col-span-12 md:col-span-2">
          <div className="relative">
            <DatePicker
              placeholderText="Closing Date"
              selected={selectedDate}
              onChange={changeCloseDate}
              dateFormat="dd-MM-yyyy"
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:none focus:none"
              showIcon={false}
            />
            {selectedDate && (
              <button onClick={clearCloseDate} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
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
                data={supportData?.pageData}
                viewDetails={canView ? handleView : undefined}
                onDelete={canDelete ? deleteRow : undefined}
                viewTxn={undefined}
                viewImage={undefined}
                onEdit={canEdit ? handleEdit : undefined}

              />
            </div>

          </div>
          <div className="flex items-center justify-self-center border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className='justify-self-center'>
              <Pagination currentPage={currentPage} totalPages={supportData?.totalPages} handlePageChange={handlePageChange} />
            </div>
          </div>
        </>
      )}

      <ImageViewerModal
        images={currentImages} // Pass the images from the selected issue
        isOpen={isImageModalOpen}
        onClose={closeImagesModal}
        initialSlide={initialSlideIndex}
      />

      <DeletePopup
        isOpen={isDeletePopupOpen}
        onClose={closeDeletePopup}
        onConfirm={deleteTicket}
        loading={isDeleteLoading}
        itemId={selectedId || ''}
      />
    </div>

  );
};

export default IssueFormModal;
