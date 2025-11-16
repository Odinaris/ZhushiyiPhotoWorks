// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const res = await db.collection('categories')
      .where({ isActive: true })
      .orderBy('order', 'asc')
      .get()

    return {
      success: true,
      data: res.data || []
    }
  } catch (err) {
    console.error('获取分类失败:', err)
    return {
      success: false,
      message: err.message
    }
  }
}
