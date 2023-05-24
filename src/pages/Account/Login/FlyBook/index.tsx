import { Spin } from 'antd';
import { useEffect, useState } from 'react';
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
export default function Index(props: any) {
  const obj = props.dingdingAppId;
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState<any>(0);
  useEffect(() => {
    if (obj.appkey) {
      const QRLoginObj = window.QRLogin({
        id: 'flyBook',
        goto: `https://www.feishu.cn/suite/passport/oauth/authorize?client_id=${
          obj.appkey
        }&redirect_uri=${encodeURIComponent(
          location.origin + '/login/oauth/feishu',
        )}&response_type=code&state=5996`,
        width: '300',
        height: '300',
        style: {
          margin: '0 auto',
        },
      });
      const handleMessage = function (event: any) {
        const origin = event.origin;
        // 使用 matchOrigin 方法来判断 message 是否来自飞书页面
        if (QRLoginObj.matchOrigin(origin)) {
          const loginTmpCode = event.data;
          const continues = new (UrlSearch as any)(`${location.href}`);
          sessionStorage.setItem('continue', continues.continue);
          sessionStorage.setItem('auth_id', obj.auth_id);
          window.location.href = `https://www.feishu.cn/suite/passport/oauth/authorize?client_id=${
            obj.appkey
          }&redirect_uri=${encodeURIComponent(
            location.origin + '/login/oauth/feishu',
          )}&response_type=code&state=5996&tmp_code=${loginTmpCode}`;
        }
      };
      if (typeof window.addEventListener != 'undefined') {
        window.addEventListener('message', handleMessage, false);
      } else if (typeof window.attachEvent != 'undefined') {
        window.attachEvent('onmessage', handleMessage);
      }
    }
    return () => {
      document.getElementById('flyBook')?.remove();
    };
  }, [obj.appkey]);

  /**
   *监听页面DOM元素变化
   */
  useEffect(() => {
    const observer = new ResizeObserver(function elResizeChange(entries) {
      entries.forEach((entry) => {
        const { heights } = entry.target.getBoundingClientRect() as any;
        setHeight(heights);
      });
    });
    observer.observe(document.getElementById('flyBook') as HTMLDivElement);
    return () => {
      document.getElementById('flyBook')?.remove();
    };
  }, []);

  /**
   * 监听变量值高度变化
   */
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [height]);

  return (
    <div>
      <Spin spinning={loading} style={{ background: '#fff', opacity: 1, height: '300px' }}>
        <div
          id="flyBook"
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '10px',
            width: '300px',
            margin: '0 auto',
          }}
        ></div>
      </Spin>
    </div>
  );
}
