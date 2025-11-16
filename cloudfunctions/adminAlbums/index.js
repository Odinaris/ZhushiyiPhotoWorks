// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 检查管理员权限
async function checkAdmin(openid) {
  const userRes = await db.collection('users').where({
    _openid: openid
  }).get()
  
  return userRes.data.length > 0 && userRes.data[0].role === 'admin'
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action, data, id } = event

  try {
    // 权限检查
    const isAdmin = await checkAdmin(openid)
    if (!isAdmin) {
      return {
        success: false,
        message: '无权限操作'
      }
    }

    let result = null

    switch (action) {
      case 'list':
        // 查询列表
        result = await db.collection('albums')
          .orderBy('order', 'asc')
          .get()
        return {
          success: true,
          data: result.data || []
        }

      case 'add':
        // 添加
        result = await db.collection('albums').add({
          data: {
            ...data,
            viewCount: 0,
            shareCount: 0,
            createTime: new Date(),
            updateTime: new Date()
          }
        })
        return {
          success: true,
          data: { _id: result._id }
        }

      case 'update':
        // 更新
        const updateData = { ...data }
        delete updateData._id
        delete updateData.viewCount
        delete updateData.shareCount
        updateData.updateTime = new Date()
        
        result = await db.collection('albums')
          .doc(data._id)
          .update({
            data: updateData
          })
        return {
          success: true
        }

      case 'delete':
        // 删除
        result = await db.collection('albums')
          .doc(id)
          .remove()
        return {
          success: true
        }

      default:
        return {
          success: false,
          message: '未知操作'
        }
    }
  } catch (err) {
    console.error('操作失败:', err)
    return {
      success: false,
      message: err.message
    }
  }
}
