// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 查询用户信息
    const userRes = await db.collection('users').where({
      _openid: openid
    }).get()

    let user = null
    let role = 'user'

    if (userRes.data.length > 0) {
      user = userRes.data[0]
      role = user.role || 'user'
    } else {
      // 首次登录，创建用户记录
      const createRes = await db.collection('users').add({
        data: {
          _openid: openid,
          role: 'user',
          createTime: new Date(),
          updateTime: new Date()
        }
      })
      
      user = {
        _id: createRes._id,
        _openid: openid,
        role: 'user'
      }
    }

    return {
      success: true,
      data: {
        role: role,
        userInfo: user
      }
    }
  } catch (err) {
    console.error('获取用户角色失败:', err)
    return {
      success: false,
      message: err.message
    }
  }
}
