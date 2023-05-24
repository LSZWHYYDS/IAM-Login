const allPath = [
  {
    path: '/dingding',
    layout: false,
    component: './Account/Login/Dingding',
  },
  {
    path: '/',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/',
        component: './Account/Login',
        layout: false,
      },
      {
        name: 'login',
        path: 'login1',
        component: './Account/Login',
        layout: false,
      },
      {
        path: 'guide',
        name: 'middlePageConfig',
        component: './MiddlePage',
        hideInMenu: true,
        layout: false,
      },
      {
        name: 'modifyPassword',
        path: '/modifyPassword',
        component: './ModifyPassword/ResetPasswordPage',
      },
      {
        name: 'feishu',
        path: '/oauth/feishu',
        component: './Account/Login/Oauth/Feishu',
      },
      {
        name: 'azure',
        path: '/oauth/azure',
        component: './Account/Login/Oauth/Azure',
      },
      {
        name: 'oidc',
        path: '/oauth/oidc',
        component: './Account/Login/Oauth/Oidc',
      },
      {
        name: 'oidc',
        path: '/oauth/oauth2',
        component: './Account/Login/Oauth/Oauth2',
      },
    ],
  },
];

export default allPath;
