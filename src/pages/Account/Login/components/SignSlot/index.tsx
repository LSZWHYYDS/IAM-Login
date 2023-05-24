import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { Row, Col, Checkbox, Form, Button, message } from 'antd';
import { connect } from 'dva';

const SignSlot = (props: any, ref: any) => {
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({
      username: props.tabsData,
    });
  }, [props.tabsData]);

  const onSubmit = (valuess: any) => {
    if (!valuess.isAgree) return message.warning('请先勾选服务协议');
    const { validateFields } = form;
    validateFields().then(
      (values) => {
        // 首先判断key类型
        if (props.keyType == 'PWD') {
          const paramsObj = {
            keyWord: 'PWD',
            values,
          };
          props.focus$.emit(paramsObj);
        } else if (props.keyType == 'SMS') {
          const paramsObj = {
            keyWord: 'SMS',
            values,
          };
          props.focus$.emit(paramsObj);
          return;
        } else if (props.keyType == 'EMAIL') {
          const paramsObj = {
            keyWord: 'EMAIL',
            values,
          };
          props.focus$.emit(paramsObj);
        } else if (props.keyType == 'AD') {
          const paramsObj = {
            keyWord: 'AD',
            values,
          };
          props.focus$.emit(paramsObj);
        } else {
          const paramsObj = {
            keyWord: 'LDAP',
            values,
          };
          props.focus$.emit(paramsObj);
        }
      },
      (msg) => {
        message.error('错误信息' + msg);
      },
    );
    return;
  };
  const getUsenameFunc = async () => {
    return await form.validateFields(['userName_Sms']).then(() => {
      if (form.getFieldValue(['userName_Sms'])) {
        return {
          userName_Sms: form.getFieldValue('userName_Sms'),
        };
      }
      return false;
    });
  };
  const getUserEmailFunc = async () => {
    return await form.validateFields(['email']).then(() => {
      if (form.getFieldValue(['email'])) {
        return {
          email: form.getFieldValue('email'),
        };
      }
      return false;
    });
  };
  const getUserName = () => {
    return form.getFieldValue('username');
  };
  useImperativeHandle(ref, () => {
    return {
      getUsenameFunc,
      getUserEmailFunc,
      getUserName,
    };
  });
  const handleDigitalseeFunc = () => {
    window.open(window.location.origin + '/login/Digitalsee.html');
  };
  return (
    <>
      <Form onFinish={onSubmit} form={form} validateTrigger={['onBlur']}>
        <Row>
          <Col span={24}>{props.slotTop}</Col>
        </Row>
        <Row>
          <Col span={24} style={{ marginLeft: '3px' }}>
            <Form.Item colon={false} name="isAgree" valuePropName="checked">
              <Checkbox>
                <span style={{ color: '#999', letterSpacing: '3px' }}>我已阅读并同意数犀</span>
                <span>
                  <span
                    onClick={handleDigitalseeFunc}
                    style={{ color: '#1890ff', cursor: 'pointer' }}
                  >
                    {' '}
                    隐私条款
                  </span>
                </span>
              </Checkbox>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item colon={false} style={{ lineHeight: '50px' }}>
              <Button
                type="primary"
                block
                size={'large'}
                htmlType="submit"
                //  disabled={props.isShows}
              >
                登录
              </Button>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col>{props.slotBottom}</Col>
        </Row>
      </Form>
    </>
  );
};

export default connect(
  ({ tabs }: { tabs: any }) => ({
    tabsData: tabs.tabsData,
  }),
  null,
  null,
  { forwardRef: true },
)(forwardRef(SignSlot));
