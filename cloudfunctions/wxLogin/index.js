// 云函数：微信登录（基于 openId 白名单）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 引入管理员配置
let adminConfig
try {
  adminConfig = require('./admin.config.js')  // 从当前目录读取
} catch (e) {
  console.warn('未找到 admin.config.js，使用空白名单。请在云函数目录下创建 admin.config.js')
  adminConfig = { ADMIN_OPENIDS: [] }
}

const ADMIN_OPENIDS = adminConfig.ADMIN_OPENIDS || []

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { userInfo } = event // 从小程序端传来的用户信息

  try {
    // 判断是否为管理员
    const isAdmin = ADMIN_OPENIDS.includes(openid)

    // 查询用户信息
    const userRes = await db.collection('users').where({
      _openid: openid
    }).get()

    let user = null
    let isNewUser = false

    if (userRes.data.length > 0) {
      // 已存在用户，更新信息
      user = userRes.data[0]
      
      const updateData = {
        updateTime: new Date(),
        role: isAdmin ? 'admin' : 'user'
      }
      
      // 更新用户信息
      if (userInfo?.nickName) updateData.nickName = userInfo.nickName
      if (userInfo?.avatarUrl) updateData.avatarUrl = userInfo.avatarUrl
      
      await db.collection('users').doc(user._id).update({
        data: updateData
      })
      
      // 更新本地用户对象
      user = { ...user, ...updateData }
    } else {
      // 新用户，创建记录
      isNewUser = true
      const createRes = await db.collection('users').add({
        data: {
          _openid: openid,
          nickName: userInfo?.nickName || '',
          avatarUrl: userInfo?.avatarUrl || '',
          role: isAdmin ? 'admin' : 'user',
          createTime: new Date(),
          updateTime: new Date()
        }
      })
      
      user = {
        _id: createRes._id,
        _openid: openid,
        nickName: userInfo?.nickName || '',
        avatarUrl: userInfo?.avatarUrl || '',
        role: isAdmin ? 'admin' : 'user'
      }
    }

    return {
      success: true,
      data: {
        openid: openid,
        user: user,
        isAdmin: isAdmin,
        isNewUser: isNewUser
      }
    }
  } catch (err) {
    console.error('微信登录失败:', err)
    return {
      success: false,
      message: err.message
    }
  }
}
