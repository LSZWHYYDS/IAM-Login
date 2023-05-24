import { dingAuth, getDingCorpId } from '@/pages/Account/service';
import {
  CookieUtil,
  getClientIdFromWindowLocation,
  getTenantIdFromWindowLocation,
  parseQueryString,
  setXsrf_token,
  showErrorMessage,
  getContinue,
} from '@/utils/common.utils';
import { loginHello, getPoliceInfo } from '../service';
import request from 'umi-request';

import { Form, message, Radio, Spin } from 'antd';
import * as dd from 'dingtalk-jsapi';
import { Component } from 'react';
import conf from '@/utils/conf';
import Mfa from './Mfa';
import styles from './index.less';
const FormItem = Form.Item,
  RadioGroup = Radio.Group;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

class Dingding extends Component {
  constructor(...args) {
    super(...args);
    this.index = 0;
    this.errorNum = 0;
    this.state = {
      dingtalkApiErr: false,
      logining: false,
      msg: '',
      mfaList: [],
      uc_name: '',
      uc_logo: '',
    };
  }

  onMfaAuthSuccess = async (response) => {
    if (!response) {
      return;
    }
    if (response.error === '0') {
      if (response.data.next === 'continue') {
        const redirectUri = getContinue();
        if (!redirectUri) {
          message.error('缺少client_id或continue参数');
          return;
        }
        window.location.href = redirectUri;
      } else {
        history.push({
          pathname: `/`,
        });
      }
    } else {
      message.error(response.data.message);
    }
  };

  dingAuthFun = (tcode, clientId, dingAuthCode, auth_id) => {
    if (window.location.href.indexOf('continue') !== -1) {
      let url = new URL(window.location.href);
      let baseURL = conf.getBackendUrl();
      let redirectUri = url.searchParams.get('continue');
      let openWin = url.searchParams.get('open_win');
      let encodeRedirectUri = encodeURIComponent(redirectUri);
      if (openWin) {
        window.open(
          `${baseURL}/login/sns/auth?tcode=${tcode}&clientId=${clientId}&code=${dingAuthCode}&type=DINGDING&authId=${auth_id}&redirectUri=${encodeRedirectUri}`,
        );
        window.close();
      } else {
        window.location.href = `${baseURL}/login/sns/auth?tcode=${tcode}&clientId=${clientId}&code=${dingAuthCode}&type=DINGDING&authId=${auth_id}&redirectUri=${encodeRedirectUri}`;
      }
    } else {
      showErrorMessage.error('参数错误: continue non-exisnt');
    }
  };
  dingdingReady = (tcode, clientId, corpObj, isLast, callback) => {
    const that = this;
    dd.ready(function () {
      dd.runtime.permission.requestAuthCode({
        corpId: corpObj.corp_id,
        onSuccess: function (info) {
          that.dingAuthFun(tcode, clientId, info.code, corpObj.auth_id);
        },
        onFail: function (err) {
          that.errorNum += 1;
          if (!isLast && callback) {
            callback();
          }
        },
      });
    });
  };

  /**
   * 首次加载执行loginHello函数
   */
  handleLoginHello = async (clientID, tcode) => {
    await loginHello({
      client_id: clientID || 'usercenter',
      tcode: tcode,
    }).then(async (res) => {
      // 增加mfa认证逻辑 如果next是mfa则进行mfa认证
      if (res.data?.next == 'mfa') {
        this.setState({
          mfaList: res.data?.tip.login_policy.mfa,
        });
        return;
      }
    });
  };

  componentDidMount() {
    let url = new URL(window.location.href);

    let tcode =
      (this.props.location.state && this.props.location.state.tcode) ||
      url.searchParams.get('tcode') ||
      getTenantIdFromWindowLocation();

    let clientId =
      (this.props.location.state && this.props.location.state.clientId) ||
      url.searchParams.get('client_id') ||
      getClientIdFromWindowLocation();

    if (url.hash.includes('#login')) {
      this.setState({
        logining: true,
      });
      getDingCorpId(tcode, clientId)
        .then((response) => {
          this.setState({
            logining: false,
          });
          setXsrf_token(CookieUtil.get('XSRF-TOKEN') || '');
          if (response.error === '0') {
            //todo 返回数组，一个一个测试
            let corpObjList = response.data;

            if (!corpObjList || corpObjList.length == 0) {
              location.href = `${location.origin}/portal/introductionPage`;
              return;
            }

            this.index = 0;
            this.errorNum = 0;
            let _this = this;
            this.dingdingReady(
              tcode,
              clientId,
              corpObjList[this.index],
              corpObjList.length === this.index + 1,
              () => {
                this.index += 1;
                if (corpObjList.length <= this.index + 1) {
                  this.dingdingReady(
                    tcode,
                    clientId,
                    corpObjList[this.index],
                    corpObjList.length === this.index + 1,
                  );
                } else {
                  if (this.errorNum === corpObjList.length) {
                    showErrorMessage('获取钉钉授权码失败：' + JSON.stringify(err));
                    _this.setState({
                      dingtalkApiErr: true,
                    });
                  }
                }
              },
            );
          } else {
            showErrorMessage(response.data.message);
          }
        })
        .catch((error) => {
          this.setState({
            logining: false,
            dingtalkApiErr: true,
          });
        });
    }

    this.handleLoginHello(clientId, tcode);
    // 获取uc系统名称和uc的logo
    getPoliceInfo().then((rs) => {
      this.setState({
        uc_name: rs.data.uc_name,
        uc_logo: rs.data.uc_logo,
      });
    });
  }

  render() {
    const { dingtalkApiErr, logining, msg } = this.state;
    return (
      <Spin spinning={logining}>
        {this.state.mfaList.length ? (
          <div className={styles.container}>
            <div
              className={styles.content}
              id="contentId"
              style={{
                position: 'relative',
                height: 'fit-content',
                paddingBottom: '5%',
              }}
            >
              <div className={styles.top}>
                <div className={styles.header}>
                  <img
                    alt="logo"
                    className={styles.logo}
                    src={this.state.uc_logo || require('@/../public/images/favicon.png')}
                  />
                  <span className={styles.title}>
                    <span className={styles.lead} style={{ color: '#555' }}>
                      {/* {ucName || '云身份连接器-数犀科技'} */}
                      {this.state.uc_name}
                    </span>
                  </span>
                </div>
              </div>
              <div className={styles.main}>
                {/* 在钉钉工作台中打开mfa统一让用户自己输入用户名 固传递'' */}
                <Mfa
                  mfaList={this.state.mfaList}
                  userName={''}
                  onLoginSuccess={this.onMfaAuthSuccess}
                />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '200px' }}>
            <div style={{ textAlign: 'center', fontSize: '16px' }}>
              <div>{dingtalkApiErr ? '请使用钉钉客户端打开此页面' : '钉钉登录中...'}</div>
              {msg}
            </div>
          </div>
        )}
      </Spin>
    );
  }
}

export default Dingding;
