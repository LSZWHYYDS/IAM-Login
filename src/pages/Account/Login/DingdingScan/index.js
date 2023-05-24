import { Col, Row, Spin } from 'antd';
import React from 'react';
import * as dd from 'dingtalk-jsapi';
let timer = null;
export default class DingdingScan extends React.Component {
  constructor(props) {
    super(props);
    const obj = props.dingdingAppId;
    const uri = encodeURIComponent(
      window.location.origin + '/iam/login/idp/code/' + obj.tcode + '/' + obj.auth_id,
    );
    // window.location.origin + '/iam/login/idp/code/' + obj.tcode + '/dingding/' + obj.auth_id,
    this.state = {
      // 你们申请的appid
      APPID: obj.appkey,
      // 跳转当前页面
      REDIRECT_URI: uri, //http://XXX/#/login 你的登录页面
      codeHeight: 0,
      loading: true,
      flag: 0, // 标记更新次数
    };
    this.refObj = React.createRef(null);
  }

  componentDidMount() {
    const that = this;
    const observer = new ResizeObserver(function elResizeChange(entries) {
      entries.forEach((entry) => {
        const { height } = entry.target.getBoundingClientRect();
        that.setState({
          codeHeight: height,
        });
      });
    });
    observer.observe(document.getElementById('login_container'));
    // const { continueUrl } = this.props;
    // const { APPID, REDIRECT_URI } = this.state;
    // // 实例化对象
    // var obj = window.DTFrameLogin(
    //    {
    //       id: 'login_container',
    //       width: 300,
    //       height: 280,
    //    },
    //    {
    //       redirect_uri: REDIRECT_URI,
    //       client_id: APPID,
    //       scope: 'openid',
    //       response_type: 'code',
    //       state: 'xxxxxxxxx',
    //       prompt: 'consent',
    //    },
    //    (loginResult) => {
    //       const { redirectUrl, authCode, state } = loginResult;
    //       // 这里可以直接进行重定向
    //       window.location.href = redirectUrl + '&continue=' + continueUrl;
    //       // 也可以在不跳转页面的情况下，使用code进行授权
    //    },
    //    (errorMsg) => {
    //       // 这里一般需要展示登录失败的具体原因
    //       alert(`Login Error: ${errorMsg}`);
    //    },
    // );
  }
  componentWillUnmount() {
    clearInterval(timer);
    document.getElementById('login_container')?.remove();
  }
  componentDidUpdate(prevProps, prevState) {
    const { REDIRECT_URI } = this.state;
    const { continueUrl } = this.props;
    // if (prevProps?.dingdingAppId?.appkey !== this.props?.dingdingAppId.appkey) {
    // 实例化对象
    var obj = window.DTFrameLogin(
      {
        id: 'login_container',
        width: 300,
        height: 280,
      },
      {
        redirect_uri: encodeURIComponent(
          window.location.origin +
            '/iam/login/idp/code/' +
            this.props.dingdingAppId.tcode +
            '/' +
            this.props.dingdingAppId.auth_id,
        ),
        client_id: this.props?.dingdingAppId.appkey,
        scope: 'openid',
        response_type: 'code',
        state: 'xxxxxxxxx',
        prompt: 'consent',
      },
      (loginResult) => {
        const { redirectUrl, authCode, state } = loginResult;
        // 这里可以直接进行重定向
        window.location.href = redirectUrl + '&continue=' + continueUrl;
        // 也可以在不跳转页面的情况下，使用code进行授权
      },
      (errorMsg) => {
        // 这里一般需要展示登录失败的具体原因
        alert(`Login Error: ${errorMsg}`);
      },
    );
    // }
    if (this.state.codeHeight && this.state.flag !== 1) {
      timer = setTimeout(() => {
        this.setState({
          loading: false,
          flag: 1,
        });
      }, 700);
    }
  }
  render() {
    return (
      <div>
        <Spin spinning={this.state.loading} style={{ background: '#fff', opacity: 1 }}>
          <Row type="flex" justify="center">
            <Col style={{ fontSize: 16 }}>请使用钉钉扫描登录</Col>
          </Row>
          <div
            id="login_container"
            className="dingdingBoxStyle"
            style={{ display: 'flex', justifyContent: 'center' }}
            ref={this.refObj}
          />
        </Spin>
      </div>
    );
  }
}
