<script setup lang="ts">
import { ref } from "vue";
import type { ApiResponse } from "~/types/apiResponse";
import type { User } from "~/types/user";
import type { Summary, Transaction, TransactionType } from "~/types/record";
import dayjs from "dayjs";
const { $apiFetch } = useNuxtApp();
const { userId } = useAuth()

// 选中的期数
const periodActive = ref<number | ''>('')

// 获取记录列表
const recordListPromise = useApiFetch<ApiResponse<Transaction[]>>(() => `transactions?period=${periodActive.value}`, {
  key: 'transactions-list',
});
// 获取统计列表
const summaryListPromise = useApiFetch<ApiResponse<Summary[]>>(() => `transactions/summary?period=${periodActive.value}`, {
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

const tabsActive = ref(0)
const tabsChange = (e: any) => {
  if(e.props.name === 1 && periodsList.value && periodsList.value.length) {
    // 查看往期，默认选中最后一个往期
    // index 0是本期，要取 1;
    periodActive.value = periodsList.value[1]!;
  } else {
    periodActive.value = ''
  }

  refreshData();
}

const handleDeleteRecord = (id: number) => {
  ElMessageBox.confirm("是否确认删除该条记录?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteRecordItem(id);
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
const periodChange = (value: number) => {
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
  refreshData()
  tabsActive.value = 0
  periodActive.value = '';
  scrollToId('pageHeader');
}

const typeFilter = (value: TransactionType) => {
  const map = {
    'expense': '代付',
    'loan': '个人借款',
    'repayment': '个人还款',
  }
  return map[value]
}
</script>

<template>
  <div class="home-page">
    <div class="flex justify-between items-center mb-12">
      <el-button type="primary" @click="billingModalVisible = true"
        >添加账单</el-button
      >
      <el-button type="danger" :disabled="recordList.length === 0" @click="handleClearRecord"
        >清空本期账单</el-button
      >
    </div>

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
      <el-tabs v-model="tabsActive" @tab-click="tabsChange">
        <el-tab-pane label="本期" :name="0"></el-tab-pane>
        <el-tab-pane label="往期" :name="1"></el-tab-pane>
      </el-tabs>

      <template v-if="tabsActive === 1">
        <div class="mb-12">
          <el-select v-model="periodActive" placeholder="请选择期数" @change="periodChange">
            <template v-for="(item, index) in periodsList">
              <!-- 不需要显示 本期 option -->
              <el-option
                v-if="index !== 0"
                :label="`第 ${item} 期`"
                :value="item"
              />
            </template>
            
          </el-select>
        </div>
      </template>
      <el-row v-if="recordList && recordList.length" :gutter="10">
        <el-col v-for="item in recordList" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card
            class="mb-12"
            header-class="card-header"
            body-class="card-body"
            footer-class="card-footer"
          >
            <ul>
              <li class="record-info-item">
                <div class="record-info-label">金额：</div>
                <div class="record-info-value">${{ item.amount }}</div>
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
              <!-- <li class="record-info-item">
                <div class="record-info-label">创建人：</div>
                <div class="record-info-value">
                  {{ item.creatorName }}
                </div>
              </li> -->
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
            <template #footer>
              <div class="flex items-center justify-end">
                <el-button
                  type="danger"
                  link
                  :disabled="deleteDisabled || item.creatorUid !== userId"
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
  padding: 16px 12px;
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
}
</style>
