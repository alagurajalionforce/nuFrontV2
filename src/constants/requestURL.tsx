type UrlTypes = {
  [key: string]: {
    path: string;
    method: string;
  };
};

const urls: UrlTypes = {
  signIn: {
    path: 'auth/signin',
    method: 'POST',
  },
  saveConfiguration: {
    path: 'app/chatConfig',
    method: 'POST',
  },
  supportTicket: {
    path: 'app/supportTicket',
    method: 'POST',
  },
  updateTicket: {
    path: 'app/supportTicket',
    method: 'PUT',
  },
  updateVerified: {
    path: 'app/updateStatus',
    method: 'PUT',
  },
  deleteSupportRow: {
    path: 'app/supportTicket',
    method: 'DELETE',
  },
  deleteEmployee: {
    path: 'app/employee',
    method: 'DELETE',
  },
  addEmployee: {
    path: 'app/employee',
    method: 'POST',
  },
  updateEmployee: {
    path: 'app/employee',
    method: 'PUT',
  },
  fileUpload: {
    path: 'auth/file',
    method: 'POST',
  },
  saveRole: {
    path: 'app/saveRole',
    method: 'POST',
  },
  updateRole: {
    path: 'app/saveRole',
    method: 'PUT',
  },
  deleteRole: {
    path: 'app/deleteRole',
    method: 'DELETE',
  },
  saveModule: {
    path: 'app/saveModule ',
    method: 'POST',
  },
  deleteModule: {
    path: 'app/deleteModule',
    method: 'DELETE',
  },
  modulePrivilege: {
    path: 'app/saveModulePrivilegeMapping',
    method: 'POST',
  },
  refreshToken: {
    path: 'auth/refreshToken', // or whatever your refresh endpoint is
    method: 'POST',
  },
  // updateConfiguration: {
  //   path: 'app/chatConfig',
  //   method: 'PUT',
  // },
  //updateEmployee updateTicket  app/saveRole updateRole deleteRole saveModule 


}

export default urls;
