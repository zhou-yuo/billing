<script setup lang="ts">
import { ref } from "vue";
import type { ApiResponse } from "~/types/apiResponse";
import type { User } from "~/types/user";
import type { Summary, Transaction, TransactionType } from "~/types/record";
import dayjs from "dayjs";
const { $apiFetch } = useNuxtApp();
const { userId } = useAuth()
import { billingTypeMap } from '~/constants/transactions';

const filterForm = reactive<{
  period: number | '',
  type: string
}>({
  period: '',
  type: '', // 账单类型 'expense'-多人消费, 'loan'-个人借款, 'repayment'-个人还款
})

// 结清状态：0 表示未结清，1 表示已结清。默认为 0
const statusTabsActive = ref(0);
const statusTabsChange = (e: any) => {
  statusTabsActive.value = e.props.name;

  if(e.props.name === 1) {
    // 往期
    if(periodsList.value && periodsList.value.length > 1) {
      // 查看往期，默认选中最后一个往期
      // index 0 是本期，要取 1;
      filterForm.period = periodsList.value[1]!;
    } else {
      filterForm.period = '';
    }
  } else {
    filterForm.period = ''
  }
  filterForm.type = ''

  refreshData();
}

const initParams = () => {
  return `period=${ filterForm.period }&type=${ filterForm.type }&status=${ statusTabsActive.value }`
}

// 获取记录列表
const recordListPromise = useApiFetch<ApiResponse<Transaction[]>>(() => `transactions?period=${ filterForm.period }&type=${ filterForm.type }&status=${ statusTabsActive.value }`, {
  key: 'transactions-list',
});
// 获取统计列表
const summaryListPromise = useApiFetch<ApiResponse<Summary[]>>(() => `transactions/summary?${ initParams() }`, {
  key: 'transactions-summary',
});

// 使用 Promise.all 一次性等待所有请求完成。
const [
  { data: recordListRes, pending: recordListPending, refresh: recordListRefresh },
  { data: summaryListRes, refresh: summaryListRefresh }
] = await Promise.all([
  recordListPromise,
  summaryListPromise
]);
// 记录列表
const recordList = computed(() => recordListRes.value?.data || [])
// 统计列表
const summaryList = computed(() => summaryListRes.value?.data || []) 

const colLayout = ref({
  xs: 24,
  sm: 12,
  md: 8,
  lg: 6
});

const handleDeleteRecord = (id: number) => {
  ElMessageBox.confirm("是否确认删除该条记录?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    ElMessageBox.prompt('为确认操作，请输入 "确认删除" 这四个字。', "提示", {
      inputPattern: /^确认删除$/,
      inputErrorMessage: "校验失败，请重新输入",
    }).then(({ value }) => {
      deleteRecordItem(id);
    });
  });
};

const deleteDisabled = ref(false);
const deleteRecordItem = async (id: number) => {
  try {
    deleteDisabled.value = true;
    await $apiFetch<ApiResponse<Summary[]>>(`/transactions/${id}`, {
      method: "delete",
    });
    ElMessage.success("删除成功");
  } catch (err) {
    console.error(err);
  } finally {
    deleteDisabled.value = false;
    refreshData();
  }
};

const handleClearRecord = () => {
  ElMessageBox.confirm("确定要删除所有账单吗？这个操作无法撤销！", "警告", {
    type: "warning",
  }).then(() => {
    ElMessageBox.prompt('为确认操作，请输入 "确认清空" 这四个字。', "提示", {
      inputPattern: /^确认清空$/,
      inputErrorMessage: "校验失败，请重新输入",
    }).then(({ value }) => {
      clearRecord()
    });
  });
};

const clearRecord = async () => {
  try {
    deleteDisabled.value = true;
    await $apiFetch<ApiResponse<Summary[]>>(`transactions/settle`, {
      method: "post",
    });
    ElMessage.success("所有账单记录已清空");
  } catch (err) {
    console.error(err);
  } finally {
    deleteDisabled.value = false;
    refreshData();
    getPeriodsList();
  }
};

// 获取用户列表
const userList = ref<User[]>([]);
const getUserList = async () => {
  try {
    const data = await $apiFetch<ApiResponse<User[]>>("user/users");
    userList.value = data.data || [];
  } catch (err) {
    console.error(err);
  }
};

const periodsList = ref<number[]>([]);
// 获取期数列表
const getPeriodsList = async () => {
  try {
    const data = await $apiFetch<ApiResponse<number[]>>("periods");
    periodsList.value = data.data || [];
  } catch (err) {
    console.error(err);
  }
};
const filterChange = (e: any) => {
  refreshData();
}

const refreshData = () => {
  recordListRefresh();
  summaryListRefresh();
};

onMounted(() => {
  getUserList();
  getPeriodsList();
});

const dateFilter = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD");
};

const billingModalVisible = ref(false);
const billingSubmit = () => {
  statusTabsActive.value = 0
  filterForm.period = ''
  filterForm.type = ''
  refreshData()
  scrollToId('pageHeader');
}

const typeFilter = (value: TransactionType) => {
  return billingTypeMap[value]
}

const deleteItemDisabled = (item: Transaction) => {
  return deleteDisabled.value || item.creatorUid !== userId.value
}
</script>

<template>
  <div class="home-page">

    <div class="actions-box">
      <div class="flex justify-between items-center actions-main">
        <el-button type="primary" @click="billingModalVisible = true"
          >添加账单</el-button
        >
        <el-button type="danger" :disabled="recordList.length === 0" @click="handleClearRecord"
          >清空本期账单</el-button
        >
      </div>
      <div class="actions-placeholder"></div>
    </div>

    <div class="home-page-main">
      <div class="section-title">统计</div>
      <div>
        <el-card
          v-if="summaryList && summaryList.length"
          header-class="card-header"
          body-class="card-body"
          footer-class="card-footer"
        >
          <ul>
            <li v-for="item in summaryList" class="mb-4 flex gap-4">
              <b style="min-width: 56px;">{{ item.name }}：</b>
              <span class="amount-color">${{ item.balance }}</span>
            </li>
          </ul>
        </el-card>
      </div>
      
      <div class="section-title">记录</div>

      <div v-loading="recordListPending">
        <el-tabs v-model="statusTabsActive" @tab-click="statusTabsChange">
          <el-tab-pane label="本期" :name="0"></el-tab-pane>
          <el-tab-pane label="往期" :name="1"></el-tab-pane>
        </el-tabs>

        <div class="filter-form">
          <el-form :inline="true" :model="filterForm" class="demo-form-inline">

            <el-row :gutter="10">
              <el-col v-bind="colLayout">
                <el-form-item label="类型：">
                  <el-select v-model="filterForm.type" placeholder="请选择类型" @change="filterChange" clearable style="width: 100%;">
                    <template v-for="(label, key) in billingTypeMap">
                      <el-option :label="label" :value="key" />
                    </template>
                  </el-select>
                </el-form-item>
              </el-col>
              
              <template v-if="statusTabsActive === 1">
                <el-col v-bind="colLayout">
                  <el-form-item label="期数：">
                    <el-select v-model="filterForm.period" placeholder="请选择期数" @change="filterChange" clearable style="width: 100%;">
                      <template v-for="(item, index) in periodsList">
                        <!-- 不需要显示 本期 option -->
                        <el-option
                          v-if="index !== 0"
                          :label="`第 ${item} 期`"
                          :value="item"
                        />
                      </template>
                    </el-select>
                  </el-form-item>
                </el-col>
              </template>
            </el-row>
          </el-form>
        </div>

        <el-row v-if="recordList && recordList.length" :gutter="10">
          <el-col v-for="item in recordList" v-bind="colLayout">
            <el-card
              class="mb-12"
              header-class="card-header"
              body-class="card-body"
              footer-class="card-footer"
            >
              <ul>
                <li class="record-info-item">
                  <div class="record-info-label">金额：</div>
                  <div class="record-info-value amount-color">
                    <span>${{ item.amount }}</span>
                    <span v-if="item.type === 'expense'">（${{ Math.round((item.amount / item.participantsNames.length) * 100) / 100 }}/人）</span>
                  </div>
                </li>
                <li class="record-info-item">
                  <div class="record-info-label">类型：</div>
                  <div class="record-info-value">{{ typeFilter(item.type) }}</div>
                </li>
                <li class="record-info-item">
                  <div class="record-info-label">付款人：</div>
                  <div class="record-info-value">{{ item.payerName }}</div>
                </li>
                <li class="record-info-item">
                  <div class="record-info-label">受益人：</div>
                  <div class="record-info-value">
                    {{ item.participantsNames.join("、") }}
                  </div>
                </li>
                <li v-if="item.status === 1" class="record-info-item">
                  <div class="record-info-label">清空人：</div>
                  <div class="record-info-value color-warning">
                    {{ item.settledByName || ''}}
                  </div>
                </li>
                <li class="record-info-item">
                  <div class="record-info-label">日期：</div>
                  <div class="record-info-value">
                    {{ dateFilter(item.transactionDate) }}
                  </div>
                </li>
                <li class="record-info-item">
                  <div class="record-info-label">备注：</div>
                  <div class="record-info-value">{{ item.description }}</div>
                </li>
              </ul>
              <template v-if="item.status === 0" #footer>
                <div class="flex items-center justify-end">
                  <el-button
                    :type="deleteItemDisabled(item) ? 'info' : 'danger'"
                    link
                    :disabled="deleteItemDisabled(item)"
                    @click="handleDeleteRecord(item.id)"
                    >删除</el-button
                  >
                </div>
              </template>
            </el-card>
          </el-col>
        </el-row>
        <el-empty v-else />
      </div>
    </div>

    <BillingModal
      v-if="billingModalVisible"
      :userList="userList"
      @closed="billingModalVisible = false"
      @submit="billingSubmit"
    />
  </div>
</template>

<style lang="scss">
.home-page {
  .home-page-main {
    padding: 16px 12px;
  }
  .actions-main {
    padding: 10px 12px;
    position: fixed;
    left: 0;
    right: 0;
    top: 44px;
    z-index: 97;
    background: var(--el-bg-color);
    border: 0.5px solid var(--el-fill-color);
  }
  .actions-main,
  .actions-placeholder {
    height: 52px;
  }
  .filter-form {
    .el-form-item {
      width: 100%;
      margin-right: 0;
    }
  }
  .el-card__header.card-header,
  .el-card__body.card-body,
  .el-card__footer.card-footer {
    padding: 12px 10px;
  }
  .card-header-title {
    font-weight: bold;
    font-size: 16px;
  }
  .record-info-item {
    display: flex;
    line-height: 18px;
    font-size: 14px;
    margin-bottom: 6px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .record-info-label {
    min-width: 56px;
    color: var(--el-text-color-regular);
  }
  .record-info-value {
    flex: 1;
    overflow: hidden;
  }
  .section-title {
    font-size: 18px;
    font-weight: bold;
    margin: 20px 0 10px;
    padding: 0 10px;
    position: relative;
    &:first-child {
      margin-top: 0;
    }
    &::after {
      content: '';
      display: block;
      width: 4px;
      height: 100%;
      background-color: var(--el-color-primary);
      position: absolute;
      left: 0;
      top: 0;
      border-radius: 1px;
    }
  }
  .period-label {
    color: #666;
    flex-shrink: 0;
  }
}
</style>
