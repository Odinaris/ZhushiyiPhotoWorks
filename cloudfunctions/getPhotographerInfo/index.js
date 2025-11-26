// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

async function getTempUrl(fileId) {
  if (!fileId) return ''
  try {
    const result = await cloud.getTempFileURL({
      fileList: [fileId]
    })
    return result.fileList[0].tempFileURL
  } catch (err) {
    console.error('获取临时链接失败:', err)
    return fileId
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const res = await db.collection('photographer')
      .limit(1)
      .get()

    if (res.data && res.data[0]) {
      const photographerInfo = res.data[0]
      // 如果logo是云存储ID，获取临时URL
      if (photographerInfo.logo) {
        photographerInfo.logo = await getTempUrl(photographerInfo.logo)
      }
      
      return {
        success: true,
        data: photographerInfo
      }
    }

    return {
      success: true,
      data: {}
    }
  } catch (err) {
    console.error('获取摄影师信息失败:', err)
    return {
      success: false,
      message: err.message
    }
  }
}