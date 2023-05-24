import {
  CookieUtil,
  getClientIdFromWindowLocation,
  setXsrf_token,
  parseQueryString,
  useStateCallback,
  getContinue,
} from '@/utils/common.utils';
import { Divider, message, Spin, Tooltip } from 'antd';
import JSEncrypt from 'jsencrypt';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import {
  basicAuth,
  generateNonce,
  getLoginConfig,
  loginHello,
  otpAuth,
  sendOtp,
  adLoginType,
  getPoliceInfo,
} from '../service';
import styles from './index.less';
import staticMethod from '@/utils/staticMethod';
import ScanCode from './components/ScanCode';
import AccessPassword from './components/AccessPassword';
import { useEventEmitter, useSessionStorageState, useSetState } from 'ahooks';
import SmsSent from './SmsSent';
import { windowObj } from './SliderComponent/jigsaw';
import { history } from 'umi';
import qs from 'qs';
import Mfa from './Mfa';
let loginHelloData: {
  secureLoginEnable: any;
  publicKey: any;
  kid: any;
  client_id: any;
  loginHelloData?: any;
  tenant_id?: any;
  pwdEnabled?: any;
  smsEnabled?: any;
  emailEnabled?: any;
  otpEnabled?: any;
  otpShow?: any;
};
// let loginKey = '',
let queryObj: any;
function UrlSearch(this: any, strs: any): void {
  let name, value;
  let str = strs || location.href;
  let num = str.indexOf('?');
  str = str.substr(num + 1);
  const arr = str.split('&');
  for (let i = 0; i < arr.length; i++) {
    num = arr[i].indexOf('=');
    if (num > 0) {
      name = arr[i].substring(0, num);
      value = arr[i].substr(num + 1);
      this[name] = value;
    }
  }
}
const Login: React.FC = () => {
  const [, setMessageSess] = useSessionStorageState<string | undefined>(
    'use-seStorage-storage-state-demo1',
    {
      defaultValue: '',
    },
  );
  const focus$ = useEventEmitter();
  const domRef1 = useRef<any>(null);
  const domRef2 = useRef<any>(null);
  const [ucName, setUcName] = useState<string>('');
  const [ucLogo, setUcLogo] = useState(null);

  const { initialState, setInitialState } = useModel<any>('@@initialState');

  const [dingdingAppId, setDingdingAppId] = useState({});
  const [feiShuAppId, setFeiShuAppId] = useState({});
  const [isShowpassCode, setIsShowpassCode] = useState('local_auth_method'); // local_auth_method forgot
  const [scanCodes, setScanCodes] = useStateCallback([]);
  const [isOutherLoginType, setIsOutherLoginType] = useState(true);

  const [default_Auth, setDefault_Auth] = useState<any>(null);
  const [local_auth_method, setLocal_auth_method] = useState<any>(null);
  const [defaultLogin, setDefaultLogin] = useState<string>('');

  const [mfaList, setMfaList] = useState([]);
  const [, setUserName] = useState('');
  interface State {
    [key: string]: any;
  }
  /**
   * 三方的一些appID
   */
  const [state, setState] = useSetState<State>({});

  /**
   * 存放飞书的数组
   */
  const [flyBook, setFlyBook] = useState<any>([]);
  /**
   * 存放钉钉的数组
   */
  const [dingDingArr, setDingDingArr] = useState<any>([]);

  /**
   * 子组件loading变量 提升到父组件
   */
  const [loading_main, setLoading_Main] = useState(true);

  /**
   * @param 滑块相关控制变量
   */
  const [isShows, setIsShows] = useState<boolean>(false);
  /**
   * 存放AD和LDAP登录方式
   */
  const [ADandLDAP, setADandLDAP] = useState<any>([]);

  /**
   *
   * @param 滑块的相关逻辑函数
   *
   */
  useEffect(() => {
    document.onclick = (event) => {
      if (!(event.target as HTMLElement).className?.indexOf?.('bg')) {
        setIsShows(false);
      }
    };
    (document.getElementById('contentId') as HTMLDivElement).onclick = (event) => {
      if ((event.target as HTMLElement).className?.indexOf?.('content') !== -1) {
        setIsShows(false);
      }
    };
  }, []);
  /**
   * 相关加密函数
   */
  const secureLogin = (
    secureLoginEnable: any,
    publicKey: any,
    nonce: any,
    kid: any,
    password: any,
  ) => {
    if (secureLoginEnable && publicKey) {
      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(publicKey);
      let encryptedPassword = encrypt.encrypt(`${nonce}-${password}`);
      encryptedPassword = `${btoa(kid)}.${encryptedPassword}`;
      return encryptedPassword;
    }
    message.error('应用需加密登录,但login_hello未生成公钥');
    return false;
  };
  /**
   * 首次加载执行loginHello函数
   */
  const handleLoginHello = async (tcode: string, client_id: string) => {
    await loginHello({
      client_id: client_id || 'usercenter',
      tcode: tcode,
    }).then(async (res: any) => {
      // 增加mfa认证逻辑 如果next是mfa则进行mfa认证
      if (res.data?.next == 'mfa') {
        setMfaList(res.data?.tip.login_policy.mfa);
        return;
      }
      if (res?.data?.tip?.login_policy) {
        /**
         * 因后端限制需要将三方认证源中的AD和LADP摘出来 放到local_auth_method
         */
        const ADandLadP = _.filter(res?.data?.tip?.login_policy?.third_auth_methods, function (o) {
          return o.auth_type == 'AD' || o.auth_type == 'LDAP';
        });
        setADandLDAP(ADandLadP);

        // 存放本地登录方式
        setLocal_auth_method(res?.data?.tip?.login_policy?.local_auth_method);
        sessionStorage.setItem(
          'local_auth_methods',
          JSON.stringify(res?.data?.tip?.login_policy?.local_auth_method),
        );
        // 存放默认登录方式
        setDefault_Auth(res?.data?.tip?.login_policy?.default_auth);
        sessionStorage.setItem(
          'default_auth',
          JSON.stringify(res?.data?.tip?.login_policy?.default_auth),
        );
        // 过滤其他登录方式
        const dingdingObjList = _.filter(res?.data?.tip?.login_policy?.third_auth_methods, {
          auth_type: 'DINGDING',
        });
        const flyBooks = _.filter(res?.data?.tip?.login_policy?.third_auth_methods, {
          auth_type: 'FEISHU',
        });

        // 如果third_auth_methods(不包含AD,LDAP)数组为空 则不显示底部的登录图标
        const filterThreeApp = _.filter(
          res?.data?.tip?.login_policy?.third_auth_methods,
          function (o) {
            return !['AD', 'LDAP'].includes(o.auth_type);
          },
        );
        if (filterThreeApp?.length == 0) {
          setIsOutherLoginType(false);
        }

        // 如果默认登录方式不是扫码方式（包括飞书 钉钉）并且有二维码登录方式则存
        setFlyBook(flyBooks);
        setDingDingArr(dingdingObjList);
        /**
         * 存放三方的AppID
         */
        if (
          res?.data?.tip?.login_policy?.third_auth_methods &&
          Array.isArray(res?.data?.tip?.login_policy?.third_auth_methods) &&
          res?.data?.tip?.login_policy?.third_auth_methods.length !== 0
        ) {
          const array_thirdAuthMethods = res?.data?.tip?.login_policy?.third_auth_methods || [];

          array_thirdAuthMethods.forEach((items: any) => {
            setState({
              [items.auth_type]: items.auth_id,
            });
          });
        }
      }
      if (res.result) {
        setXsrf_token(CookieUtil.get('XSRF-TOKEN') || '');
        const tip = res.data.tip || {};
        if (res.data.next === 'continue') {
          const queryObj_s: any = staticMethod.parseQueryString(window.location.href);
          const redirectUri = queryObj_s.continue;
          if (redirectUri) {
            window.location.href = decodeURIComponent(redirectUri);
          }
        } else if (!res.data.continue && tip) {
          loginHelloData = {
            loginHelloData: tip,
            tenant_id: tip?.basic_info?.tenant_id,
            client_id: tip?.secure_login?.client_id,
            secureLoginEnable: tip?.secure_login?.secure_login_enable,
            publicKey: tip?.secure_login?.public_key,
            kid: tip?.secure_login?.kid,
            pwdEnabled: tip?.primary_auth?.pwd_enabled,
            smsEnabled: tip?.primary_auth?.sms_enabled,
            emailEnabled: tip?.primary_auth?.email_enabled,
            otpEnabled: tip?.primary_auth?.email_enabled || tip?.primary_auth?.sms_enabled,
            otpShow: tip?.primary_auth?.email_enabled || tip?.primary_auth?.sms_enabled,
          };
          sessionStorage.setItem('tcode', loginHelloData.tenant_id);
        } else if (!loginHelloData) {
          loginHelloData = {
            loginHelloData: tip,
            tenant_id: tip?.basic_info?.tenant_id,
            client_id: tip?.secure_login?.client_id,
            secureLoginEnable: true,
            publicKey: tip?.secure_login?.public_key,
            kid: tip?.secure_login?.kid,
            pwdEnabled: tip?.primary_auth?.pwd_enabled,
            smsEnabled: tip?.primary_auth?.sms_enabled,
            emailEnabled: tip?.primary_auth?.email_enabled,
            otpEnabled: tip?.primary_auth?.email_enabled || tip?.primary_auth?.sms_enabled,
            otpShow: tip?.primary_auth?.email_enabled || tip?.primary_auth?.sms_enabled,
          };
          sessionStorage.setItem('tcode', loginHelloData.tenant_id);
        }
      } else {
        message.error('未知错误，请重试');
      }
    });
  };
  /**
   * 根据auth_id请求扫码的key
   */
  const getLoginConfigFunc = (corpObj: any, name?: string) => {
    getLoginConfig(corpObj.auth_id).then((res: any) => {
      const data = res.data || {};
      if (name == 'feishu') {
        setFeiShuAppId({
          auth_id: data?.auth_id,
          tcode: data.tcode,
          appkey: data.config.app_key,
        });
      } else {
        setDingdingAppId({
          auth_id: data?.auth_id,
          tcode: data.tcode,
          appkey: data.config.app_key,
        });
      }
    });
  };
  /**
   * 点击发送验证码 进行调用接口发送验证码
   */
  const onShowLoginBySmsOrEmail = async (obj: any) => {
    // loginKey = obj.key;
    const mappingLogin_id = {
      SMS: 'userName_Sms',
      EMAIL: 'email',
    };
    return sendOtp({
      client_id: getClientIdFromWindowLocation(),
      login_id: obj[mappingLogin_id[obj.keyWord]], // 用户的手机号或者邮箱
      send_by: obj.keyWord, // 用户的登录方式
    })
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  };
  /**
   * 对短信或者邮箱登录返回的结果进行处理
   */
  const onLoginSuccess = async (response: any) => {
    if (!response) {
      return;
    }
    if (response.error === '0') {
      const href = window.location.href;
      if (response.data.next === 'continue' || href.includes('continue')) {
        // const queryObj_s1: any = staticMethod.parseQueryString(window.location.href);
        //   const redirectUri = queryObj_s1.continue;
        const redirectUri = getContinue();
        if (!redirectUri) {
          message.error('缺少client_id或continue参数');
          return;
        }
        if (response.data.next === 'continue') {
          window.location.href = redirectUri;
        } else if (response.data.next) {
          // TODO: 跳转到next提示的react route
          if (response.data.next === 'mfa') {
            //多因子认证
            setMfaList(response.data.tip.login_policy.mfa);
            return;
          }
        } else {
          history.push({
            pathname: `/`,
          });
        }
      }
    } else {
      message.error(response.data.message);
    }
  };
  /**
   * 若是邮箱或短信登录调用此函数
   */
  const onLoginBySMSOrEmail = (values: any) => {
    const mapping = {
      PWD: 'username',
      SMS: 'userName_Sms',
      EMAIL: 'email',
    };
    otpAuth({
      client_id: getClientIdFromWindowLocation(),
      login_id: values.values[mapping[values.keyWord]], // 登录的用户名
      otp: values.values[window.smsAndemailKey], // 当前对应的验证码
      send_by: values.keyWord, // 当前是邮箱或者短信
    }).then((response) => {
      // 成功后进行处理返回的结果
      onLoginSuccess(response);
    });
  };
  /**
   * 渲染右上角切换回更多方式登录提示框
   */
  const ScanIcon = () => {
    if (Object.values(local_auth_method).filter((item) => item).length !== 0) {
      if (isShowpassCode == 'SCAN') {
        return (
          <div
            style={{ position: 'absolute', right: '48px', top: '48px' }}
            onClick={() => {
              setLoading_Main(true);
              setTimeout(() => {
                setLoading_Main(false);
                setIsShowpassCode('local_auth_method'); // 点击返回登录显示账号密码登录
              }, 500);
            }}
          >
            <div className={styles.returnLoginTest}>
              <span>更多登录</span>
              <div className={styles.arrow}></div>
            </div>
            <img src="/login/images/saoma.png" style={{ width: '50px', cursor: 'pointer' }} />
          </div>
        );
      }
    }
    return;
  };
  /**
   * 进行对用户的账号和密码进行验证
   */
  const handleBasicAuth = async (obj: any) => {
    sessionStorage.setItem('loginId', obj.username);
    basicAuth(obj)
      .then(async (response: any) => {
        onLoginSuccess(response);
      })
      .catch(() => {
        // message.error('登录失败,可能用户名密码错误.');
      });
  };
  /**
   * 账号登录（处理生成Nonce事件）
   */
  const handleGenerateNonce = async (values: API.LoginParams, username_pro?: string) => {
    await generateNonce({
      tcode: loginHelloData?.tenant_id,
      client_id: queryObj?.client_id,
    }).then(async (res: any) => {
      if (res.error === '0') {
        const nonce = res.data;
        const val = secureLogin(
          loginHelloData.secureLoginEnable,
          loginHelloData.publicKey,
          nonce,
          loginHelloData.kid,
          values.password,
        );
        if (val) {
          const username = username_pro;
          const obj = {
            tcode: loginHelloData.tenant_id,
            username,
            password: val,
            client_id: loginHelloData.client_id,
          };
          handleBasicAuth(obj);
        } else {
          message.error('获取加密nonce失败');
        }
      }
    });
  };

  const ADorLDAPEncryption = async (password: string, callback: any) => {
    await generateNonce({
      tcode: loginHelloData?.tenant_id,
      client_id: queryObj?.client_id,
    }).then(async (res: any) => {
      if (res.error === '0') {
        const nonce = res.data;
        const val = secureLogin(
          loginHelloData.secureLoginEnable,
          loginHelloData.publicKey,
          nonce,
          loginHelloData.kid,
          password,
        );
        if (val) {
          callback(val);
        } else {
          message.error('获取加密nonce失败');
        }
      }
    });
  };

  /**
   * 判断登录类型是否是账号还是短信、邮箱且执行相关的处理函数
   */
  const onLoginByPwd = (values: any, TotalObj?: any) => {
    windowObj();
    // 显示滑块弹窗
    setIsShows(true);
    // 重置HTML内容元素
    (document.getElementById('captcha') as HTMLElement).innerHTML = '';
    window.jigsaw.init({
      el: domRef1.current,
      onSuccess: function () {
        // 此处是滑块验证已经验证成功 后续进行验证账号密码是否正确
        setIsShows(false);
        if (TotalObj.keyWord === 'PWD') {
          setUserName(values.username);
          handleGenerateNonce(values, values.username);
        } else if (TotalObj.keyWord === 'SMS' || TotalObj.keyWord === 'EMAIL') {
          onLoginBySMSOrEmail(TotalObj);
        } else if (TotalObj.keyWord === 'AD') {
          ADorLDAPEncryption(values.password, (encryptionPassword: string) => {
            setUserName(values.username);
            adLoginType({
              tcode: queryObj?.tcode,
              username: values.username,
              password: encryptionPassword,
              client_id: queryObj?.client_id || 'usercenter',
              auth_id: _.filter(ADandLDAP, {
                auth_type: 'AD',
              })[0]?.auth_id,
            }).then((rs) => {
              if (rs.data.next == 'continue') {
                window.location.href = decodeURIComponent(queryObj.continue);
              }
            });
          });
        } else if (TotalObj.keyWord === 'LDAP') {
          ADorLDAPEncryption(values.password, (encryptionPassword: string) => {
            setUserName(values.username);
            adLoginType({
              tcode: queryObj?.tcode,
              username: values.username,
              password: encryptionPassword,
              client_id: queryObj?.client_id || 'usercenter',
              auth_id: _.filter(ADandLDAP, {
                auth_type: 'LDAP',
              })[0]?.auth_id,
            }).then((rs) => {
              console.log(
                _.filter(ADandLDAP, {
                  auth_type: 'LDAP',
                })[0],
              );

              if (rs.data.next == 'continue') {
                window.location.href = decodeURIComponent(queryObj.continue);
              }
            });
          });
        }
      },
    });
  };
  /**
   * 利用事件总线代替深层次组件传递(登录总入口执行函数)
   */
  focus$.useSubscription((val: any) => {
    const mappingSub = {
      PWD: 'username',
      SMS: 'userName_Sms',
      EMAIL: 'email',
      AD: 'username',
      LDAP: 'username',
    };
    setMessageSess(val.values[mappingSub[val.keyWord]]);
    // 监听点击登录 执行登录相关逻辑
    onLoginByPwd(val.values, val);
  });
  /**
   * 点击忘记密码调用父组件函数 注意忘记密码按钮在子组件
   */
  const modifyBackWays = () => {
    setIsShowpassCode('forgot');
    setIsOutherLoginType(false);
  };
  /**
   * 忘记密码组件中的返回登录 调用事件
   */
  const modifyIsShowpassCodeVariable = () => {
    setIsShowpassCode('local_auth_method');
    const threeArray = Object.keys(state).filter((item) => !['AD', 'LDAP'].includes(item));
    setIsOutherLoginType(threeArray?.length == 0 ? false : true);
  };
  /**
   * 处理三方登录 包括 OIDC Oauth2.0 Azure AD
   */
  const handleThreePartiesAuth = (auth_id: string) => {
    getLoginConfig(auth_id).then((rs: any) => {
      try {
        const objParams = {
          client_id: rs.data.config.client_id,
          redirect_uri: rs.data.config.redirect_uri,
          response_type: rs.data.config.response_type || 'code',
          scope: rs.data.config.scope,
          sso_reload: true,
          state: new Date().getTime(),
        };
        const continues = new (UrlSearch as any)(`${location.href}`);
        sessionStorage.setItem('continue', continues.continue);
        sessionStorage.setItem('auth_id', rs.data.auth_id);
        window.location.href =
          rs.data.config.authorization_endpoint + '?' + qs.stringify(objParams);
      } catch (err) {
        console.log(err);
      }
    });
  };

  const handleCASAuth = (auth_id: string) => {
    getLoginConfig(auth_id).then((rs: any) => {
      try {
        const objParams = {
          login_endpoint: rs.data.config.login_endpoint,
          service: rs.data.config.service,
          format: rs.data.config.format,
        };
        const continues = new (UrlSearch as any)(`${location.href}`);
        sessionStorage.setItem('continue', continues.continue);
        sessionStorage.setItem('auth_id', rs.data.auth_id);
        window.location.href =
          objParams?.login_endpoint +
          `?service=${encodeURIComponent(objParams?.service)}&format=${objParams?.format}`;
      } catch (err) {
        console.log(err);
      }
    });
  };

  /**
   * 点击飞书图标切换组件显示飞书二维码
   */
  const handleFlyBook = () => {
    setIsShowpassCode('SCAN'); //切换到二维码组件且必须放在外层 否则会导致切换不回到扫码组件
    if (flyBook?.length !== 0) {
      setScanCodes(flyBook, (newValue: any) => {
        getLoginConfigFunc(newValue[0], 'feishu');
      });
    }
  };

  /**
   * 点击钉钉图标渲染钉钉扫码
   */
  const renderDingdingButton = () => {
    setIsShowpassCode('SCAN'); //切换到二维码组件且必须放在外层 否则会导致切换不回到扫码组件
    if (dingDingArr.length !== 0) {
      setScanCodes(dingDingArr, (newValue: any) => {
        getLoginConfigFunc(newValue[0], 'dingding');
      });
    }
  };
  /**
   *
   * @param 监听默认登录方式
   *
   */
  useEffect(() => {
    // 判断默认登录是否有值  && dingDingArr.length !== 0 && flyBook.length !== 0
    if (default_Auth) {
      // 如果默认类型是钉钉则渲染钉钉扫码
      if (default_Auth.auth_type == 'DINGDING') {
        renderDingdingButton();
      }
      // 如果默认类型是飞书类型则渲染飞书扫码
      if (default_Auth.auth_type == 'FEISHU') {
        handleFlyBook();
      }
      if (default_Auth.auth_type == 'PWD') {
        setLoading_Main(false);
        // 默认登录为PWD
        setDefaultLogin('PWD');
      }

      if (default_Auth.auth_type == 'SMS') {
        setLoading_Main(false);
        // 默认登录为SMS
        setDefaultLogin('SMS');
      }

      if (default_Auth.auth_type == 'EMAIL') {
        setLoading_Main(false);
        // 默认登录为EMAIL
        setDefaultLogin('email');
      }

      if (default_Auth.auth_type == 'AD') {
        setLoading_Main(false);
        // 默认登录为AD
        setDefaultLogin('AD');
      }

      if (default_Auth.auth_type == 'LDAP') {
        setLoading_Main(false);
        // 默认登录为LDAP
        setDefaultLogin('LDAP');
      }
    }
  }, [default_Auth, dingDingArr, flyBook]);

  useEffect(() => {
    (async () => {
      queryObj = parseQueryString(location.href);
      const url = new URL(window.location.href);
      const tcode = url.searchParams.get('tcode');
      const client_id = url.searchParams.get('client_id');
      await handleLoginHello(tcode || '', client_id || '');
      await getPoliceInfo().then((rs) => {
        setInitialState({
          ...initialState,
          policyData: {
            uc_name: rs.data.uc_name,
          },
          polcy: rs.data?.pwd_complexity,
        });
        const uc_name = rs.data.uc_name;
        setUcName(uc_name);
        setUcLogo(rs.data.uc_logo);
        setLoading_Main(false);
        sessionStorage.setItem('uc_logo', rs.data.uc_logo);
        sessionStorage.setItem('ucName', uc_name);
      });
    })();
  }, []);

  if (mfaList?.length) {
    return (
      <div className={styles.container}>
        <div
          className={styles.content}
          id="contentId"
          style={{
            position: 'relative',
            height: 'fit-content',
            paddingBottom: '5%',
          }}
        >
          <div
            className={styles.top}
            style={{ display: isShowpassCode !== 'forgot' ? 'block' : 'none' }}
          >
            <div className={styles.header}>
              <img
                alt="logo"
                className={styles.logo}
                src={ucLogo || require('@/../public/images/favicon.png')}
              />
              <span className={styles.title}>
                <span className={styles.lead} style={{ color: '#555' }}>
                  {/* {ucName || '云身份连接器-数犀科技'} */}
                  {ucName}
                </span>
              </span>
            </div>
          </div>
          <div className={styles.main}>
            <Mfa mfaList={mfaList} onLoginSuccess={onLoginSuccess} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content} style={{ position: 'relative' }} id="contentId">
        <Spin
          spinning={loading_main}
          style={{
            background: '#fff',
            height: '100%',
            opacity: 1,
            maxHeight: 'unset',
          }}
        >
          <div
            className={styles.top}
            style={{ display: isShowpassCode !== 'forgot' ? 'block' : 'none' }}
          >
            <div className={styles.header}>
              <img
                alt="logo"
                className={styles.logo}
                src={ucLogo || require('@/../public/images/favicon.png')}
              />
              <span className={styles.title}>
                <span className={styles.lead} style={{ color: '#555' }}>
                  {/* {ucName || '云身份连接器-数犀科技'} */}
                  {ucName}
                </span>
              </span>
            </div>
          </div>
          {/* <Spin spinning={loading_main} style={{ background: '#fff', height: '390px', opacity: 1 }}> */}
          <div className={styles.main}>
            {/* 是否显示密码登录还是二维码登录 */}
            <div style={{ minHeight: '370px' }}>
              {(() => {
                if (isShowpassCode == 'local_auth_method') {
                  return (
                    <AccessPassword
                      focus$={focus$}
                      onShowLoginBySmsOrEmail={onShowLoginBySmsOrEmail}
                      modifyBackWay={modifyBackWays}
                      isShows={isShows}
                      defaultType={defaultLogin}
                      local_auth_method={local_auth_method}
                      setIsShows={setIsShows}
                      filterADandLDAP={ADandLDAP}
                      handleLoginHello={handleLoginHello}
                    />
                  );
                } else {
                  // 钉钉扫码组件
                  if (isShowpassCode == 'SCAN') {
                    return (
                      <ScanCode
                        ScanCodes={scanCodes} // 把过滤出的钉钉类型的对象传递tabs组件 进行多种钉钉类型登录渲染type[]
                        getLoginConfigFunc={getLoginConfigFunc}
                        dingdingAppIds={dingdingAppId} // 钉钉的appkey
                        feiShuAppIds={feiShuAppId} // 飞书的appkey
                      />
                    );
                  }
                  // 忘记密码组件
                  if (isShowpassCode == 'forgot') {
                    return <SmsSent modifyIsShowpassCodeVariable={modifyIsShowpassCodeVariable} />;
                  }
                  return;
                }
              })()}
            </div>

            <div style={{ display: isOutherLoginType ? 'block' : 'none', marginBottom: '30px' }}>
              <Divider plain style={{ color: 'rgb(153, 153, 153)' }}>
                其他登录方式
              </Divider>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Tooltip title="钉钉">
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      cursor: 'pointer',
                      background: '#f5f6f7',
                      borderRadius: '4px',
                      //  display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: '8px',
                      display: dingDingArr.length ? 'inline-flex' : 'none',
                    }}
                    onClick={() => renderDingdingButton()}
                  >
                    <img src={'/login/images/ding.png'} style={{ width: '60%', height: '60%' }} />
                  </div>
                </Tooltip>

                <Tooltip title="飞书">
                  <div
                    onClick={() => handleFlyBook()}
                    style={{
                      width: '50px',
                      height: '50px',
                      cursor: 'pointer',
                      background: '#f5f6f7',
                      borderRadius: '4px',
                      //  display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: '8px',
                      display: flyBook.length ? 'inline-flex' : 'none',
                    }}
                  >
                    <img src="/login/images/feishu.png" style={{ width: '60%', height: '60%' }} />
                  </div>
                </Tooltip>

                <Tooltip title="Azure AD">
                  <div
                    onClick={() => handleThreePartiesAuth(state.AZUREAD)}
                    style={{
                      width: '50px',
                      height: '50px',
                      cursor: 'pointer',
                      background: '#f5f6f7',
                      borderRadius: '4px',
                      //  display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: '8px',
                      display: state.AZUREAD ? 'inline-flex' : 'none',
                    }}
                  >
                    <img src="/login/images/AD.png" style={{ width: '60%', height: '60%' }} />
                  </div>
                </Tooltip>

                <Tooltip title="OIDC">
                  <div
                    onClick={() => handleThreePartiesAuth(state.OIDC)}
                    style={{
                      width: '50px',
                      height: '50px',
                      cursor: 'pointer',
                      background: '#f5f6f7',
                      borderRadius: '4px',
                      //  display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: '8px',
                      display: state.OIDC ? 'inline-flex' : 'none',
                    }}
                  >
                    <img
                      src="/login/images/oidc.png"
                      style={{ width: '60%', height: '60%', backgroundColor: '#fff' }}
                    />
                  </div>
                </Tooltip>

                <Tooltip title="Oauth2">
                  <div
                    onClick={() => handleThreePartiesAuth(state.OAUTH2)}
                    style={{
                      width: '50px',
                      height: '50px',
                      cursor: 'pointer',
                      background: '#f5f6f7',
                      borderRadius: '4px',
                      //  display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: '8px',
                      display: state.OAUTH2 ? 'inline-flex' : 'none',
                    }}
                  >
                    <img
                      src="/login/images/oauth2.png"
                      style={{ width: '60%', height: '60%', backgroundColor: '#fff' }}
                    />
                  </div>
                </Tooltip>

                <Tooltip title="CAS">
                  <div
                    onClick={() => {
                      handleCASAuth(state.CAS);
                    }}
                    style={{
                      width: '50px',
                      height: '50px',
                      cursor: 'pointer',
                      background: '#f5f6f7',
                      borderRadius: '4px',
                      //  display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: '8px',
                      display: state.CAS ? 'inline-flex' : 'none',
                    }}
                  >
                    <img
                      src="/login/images/cas.png"
                      style={{ width: '60%', height: '60%', backgroundColor: '#fff' }}
                    />
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
        </Spin>
        {/* 渲染右上角的ICON 并且本地登录方式至少存在一个才显示 返回登录按钮*/}
        {local_auth_method ? ScanIcon() : ''}
        {/* 滑块验证相关渲染 */}
        <div
          className={styles.warps}
          id="slientId"
          style={{
            opacity: isShows ? 1 : 0,
            visibility: isShows ? 'visible' : 'hidden',
          }}
        >
          <div style={{ height: isShows ? '308px' : '0' }} ref={domRef2}>
            <div id="captcha" ref={domRef1}></div>
            <div id="msg"></div>
          </div>
        </div>
      </div>
      <div className={styles.bg} />
    </div>
  );
};

export default Login;
