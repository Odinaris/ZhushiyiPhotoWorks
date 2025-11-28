/**
 * 工具函数
 */

// 格式化时间
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 显示加载提示 - 使用自定义loading overlay
const showLoading = (title = '加载中...') => {
  // 确保页面已准备好
  const pages = getCurrentPages()
  if (pages.length === 0) return
  
  const currentPage = pages[pages.length - 1]
  
  // 创建loading overlay
  const loadingData = {
    isLoading: true,
    loadingText: title
  }
  
  currentPage.setData(loadingData)
}

// 隐藏加载提示
const hideLoading = () => {
  // 获取当前页面
  const pages = getCurrentPages()
  if (pages.length === 0) return
  
  const currentPage = pages[pages.length - 1]
  
  // 移除loading overlay
  currentPage.setData({
    isLoading: false,
    loadingText: ''
  })
}

// 显示成功提示
const showSuccess = (title = '操作成功') => {
  wx.showToast({
    title,
    icon: 'success',
    duration: 2000
  })
}

// 显示错误提示
const showError = (title = '操作失败') => {
  wx.showToast({
    title,
    icon: 'none',
    duration: 2000
  })
}

// 显示确认对话框
const showConfirm = (content, title = '提示') => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title,
      content,
      success: res => {
        if (res.confirm) {
          resolve(true)
        } else {
          resolve(false)
        }
      },
      fail: reject
    })
  })
}

// 上传图片到云存储
const uploadImage = (filePath, cloudPath) => {
  return new Promise((resolve, reject) => {
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => resolve(res.fileID),
      fail: reject
    })
  })
}

// 选择并上传图片
const chooseAndUploadImage = async (count = 1, folder = 'images') => {
  try {
    const res = await wx.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    const uploadPromises = res.tempFilePaths.map((filePath, index) => {
      const timestamp = Date.now()
      const random = Math.floor(Math.random() * 10000)
      const ext = (filePath.split('.').pop() || 'jpg').toLowerCase()
      const cloudPath = `${folder}/${timestamp}_${random}_${index}.${ext}`
      return uploadImage(filePath, cloudPath)
    })

    return await Promise.all(uploadPromises)
  } catch (err) {
    console.error('选择上传图片失败:', err)
    throw err
  }
}

// 删除云存储文件
const deleteCloudFile = (fileIDs) => {
  return new Promise((resolve, reject) => {
    wx.cloud.deleteFile({
      fileList: Array.isArray(fileIDs) ? fileIDs : [fileIDs],
      success: resolve,
      fail: reject
    })
  })
}

// 节流函数
const throttle = (fn, delay = 500) => {
  let timer = null
  return function(...args) {
    if (timer) return
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

// 防抖函数
const debounce = (fn, delay = 500) => {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

const CACHE_PREFIX = 'cache:'

const setCache = (key, data, ttlMs = 0) => {
  try {
    const expireAt = ttlMs > 0 ? Date.now() + ttlMs : 0
    wx.setStorageSync(CACHE_PREFIX + key, { data, expireAt })
  } catch (e) {}
}

const getCache = (key) => {
  try {
    const obj = wx.getStorageSync(CACHE_PREFIX + key)
    if (!obj) return null
    if (!obj.expireAt || Date.now() < obj.expireAt) return obj.data
    return null
  } catch (e) {
    return null
  }
}

const callFunction = async (name, data = {}) => {
  try {
    const res = await wx.cloud.callFunction({ name, data })
    if (res && res.result && res.result.success) {
      return { ok: true, data: res.result.data }
    }
    return { ok: false, message: (res && res.result && res.result.message) ? res.result.message : '请求失败' }
  } catch (err) {
    return { ok: false, message: err.message || '网络错误' }
  }
}

const getWithCache = async (key, fetcher, ttlMs) => {
  const cached = getCache(key)
  if (cached != null) return cached
  const data = await fetcher()
  setCache(key, data, ttlMs)
  return data
}

const clearCache = (key) => {
  try {
    wx.removeStorageSync(CACHE_PREFIX + key)
  } catch (e) {}
}

module.exports = {
  formatTime,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showConfirm,
  uploadImage,
  chooseAndUploadImage,
  deleteCloudFile,
  throttle,
  debounce,
  callFunction,
  setCache,
  getCache,
  getWithCache,
  clearCache
}
