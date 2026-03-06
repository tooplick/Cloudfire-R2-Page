<template>
  <div class="app-container">
    <LoginOverlay v-if="!isLoggedIn" :onLoginSuccess="handleLoginSuccess" />

    <el-container v-else class="main-layout">
      <!-- Header -->
      <el-header class="header">
        <div class="logo">
          <el-icon :size="24" color="#3b82f6" class="mr-2"><Cloudy /></el-icon>
          <h2>Cloudfire R2</h2>
        </div>
        <div class="header-right">
          <span class="user-info">
            <el-icon><User /></el-icon> {{ username }}
          </span>
          <el-dropdown trigger="click" @command="handleCommand">
            <el-button class="ml-4" circle icon="Setting" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="settings"><el-icon><Setting /></el-icon>系统设置</el-dropdown-item>
                <el-dropdown-item command="logout" divided><el-icon><SwitchButton /></el-icon>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Toolbar -->
      <div class="toolbar">
        <el-breadcrumb separator-icon="ArrowRight">
          <el-breadcrumb-item>
            <a @click="navigateTo('')"><el-icon><Monitor /></el-icon> 根目录</a>
          </el-breadcrumb-item>
          <el-breadcrumb-item v-for="(part, index) in breadcrumbs" :key="index">
            <a @click="navigateTo(part.path)">{{ part.name }}</a>
          </el-breadcrumb-item>
        </el-breadcrumb>

        <div class="toolbar-actions">
          <el-button-group class="mr-4">
            <el-button :type="viewMode === 'grid' ? 'primary' : 'default'" icon="Grid" @click="viewMode = 'grid'" />
            <el-button :type="viewMode === 'list' ? 'primary' : 'default'" icon="List" @click="viewMode = 'list'" />
          </el-button-group>
          
          <el-button icon="FolderAdd" @click="showNewFolder = true">新建文件夹</el-button>
          <el-button type="primary" icon="Upload" @click="showUploadDialog = true" class="ml-2">上传文件</el-button>
        </div>
      </div>

      <!-- Main Content -->
      <el-main class="main-content" v-loading="loading">
        <!-- Empty State -->
        <el-empty v-if="folders.length === 0 && files.length === 0" description="目录为空">
          <el-button type="primary" @click="showUploadDialog = true">上传文件</el-button>
        </el-empty>

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="grid-view">
          <el-row :gutter="20">
            <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="3" v-for="folder in folders" :key="folder.path">
              <el-card shadow="hover" class="file-card" body-style="padding: 15px; text-align: center" @click="navigateTo(folder.path)">
                <div class="card-actions" @click.stop>
                  <el-dropdown trigger="click" @command="(cmd) => handleItemCommand(cmd, 'folder', folder)">
                    <el-icon class="action-icon"><More /></el-icon>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="rename"><el-icon><Edit /></el-icon>重命名</el-dropdown-item>
                        <el-dropdown-item command="delete" class="text-danger"><el-icon><Delete /></el-icon>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
                <el-icon :size="48" color="#3b82f6"><Folder /></el-icon>
                <div class="file-name" :title="folder.name">{{ folder.name }}</div>
              </el-card>
            </el-col>

            <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="3" v-for="file in files" :key="file.key">
              <el-card shadow="hover" class="file-card" body-style="padding: 15px; text-align: center" @click="handleFileClick(file)">
                <div class="card-actions" @click.stop>
                  <el-dropdown trigger="click" @command="(cmd) => handleItemCommand(cmd, 'file', file)">
                    <el-icon class="action-icon"><More /></el-icon>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item v-if="isPreviewable(file.name)" command="preview"><el-icon><View /></el-icon>预览</el-dropdown-item>
                        <el-dropdown-item command="download"><el-icon><Download /></el-icon>下载</el-dropdown-item>
                        <el-dropdown-item command="share"><el-icon><Share /></el-icon>分享链接</el-dropdown-item>
                        <el-dropdown-item command="rename"><el-icon><Edit /></el-icon>重命名</el-dropdown-item>
                        <el-dropdown-item command="delete" class="text-danger"><el-icon><Delete /></el-icon>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
                <el-icon :size="48" color="#64748b"><component :is="getFileIcon(file.name)" /></el-icon>
                <div class="file-name" :title="file.name">{{ file.name }}</div>
                <div class="file-meta">
                  <span>{{ formatSize(file.size) }}</span>
                  <span>{{ formatTime(file.uploaded).split(' ')[0] }}</span>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- List View -->
        <el-table v-else :data="tableData" style="width: 100%" @row-click="handleRowClick">
          <el-table-column label="名称" min-width="250">
            <template #default="{ row }">
              <div class="flex-align-center">
                <el-icon :size="20" :color="row.isFolder ? '#3b82f6' : '#64748b'" class="mr-2">
                  <Folder v-if="row.isFolder" />
                  <component v-else :is="getFileIcon(row.name)" />
                </el-icon>
                {{ row.name }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="大小" width="120">
            <template #default="{ row }">
              {{ row.isFolder ? '-' : formatSize(row.size) }}
            </template>
          </el-table-column>
          <el-table-column prop="uploaded" label="修改时间" width="180">
            <template #default="{ row }">
              {{ row.isFolder ? '-' : formatTime(row.uploaded) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="right">
            <template #default="{ row }">
              <div @click.stop v-if="row.isFolder">
                <el-button type="primary" link icon="Edit" @click="handleItemCommand('rename', 'folder', row)" />
                <el-button type="danger" link icon="Delete" @click="handleItemCommand('delete', 'folder', row)" />
              </div>
              <div @click.stop v-else>
                <el-button v-if="isPreviewable(row.name)" type="primary" link icon="View" @click="handleItemCommand('preview', 'file', row)" />
                <el-button type="primary" link icon="Download" @click="handleItemCommand('download', 'file', row)" />
                <el-button type="primary" link icon="Share" @click="handleItemCommand('share', 'file', row)" />
                <el-dropdown trigger="click" @command="(cmd) => handleItemCommand(cmd, 'file', row)" class="ml-2">
                  <el-button type="primary" link icon="More" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="rename"><el-icon><Edit /></el-icon>重命名</el-dropdown-item>
                      <el-dropdown-item command="delete" class="text-danger"><el-icon><Delete /></el-icon>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>

    <!-- Dialogs -->
    <el-dialog v-model="showNewFolder" title="新建文件夹" width="400px">
      <el-input v-model="newFolderName" placeholder="请输入文件夹名称" @keyup.enter="createFolder" />
      <template #footer>
        <el-button @click="showNewFolder = false">取消</el-button>
        <el-button type="primary" @click="createFolder" :loading="actionLoading">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showRename" title="重命名" width="400px">
      <el-input v-model="renameValue" placeholder="请输入新名称" @keyup.enter="submitRename" ref="renameInputRef" />
      <template #footer>
        <el-button @click="showRename = false">取消</el-button>
        <el-button type="primary" @click="submitRename" :loading="actionLoading">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showUploadDialog" title="上传文件" width="500px">
      <el-upload
        class="upload-drag-area"
        drag
        action="#"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleFileSelect"
        multiple
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或 <em>点击选择文件</em>
        </div>
      </el-upload>
    </el-dialog>
    
    <!-- Upload Drawer -->
    <el-drawer v-model="showUploads" title="上传列表" direction="rtl" size="350px">
      <div v-for="task in uploadTasks" :key="task.id" class="upload-task">
        <div class="task-header">
          <span class="task-name" :title="task.file.name">{{ task.file.name }}</span>
          <span :class="['task-status', task.statusClass]">{{ task.statusText }}</span>
        </div>
        <el-progress :percentage="task.progress" :status="task.progressStatus" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '../api'
import { formatSize, formatTime, getFileIcon, isPreviewable } from '../utils'
import { uploadSingleFile, uploadChunkedFile } from '../upload'
import LoginOverlay from '../components/LoginOverlay.vue'

const router = useRouter()

// 状态
const isLoggedIn = ref(false)
const username = ref('')
const loading = ref(true)
const actionLoading = ref(false)

const currentPath = ref('')
const viewMode = ref('grid')

const folders = ref([])
const files = ref([])
const settings = ref({})

// 弹窗状态
const showNewFolder = ref(false)
const newFolderName = ref('')
const showRename = ref(false)
const renameValue = ref('')
const activeItem = ref(null)
const renameInputRef = ref(null)
const showUploadDialog = ref(false)

const showUploads = ref(false)
const uploadTasks = ref([])

// 计算属性
const breadcrumbs = computed(() => {
  const parts = currentPath.value.split('/').filter(Boolean)
  let accumulated = ''
  return parts.map(part => {
    accumulated += part + '/'
    return { name: part, path: accumulated }
  })
})

const tableData = computed(() => {
  const f = folders.value.map(x => ({ ...x, isFolder: true }))
  const fl = files.value.map(x => ({ ...x, isFolder: false }))
  return [...f, ...fl]
})

// 初始化与路由
onMounted(async () => {
  try {
    const res = await api('/auth/login')
    if (res.loggedIn) {
      handleLoginSuccess(res.username)
    }
  } catch (err) {
    isLoggedIn.value = false
    loading.value = false
  }
})

function handleLoginSuccess(user) {
  isLoggedIn.value = true
  username.value = user
  fetchSettings().then(() => loadPath(''))
}

// 数据加载
async function fetchSettings() {
  try {
    const res = await api('/api/settings')
    settings.value = res.settings
  } catch (err) {
    console.error('Failed to load settings', err)
  }
}

async function loadPath(path) {
  loading.value = true
  currentPath.value = path
  try {
    const data = await api(`/api/list?path=${encodeURIComponent(path)}`)
    folders.value = data.folders || []
    files.value = data.files || []
  } catch (err) {
    // Error handled by api.js
  } finally {
    loading.value = false
  }
}

function navigateTo(path) {
  loadPath(path)
}

// 顶部菜单
function handleCommand(cmd) {
  if (cmd === 'settings') {
    router.push('/settings')
  } else if (cmd === 'logout') {
    api('/auth/logout').finally(() => {
      isLoggedIn.value = false
      username.value = ''
    })
  }
}

// 操作分发
function handleItemCommand(cmd, type, item) {
  if (cmd === 'rename') {
    activeItem.value = { ...item, type }
    renameValue.value = item.name
    showRename.value = true
    nextTick(() => renameInputRef.value?.focus())
  } else if (cmd === 'delete') {
    ElMessageBox.confirm(`确定要删除 "${item.name}" 吗？此操作不可撤销。`, '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      confirmButtonClass: 'el-button--danger'
    }).then(async () => {
      try {
        await api('/api/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: type === 'folder' ? item.path : item.key })
        })
        ElMessage.success('删除成功')
        loadPath(currentPath.value)
      } catch {}
    }).catch(() => {})
  } else if (cmd === 'download') {
    window.location.href = `/api/download?key=${encodeURIComponent(item.key)}`
  } else if (cmd === 'share') {
    api('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: item.key, name: item.name })
    }).then(data => {
      navigator.clipboard.writeText(data.url).then(() => {
        ElMessage.success('分享链接已复制到剪贴板')
      })
    })
  } else if (cmd === 'preview') {
    // 简略实现: 直接新窗口打开预览，或后续补齐类似原来的 modal 预览
    window.open(`/api/download?key=${encodeURIComponent(item.key)}&preview=1`, '_blank')
  }
}

function handleFileClick(file) {
  if (isPreviewable(file.name)) {
    handleItemCommand('preview', 'file', file)
  } else {
    handleItemCommand('download', 'file', file)
  }
}

function handleRowClick(row) {
  if (row.isFolder) {
    navigateTo(row.path)
  } else {
    handleFileClick(row)
  }
}

// API 操作
async function createFolder() {
  if (!newFolderName.value) return
  actionLoading.value = true
  try {
    const path = currentPath.value + newFolderName.value
    await api('/api/mkdir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    })
    ElMessage.success('创建成功')
    showNewFolder.value = false
    newFolderName.value = ''
    loadPath(currentPath.value)
  } catch {} finally {
    actionLoading.value = false
  }
}

async function submitRename() {
  if (!renameValue.value || renameValue.value === activeItem.value.name) {
    showRename.value = false
    return
  }
  
  actionLoading.value = true
  const item = activeItem.value
  const isFolder = item.type === 'folder'
  const oldKey = isFolder ? item.path : item.key
  
  let newKey
  if (isFolder) {
    const parentPath = oldKey.slice(0, oldKey.slice(0, -1).lastIndexOf('/') + 1)
    newKey = parentPath + renameValue.value + '/'
  } else {
    const parentPath = oldKey.slice(0, oldKey.lastIndexOf('/') + 1)
    newKey = parentPath + renameValue.value
  }

  try {
    await api('/api/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldKey, newKey })
    })
    ElMessage.success('重命名成功')
    showRename.value = false
    loadPath(currentPath.value)
  } catch {} finally {
    actionLoading.value = false
  }
}

// 上传系统
function handleFileSelect(uploadFile) {
  const file = uploadFile.raw
  if (!file) return

  // 1. 检查限制
  const maxSize = settings.value.max_file_size || 104857600
  if (file.size > maxSize) {
    ElMessage.error(`文件 "${file.name}" 超出大小限制`)
    return
  }

  showUploadDialog.value = false
  showUploads.value = true

  const task = {
    id: Date.now() + Math.random().toString(36).slice(2),
    file,
    progress: 0,
    statusText: '准备中',
    statusClass: '',
    progressStatus: ''
  }
  uploadTasks.value.unshift(task)

  const onProgress = (pct, text) => {
    task.progress = pct
    task.statusText = text
    if (pct === 100 && text.includes('完成')) {
       task.progressStatus = 'success'
       task.statusClass = 'text-success'
    } else if (text.includes('失败') || text.includes('错误')) {
       task.progressStatus = 'exception'
       task.statusClass = 'text-danger'
    }
  }

  const chunkEnabled = String(settings.value.chunk_enabled) === 'true'
  const threshold = parseInt(settings.value.chunk_threshold || 10485760)

  const uploadPromise = (chunkEnabled && file.size > threshold)
    ? uploadChunkedFile(file, currentPath.value, settings.value, onProgress)
    : uploadSingleFile(file, currentPath.value, onProgress)

  uploadPromise.then(() => {
    task.progressStatus = 'success'
    task.statusText = '上传成功'
    loadPath(currentPath.value) // 刷新列表
  }).catch((err) => {
    task.progressStatus = 'exception'
    task.statusText = err.message
  })
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.main-layout {
  height: 100%;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0 20px;
}
.logo {
  display: flex;
  align-items: center;
}
.logo h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.header-right {
  display: flex;
  align-items: center;
}
.user-info {
  font-size: 14px;
  color: var(--el-text-color-regular);
}
.ml-4 { margin-left: 16px; }
.mr-2 { margin-right: 8px; }
.mr-4 { margin-right: 16px; }

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: #fff;
  border-bottom: 1px solid var(--el-border-color-light);
}
.toolbar-actions {
  display: flex;
  align-items: center;
}

.main-content {
  padding: 20px;
  background-color: #f8fafc;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

/* Grid View CSS */
.file-card {
  margin-bottom: 20px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}
.file-card:hover {
  border-color: var(--el-color-primary-light-5);
  transform: translateY(-2px);
}
.card-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transition: opacity 0.2s;
}
.file-card:hover .card-actions {
  opacity: 1;
}
.action-icon {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
}
.action-icon:hover {
  background: var(--el-fill-color-dark);
}
.file-name {
  margin-top: 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-meta {
  margin-top: 6px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  display: flex;
  flex-direction: column;
}

/* List View CSS */
.flex-align-center {
  display: flex;
  align-items: center;
}
.text-danger {
  color: var(--el-color-danger);
}
.text-success {
  color: var(--el-color-success);
}
.ml-2 {
  margin-left: 8px;
}

/* Upload Drawer */
.upload-task {
  margin-bottom: 16px;
}
.task-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
}
.task-name {
  width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.task-status {
  color: var(--el-text-color-secondary);
}

.upload-drag-area :deep(.el-upload-dragger) {
  padding: 40px;
}
</style>
