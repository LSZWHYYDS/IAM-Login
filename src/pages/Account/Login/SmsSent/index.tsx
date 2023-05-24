import TextTimer from '@/components/TextTimer';
import { resetRequestHeader } from '@/services/digitalsee/api';
import { forgetPwd, updatePwdAfterForget } from '@/services/userMgrAPI';
import { LockOutlined, TagOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Row } from 'antd';
import styles from './index.less';
import { useModel } from 'umi';
// import { useEffect } from 'react';

// function numbers(str: any) {
//    let count3 = 0;
//    for (let i = 0; i < str.length; i++) {
//       if (str.charAt(i) >= '0' && str.charAt(i) <= '9') {
//          count3++;
//       }
//    }
//    return count3;
// }

// function loawers(str: any) {
//    let count = 0;
//    for (let i = 0; i < str.length; i++) {
//       const char = str[i].charCodeAt();
//       if (char >= 97 && char <= 122) {
//          count++;
//       }
//    }
//    return count;
// }

// function Upper(str: any) {
//    let count = 0;
//    for (let i = 0; i < str.length; i++) {
//       const char = str[i].charCodeAt();
//       if (char >= 65 && char <= 90) {
//          count++;
//       }
//    }
//    return count;
// }
const validatePassword = function (customizeRules: any) {
  return function (_rule: any, value: string, callback: any) {
    const regExpObj = {
      require_num: /\d/,
      require_spec_char: /[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^_\`\{\|\}\~]/,
      require_upper_char: /[A-Z]/,
      require_lower_char: /[a-z]/,
    };

    if (value && customizeRules) {
      const mainArr: any = [];
      const strArr: any = [];
      const lenPattern = new RegExp(`^.{${customizeRules.min_len},${customizeRules.max_len}}$`);
      const spacePattern = /\s/;
      if (!lenPattern.test(value)) {
        if (customizeRules.min_len !== customizeRules.max_len) {
          mainArr.push(`请输入${customizeRules.min_len}-${customizeRules.max_len}个字符`);
        } else {
          mainArr.push(`请输入${customizeRules.min_len}个字符`);
        }
      }
      if (spacePattern.test(value)) {
        mainArr.push(`不允许输入空格`);
      }
      for (const key in regExpObj) {
        if (regExpObj.hasOwnProperty(key) && customizeRules[key] === 1) {
          if (!regExpObj[key].test(value)) {
            switch (key) {
              case 'require_num':
                strArr.push('数字');
                break;
              case 'require_spec_char':
                strArr.push('特殊字符');
                break;
              case 'require_upper_char':
                strArr.push('大写字母');
                break;
              case 'require_lower_char':
                strArr.push('小写字母');
            }
          }
        }
      }
      if (strArr.length !== 0) {
        strArr[0] = `还需包含${strArr[0]}`;
        mainArr.push(strArr.join('、'));
      }
      if (mainArr.length === 0) {
        callback();
      } else {
        callback(mainArr.join('；'));
      }
    } else {
      callback();
    }
  };
};
function SmsSent(props: any) {
  const [form] = Form.useForm();
  const { initialState } = useModel<any>('@@initialState');
  // const [api, contextHolder] = notification.useNotification();

  const polcy = initialState?.polcy;
  const onFinish = async (values: any) => {
    const params = {
      reset_password_token: values?.verifyCode_Sms,
      tcode: sessionStorage.getItem('tcode') || '',
      new_password: values?.password,
    };
    await updatePwdAfterForget(params).then((result) => {
      if (result?.error === '0') {
        message.success('操作成功...');
      }
    });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const returnPassword = () => {
    resetRequestHeader();
    props.modifyIsShowpassCodeVariable();
  };

  // 忘记密码获取Token
  const forgotpwdHandle = (userName: string) => {
    return forgetPwd(userName)
      .then((res) => {
        if (res.error_description === 'SUCCESS') {
          message.success('发送成功，请注意查收!');
          return true;
        } else {
          return false;
        }
      })
      .catch(() => {
        console.log('error...');
      });
  };
  // useEffect(() => {
  //    api.open({
  //       message: '友情提示',
  //       duration: null,
  //       description: `密码复杂度为:长度最小为${polcy?.min_len}位，最大长度${polcy?.max_len}，
  //          小写字符${polcy?.require_lower_char}位，大写字符${polcy?.require_upper_char}位，数字${polcy?.require_num}位
  //       `,
  //       icon: <SmileOutlined style={{ color: '#108ee9' }} />
  //    });
  // }, []);

  const uc_logo = sessionStorage.getItem('uc_logo');

  const handleError = (event: any) => {
    event.target.src = '/login/images/favicon.png';
  };
  return (
    <>
      <div>
        <img
          width={50}
          height={50}
          src={uc_logo || '/login/images/favicon.png'}
          onError={handleError}
        />
        <div className={styles.title}>重置密码</div>
        <div className={styles.titleExplain}>
          输入你的注册电话/邮箱，输入收到的验证码，我们将为你进行密码重置。
        </div>
        <Form
          name="basic"
          wrapperCol={{ span: 24 }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          style={{ marginTop: '20px' }}
          validateTrigger={['onBlur']}
          form={form}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入手机号码或者邮箱号' }]}
            validateFirst={true}
          >
            <Input
              size="large"
              prefix={<UserSwitchOutlined style={{ marginRight: '3px', color: '#878A95' }} />}
              placeholder="请输入手机号 / 邮箱"
            />
          </Form.Item>
          <Form.Item name={'verifyCode_Sms'} validateFirst={true}>
            <Row>
              <Col span={13}>
                <Input
                  size="large"
                  placeholder="请输入验证码"
                  prefix={<TagOutlined style={{ marginRight: '3px', color: '#878A95' }} />}
                  maxLength={10}
                />
              </Col>
              <Col span={1}></Col>
              <Col span={10}>
                <TextTimer
                  style={{ width: '100%', height: '40.14px' }}
                  text="发送验证码"
                  eventClick={async () => {
                    return form
                      .validateFields(['username'])
                      .then(async (rs) => {
                        if (rs?.username) {
                          // 调用接口发送验证码
                          const result = await forgotpwdHandle(rs?.username);
                          return result;
                          // return 'error';
                        } else {
                          // return 'forgot';
                          return false;
                        }
                      })
                      .catch(() => {
                        return 'forgot';
                      });
                  }}
                ></TextTimer>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              // {
              //    validator: (rule, value) => {
              //       if (value.length >= polcy.min_len) {
              //          if (value.length <= polcy.max_len) {
              //             if (loawers(value) >= polcy?.require_lower_char) {
              //                if (Upper(value) >= polcy?.require_upper_char) {
              //                   if (numbers(value) >= polcy?.require_num) {
              //                      return Promise.resolve('');
              //                   } else {
              //                      return Promise.resolve('');
              //                   }
              //                } else {
              //                   return Promise.reject('密码不符合规则!');
              //                }
              //             } else {
              //                return Promise.reject('密码不符合规则!');
              //             }
              //          } else {
              //             return Promise.reject('密码不符合规则!');
              //          }
              //       } else {
              //          return Promise.reject('密码不符合规则!');
              //       }
              //    }
              // },

              { validator: validatePassword(polcy) },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="请输入新密码"
              prefix={<LockOutlined style={{ marginRight: '3px', color: '#878A95' }} />}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ borderRadius: '4px' }}
              size="large"
            >
              确认
            </Button>
          </Form.Item>
        </Form>
        <div className={styles.linkLike} onClick={returnPassword}>
          返回登录
        </div>
      </div>
    </>
  );
}

export default SmsSent;
// if (
//    value.length > polcy.min_len &&
//    value.length < polcy.max_len &&
//    testLoawer(value).lower > polcy?.require_lower_char
// ) {
// }
// if (reg.test(value)) {
//    return Promise.reject('密码不符合规则!');
// } else {
//    return Promise.resolve();
// } if(testLoawer(value)?.Upper >=value.require_num){
//    return Promise.resolve();
// }else{
//    return Promise.reject('密码不符合规则!');
// }
