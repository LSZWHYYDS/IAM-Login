import conf from '@/utils/conf';
import { request } from 'umi';

export async function detectionTenant(tenant_id: string) {
  return request(conf.getBackendUrl() + `/api/tenant/${tenant_id}`, {
    method: 'GET',
  });
}
