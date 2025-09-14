<script setup lang="ts">
import type { FormInstance } from "element-plus"
import dayjs from 'dayjs';
import { ref, computed, reactive } from "vue"
const { $apiFetch } = useNuxtApp()

const emits = defineEmits(['closed'])

const dialogVisible = ref(true)

const closed = () => {
  emits('closed')
}

const userList = ref<{
  id: string,
  name: string
}[]>([])
const getUserList = async () => {
  try {
    const data = await $apiFetch('user/users')
    console.log("🚀 ~ getUserList ~ data:", data)
    userList.value = data.data || []
  } catch(err) {
    console.error(err);
  }
}

onMounted(() => {
  getUserList()
})

const form = reactive({
  amount: null,
  type: 1, // 账单类型
  creditor: '', // 债权人
  debtor: [], // 债务人
  date: '', // 日期
  desc: '',
})

onMounted(() => {
  form.date = dayjs().format('YYYY-MM-DD')
});

const rules = reactive({
  amount: { required: true, message: '请输入金额', trigger: 'blur' },
  type: { required: true, message: '请选择账单类型', trigger: 'change' },
  creditor: { required: true, message: '请选择债权人', trigger: 'change' },
  debtor: { required: true, message: '请选择债务人', trigger: 'change' },
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
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

const formRef = ref<FormInstance>()
const handleConfirm = async () => {
  if(!formRef.value) return;
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
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
            <el-radio-group v-model="form.type">
              <el-radio :value="1">代付</el-radio>
              <el-radio :value="2">借款</el-radio>
              <el-radio :value="3">划款</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="债权人：" prop="creditor">
            <el-radio-group v-model="form.creditor">
              <template v-for="item in userList">
                <el-radio :value="item.id">{{ item.name }}</el-radio>
              </template>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="债务人：" prop="debtor">
            <el-checkbox-group v-model="form.debtor">
              <template v-for="item in userList">
                <el-checkbox :label="item.name" :name="item.id"></el-checkbox>
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
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss">

</style>