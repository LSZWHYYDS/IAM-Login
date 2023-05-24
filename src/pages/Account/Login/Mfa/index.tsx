import TextTimer from '@/components/TextTimer/mfaIndex';
import { getClientIdFromWindowLocation } from '@/utils/common.utils';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Space } from 'antd';
import React, { useRef, useState } from 'react';
import { mfaOtpAuth, mfaSendOtp } from '../../service';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 24 },
};

const Mfa: React.FC<any> = (props) => {
  const { onLoginSuccess, mfaList } = props;
  const refCountTimer = useRef(null);
  const [formRef] = Form.useForm();
  const [validity, setValidity] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [loginType, setLoginType] = useState(mfaList[0] || 'SMS');

  const onClickTimer = (typeValue: string) => {
    return mfaSendOtp({
      client_id: getClientIdFromWindowLocation(),
      send_by: typeValue,
    }).then((res1: any) => {
      setValidity(res1?.data?.validity || 1);
      setIdentifier(res1?.data?.identifier || '');
      setLoginType(typeValue);
    });
  };
  const onFinish = async () => {
    formRef?.validateFields().then((formValues: any) => {
      mfaOtpAuth({
        client_id: getClientIdFromWindowLocation(),
        otp: formValues.otp,
        send_by: loginType,
      }).then((response) => {
        onLoginSuccess(response, {});
      });
    });
  };
  const switchMfaType = () => {
    formRef.resetFields();
    onClickTimer((loginType === 'SMS' && 'EMAIL') || 'SMS');
    refCountTimer?.current?.countTime?.();
  };
  const render = () => {
    const sendDes = '验证码已发送至：' + identifier + '，有效时间为' + validity + '分钟';
    return (
      <Form form={formRef} onFinish={onFinish}>
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          {identifier && (
            <div className="forgetPwd-title" style={{ marginTop: 10 }}>
              <CheckCircleTwoTone style={{ fontSize: 20 }} />
              {sendDes}
            </div>
          )}
          <Row gutter={16} style={{ marginTop: '5%' }}>
            <Col flex="auto">
              <FormItem name="otp" {...formItemLayout}>
                <Input
                  size="large"
                  placeholder={(loginType === 'SMS' && '请输入短信验证码') || '请输入邮件验证码'}
                  maxLength={10}
                />
              </FormItem>
            </Col>
            <Col span={1}></Col>
            <Col>
              <TextTimer
                initTime={60}
                style={{ width: '100%', height: '40.14px' }}
                onClickText={() => onClickTimer(loginType)}
                text="发送验证码"
                ref={refCountTimer}
              />
            </Col>
          </Row>
          <Row justify="center" style={{ marginTop: '5%' }}>
            <Col span="24" style={{ textAlign: 'center' }}>
              <Button size="large" type="primary" htmlType="submit" block>
                {(loginType === 'SMS' && '短信验证码登录') || '邮件验证码登录'}
              </Button>
            </Col>
          </Row>
        </Space>
        {mfaList?.length >= 2 ? (
          <Row justify="end">
            <Col span={24} style={{ textAlign: 'right', marginTop: 20 }}>
              <a onClick={switchMfaType}>
                {(loginType === 'SMS' && '切换至邮件验证码登录') || '切换至短信验证码登录'}
              </a>
            </Col>
          </Row>
        ) : (
          ''
        )}
      </Form>
    );
  };
  return render();
};

export default Mfa;
