// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { albumId, type } = event // type: view | share

  try {
    const updateData = {}
    if (type === 'view') {
      updateData.viewCount = _.inc(1)
    } else if (type === 'share') {
      updateData.shareCount = _.inc(1)
    }

    await db.collection('albums')
      .doc(albumId)
      .update({
        data: updateData
      })

    return {
      success: true
    }
  } catch (err) {
    console.error('更新统计失败:', err)
    return {
      success: false,
      message: err.message
    }
  }
}
