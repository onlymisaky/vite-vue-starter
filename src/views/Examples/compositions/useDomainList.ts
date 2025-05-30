import type { DomainParams, DomainVo, QueryDomainListDto } from '@/api/domain';
import { computed, ref } from 'vue';
import { queryDomainList } from '@/api/domain';
import { useRequest } from '@/hooks/useRequest';
import { useResetableRef } from '@/hooks/useResetableState';
import { createUseRequestService } from '@/request/utils';

export function useDomainList() {
  const [searchParamsViewModel, resetSearchParamsViewModel] = useResetableRef<Partial<DomainParams>>({
    char: '',
    varchar: '',
    decimalRange: [],
    enum: [],
    datetimeRange: [],
  });

  const pagination = ref({ page: 1, pageSize: 20, total: 0 });

  const [sort, resetSort] = useResetableRef<SortOptions>({ sortBy: '', sortOrder: '' });

  const queryParams = computed<QueryDomainListDto>(() => {
    const kesy = Object.keys(searchParamsViewModel.value) as (keyof DomainParams)[];
    const params = kesy.reduce((acc, key) => {
      const val = searchParamsViewModel.value[key];

      if (['', 'undefined', 'null'].includes(`${val}`.trim())) {
        return acc;
      }

      if (Array.isArray(val) && val.length === 0) {
        return acc;
      }

      return { ...acc, [key]: val };
    }, {} as DomainParams);

    if (sort.value.sortBy && sort.value.sortOrder) {
      return {
        pagination: { page: pagination.value.page, pageSize: pagination.value.pageSize },
        params,
        sort: sort.value,
      };
    }

    return {
      pagination: { page: pagination.value.page, pageSize: pagination.value.pageSize },
      params,
    };
  });

  const domainList = ref<DomainVo[]>([]);

  const { loading, data, request: fetchDomainList, abort, abortable } = useRequest(createUseRequestService(queryDomainList));

  function getDomainList() {
    return fetchDomainList(queryParams.value)
      .then((res) => {
        domainList.value = data.value?.list ?? [];
        pagination.value.total = data.value?.total ?? 0;
        return res;
      })
      .catch((error) => {
        ElMessage.error(error.message);
        return Promise.reject(error);
      });
  }

  function handleSortChange({ prop, order }: { prop: string, order: 'descending' | 'ascending' | '' }) {
    if (!order) {
      resetSort();
    }
    else {
      sort.value.sortBy = prop;
      sort.value.sortOrder = order.replace('descending', 'DESC').replace('ascending', 'ASC').trim() as SortOptions['sortOrder'];
    }
    getDomainList();
  }

  function resetSearchParams() {
    resetSearchParamsViewModel();
    getDomainList();
  }

  return {
    searchParamsViewModel,
    resetSearchParams,
    pagination,
    domainList,
    loading,
    getDomainList,
    abort,
    abortable,
    handleSortChange,
  };
}
