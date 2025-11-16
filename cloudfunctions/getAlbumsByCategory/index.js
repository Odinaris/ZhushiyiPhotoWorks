// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { categoryId, page = 1, pageSize = 10 } = event

  try {
    const where = { isActive: true }
    if (categoryId) {
      where.categoryId = categoryId
    }

    const res = await db.collection('albums')
      .where(where)
      .orderBy('order', 'asc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    return {
      success: true,
      data: res.data || []
    }
  } catch (err) {
    console.error('获取作品集失败:', err)
    return {
      success: false,
      message: err.message
    }
  }
}
