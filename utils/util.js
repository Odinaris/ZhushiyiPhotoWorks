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

// 显示加载提示
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  })
}

// 隐藏加载提示
const hideLoading = () => {
  wx.hideLoading()
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
      const cloudPath = `${folder}/${timestamp}_${random}_${index}.jpg`
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
  debounce
}
