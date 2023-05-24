const tabs = {
  namespace: 'tabs',
  state: {
    tabsData: '',
  },
  reducers: {
    setTabsData(state: any, action: any) {
      return { ...state, tabsData: action.payload };
    },
  },

  subscriptions: {
    // changeTime({ dispatch, history }: any) { },
  },
};
export default tabs;
