export const loginSuccess = function (accessToken: string, tcode: string, callback: any) {
  sessionStorage.setItem(
    'reduxPersist:login',
    JSON.stringify({
      loggedIn: true,
    }),
  );

  if (typeof callback === 'function') {
    callback();
  }
};
export const noLogin = () => {
  return (
    //下列页面不需要授权就可以访问
    window.location.href.indexOf('register') !== -1 ||
    window.location.href.indexOf('mailSent') !== -1 ||
    window.location.href.indexOf('smsSent') !== -1 ||
    window.location.href.indexOf('dingding') !== -1 ||
    window.location.href.indexOf('resetPassword') !== -1 ||
    window.location.href.indexOf('forget_password') !== -1 ||
    window.location.href.indexOf('forcedUpdatePwd') !== -1 ||
    window.location.href.indexOf('verify_email_address') !== -1 ||
    window.location.href.indexOf('#/cert') !== -1 ||
    window.location.href.indexOf('#/email') !== -1 ||
    window.location.href.indexOf('#/sms') !== -1 ||
    window.location.pathname === '/user/login' ||
    window.location.pathname === '/user/login/' ||
    window.location.pathname === '/Digitalsee.html/' ||
    window.location.pathname === '/Digitalsee.html'
  );
};

export const isAuthed = () => {
  return (
    //下列页面不需要授权就可以访问
    window.location.href.indexOf('register') !== -1 ||
    window.location.href.indexOf('mailSent') !== -1 ||
    window.location.href.indexOf('smsSent') !== -1 ||
    window.location.href.indexOf('forget_password') !== -1 ||
    window.location.href.indexOf('resetPassword') !== -1 ||
    window.location.href.indexOf('verify_email_address') !== -1 ||
    window.location.href.indexOf('#/cert') !== -1 ||
    window.location.href.indexOf('#/email') !== -1 ||
    window.location.href.indexOf('#/sms') !== -1 ||
    window.location.pathname === '/user/login' ||
    window.location.pathname === '/user/login/' ||
    (window.location.href.indexOf('/dingding') !== -1 &&
      window.location.href.indexOf('continue') !== -1) || //请求dingding登录页面，并且已经包含了continue页面，则不发起授权请求
    (window.location.href.indexOf('#login') !== -1 &&
      window.location.href.indexOf('continue') !== -1) //请求login登录页面，并且已经包含了continue页面，则不发起授权请求
  );
};
