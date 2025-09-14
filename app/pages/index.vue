<script setup lang="ts">
import { ref } from "vue";
import type { ApiResponse } from "~/types/apiResponse";
import type { User } from "~/types/user";
import type { Summary, Transaction } from "~/types/record";
import dayjs from "dayjs";
const { $apiFetch } = useNuxtApp();

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
    init();
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
    await $apiFetch<ApiResponse<Summary[]>>(`transactions/clear`, {
      method: "post",
    });
    ElMessage.success("所有账单记录已清空");
  } catch (err) {
    console.error(err);
  } finally {
    deleteDisabled.value = false;
    init();
  }
};

const userList = ref<User[]>([]);
const getUserList = async () => {
  try {
    const data = await $apiFetch<ApiResponse<User[]>>("user/users");
    userList.value = data.data || [];
  } catch (err) {
    console.error(err);
  }
};

const recordList = ref<Transaction[]>([]);
const getRecordList = async () => {
  try {
    const data = await $apiFetch<ApiResponse<Transaction[]>>("transactions");
    recordList.value = data.data || [];
  } catch (err) {
    console.error(err);
  }
};

const summaryList = ref<Summary[]>([]);
const getSummaryList = async () => {
  try {
    const data = await $apiFetch<ApiResponse<Summary[]>>(
      "transactions/summary"
    );
    summaryList.value = data.data || [];
  } catch (err) {
    console.error(err);
  }
};

const init = () => {
  getRecordList();
  getSummaryList();
};

onMounted(() => {
  getUserList();
  init();
});

const dateFilter = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD");
};

const billingModalVisible = ref(false);

const typeFilter = (value: 'expense' | 'loan' | 'repayment') => {
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
      <el-button type="danger" @click="handleClearRecord"
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
            <b>{{ item.name }}：</b>
            <span class="amount-color">{{ item.balance }}</span>
          </li>
        </ul>
      </el-card>
    </div>

    <div class="section-title">记录</div>

    <div>
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
                <div class="record-info-value">{{ item.amount }}</div>
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
                  :disabled="deleteDisabled"
                  @click="handleDeleteRecord(item.id)"
                  >删除</el-button
                >
              </div>
            </template>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <BillingModal
      v-if="billingModalVisible"
      :userList="userList"
      @closed="billingModalVisible = false"
      @submit="init"
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
  }
}
</style>
