import request from 'umi-request';
import { createQueryString } from '@/utils/common.utils';
// 查询用户数，包含下级组
export async function getUserCount(params = { page: 0, size: 10 }) {
  const newParams = { ...params };
  newParams.attrs = 'sub,name';
  const { org_id: orgId } = newParams;
  if (orgId) {
    newParams.return_users_in_sub_org = true;
  }
  return request<API.ResponseData>(`/iam/api/users${createQueryString(newParams)}`);
}
export async function getUserList(params = { page: 0, size: 10 }) {
  const newParams = { ...params };
  newParams.attrs =
    'sub,name,org_ids,email,username,status,phone_number,readonly,come_from,picture,created_mode';
  const { org_id: orgId } = newParams;
  if (orgId) {
    if (orgId === '_root') {
      newParams.return_users_in_sub_org = true; // return users in sub org
    } else {
      newParams.return_users_in_sub_org = false; // do not return users in sub org
    }
  }
  return request<API.ResponseData>(`/iam/api/users${createQueryString(newParams)}`, {
    noTip: true,
  });
}

export async function getUserListWithSub(params = { page: 0, size: 10 }) {
  const newParams = { ...params };
  newParams.attrs =
    'sub,name,org_ids,email,username,status,phone_number,readonly,come_from,picture,created_mode';
  const { org_id: orgId } = newParams;
  if (orgId) {
    newParams.return_users_in_sub_org = true;
  }
  return request<API.ResponseData>(`/iam/api/users${createQueryString(newParams)}`, {
    noTip: true,
  });
}

//incsearch user.
export async function incsearch(keyword: string) {
  const params = {
    q: keyword,
    limit: 20,
    attrs: 'sub,username,name,email,picture',
    // m: "inc",
  };
  return request<API.ResponseData>('/iam/api/users' + createQueryString(params), {
    noTip: true,
  });
}
export async function adminResetUserPwd(data: any) {
  return request<API.ResponseData>('/iam/api/users/password', {
    method: 'POST',
    data,
  });
}
export async function updatePwd(data: any) {
  request.interceptors.request.use((url, options) => {
    const authHeader = { tcode: sessionStorage.getItem('tcode') };
    return {
      url: url,
      options: { ...options, interceptors: true, headers: authHeader },
    };
  });
  return request<API.ResponseData>('/iam/api/self/password', {
    method: 'PUT',
    data,
  });
}
export async function forgetPwd(username: string) {
  request.interceptors.request.use((url, options) => {
    const authHeader = { tcode: sessionStorage.getItem('tcode') };
    return {
      url: url,
      options: { ...options, interceptors: true, headers: authHeader },
    };
  });
  return request<API.ResponseData>('/iam/api/self/forget_password', {
    method: 'POST',
    data: { username },
  });
}
export async function validateSmsCode(params: any) {
  return request<API.ResponseData>(
    '/iam/api/self/verify_forget_password_sms_code' + createQueryString(params),
  );
}
export async function updatePwdAfterForget(params: any) {
  request.interceptors.request.use((url, options) => {
    return {
      url: url,
      options: {
        ...options,
        interceptors: true,
        headers: { tcode: sessionStorage.getItem('tcode') },
      },
    };
  });
  return request<API.ResponseData>('/iam/api/self/reset_password', {
    method: 'POST',
    data: params,
  });
}
// getSelfPermSets() {
//   return axios.get("/self/permission_sets");
// },
// let userMgrAPI = {
//     //查询用户数，包含下级组
//     getUserCount(params={page: 0, size: 10}) {
//         params.attrs = "sub,name";
//         const { org_id:orgId } = params;
//         if (orgId) {
//             params.return_users_in_sub_org = true;
//         }
//         return axios.get("/users", {params});
//     },
//     getUserList(params={page: 0, size: 10}) {
//         params.attrs = "sub,name,org_ids,email,username,status,phone_number,readonly,come_from,picture,created_mode";
//         const { org_id:orgId } = params;
//         if (orgId) {
//             if (orgId === '_root') {
//                 params.return_users_in_sub_org = true; //return users in sub org
//             }else {
//                 params.return_users_in_sub_org = false; //do not return users in sub org
//             }
//         }
//         return axios.get("/users", {params});
//     },
//     //incsearch user.
//     incsearch(keyword) {
//         const params = {
//             q : keyword,
//             limit: 20,
//             attrs : "sub,username,name,email,picture",
//             m: "inc",
//         };
//         const api = axios.get("/users" + util.createQueryString(params));
//         return api;
//     },
//     getUser(username) {
//         return axios.get("/user" + util.createQueryString({username}));
//     },
//     /**
//      * get all the applications which are entitled to a specific user.
//      * @param {object} params must includes username
//      */
//     getUserEntitledApp(params) {
//         return axios.get("/user/apps" + util.createQueryString(params));
//     },
//     getSelfInfo() {
//         return axios.get("/self/user_info", {
//             headers: {
//                 "Authorization": "Bearer " + sessionStorage.getItem("access_token"),
//                 "Content-Type": "application/json;charset=UTF-8"
//             }
//         });
//     },

//     /**
//      * Reinvite user
//      * @param {string} username
//      * @returns
//      */
//     reinviteUser (username) {
//         return axios.patch("/user/push?username="+username);
//     },

//     /**
//      * get self permission sets.
//      */
//     getSelfPermSets() {
//         return axios.get("/self/permission_sets");
//     },
//     updatePwd(params) {
//         return axios.put("/self/password", params, {
//             headers: {
//                 "tcode": sessionStorage.getItem("tcode")
//             }
//         });
//     },
//     addUser(data, params) {
//         return axios.post("/users" + util.createQueryString(params), data);
//     },
//     delUser(ids) {
//         return axios.post("/users/delete", {
//             usernames: ids
//         });
//     },
//     editUser(username, data) {
//         return axios.patch("/user" + util.createQueryString({username}), data);
//     },

//     changeStatus(isActived, ids) {
//         return axios.put("/users/status", {
//             "status": isActived ? "ACTIVE" : "INACTIVE",
//             "usernames": ids
//         });
//     },
//     getPreImportUsers(params={page: 0, size: 10}) {
//         return axios.get("/users/pre_import" + util.createQueryString(params));
//     },
//     saveImportUsers(isCover) {
//         return axios.post("/users/import", {
//             "replace": isCover
//         });
//     },
//     delPreImportedUsers() {
//         return axios.delete("/users/pre_import");
//     },
//     getPreImportResult() {
//         return axios.get("/users/pre_import/statistics");
//     },
//     sendValidateEmail() {
//         return axios.post("/self/email_to_verify_email_address", null, {
//             "content-type": "application/json;charset=UTF-8"
//         });
//     },
//     verifyEmail(token,tcode) {
//         return axios.get("/self/verify_email_address/" + token,{headers:{"tcode":tcode}});
//     },
//     importAdLdap() {
//         return axios.post("/users/pre_import/idp" , null, {
//             "content-type": "application/json;charset=UTF-8"
//         });
//     },
//     //testing ad/ldap import
//     testAdLdapImport(data) {
//         return axios.post("/users/sync_test", data);
//     },

//     saveAdLdapConfig(data) {
//         return axios.patch("/connectors/pre_import/config", data);
//     },
//     getPreImportConfig() {
//         return axios.get("/connectors/pre_import/config");
//     },
//     getImportConfigTips() {
//         return axios.get("/connectors/pre_import/config/tips");
//     },
//     getDsProfiles() {
//         return axios.get("push/connectors/ds_profiles");
//     },

//     sendValidateMobile() {
//         return axios.post("/self/send_verify_mobile_code", null, {
//             "content-type": "application/json;charset=UTF-8"
//         });
//     },
//     validateMobile(smsCode) {
//         return axios.get("/self/verify_mobile/" + smsCode);
//     },
//     validateSmsCode(params,tcode) {
//         return axios.get("/self/verify_forget_password_sms_code" + util.createQueryString(params),{headers:{tcode:tcode}});
//     },
//     /**
//      * get self certificates.
//      */
//     getSelfCerts() {
//         return axios.get("/self/cert");
//     },

//     /**
//      * self active/inactive cert by cert id
//      * @param {string} status INACTIVE/ACTIVE
//      */
//     selfToggleCertStatus(certid, status) {
//         return axios.patch("/self/cert/" + certid + "/status", {status});
//     },

//     /**
//      * self delete one certificate.
//      * @param {string} certid certification id
//      */
//     selfDeleteCert(certid) {
//         return axios.delete("/self/cert/" + certid);
//     },

//     /**
//      * user admin to get someone else's certificates.
//      * @param {string} username
//      */
//     adminGetUserCerts(username) {
//         return axios.get("/user_cert" + util.createQueryString({ username }));
//     },

//     /**
//      * user admin to active/inactive someone else's certificate.
//      * @param {string} cert_id certification identity
//      * @param {string} status ACTIVE/INACTIVE
//      * @param {string} username
//      */
//     adminToggleCertStatus(cert_id, status, username) {
//         return axios.patch("/user_cert/change_status" + util.createQueryString({cert_id, username}),{status});
//     },

//     /**
//      * user admin to delete someone else's certificate.
//      * @param {string} certid certification identity
//      * @param {string} username
//      */
//     adminDeleteCert(certid, username) {
//         return axios.delete("/user_cert/" + certid + util.createQueryString({username}));
//     },
// };

// export default userMgrAPI;
