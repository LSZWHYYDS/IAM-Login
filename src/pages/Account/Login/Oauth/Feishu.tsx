import { parseQueryString } from '@/utils/common.utils';
import { Spin } from 'antd';
import { useEffect } from 'react';
/**
 * 此页面为了拿取飞书时拼接在地址栏的code作为中间页
 */
export default function Feishu() {
  useEffect(() => {
    const urlHref = window.location.href;
    const obj: any = parseQueryString(urlHref);
    const tcode = sessionStorage.getItem('tcode');
    const auth_id = sessionStorage.getItem('auth_id');
    const continues = sessionStorage.getItem('continue');
    window.location.href =
      window.location.origin +
      '/iam/login/idp/code/' +
      tcode +
      '/' +
      auth_id +
      `?code=${obj.code}&continue=${continues}state=${new Date().getTime()}`;
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f8f9ff',
      }}
    >
      <Spin tip="飞书登录中..." size="large" />
    </div>
  );
}
