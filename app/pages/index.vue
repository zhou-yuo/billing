<script setup lang="ts">
import { ref } from "vue";
import type { ApiResponse } from "~/types/apiResponse";
import type { Transaction } from "~/types/record";

const { data: list, pending, error } = await useApiFetch<ApiResponse<Transaction[]>>('transactions')

const handleDeleteRecord = () => {
  ElMessageBox.confirm(
    '是否确认删除该条记录?',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      ElMessage.success('Delete completed')
    })
}

const handleClearRecord = () => {
  ElMessageBox.confirm(
    '是否确认已结清本期账单，并清除记录?',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      ElMessage.success('Clear completed')
    })
}

const billingModalVisible = ref(false)

</script>

<template>
  <div class="home-page">
    <div class="flex justify-between items-center mb-12">
      <el-button type="primary" @click="billingModalVisible = true">添加账单</el-button>
      <el-button type="danger" @click="handleClearRecord">清空本期账单</el-button>
    </div>

    <div class="section-title">
      统计
    </div>
    <div>
      <el-card header-class="card-header" body-class="card-body" footer-class="card-footer">
        <ul>
          <li v-for="item in 4" class="mb-4 flex gap-4">
            <b>User A</b>
            <span>欠</span>
            <b>User B</b>
            <span class="amount-color">88.00</span>
          </li>
        </ul>
      </el-card>
    </div>

    <div class="section-title">
      记录
    </div>

    <div>
      <el-row v-if="list && list.data" :gutter="10">
        <el-col v-for="value in list.data" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="mb-12" header-class="card-header" body-class="card-body" footer-class="card-footer">
            <ul>
              <li class="record-info-item">
                <div class="record-info-label">金额：</div>
                <div class="record-info-value">88.88</div>
              </li>
              <li class="record-info-item">
                <div class="record-info-label">债权人：</div>
                <div class="record-info-value">User1</div>
              </li>
              <li class="record-info-item">
                <div class="record-info-label">债务人：</div>
                <div class="record-info-value">User2、User3、User4</div>
              </li>
              <li class="record-info-item">
                <div class="record-info-label">日期：</div>
                <div class="record-info-value">2025-09-09</div>
              </li>
              <li class="record-info-item">
                <div class="record-info-label">备注：</div>
                <div class="record-info-value">2025-09-09</div>
              </li>
            </ul>
            <template #footer>
              <div class="flex items-center justify-end">
                <el-button type="danger" link @click="handleDeleteRecord()">删除</el-button>
              </div>
            </template>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <BillingModal   
      v-if="billingModalVisible"
      @closed="billingModalVisible = false"
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
