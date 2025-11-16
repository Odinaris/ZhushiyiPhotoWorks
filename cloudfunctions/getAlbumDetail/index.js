// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { albumId } = event

  try {
    const res = await db.collection('albums')
      .doc(albumId)
      .get()

    return {
      success: true,
      data: res.data || null
    }
  } catch (err) {
    console.error('获取作品集详情失败:', err)
    return {
      success: false,
      message: err.message
    }
  }
}
