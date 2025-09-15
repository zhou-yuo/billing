<script setup lang="ts">
import type { FormInstance } from "element-plus"
import dayjs from 'dayjs';
import { ref, computed, reactive } from "vue"
import type { User } from "~/types/user";
const { userId } = useAuth()

const { $apiFetch } = useNuxtApp()

const props = defineProps({
  userList: {
    type: Array as PropType<User[]>,
    default: () => []
  }
})
const emits = defineEmits(['closed', 'submit'])

const dialogVisible = ref(true)

const closed = () => {
  emits('closed')
}

const form = reactive({
  amount: null,
  type: 'expense', // 账单类型 'expense'-多人消费, 'loan'-个人借款, 'repayment'-个人还款
  payerId: '', // 付款人
  participants: [] as string[], // 受益人
  date: '', // 日期
  desc: '',
})

onMounted(() => {
  form.payerId = userId.value || '';
  form.date = dayjs().format('YYYY-MM-DD')
});

const rules = reactive({
  amount: { required: true, message: '请输入金额', trigger: 'blur' },
  type: { required: true, message: '请选择账单类型', trigger: 'change' },
  payerId: { required: true, message: '请选择付款人', trigger: 'change' },
  participants: { required: true, message: '请选择受益人', trigger: 'change' },
  date: { required: true, message: '请选择日期', trigger: 'change' },
  desc: { required: true, message: '请输入描述', trigger: 'blur' },
})

const screenWidth = ref(0);

const dialogWidth = computed(() => {
  return screenWidth.value < 500 ? '96%' : '500px';
});
const handleResize = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  handleResize()
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

const formRef = ref<FormInstance>()
const handleConfirm = async () => {
  if(!formRef.value) return;
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      onSubmit()
    }
  })
}

const submitLoadig = ref(false)
const onSubmit = async () => {
  try {
    submitLoadig.value = true
    let formData: {
      amount: number | string,
      type: string,
      payerId: null | string,
      participants: string[],
      lenderId: null | string,
      borrowerId: null | string,
      description: string,
      transactionDate: string,
    } = {
      amount: form.amount!,
      type: form.type, // 'expense'-多人消费, 'loan'-个人借款, 'repayment'-个人还款
      payerId: null, // 付款人
      participants: [], // 受益人
      // 债权人/出借人的用户 ID。仅在 type 为 loan 或 repayment 时需要填写。如果 type 是 expense，请传 null。
      lenderId: null, // 出借人
      // 债务人/借款人的用户 ID。仅在 type 为 loan 或 repayment 时需要填写。如果 type 是 expense，请传 null。
      borrowerId: null, // 借款人
      description: form.desc, 
      transactionDate: form.date,
    }
    // 类型: expense (多人消费)
    //   付款人 (form.payerId) -> formData.payerId
    //   受益人 (form.participants) -> formData.participants
    //   lenderId 和 borrowerId 应为 null。
    // 类型: loan (个人借款)
    //   付款人/出借人 (form.payerId) -> formData.lenderId
    //   受益人/借款人 (form.participants[0]) -> formData.borrowerId
    //   payerId 和 participants 应为 null / []。
    // 类型: repayment (个人还款)
    //   付款人/还款人 (form.payerId) -> formData.borrowerId (还钱的人是债务人)
    //   受益人/收款人 (form.participants[0]) -> formData.lenderId (收钱的人是债权人)
    //   payerId 和 participants 应为 null / []。
    switch(form.type) {
      case 'expense':
        // 多人消费：记录谁付了钱，以及谁参与了消费
        formData.payerId = form.payerId;  // 付款人
        formData.participants = form.participants; // 受益人
        break
      case 'loan':
        // 个人借款：付款人是“出借人”，受益人是“借款人”
        formData.payerId = form.payerId;  // 付款人
        formData.participants = form.participants; // 受益人
        formData.lenderId = form.payerId; // 出借人
        formData.borrowerId = form.participants[0]!; // 借款人
        break
      case 'repayment':
        // 个人还款：付款人(还款人)是“借款人”，受益人(收款人)是“出借人”
        formData.payerId = form.payerId;  // 付款人
        formData.participants = form.participants; // 受益人
        formData.lenderId = form.participants[0]!; // 收款人
        formData.borrowerId = form.payerId; // 还款人
        break
    }
    const data = await $apiFetch('transactions/create', {
      method: 'post',
      body: formData
    })
    ElMessage.success('提交成功')
    emits('submit')
    dialogVisible.value = false;
  } catch(err) {
    console.error(err);
  } finally {
    submitLoadig.value = false
  }
}

// 受益人 disabled
const participantsCheckboxDisable = (item: User) => {
  try {
    if(form.type === 'loan' || form.type === 'repayment') {
      // 借款 或 还款时，受益人不能是自己；
      if(item.id === userId.value) {
        return true
      }
      // 借款 或 还款 时，受益人只能选一个
      return form.participants.length > 0 && !form.participants.includes(item.id)
    }
  } catch(err) {
    return false
  }
  return false
}

</script>

<template>
  <div class="">
    <el-dialog
      v-model="dialogVisible"
      title="添加账单"
      :width="dialogWidth"
      @closed="closed"
    >
      <div>
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="auto"
        >
          <el-form-item label="金额：" prop="amount">
            <el-input-number v-model="form.amount" :min="0" :max="999999999" :step="1" :precision="2" placeholder="请输入金额" style="width: 80%;" />
          </el-form-item>
          <el-form-item label="账单类型：" prop="type">
            <!-- 'expense'-多人消费, 'loan'-个人借款, 'repayment'-个人还款 -->
            <el-radio-group v-model="form.type" @change="form.participants = []">
              <el-radio value="expense">代付</el-radio>
              <el-radio value="loan" >借款</el-radio>
              <el-radio value="repayment" >还款</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="付款人：" prop="payerId">
            <el-radio-group v-model="form.payerId">
              <template v-for="item in userList">
                <el-radio :value="item.id" :disabled="item.id !== userId">{{ item.name }}</el-radio>
              </template>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="受益人：" prop="participants">
            <el-checkbox-group v-model="form.participants">
              <template v-for="item in userList">
                <el-checkbox 
                  :label="item.id" 
                  :disabled="participantsCheckboxDisable(item)"
                >{{ item.name }}</el-checkbox>
              </template>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="日期：" prop="date">
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="请选择日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="描述：" prop="desc">
            <el-input
              v-model="form.desc"
              autosize
              type="textarea"
              placeholder="请输入描述"
              maxlength="100"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoadig" @click="handleConfirm">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss">

</style>