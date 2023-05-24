/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { useUpdate } from 'ahooks';
import { Button, Form } from 'antd';
let timerHandler: any;
const TextTimer: React.FC<any> = (props) => {
  const form = Form.useFormInstance();
  const { initTime = 60, userName } = props;
  const currentRef = useRef(initTime);
  const [, setUserNames] = useState('');
  const [btnDisabled, setBtnDisabled] = useState(false);

  const update = useUpdate();
  const start = () => {
    clearInterval(timerHandler);
    timerHandler = setInterval(() => {
      if (currentRef.current <= 0) {
        currentRef.current = 60;
        update();
        clearInterval(timerHandler);
        return;
      }
      --currentRef.current;
      update();
    }, 1000);
  };
  useEffect(() => {
    if (userName) {
      setUserNames(userName);
      start();
    }
    if (!(currentRef.current > 0 && currentRef.current <= (initTime || 60))) {
      currentRef.current = 60;
      clearInterval(timerHandler);
      setBtnDisabled(false);
    }
  }, [currentRef.current]);
  useEffect(() => {
    return () => {
      clearInterval(timerHandler);
    };
  }, []);

  const onClickText = () => {
    form.validateFields().then(() => {
      // props.onClickText为mfa
      if (props.onClickText) {
        props.onClickText().then(() => {
          currentRef.current = initTime;
          if (props.mfaUsername) {
            setUserNames(props.mfaUsername);
            --currentRef.current;
            update();
            // 代表没有自动传入用户名，需要手动输入
            start();
          }
        });
      } else {
        // 如果接口返回404或者其他错误 则不进行请求send_op接口
        props?.eventClick().then((rs: boolean) => {
          if (rs) {
            start();
            --currentRef.current;
            update();
            setBtnDisabled(true);
          }
        });
      }
    });
  };
  const render = () => {
    let textObj;
    if (currentRef.current === 0) {
      textObj = (
        <span className="forgetPwd-send-email" style={{ cursor: 'pointer' }}>
          {props.text}
        </span>
      );
    } else {
      textObj = (
        <span className="forgetPwd-send-email-gray" style={{ cursor: 'pointer' }}>
          {props.text}
        </span>
      );
    }
    return (
      <Button
        block
        disabled={btnDisabled}
        onClick={onClickText}
        type="primary"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '40.14px',
        }}
      >
        {currentRef.current !== 0 && currentRef.current !== 60 ? (
          <span
            className={currentRef.current === 0 ? 'hidden' : 'forgetPwd-timer'}
            style={{ cursor: 'pointer' }}
          >
            {currentRef.current}
          </span>
        ) : (
          ''
        )}
        {textObj}
      </Button>
    );
  };
  return render();
};

export default TextTimer;
