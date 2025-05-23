<script setup>
import { h, onMounted } from 'vue';
import { deleteDomain, editDomain } from '@/api/domain';
import ListPage from '@/components/ListPage/ListPage.vue';
import { useModal } from '@/hooks/useModal';
import { handleAxiosResult } from '@/request';
import DomainForm from './components/DomainForm.vue';
import { useDomainList } from './compositions/useDomainList.ts';

const {
  searchParams,
  resetSearchParams,
  pagination,
  domainList,
  loading,
  getDomainList,
  abort,
  abortable,
  handleSortChange,
} = useDomainList();

const [open, close, DomainModal] = useModal(h(DomainForm, {
  onConfirm() {
    close();
    getDomainList();
  },
}), { title: '添加' }, {
  content: DomainForm,
});

async function handleDelete(row) {
  row._loading = true;
  const axiosPromise = deleteDomain(row.id);
  const [error] = await handleAxiosResult(axiosPromise);

  if (error) {
    ElMessage.error(error.message);
    row._loading = false;
    return;
  }

  ElMessage.success('删除成功');
  const index = domainList.value.findIndex(item => item.id === row.id);
  domainList.value.splice(index, 1);
}

async function changeStatus(_value, row, index) {
  const nextStatus = row.status === 1 ? 2 : 1;
  row._loading = true;

  const axiosPromise = editDomain(row.id, { status: nextStatus });

  const [error] = await handleAxiosResult(axiosPromise);

  if (error) {
    ElMessage.error(error.message);
    row._loading = false;
    return;
  }

  domainList.value[index].status = nextStatus;
  ElMessage.success('修改成功');
  row._loading = false;
}

onMounted(() => {
  getDomainList();
});
</script>

<template>
  <ListPage
    class="flex-1"
    @add="open"
    @refresh="getDomainList"
  >
    <template #others>
      <component :is="DomainModal" />
    </template>
    <template #filter>
      <div class="flex flex-col gap-[10px]">
        <ElForm
          inline
          :model="searchParams"
        >
          <ElSkeleton animated>
            <template #template>
              <div class="flex flex-wrap gap-[10px] items-center">
                <div
                  v-for="i in 7"
                  :key="i"
                  class="w-[320px]"
                >
                  <ElSkeletonItem variant="h1" />
                </div>
                <div class="flex ml-auto gap-[10px]">
                  <ElButton
                    type="primary"
                    @click="getDomainList"
                  >
                    查询
                  </ElButton>
                  <ElButton @click="resetSearchParams">
                    重置
                  </ElButton>
                  <ElButton
                    :disabled="!abortable"
                    @click="abort"
                  >
                    取消
                  </ElButton>
                </div>
              </div>
            </template>
          </ElSkeleton>
        </ElForm>
      </div>
    </template>
    <template #default="{ tableConfig }">
      <ElTable
        v-loading="loading"
        v-bind="tableConfig"
        :data="domainList"
        height="100%"
        @sort-change="handleSortChange"
      >
        <ElTableColumn
          type="index"
          label="编号"
          width="70"
          fixed
        />
        <ElTableColumn label="名称" />
        <ElTableColumn
          label="价格"
          width="120"
        />
        <ElTableColumn
          label="库存"
          width="120"
        />
        <ElTableColumn
          label="状态"
          width="200"
        >
          <template #default="{ row, $index }">
            <ElSwitch
              v-model="row.status"
              inline-prompt
              :loading="row._loading"
              :active-value="1"
              active-text="启用"
              :inactive-value="2"
              inactive-text="禁用"
              :before-change="() => changeStatus(row.status, row, $index)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="createTime"
          label="创建时间"
          width="250"
          sortable
        >
          <template #default="{ row }">
            <span>{{ (row.createTime || '').replace('T', ' ').replace('.000Z', '') }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="updateTime"
          label="更新时间"
          width="250"
          sortable
        >
          <template #default="{ row }">
            <span>{{ (row.updateTime || '').replace('T', ' ').replace('.000Z', '') }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          label="操作"
          width="200"
          fixed="right"
        >
          <template #default="{ row }">
            <ElButton
              type="primary"
              size="small"
              :loading="row._loading"
              @click="open({
                dialog: { title: '编辑' },
                content: { domain: row },
              })"
            >
              编辑
            </ElButton>
            <ElPopconfirm
              title="确定要删除吗？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <ElButton
                  type="danger"
                  size="small"
                  :loading="row._loading"
                >
                  删除
                </ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </ElTableColumn>
      </ElTable>
    </template>
    <template #pagination>
      <ElPagination
        v-model:current-page="pagination.page"
        background
        class="mt-[10px]"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="getDomainList"
      />
    </template>
  </ListPage>
</template>
