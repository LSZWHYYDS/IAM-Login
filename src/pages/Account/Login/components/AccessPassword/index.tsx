import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutOutlined,
  LockOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import TextTimer from '@/components/TextTimer';
import SignSlot from '../SignSlot';
import { Col, Form, Input, Row, Tabs } from 'antd';
import { connect } from 'dva';
import { isEmail } from '@/utils/validator';
import { useStateCallback } from '@/utils/common.utils';

const AccessPassword: React.FC<any> = (props: any) => {
  const [tabActiveKey, setTabActiveKey] = useState<string>('PWD');
  const [tabsarray, setTabsarray] = useState<any>([]);
  const [, setSavePreUsername] = useStateCallback('');

  const { dispatch, handleLoginHello } = props;
  const refSlot = useRef<any>(null);
  const onChange = (key: string) => {
    dispatch({
      type: 'tabs/setTabsData',
      payload: refSlot.current.getUserName(),
    });

    if (['SMS', 'EMAIL'].includes(key)) {
      if (key == 'SMS') {
        window.smsAndemailKey = 'verifyCode_Sms';
      } else if (key == 'EMAIL') {
        window.smsAndemailKey = 'emailVerifyCode';
      }
    }
    setTabActiveKey(key);
  };
  const renderTabTitle = (str: string) => {
    const textObj = {
      PWD: '密码登录',
      EMAIL: '邮箱登录',
      SMS: '短信登录',
      AD: 'AD',
      LDAP: 'LDAP',
    };
    return <span style={{ fontSize: '16px', fontFamily: 'sans-serif' }}>{textObj[str]}</span>;
  };
  const forgotWord = () => {
    props.modifyBackWay();
  };

  const handleUsernameOnBlur = () => {
    const userNameStr = refSlot.current.getUserName();
    setSavePreUsername(userNameStr, () => {
      if (userNameStr.indexOf('@') != -1 && !isEmail(userNameStr)) {
        const tcode = userNameStr?.split('@')[1];
        const url = new URL(window.location.href);
        const client_id = url.searchParams.get('client_id');
        setSavePreUsername(userNameStr, () => {});
        handleLoginHello?.(tcode, client_id);
      }
    });
  };
  useEffect(() => {
    if (sessionStorage.getItem('local_auth_methods')) {
      const obj = {}, // { email : true ,  PWD : true ...}
        tempArr = [];
      const local_auth_methodss: any = JSON.parse(
        sessionStorage.getItem('local_auth_methods') || '{}',
      );
      /**
       * 根据传递过来的数组进行渲染
       */
      if (Array.isArray(props?.filterADandLDAP)) {
        props?.filterADandLDAP.forEach((element: any) => {
          local_auth_methodss[element.auth_type.toLowerCase()] = true;
        });
      }
      const tabsObj = {
        PWD: {
          label: renderTabTitle('PWD'),
          key: 'PWD',
          children: (
            <>
              <SignSlot
                ref={refSlot}
                slotTop={
                  <>
                    <Form.Item
                      name={'username'}
                      rules={[{ required: true, message: '请输入用户名' }]}
                    >
                      <Input
                        onBlur={handleUsernameOnBlur}
                        size="large"
                        placeholder="请输入用户名 / 手机号 / 邮箱"
                        prefix={<UsergroupAddOutlined style={{ marginRight: '3px' }} />}
                      />
                    </Form.Item>
                    <Form.Item
                      name={'password'}
                      rules={[{ required: true, message: '请输入密码' }]}
                    >
                      <Input.Password
                        size="large"
                        placeholder="请输入密码"
                        prefix={<LockOutlined style={{ marginRight: '3px' }} />}
                      />
                    </Form.Item>
                  </>
                }
                slotBottom={
                  <span
                    style={{
                      cursor: 'pointer',
                      color: '#215ae5',
                      fontSize: '16px',
                    }}
                    onClick={() => {
                      dispatch({
                        type: 'tabs/setTabsData',
                        payload: refSlot.current.getUserName(),
                      });
                      // 点击忘记密码关闭滑块验证
                      props.setIsShows(false);
                      forgotWord();
                    }}
                  >
                    忘记密码?
                  </span>
                }
                keyType={'PWD'}
                focus$={props.focus$}
                isShows={props.isShows}
              ></SignSlot>
            </>
          ),
        },
        SMS: {
          label: renderTabTitle('SMS'),
          key: 'SMS',
          children: (
            <>
              <SignSlot
                ref={refSlot}
                isShows={props.isShows}
                slotTop={
                  <>
                    <Form.Item
                      name={'userName_Sms'}
                      rules={[{ required: true, message: '请输入手机号' }]}
                      validateFirst={true}
                    >
                      <Input
                        placeholder="请输入手机号"
                        size="large"
                        maxLength={11}
                        prefix={<PhoneOutlined style={{ marginRight: '3px' }} />}
                      />
                    </Form.Item>
                    <Form.Item name={'verifyCode_Sms'}>
                      <Row>
                        <Col flex="auto">
                          <Input
                            size="large"
                            placeholder="请输入验证码"
                            prefix={<SafetyCertificateOutlined style={{ marginRight: '3px' }} />}
                            maxLength={6}
                          />
                        </Col>
                        <Col span={1}></Col>
                        <Col>
                          <TextTimer
                            style={{ width: '100%', height: '40.14px' }}
                            text="获取验证码"
                            eventClick={() => {
                              const userObjectInfo: any = refSlot.current.getUsenameFunc();
                              // eventClick 函数返回的一个Promise对象
                              return userObjectInfo.then((value: any) => {
                                if (value.userName_Sms) {
                                  // Promise内部返回的值也就是res的值
                                  return props
                                    .onShowLoginBySmsOrEmail({
                                      ...value,
                                      keyWord: 'SMS',
                                      key: 'verifyCode_Sms',
                                    })
                                    .then((res: boolean) => {
                                      if (!res) return false;
                                      else return true;
                                    });
                                } else {
                                  return false;
                                }
                              });
                            }}
                          ></TextTimer>
                        </Col>
                      </Row>
                    </Form.Item>
                  </>
                }
                slotBottom={
                  <span style={{ color: '#215ae5', opacity: '0', visibility: 'hidden' }}>
                    忘记密码
                  </span>
                }
                keyType={'SMS'}
                focus$={props.focus$}
              ></SignSlot>
            </>
          ),
        },
        email: {
          label: renderTabTitle('EMAIL'),
          key: 'EMAIL',
          children: (
            <>
              <SignSlot
                ref={refSlot}
                isShows={props.isShows}
                slotTop={
                  <>
                    <Form.Item
                      name={'email'}
                      rules={[
                        {
                          required: true,
                          message: '请输入邮箱',
                        },
                      ]}
                    >
                      <Input
                        placeholder="请输入邮箱"
                        size="large"
                        prefix={<LayoutOutlined style={{ marginRight: '3px' }} />}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Row>
                        <Col flex="auto">
                          <Form.Item name={'emailVerifyCode'}>
                            <Input
                              size="large"
                              placeholder="请输入验证码"
                              prefix={<SafetyCertificateOutlined style={{ marginRight: '3px' }} />}
                              maxLength={6}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={1}></Col>
                        <Col>
                          <TextTimer
                            style={{ width: '100%', height: '40.14px' }}
                            text="获取验证码"
                            initTime={60}
                            eventClick={() => {
                              const userObjectInfo: any = refSlot.current.getUserEmailFunc();
                              // eventClick 函数返回的一个Promise对象
                              return userObjectInfo.then((value: any) => {
                                if (value.email) {
                                  // Promise内部返回的值也就是res的值
                                  return props
                                    .onShowLoginBySmsOrEmail({
                                      ...value,
                                      keyWord: 'EMAIL',
                                      key: 'emailVerifyCode',
                                    })
                                    .then((res: boolean) => {
                                      if (!res) return false;
                                      else return true;
                                    });
                                } else {
                                  return false;
                                }
                              });
                            }}
                          ></TextTimer>
                        </Col>
                      </Row>
                    </Form.Item>
                  </>
                }
                slotBottom={
                  <span style={{ color: '#215ae5', opacity: '0', visibility: 'hidden' }}>
                    忘记密码
                  </span>
                }
                keyType={'EMAIL'}
                focus$={props.focus$}
              ></SignSlot>
            </>
          ),
        },
        AD: {
          label: renderTabTitle('AD'),
          key: 'AD',
          children: (
            <>
              <SignSlot
                ref={refSlot}
                slotTop={
                  <>
                    <Form.Item
                      name={'username'}
                      rules={[{ required: true, message: '请输入用户名' }]}
                    >
                      <Input
                        size="large"
                        placeholder="请输入AD名称"
                        prefix={<UsergroupAddOutlined style={{ marginRight: '3px' }} />}
                      />
                    </Form.Item>
                    <Form.Item
                      name={'password'}
                      rules={[{ required: true, message: '请输入密码' }]}
                    >
                      <Input.Password
                        size="large"
                        placeholder="请输入密码"
                        prefix={<LockOutlined style={{ marginRight: '3px' }} />}
                      />
                    </Form.Item>
                  </>
                }
                keyType={'AD'}
                focus$={props.focus$}
                isShows={props.isShows}
              ></SignSlot>
            </>
          ),
        },
        LDAP: {
          label: renderTabTitle('LDAP'),
          key: 'LDAP',
          children: (
            <>
              <SignSlot
                ref={refSlot}
                slotTop={
                  <>
                    <Form.Item
                      name={'username'}
                      rules={[{ required: true, message: '请输入用户名' }]}
                    >
                      <Input
                        size="large"
                        placeholder="请输入LDAP名称"
                        prefix={<UsergroupAddOutlined style={{ marginRight: '3px' }} />}
                      />
                    </Form.Item>
                    <Form.Item
                      name={'password'}
                      rules={[{ required: true, message: '请输入密码' }]}
                    >
                      <Input.Password
                        size="large"
                        placeholder="请输入密码"
                        prefix={<LockOutlined style={{ marginRight: '3px' }} />}
                      />
                    </Form.Item>
                  </>
                }
                keyType={'LDAP'}
                focus$={props.focus$}
                isShows={props.isShows}
              ></SignSlot>
            </>
          ),
        },
      };
      try {
        for (const item in local_auth_methodss) {
          const loginTypeObject = {
            email_enabled: () => {
              obj['email'] = local_auth_methodss[item];
            },
            pwd_enabled: () => {
              obj['PWD'] = local_auth_methodss[item];
            },
            sms_enabled: () => {
              obj['SMS'] = local_auth_methodss[item];
            },
            ad: () => {
              obj['AD'] = local_auth_methodss[item];
            },
            ldap: () => {
              obj['LDAP'] = local_auth_methodss[item];
            },
          };
          // 根据条件进行执行函数
          loginTypeObject[item]();
        }
        for (const items in obj) {
          if (obj[items]) {
            tempArr.push(tabsObj[items]);
          }
        }
        setTabActiveKey(props.defaultType || tempArr[0]?.key);
        setTabsarray(tempArr);
      } catch (err) {}
    }
  }, [props.local_auth_method, props.defaultType]);
  return (
    <>
      <Tabs
        onChange={onChange}
        activeKey={tabActiveKey}
        destroyInactiveTabPane={true} // 切换时销毁DOM结构
        items={tabsarray}
      ></Tabs>
    </>
  );
};
export default connect()(AccessPassword);
