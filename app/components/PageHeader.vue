<script setup lang="ts">
import { ref } from "vue"

const { logout, userId } = useAuth()

// 获取用户名缩写
const userNameAcronym = computed(() => {
  if(userId.value) {
    return getAcronymFromCamelCase(userId.value);
  }
  return ''
})

const actionsCommand = (e: string) => {
  switch(e) {
    case 'logout':
      handleLogout()
      break;
  }
}

const handleLogout = () => {
  ElMessageBox.confirm(
    '是否确认退出登录？',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      logout()
    })
}

</script>

<template>
  <div id="pageHeader" class="page-header">
    <div class="page-header-main">
      <div class="page-header-goback"></div>
      <div class="page-header-title line-1">
        账单
      </div>
      <div class="page-header-action center">
        <el-dropdown popper-class="page-header-action-popper" @command="actionsCommand">
          <div class="avatar-box center">
            <span>{{ userNameAcronym }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <ClientOnly>
                  <div class="actions-menu-item flex items-center">
                    <Icon name="uil:sign-in-alt" class="actions-menu-icon"></Icon>
                    <div class="actions-menu-label">退出登录</div>
                  </div>
                </ClientOnly>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
      </div>
    </div>
    <div class="page-header-placeholder"></div>
  </div>
</template>

<style lang="scss">
.page-header {
  $page-header-header: 44px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  .page-header-main,
  .page-header-placeholder {
    height: $page-header-header;
    line-height: $page-header-header;
  }
  .page-header-main {
    background-color: var(--el-fill-color);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .page-header-goback,
  .page-header-action {
    width: $page-header-header;
    height: $page-header-header;
  }
  .page-header-title {
    flex: 1;
  }
  .avatar-box {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--el-color-primary);
    color: #fff;
    font-weight: bold;
    font-size: 12px;
    cursor: pointer;
  }
}
.page-header-action-popper {
  .actions-menu-item {
    padding: 0 4px;
  }
  .actions-menu-icon {
    font-size: 16px;
    margin-right: 8px;
  }
  .actions-menu-label {
    font-size: 14px;
  }
}
</style>