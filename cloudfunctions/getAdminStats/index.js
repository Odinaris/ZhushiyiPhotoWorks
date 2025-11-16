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

  try {
    // 权限检查
    const isAdmin = await checkAdmin(openid)
    if (!isAdmin) {
      return {
        success: false,
        message: '无权限访问'
      }
    }

    // 获取统计数据
    const albumCount = await db.collection('albums').count()
    const categoryCount = await db.collection('categories').count()
    const bannerCount = await db.collection('banners').count()
    
    // 获取总浏览数
    const albumsRes = await db.collection('albums').field({
      viewCount: true
    }).get()
    
    const totalViews = albumsRes.data.reduce((sum, album) => sum + (album.viewCount || 0), 0)

    return {
      success: true,
      data: {
        albumCount: albumCount.total,
        categoryCount: categoryCount.total,
        bannerCount: bannerCount.total,
        totalViews: totalViews
      }
    }
  } catch (err) {
    console.error('获取统计数据失败:', err)
    return {
      success: false,
      message: err.message
    }
  }
}
