import type { DomainListQueryDto, DomainListVo } from '@/api/domain';
import { computed, ref } from 'vue';
import { queryDomainList } from '@/api/domain';
import { useRequest } from '@/hooks/useRequest';
import { useResetableRef } from '@/hooks/useResetableState';
import { createUseRequestService } from '@/request/utils';

export function useDomainList() {
  const searchParams = ref<object>({});

  const pagination = ref({ page: 1, pageSize: 20, total: 0 });

  const [sort, resetSort] = useResetableRef({ sortBy: '', sortOrder: '' });

  const queryParams = computed<DomainListQueryDto>(() => {
    const params: Record<string, any> = {
      pagination: { page: pagination.value.page, pageSize: pagination.value.pageSize },
      params: Object.keys(searchParams.value).reduce((acc, key) => {
        const k = key as keyof typeof searchParams.value;
        const val = searchParams.value[k];

        if (!['', 'null', 'undefined'].includes(`${val}`.trim())) {
          acc[k] = val;
        }
        return acc;
      }, {} as Record<string, any>),
    };
    if (sort.value.sortBy && sort.value.sortOrder) {
      params.sort = sort.value;
    }
    return params;
  });

  const domainList = ref<DomainListVo[]>([]);

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
      sort.value.sortOrder = order.replace('descending', 'DESC').replace('ascending', 'ASC');
    }
    getDomainList();
  }

  return {
    searchParams,
    pagination,
    domainList,
    loading,
    getDomainList,
    abort,
    abortable,
    handleSortChange,
  };
}
