/* eslint-disable @typescript-eslint/no-unused-expressions */
import _ from 'lodash';
import { hasFunc } from '@/utils/common.utils';
import allPath from '../../config/routes';
import { getAllPathsByPermSet } from '../../config/menuData';

export const IosVersions = ['7.0', '8.0', '9.0', '10.0', '11.0', '12.0', '13.0', '14.0', '15.0'];
export const AndroidVersions = ['4.0', '5.0', '6.0', '7.0', '8.0', '9.0', '10.0', '11.0', '12.0'];

export const LicenseConfigPath = {
  user_join: ['/uc/syncgene'],
  app_sso: [],
  risk_monitor: [],
  file_audit: ['/fileAudit/fileAuditLog'],
  adm: [
    '/apps/abmapps',
    '/apps/abmapps',
    '/setting/entapps',
    '/setting/invitations',
    '/setting/customize',
  ],
  dlp: ['/policy/appPolicy', '/policy/deviceAdmitPolicy'],
  gateway: [],
};
let allPermPaths: string[] = [];
let hasPermPaths: string[] = [];

export const hasPerm = (path: string) => {
  const needPerm = allPermPaths.includes(path);
  if (!needPerm) {
    return true;
  }
  const hasChild = _.find(hasPermPaths, (item) => {
    return _.startsWith(item, path);
  })?.length;
  return hasPermPaths.includes(path) || hasChild;
};
function removeNoPermMenu(menus: any) {
  menus &&
    _.remove(menus, (menu: any) => {
      const del = !hasPerm(menu.path);
      if (del) {
        return del;
      }
      const has = hasFunc(menu.path);
      if (!has) {
        return true;
      }
      removeNoPermMenu(menu.routes);
      if (menu.routes && menu.routes.length === 0) {
        return true;
      }
      return false;
    });
}
function removeNoLicMenu(menus: any) {
  menus &&
    _.remove(menus, (menu: any) => {
      const has = hasFunc(menu.path);
      if (!has) {
        return true;
      }
      removeNoLicMenu(menu.routes);
      if (menu.routes && menu.routes.length === 0) {
        return true;
      }
      return false;
    });
}
export const getPermMenuData = (permissionsSets: any, loginId: string) => {
  const permMenus = _.cloneDeep(allPath);
  if (loginId === 'admin') {
    removeNoLicMenu(permMenus);
    return permMenus;
  }
  const permInfo = getAllPathsByPermSet(permissionsSets);
  allPermPaths = permInfo.allPermPaths;
  hasPermPaths = permInfo.permPaths;
  removeNoPermMenu(permMenus);
  return;
};
