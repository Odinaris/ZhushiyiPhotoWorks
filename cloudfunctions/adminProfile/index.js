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
  const { action, data } = event

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
      case 'get':
        // 获取
        result = await db.collection('photographer')
          .limit(1)
          .get()
        return {
          success: true,
          data: result.data[0] || null
        }

      case 'update':
        // 更新或创建
        result = await db.collection('photographer')
          .limit(1)
          .get()
        
        const updateData = {
          ...data,
          updateTime: new Date()
        }
        
        if (result.data.length > 0) {
          // 更新
          await db.collection('photographer')
            .doc(result.data[0]._id)
            .update({
              data: updateData
            })
        } else {
          // 创建
          updateData.createTime = new Date()
          await db.collection('photographer').add({
            data: updateData
          })
        }
        
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
