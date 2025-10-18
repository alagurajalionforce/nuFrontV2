import { FaUserFriends, FaUsers, FaRocketchat, FaLifeRing, FaUsersCog, FaFolderOpen, FaUserPlus } from "react-icons/fa";
import { CgHome } from "react-icons/cg";
import { AiOutlineUserSwitch } from "react-icons/ai";
import { GrTransaction } from "react-icons/gr";
import { TfiDashboard } from "react-icons/tfi";
import AllMerchants from '../pages/merchants/allList/AllMerchants';
import AllMerchantTxns from '../pages/merchants/txnList/AllTxnList'
import AllCustomerList from "../pages/customers/allList/AllCustomerList";
import AllTxnList from "../pages/customers/txnList/AllTxnList";
import MerchantDetails from '../pages/merchants/allList/viewDetails';
import MerchantAllTxnDetails from '../pages/merchants/allList/viewTsxDetails';
import MerchantTxnDetails from '../pages/merchants/txnList/viewTsxDetails';
import CustomerDetails from '../pages/customers/allList/viewDetails';
import CustomerAllTxnDetails from '../pages/customers/allList/viewTxnDetails';
import CustomerTxnDetails from '../pages/customers/txnList/viewTxnDetails';
import ChatConfiguration from '../pages/chat/settings/chatSettings';
import AddChat from '../pages/chat/add/addChat';
import ReconciliationPage from "../pages/reconciliation/index";
import Support from '../pages/support/contact';
import EmployeeManager from "../pages/staff/staffs";
import Dashboard from "../pages/dashboard/dashboard";
import AuditTrail from "../pages/audit/auditTrail";
import UsersRole from "../pages/userRole/usersRole";
import RoleManagement from "../pages/userRole/roles";
import ModuleManagement from "../pages/userRole/modules";



export type Role =
    | 'customer'
    | 'ROLE_ADMIN';


export interface RouteConfig {
    path: string;
    component: React.ComponentType;
    roles?: any[];
    label?: string;
    linkType?: string;
    icon: any;
    parent?: any;
}


export const getRoutes = async (): Promise<RouteConfig[]> => {

    const routes: RouteConfig[] = [
        {
            path: '/dashboard',
            component: Dashboard,
            label: 'Dashboard',
            icon: TfiDashboard,
            linkType: 'menu',
        },
        {
            path: '/merchant/lists',
            component: AllMerchants,
            label: 'All Merchants',
            icon: FaUserFriends,
            linkType: 'menu',
        },
        {
            path: '/merchants/transactions',
            component: AllMerchantTxns,
            label: 'Merchant Transactions',
            icon: GrTransaction,
            linkType: 'menu',
        },
        //MerchantDetails
        {
            path: '/merchant-details',
            component: MerchantDetails,
            label: 'Merchant Details',
            icon: GrTransaction,
            linkType: 'page',
            parent: 'All Merchants',
        },
        {
            path: '/merchant-all-transaction-details',
            component: MerchantAllTxnDetails,
            label: 'Merchant all details',
            icon: GrTransaction,
            linkType: 'page',
            parent: 'All Merchants',
        },
        {
            path: '/merchant-transaction-details',
            component: MerchantTxnDetails,
            label: 'Merchant Transaction Details',
            icon: GrTransaction,
            linkType: 'page',
            parent: 'Merchant Transactions',
        },
        //customers
        {
            path: '/customers/list',
            component: AllCustomerList,
            label: 'All Customers',
            icon: FaUsers,
            linkType: 'menu',
        },

        {
            path: '/customers/transactions',
            component: AllTxnList,
            label: 'Customer Transactions',
            icon: GrTransaction,
            linkType: 'menu',
        },

        {
            path: '/customer-details',
            component: CustomerDetails,
            label: 'Customer Details',
            icon: GrTransaction,
            linkType: 'page',
            parent: 'All Customers',
        },
        {
            path: '/customer-all-transaction-details',
            component: CustomerAllTxnDetails,
            label: 'Customer all details',
            icon: GrTransaction,
            linkType: 'page',
            parent: 'All Customers',
        },
        {
            path: '/customer-transaction-details',
            component: CustomerTxnDetails,
            label: 'Customer Transaction Details',
            icon: GrTransaction,
            linkType: 'page',
            parent: 'Customer Transactions',
        },

        //Chat - AddChat

        {
            path: '/chat/chat-configuration',
            component: ChatConfiguration,
            label: 'Chat Configuration',
            icon: FaRocketchat,
            linkType: 'menu',
        },
        {
            path: '/chat/add',
            component: AddChat,
            label: 'Add Chat',
            icon: FaRocketchat,
            linkType: 'page',
            parent: 'Chat Configuration',
        },
        //EmployeeManager
        {
            path: '/employee-manager',
            component: EmployeeManager,
            label: 'Employee Manager',
            icon: FaUsersCog,
            linkType: 'menu',
        },
        //Support

        {
            path: '/support',
            component: Support,
            label: 'Support',
            icon: FaLifeRing,
            linkType: 'menu',
        },

        //Audit Trail

        {
            path: '/audit-trail',
            component: AuditTrail,
            label: 'Audit Trail',
            icon: FaFolderOpen,
            linkType: 'menu',
        },

        //User Role 

        {
            path: '/user-role',
            component: UsersRole,
            label: 'User Role',
            icon: FaUserPlus,
            linkType: 'menu',
        },
        {
            path: '/roles',
            component: RoleManagement,
            label: 'Role Management',
            icon: FaUserPlus,
            linkType: 'page',
            parent: 'User Role',
        },
        {
            path: '/modules',
            component: ModuleManagement,
            label: 'Module Management',
            icon: FaUserPlus,
            linkType: 'page',
            parent: 'User Role',
        },



    ];
    return routes;
}

export const routes: RouteConfig[] = [
    {
        path: '/dashboard',
        component: Dashboard,
        label: 'Dashboard',
        icon: TfiDashboard,
        linkType: 'menu',
    },
    {
        path: '/merchant/lists',
        component: AllMerchants,
        label: 'All Merchants',
        icon: FaUserFriends,
        linkType: 'menu',
    },
    {
        path: '/merchants/transactions',
        component: AllMerchantTxns,
        label: 'Merchant Transactions',
        icon: GrTransaction,
        linkType: 'menu',
    },
    //MerchantDetails
    {
        path: '/merchant-details',
        component: MerchantDetails,
        label: 'Merchant Details',
        icon: GrTransaction,
        linkType: 'page',
        parent: 'All Merchants',
    },
    {
        path: '/merchant-all-transaction-details',
        component: MerchantAllTxnDetails,
        label: 'Merchant all details',
        icon: GrTransaction,
        linkType: 'page',
        parent: 'All Merchants',
    },
    {
        path: '/merchant-transaction-details',
        component: MerchantTxnDetails,
        label: 'Merchant Transaction Details',
        icon: GrTransaction,
        linkType: 'page',
        parent: 'Merchant Transactions',
    },
    //customers
    {
        path: '/customers/list',
        component: AllCustomerList,
        label: 'All Customers',
        icon: FaUsers,
        linkType: 'menu',
    },

    {
        path: '/customers/transactions',
        component: AllTxnList,
        label: 'Customer Transactions',
        icon: GrTransaction,
        linkType: 'menu',
    },

    {
        path: '/customer-details',
        component: CustomerDetails,
        label: 'Customer Details',
        icon: GrTransaction,
        linkType: 'page',
        parent: 'All Customers',
    },
    {
        path: '/customer-all-transaction-details',
        component: CustomerAllTxnDetails,
        label: 'Customer all details',
        icon: GrTransaction,
        linkType: 'page',
        parent: 'All Customers',
    },
    {
        path: '/customer-transaction-details',
        component: CustomerTxnDetails,
        label: 'Customer Transaction Details',
        icon: GrTransaction,
        linkType: 'page',
        parent: 'Customer Transactions',
    },

    //Chat - AddChat

    {
        path: '/chat/chat-configuration',
        component: ChatConfiguration,
        label: 'Chat Configuration',
        icon: FaRocketchat,
        linkType: 'menu',
    },
    {
        path: '/chat/add',
        component: AddChat,
        label: 'Add Chat',
        icon: FaRocketchat,
        linkType: 'page',
        parent: 'Chat Configuration',
    },
    //EmployeeManager
    {
        path: '/employee-manager',
        component: EmployeeManager,
        label: 'Employee Manager',
        icon: FaUsersCog,
        linkType: 'menu',
    },
    //Support

    {
        path: '/support',
        component: Support,
        label: 'Support',
        icon: FaLifeRing,
        linkType: 'menu',
    },

    //Audit Trail

    {
        path: '/audit-trail',
        component: AuditTrail,
        label: 'Audit Trail',
        icon: FaFolderOpen,
        linkType: 'menu',
    },

    //User Role 

    {
        path: '/user-role',
        component: UsersRole,
        label: 'User Role',
        icon: FaUserPlus,
        linkType: 'menu',
    },
    {
        path: '/roles',
        component: RoleManagement,
        label: 'Role Management',
        icon: FaUserPlus,
        linkType: 'page',
        parent: 'User Role',
    },
    {
        path: '/modules',
        component: ModuleManagement,
        label: 'Module Management',
        icon: FaUserPlus,
        linkType: 'page',
        parent: 'User Role',
    },



];

export const defaultRoute = '/dashboard';
