import { request } from '@/request/index';

export interface DomainListQueryDto { }
export interface DomainListVo { }
export function queryDomainList(queryParams: DomainListQueryDto) {
  return request.post<PaginatedResponse<DomainListVo>>('/domain/list', queryParams);
}

export interface AddDomainDto { }
export function addDomain(data: AddDomainDto) {
  return request.post('/domain', data);
}

export interface EditDomainDto { }
export function editDomain(id: number, data: EditDomainDto) {
  return request.patch(`/domain/${id}`, data);
}

export function deleteDomain(id: number) {
  return request.delete(`/domain/${id}`);
}
