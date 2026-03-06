<template>
  <div class="settings-container">
    <el-header class="settings-header">
      <el-button link icon="Back" @click="router.push('/')">返回云盘</el-button>
    </el-header>

    <el-main class="settings-main" v-loading="loading">
      <h2 class="page-title">系统设置</h2>
      <el-row :gutter="20">
        <!-- Storage Usage Card -->
        <el-col :span="24" class="mb-4">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon><DataBoard /></el-icon>
                <span>存储空间</span>
              </div>
            </template>
            <div class="storage-usage">
              <div class="flex-between mb-2">
                <span class="text-sm">已用 {{ formatSize(storageUsed) }} <span v-if="loadingStorage">(计算中...)</span></span>
                <span class="text-sm text-muted">总计 {{ maxStorageFormatted }}</span>
              </div>
              <el-progress 
                :percentage="storagePercentage" 
                :status="storagePercentage > 90 ? 'exception' : (storagePercentage > 75 ? 'warning' : 'success')" 
                :stroke-width="12"
                :show-text="false"
              />
              <div class="text-xs text-muted mt-2" v-if="storageDetails">
                文件数: {{ storageDetails.fileCount }}
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- Upload Limits Card -->
        <el-col :span="24" class="mb-4">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon><UploadFilled /></el-icon>
                <span>上传限制</span>
              </div>
            </template>
            <el-form label-position="top" :model="form">
              <el-form-item label="单文件大小限制">
                <div class="flex-row">
                  <el-input-number v-model="formModels.maxFileSizeVal" :min="1" />
                  <el-select v-model="formModels.maxFileSizeUnit" class="ml-2 w-100">
                    <el-option label="MB" :value="1048576" />
                    <el-option label="GB" :value="1073741824" />
                  </el-select>
                </div>
              </el-form-item>
              
              <el-form-item label="总存储空间限制">
                <div class="flex-row">
                  <el-input-number v-model="formModels.maxStorageSizeVal" :min="0" :step="0.1" />
                  <el-select v-model="formModels.maxStorageSizeUnit" class="ml-2 w-100">
                    <el-option label="GB" :value="1073741824" />
                    <el-option label="TB" :value="1099511627776" />
                  </el-select>
                </div>
                <div class="form-hint">设为 0 表示不限制</div>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- Chunk Upload Card -->
        <el-col :span="24" class="mb-4">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon><Files /></el-icon>
                <span>分片上传</span>
              </div>
            </template>
            <el-form label-position="left" label-width="140px" :model="form">
              <el-form-item label="启用分片上传">
                <el-switch v-model="formModels.chunkEnabled" />
              </el-form-item>
              
              <div v-show="formModels.chunkEnabled" class="chunk-settings">
                <el-form-item label="分片触发阈值 (MB)">
                  <el-input-number v-model="formModels.chunkThreshold" :min="1" />
                  <span class="form-hint ml-2">文件超过此大小时自动使用分片上传</span>
                </el-form-item>
                
                <el-form-item label="分片大小 (MB)">
                  <el-input-number v-model="formModels.chunkSize" :min="5" />
                  <span class="form-hint ml-2">建议 5~20 MB，最小 5 MB</span>
                </el-form-item>
              </div>
            </el-form>
          </el-card>
        </el-col>
      </el-row>

      <div class="actions-footer">
        <el-button @click="resetToDefault" icon="RefreshLeft">恢复默认</el-button>
        <el-button type="primary" @click="saveSettings" icon="Select" :loading="saving">保存设置</el-button>
      </div>
    </el-main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { api } from '../api'
import { formatSize } from '../utils'

const router = useRouter()
const loading = ref(true)
const saving = ref(false)
const loadingStorage = ref(false)

const storageUsed = ref(0)
const storageDetails = ref(null)

const form = ref({})
const formModels = reactive({
  maxFileSizeVal: 100,
  maxFileSizeUnit: 1048576,
  maxStorageSizeVal: 1,
  maxStorageSizeUnit: 1073741824,
  chunkEnabled: true,
  chunkThreshold: 10,
  chunkSize: 5
})

const maxStorageFormatted = computed(() => {
  const total = formModels.maxStorageSizeVal * formModels.maxStorageSizeUnit
  if (total === 0) return '无限制'
  return formatSize(total)
})

const storagePercentage = computed(() => {
  const total = formModels.maxStorageSizeVal * formModels.maxStorageSizeUnit
  if (total === 0 || storageUsed.value === 0) return 0
  return Math.min(100, Math.round((storageUsed.value / total) * 100))
})

onMounted(() => {
  loadSettings()
  loadStorageUsage()
})

async function loadSettings() {
  loading.value = true
  try {
    const res = await api('/api/settings')
    const s = res.settings
    form.value = s

    // 解析配置到 UI Model
    let mfs = parseInt(s.max_file_size)
    if (mfs >= 1073741824 && mfs % 1073741824 === 0) {
      formModels.maxFileSizeVal = mfs / 1073741824
      formModels.maxFileSizeUnit = 1073741824
    } else {
      formModels.maxFileSizeVal = Math.round(mfs / 1048576)
      formModels.maxFileSizeUnit = 1048576
    }

    let mss = parseInt(s.max_storage_size)
    if (mss === 0) {
      formModels.maxStorageSizeVal = 0
      formModels.maxStorageSizeUnit = 1073741824
    } else if (mss >= 1099511627776 && mss % 1099511627776 === 0) {
      formModels.maxStorageSizeVal = mss / 1099511627776
      formModels.maxStorageSizeUnit = 1099511627776
    } else {
      formModels.maxStorageSizeVal = Math.round((mss / 1073741824) * 10) / 10
      formModels.maxStorageSizeUnit = 1073741824
    }

    formModels.chunkEnabled = String(s.chunk_enabled) === 'true'
    formModels.chunkThreshold = parseInt(s.chunk_threshold) / 1048576
    formModels.chunkSize = parseInt(s.chunk_size) / 1048576

  } catch (err) {
    if (err.message === '未登录') router.push('/')
  } finally {
    loading.value = false
  }
}

async function loadStorageUsage() {
  loadingStorage.value = true
  try {
    const res = await api('/api/storage')
    if (res.success && res.storage) {
      storageUsed.value = res.storage.usedSize
      storageDetails.value = {
        fileCount: res.storage.fileCount
      }
    }
  } catch (err) {
    console.error('获取存储用量失败')
  } finally {
    loadingStorage.value = false
  }
}

async function saveSettings() {
  saving.value = true
  try {
    const newSettings = {
      max_file_size: (formModels.maxFileSizeVal * formModels.maxFileSizeUnit).toString(),
      max_storage_size: (formModels.maxStorageSizeVal * formModels.maxStorageSizeUnit).toString(),
      chunk_enabled: formModels.chunkEnabled.toString(),
      chunk_threshold: (formModels.chunkThreshold * 1048576).toString(),
      chunk_size: (formModels.chunkSize * 1048576).toString()
    }
    
    const res = await api('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: newSettings })
    })
    
    if (res.success) {
      ElMessage.success('配置已保存')
    }
  } catch (err) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function resetToDefault() {
  formModels.maxFileSizeVal = 100
  formModels.maxFileSizeUnit = 1048576
  formModels.maxStorageSizeVal = 1
  formModels.maxStorageSizeUnit = 1073741824
  formModels.chunkEnabled = true
  formModels.chunkThreshold = 10
  formModels.chunkSize = 5
  ElMessage.info('已恢复默认配置，请点击"保存设置"以应用')
}
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  background-color: var(--el-bg-color-page);
}
.settings-header {
  display: flex;
  align-items: center;
  background-color: var(--el-bg-color-overlay);
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0 20px;
}
.page-title {
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.settings-main {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}
.mb-4 { margin-bottom: 16px; }
.mb-2 { margin-bottom: 8px; }
.mt-2 { margin-top: 8px; }
.ml-2 { margin-left: 8px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.text-muted { color: var(--el-text-color-secondary); }
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.flex-row {
  display: flex;
  align-items: center;
}
.w-100 { width: 100px; }
.form-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  margin-top: 4px;
}
.chunk-settings {
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  margin-top: 10px;
}
.actions-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>
