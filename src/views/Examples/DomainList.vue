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

async function changeBoolean(_value, row, index) {
  const nextStatus = !row.boolean;
  row._loading = true;

  const axiosPromise = editDomain(row.id, { boolean: nextStatus });

  const [error] = await handleAxiosResult(axiosPromise);

  if (error) {
    ElMessage.error(error.message);
    row._loading = false;
    return;
  }

  domainList.value[index].boolean = nextStatus;
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
        <ElTableColumn
          label="char" prop="char" :width="{
            default: '110',
            small: '100',
            large: '130',
          }[tableConfig.size]"
        />
        <ElTableColumn label="varchar" prop="varchar" width="150" show-overflow-tooltip />
        <ElTableColumn label="int" prop="int" width="80" />
        <ElTableColumn label="decimal" prop="decimal" width="100" />
        <ElTableColumn
          label="boolean"
          width="90"
        >
          <template #default="{ row, $index }">
            <ElSwitch
              v-model="row.boolean"
              inline-prompt
              :loading="row._loading"
              :active-value="true"
              active-text="打开"
              :inactive-value="false"
              inactive-text="关闭"
              :before-change="() => changeBoolean(row.boolean, row, $index)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="enum" prop="enum" width="90" />
        <ElTableColumn label="array" prop="array" width="150" />
        <ElTableColumn label="datetime" prop="datetime" width="220" />
        <ElTableColumn label="timestamp" prop="timestamp" width="140" />
        <ElTableColumn label="json" prop="json" width="130" show-overflow-tooltip />
        <ElTableColumn
          prop="createTime"
          label="创建时间"
          width="200"
          sortable
        >
          <template #default="{ row }">
            <span>{{ (row.createTime || '').replace('T', ' ').replace('.000Z', '') }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="updateTime"
          label="更新时间"
          width="200"
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
