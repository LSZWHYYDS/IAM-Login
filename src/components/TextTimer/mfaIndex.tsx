/* eslint-disable react-hooks/exhaustive-deps */
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useUpdate } from 'ahooks';
import { Button, Form } from 'antd';
let timerHandler: any;
const TextTimer: React.FC<any> = (props, ref) => {
  const form = Form.useFormInstance();
  const { initTime = 60 } = props;
  const currentRef = useRef(initTime);
  const [btnDisabled, setBtnDisabled] = useState(false);

  const update = useUpdate();
  const countTime = () => {
    clearInterval(timerHandler);
    setBtnDisabled(true);
    update();
    timerHandler = setInterval(() => {
      --currentRef.current;
      update();
      if (currentRef.current <= 0) {
        currentRef.current = initTime;
        setBtnDisabled(false);
        clearInterval(timerHandler);
        return;
      }
    }, 1000);
  };

  const onClickStart = () => {
    form.validateFields().then(() => {
      // props.onClickText为mfa
      if (props.onClickText) {
        props.onClickText().then(() => countTime());
      }
    });
  };

  useEffect(() => {
    onClickStart();
    return () => {
      clearInterval(timerHandler);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    countTime,
  }));

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
        onClick={onClickStart}
        disabled={btnDisabled}
        type="primary"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '40.14px',
        }}
      >
        <span
          style={{
            cursor: 'pointer',
            display: currentRef.current === 0 || currentRef.current === 60 ? 'none' : 'block',
          }}
        >
          {currentRef.current}
        </span>
        {textObj}
      </Button>
    );
  };
  return render();
};

export default forwardRef(TextTimer);
