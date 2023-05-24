import { PageLoading } from '@ant-design/pro-layout';
import { message, notification } from 'antd';
import { RequestConfig, RunTimeLayoutConfig, history } from 'umi';
import staticMethod from '@/utils/staticMethod';
import { errPlaceholder } from './services/digitalsee/api';
export const initialStateConfig = {
  loading: <PageLoading />,
};
export async function getInitialState() {
  return {};
}
export const layout: RunTimeLayoutConfig = ({ initialState }: any) => {
  return {
    disableContentMargin: false,
    //  title: initialState?.policyData?.uc_name || '云身份连接器-数犀科技',
    title: initialState?.policyData?.uc_name,
    onPageChange: () => {
      // 判断是否携带forget_password
      if (location.hash.split('/').includes('forget_password')) {
        history.push(
          `/resetPassword?a=${location.hash.split('/')[2]}&b=${location.hash.split('/')[3]}`,
        );
      } else {
        const queryObj: any = staticMethod.parseQueryString(window.location.href);
        if (!(location.pathname == '/login/guide/')) {
          if ((!queryObj.continue || !queryObj.client_id) && !queryObj.code) {
            message.error(errPlaceholder);
          }
        }
      }
    },
    ...{ siderWidth: 0 },
  };
};

export const request: RequestConfig = {
  errorHandler: (error: any) => {
    const { response } = error;
    if (!response) {
      notification.error({
        description: '您的网络发生异常，无法连接服务器',
        message: '网络异常',
      });
    }
    throw error;
  },
};
