import { Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import DingdingScan from '../../DingdingScan';
import { getContinue } from '@/utils/common.utils';
import FlayBook from '../../FlyBook/index';
import _ from 'lodash';
const ScanCode: React.FC<any> = (props: any) => {
  const [key, setKey] = useState<string>('1');
  /**
   * 保存当前企业信息
   */
  const [saveCurrentInfo, setSaveCurrentInfo] = useState<any>({});
  /**
   * 监听传递过来的props变化 若变化则重新渲染UI函数
   */
  useEffect(() => {
    if (key == '1') {
      setSaveCurrentInfo(props.ScanCodes[0]);
    }
  }, [props.ScanCodes, props.dingdingAppIds]);

  const currentCorp = saveCurrentInfo && '当前企业名称：' + saveCurrentInfo.name;

  const onChange = (keys: string) => {
    let obj: any = null;
    props.ScanCodes.forEach((is: any, ix: any) => {
      if (ix + 1 == Number(keys)) {
        obj = is;
        setSaveCurrentInfo(is);
      }
    });

    props.getLoginConfigFunc(obj, 'dingding');
    setKey(keys);
  };
  const continueUrl = getContinue() || location.origin;

  const renderFlayBook = (item: any) => {
    if (item.auth_type == 'FEISHU') {
      if (_.isEmpty(props.feiShuAppIds)) return;
      return (
        <>
          <FlayBook
            dingdingAppId={props.feiShuAppIds}
            continueUrl={encodeURIComponent(continueUrl)}
          />
        </>
      );
    } else {
      if (_.isEmpty(props.dingdingAppIds)) return;
      return (
        <>
          <DingdingScan
            dingdingAppId={props.dingdingAppIds}
            continueUrl={encodeURIComponent(continueUrl)}
          />
        </>
      );
    }
  };

  return (
    <div style={{ minHeight: '370px' }}>
      <Tabs defaultActiveKey="1" onChange={onChange} activeKey={key} destroyInactiveTabPane>
        {props.ScanCodes.map((item: any, index: any) => {
          return (
            <Tabs.TabPane tab={item.name} key={index + 1}>
              {renderFlayBook(item)}
              <div
                style={{
                  textAlign: 'center',
                  marginTop: '-30px',
                  color: '#999',
                  position: 'relative',
                }}
              >
                {currentCorp || ''}
              </div>
            </Tabs.TabPane>
          );
        })}
      </Tabs>
    </div>
  );
};

export default ScanCode;
