import axios from "axios";
import { store } from "../store";

export const formatDate = (date: any) => {
    if (date) {
        const [year, month, day] = date.split('-');
        const result = [day, month, year].join('-');
        //   console.log("RESULT", result);
        return result;
    }
};

export const formatDatewithSlash = (date: any) => {
    if (date) {
        const [year, month, day] = date.split('-');
        const result = [day, month, year].join('-');
        //   console.log("RESULT", result);
        return result;
    }
};

export const newFormatDate = (dateString: string): string => {
    //console.log(dateString, 'given Date');
    const date = new Date(dateString);

    //console.log(date, 'given Date');

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    // console.log(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const changeFormatDate = (dateString: string): string => {
    //console.log(dateString, 'given Date');

    // Parse DD-MM-YYYY to YYYY-MM-DD
    const [day, month, year] = dateString.split('-');
    const date = new Date(`${year}-${month}-${day}T00:00:00`);

    if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return '';
    }

    const formattedYear = date.getFullYear();
    const formattedMonth = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const formattedDay = String(date.getDate()).padStart(2, '0');

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${formattedYear}-${formattedMonth}-${formattedDay}T${hours}:${minutes}:${seconds}`;
};


export const normalFormatDate = (dateString: string): string => {
    //console.log(dateString, 'given Date');
    const date = new Date(dateString);

    //console.log(date);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    //console.log(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
    return `${day}-${month}-${year}T${hours}:${minutes}:${seconds}`;
};

export const truncateDescription = (
    text: string,
    wordLimit: number
): string => {
    const words = text.split(' ');
    return words.length > wordLimit
        ? words.slice(0, wordLimit).join(' ') + '...'
        : text;
};


export const mapApiPermissionsToState = (apiData: any[]) => {
    const newCheckedSubItems: {
        [roleId: string]: {
            [moduleId: string]: {
                [perm: string]: boolean;
            };
        };
    } = {};

    apiData.forEach(entry => {
        const {
            roleId,
            moduleId,
            privilegeView = false,
            privilegeCreate = false,
            privilegeUpdate = false,
            privilegeDelete = false,
        } = entry;

        // Initialize if not exists
        if (!newCheckedSubItems[roleId]) newCheckedSubItems[roleId] = {};
        if (!newCheckedSubItems[roleId][moduleId]) {
            newCheckedSubItems[roleId][moduleId] = {
                View: false,
                Add: false,
                Edit: false,
                Delete: false,
                All: false
            };
        }

        const perms = newCheckedSubItems[roleId][moduleId];

        // Only set to true if explicitly true in API data
        if (privilegeView) perms["View"] = true;
        if (privilegeCreate) perms["Add"] = true;
        if (privilegeUpdate) perms["Edit"] = true;
        if (privilegeDelete) perms["Delete"] = true;

        // Calculate "All" based on individual permissions
        perms["All"] = ["View", "Add", "Edit", "Delete"].every(p => perms[p]);
    });

    return newCheckedSubItems;
};

export const hasAccess = (
    moduleName: string,
    privilege: 'privilegeView' | 'privilegeCreate' | 'privilegeUpdate' | 'privilegeDelete' = 'privilegeView'
): boolean => {
    const getRoles = () => store.getState().user?.roles || 'UnknownRole';
    const role = getRoles();

    // Super admin bypass
    if (role.includes('SUPER_ADMIN')) return true;

    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const roleData = JSON.parse(localStorage.getItem('userRole') || '[]');

    const seen = new Set<string>();
    const filteredPermissions = permissions.filter((p: any) => {
        const key = `${p.roleName}:${p.moduleName}`;
        const isValid = roleData.includes(p.roleName) && !seen.has(key);
        if (isValid) seen.add(key);
        return isValid;
    });

    return filteredPermissions.some((perm: any) => {
        const moduleMatch = perm.moduleName === moduleName;
        const privilegeMatch = perm[privilege] === true;
        return moduleMatch && privilegeMatch;
    });
};

export const getUserIP = async (): Promise<string> => {
    try {
        const res = await axios.get('https://api4.ipify.org?format=json');
        return res.data.ip;
    } catch (error) {
        console.error('Failed to fetch IPv4 address:', error);
        return 'Unknown';
    }
};

export const displayFormatDateWithoutAMPM = (value: string | null) => {
    if (!value) return "-";

    let date: Date | null = null;

    // Try ISO format first (2025-07-14 09:20:28)
    const isoDate = new Date(value);
    if (!isNaN(isoDate.getTime())) {
        date = isoDate;
    } else {
        // Fallback: try DD-MM-YYYY HH:MM:SS
        const match = value.match(/^(\d{2})-(\d{2})-(\d{4})[ T](\d{2}):(\d{2}):(\d{2})$/);
        if (match) {
            const [_, dd, mm, yyyy, hh, min, ss] = match;
            date = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`);
        }
    }

    if (!date || isNaN(date.getTime())) {
        return "Invalid Date";
    }

    const dateStr = date.toLocaleDateString("en-GB").replace(/\//g, "-");
    const timeStr = date.toLocaleTimeString("en-GB", {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    return (
        <span className="flex flex-col leading-tight">
            <span>{dateStr}</span>
            <span className="text-xs text-gray-500">{timeStr}</span>
        </span>
    );
}

export const displayFormatDate = (value: string | null) => {
    if (!value) return "-";

    let date: Date | null = null;

    // Try ISO format first (2025-07-14 09:20:28)
    const isoDate = new Date(value);
    if (!isNaN(isoDate.getTime())) {
        date = isoDate;
    } else {
        // Fallback: try DD-MM-YYYY HH:MM:SS
        const match = value.match(/^(\d{2})-(\d{2})-(\d{4})[ T](\d{2}):(\d{2}):(\d{2})$/);
        if (match) {
            const [_, dd, mm, yyyy, hh, min, ss] = match;
            date = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`);
        }
    }

    if (!date || isNaN(date.getTime())) {
        return "Invalid Date";
    }

    const dateStr = date.toLocaleDateString("en-GB").replace(/\//g, "-");
    const timeStr = date.toLocaleTimeString("en-GB", {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true // Add this to show AM/PM
    });

    return (
        <span className="flex flex-col leading-tight">
            <span>{dateStr}</span>
            <span className="text-xs text-gray-500">{timeStr}</span>
        </span>
    );
};

export const PageSize = 10;