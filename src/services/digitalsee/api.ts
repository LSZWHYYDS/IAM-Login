import { errorCode, getXsrf_token } from '@/utils/common.utils';
// import conf from '@/utils/conf';
// import * as WebAuth from '@/utils/webAuth';
// import staticMethod from '@/utils/staticMethod';
import { Modal } from 'antd';
import { history } from 'umi';
import request from 'umi-request';

// request拦截器, 改变url 或 options.
request.interceptors.request.use((url, options) => {
  const authHeader = {};
  if (sessionStorage.getItem('tcode')) {
    authHeader['tcode'] = sessionStorage.getItem('tcode');
  }
  if (!options.method) {
    options.method = 'get';
  }
  if (options.headers && !options.headers['Content-Type']) {
    options.headers['Content-Type'] = 'application/json';
  }
  const token = getXsrf_token();
  if (token && !url.includes('login_hello')) {
    authHeader['x-xsrf-token'] = token;
  }
  return {
    url: url,
    options: { ...options, interceptors: true, headers: authHeader },
  };
});

request.interceptors.response.use(async (response, options) => {
  const data = await response.clone().json();
  if (options.noTip) {
    return response;
  }
  // 不同操作情况不同，由各个地方发出请求时进行判断需不需要显示，以及如何显示提示信息
  if (data.code === '0' || data.error === '0') {
  } else {
    if (data.error == '1010212') {
      //需要修改密码
      Modal.error({
        title: '提示',
        content:
          (data.error && errorCode[data.error]) ||
          data.error_description ||
          '操作失败，请重新确认操作',
        onOk: () => {
          history.push('/modifyPassword/' + location.search);
        },
      });
      return;
    }
    if (data.error == '1010103') {
      Modal.error({
        title: '提示',
        content:
          (data.error && errorCode[data.error]) ||
          data.error_description ||
          '操作失败，请重新确认操作',
        onOk: () => {
          //  window.location.href = location.origin + '/uc';
        },
      });
      return;
    }
    if (data.error == '1010250') {
      Modal.error({
        title: '提示',
        content: '滑块验证异常, 请刷新重试',
      });
      return;
    }

    Modal.error({
      title: '提示',
      content:
        (data.error && errorCode[data.error]) ||
        data.error_description ||
        '操作失败，请重新确认操作',
    });
  }
  return response;
});

/**
 * 获取当前的用户
 */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/iam/api/self/user_info', {
    method: 'GET',
    noTip: true,
    ...(options || {}),
  });
}

/** 退出登录接口 POST /iam/api/login/logout */
export async function logout(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/iam/api/login/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  sessionStorage.setItem('loginId', body.username || '');
  return request<API.LoginResult>('/login/basic_auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function getConfigsPolicies() {
  return request('/iam/api/configs/policies', {
    method: 'GET',
  });
}

export const errPlaceholder = '操作失误，请确认操作是否正确!';

export const resetRequestHeader = () => {
  // request拦截器, 改变url 或 options.
  request.interceptors.request.use((urls, options) => {
    const authHeader = {};
    if (sessionStorage.getItem('tcode')) {
      authHeader['tcode'] = sessionStorage.getItem('tcode');
    }
    if (!options.method) {
      options.method = 'get';
    }
    if (options.headers && !options.headers['Content-Type']) {
      options.headers['Content-Type'] = 'application/json';
    }
    const token = getXsrf_token();

    if (token && !urls.includes('login_hello')) {
      authHeader['x-xsrf-token'] = token;
    }
    if (options.url.indexOf('/api/configs/policies')) {
      authHeader['tcode'] = sessionStorage.getItem('tcode');
    }
    return {
      url: urls,
      options: { ...options, interceptors: true, headers: authHeader },
    };
  });
};
export async function getPolicies() {
  return request<API.ResponseData>('/iam/api/configs/policies', {
    headers: {
      Authorization: ``,
    },
  });
}
