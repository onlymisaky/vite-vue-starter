import { request } from '@/request/index';

export interface DomainVo extends BaiscListItemVo {
  char: string
  varchar: string
  text: string
  int: number
  decimal: number
  tinyintToAchieveBoolean: boolean
  boolean: boolean
  enum: string
  date: string
  time: string
  datetime: string
  timestamp: string
  year: string
  json: object
  array: string[]
}

export interface DomainParams {
  char: string
  varchar: string
  decimalRange: number[]
  enum: string[]
  datetimeRange: string[]
}

export interface QueryDomainListDto extends QueryListDto<DomainParams> { }

export function queryDomainList(data: QueryDomainListDto) {
  return request.post<PaginatedResponse<DomainVo>>('/domain/list', data);
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
