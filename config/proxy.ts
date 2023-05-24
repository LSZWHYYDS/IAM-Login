export default {
  dev: {
    '/api': {
      target: 'https://192-168-50-17-81c22d0dlfr4.ztna-dingtalk.com',
      // target: 'http://192.168.50.17',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/api': '' },
    },
    '/iam': {
      secure: false,
      target: 'https://192-168-50-17-81c22d0dlfr4.ztna-dingtalk.com',
      // target: 'http://192.168.50.17',
      changeOrigin: true,
    },
    '/mdm': {
      secure: false,
      target: 'https://192-168-50-17-81c22d0dlfr4.ztna-dingtalk.com',
      // target: 'http://192.168.50.17',
      changeOrigin: true,
    },
    '/adm': {
      secure: false,
      target: 'https://192-168-50-17-81c22d0dlfr4.ztna-dingtalk.com',
      // target: 'http://192.168.50.17',
      changeOrigin: true,
    },
  },
};
