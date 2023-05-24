import { useState } from 'react';
import { Card, Input, Button, message, Modal } from 'antd';
import { existChineseCharacter1 } from '@/utils/common.utils';
import { detectionTenant } from './service';
const MiddlePage = () => {
  const [value, setValue] = useState('');
  const showModal = () => {
    Modal.warning({
      title: '友情提示',
      content: (
        <span>
          请将您的问题及联系方式发送至我们，邮箱地址：
          <span style={{ color: '#0D4F8C', cursor: 'pointer' }}>general@digitalsee.cn</span>
        </span>
      ),
    });
  };

  const renderTitle = () => {
    return (
      <>
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 30 }}
        >
          <img
            src="/login/images/favicon.png"
            alt="logo图片"
            style={{
              width: '60px',
              height: '60px',
            }}
          />
          <span
            style={{
              fontSize: '24px',
              letterSpacing: '5px',
              color: 'rgba(0,0,0,.85)',
              fontWeight: 600,
              marginLeft: '10px',
            }}
          >
            数犀科技
          </span>
        </div>
      </>
    );
  };

  const clickHandle = () => {
    if (!existChineseCharacter1(value)) {
      message.warning('输入的域名不能含有特殊字符!');
      return;
    }
    if (!value) {
      message.warning('输入的域名不能为空');
      return;
    }
    detectionTenant(value).then((rs) => {
      if (rs?.data) {
        window.open('https://' + value + '.digitalsee.cn');
      } else {
        message.error('租户不存在!');
      }
    });
  };

  const enterHandle = (event: any) => {
    if (event.keyCode == '13') {
      clickHandle();
    }
  };

  const handleChange = (e: any) => {
    setValue(e.target.value);
  };

  return (
    <>
      <div
        style={{
          backgroundColor: '#FAFAFA',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundImage: 'url(/login/images/bg.png)',
          backgroundSize: '100% 100%',
        }}
        onKeyUp={enterHandle}
      >
        <div
          style={{
            width: '60%',
            height: 420,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <img src="/login/images/small.png" height={380} />
          <Card
            title={renderTitle()}
            loading={false}
            bordered={false}
            style={{
              width: 450,
              height: 500,
              boxShadow: 'rgba(17, 12, 46, 0.15) 0 48px 100px 0',
              borderRadius: '5px',
              marginTop: -60,
            }}
            headStyle={{
              padding: '0',
              display: 'flex',
              justifyContent: 'center',
              textAlign: 'center',
              fontSize: '16px',
              marginLeft: '-45px',
              borderBottom: 0,
            }}
          >
            <div
              style={{
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <span
                style={{
                  marginBottom: '18px',
                  fontSize: '20px',
                  color: '#a8a8a8',
                  fontFamily: 'sans-serif',
                  letterSpacing: 3,
                }}
              >
                请输入您的租户名称
              </span>
              <div style={{ marginTop: '15px' }}>
                <Input.Group compact>
                  <Input
                    allowClear
                    style={{ width: '45%', textAlign: 'left' }}
                    defaultValue="0571"
                    size="large"
                    value={value}
                    onChange={handleChange}
                    placeholder="请输入租户名称"
                  />
                  <Button size="large" disabled={true} style={{ width: '10%', fontSize: '18px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '2px',
                        height: '2px',
                        borderRadius: '50%',
                        backgroundColor: '#000',
                      }}
                    ></span>
                  </Button>
                  <Input
                    style={{ width: '45%', textAlign: 'left' }}
                    defaultValue="digitalsee.cn"
                    size="large"
                    maxLength={0}
                    readOnly={true}
                  />
                </Input.Group>
              </div>
              <div style={{ marginTop: '35px' }} onClick={clickHandle}>
                <Button type="primary" size="large" block>
                  下一步
                </Button>
              </div>
              <div style={{ marginTop: '10px' }}>
                <span
                  style={{
                    color: '#007dc1',
                    fontSize: '16px',
                    fontWeight: '500',
                    marginTop: '30px',
                    display: 'inline-block',
                    cursor: 'pointer',
                  }}
                  onClick={showModal}
                >
                  忘记你的租户名称?
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MiddlePage;
