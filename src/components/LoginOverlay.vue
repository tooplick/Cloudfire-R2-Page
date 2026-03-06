<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="logo">
        <el-icon :size="40" color="#3b82f6"><Cloudy /></el-icon>
        <h2>Cloudfire R2</h2>
      </div>
      
      <el-form :model="form" @submit.prevent="handleLogin" label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="form.remember">记住密码</el-checkbox>
        </el-form-item>

        <el-button type="primary" native-type="submit" class="w-full" :loading="loading">
          登录
        </el-button>
        
        <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="mt-4" />
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api } from '../api'

const props = defineProps(['onLoginSuccess'])

const form = reactive({
  username: '',
  password: '',
  remember: false
})
const loading = ref(false)
const error = ref('')

onMounted(() => {
  const remembered = localStorage.getItem('cd_remember')
  if (remembered === '1') {
    form.username = localStorage.getItem('cd_username') || ''
    const savedPass = localStorage.getItem('cd_password')
    form.password = savedPass ? atob(savedPass) : ''
    form.remember = true
  }
})

async function handleLogin() {
  if (!form.username || !form.password) return
  
  loading.value = true
  error.value = ''
  
  try {
    const res = await api('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.username, password: form.password })
    })
    
    if (res.loggedIn) {
      if (form.remember) {
        localStorage.setItem('cd_remember', '1')
        localStorage.setItem('cd_username', form.username)
        localStorage.setItem('cd_password', btoa(form.password))
      } else {
        localStorage.removeItem('cd_remember')
        localStorage.removeItem('cd_username')
        localStorage.removeItem('cd_password')
      }
      
      props.onLoginSuccess(form.username)
    }
  } catch (err) {
    error.value = err.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-bg-color-page);
}
.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  padding: 20px;
}
.logo {
  text-align: center;
  margin-bottom: 30px;
}
.logo h2 {
  margin: 10px 0 0;
  color: var(--el-text-color-primary);
  font-weight: 500;
}
.w-full {
  width: 100%;
}
.mt-4 {
  margin-top: 16px;
}
</style>
