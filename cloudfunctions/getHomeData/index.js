// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 获取轮播图
    const bannerRes = await db.collection('banners')
      .where({ isActive: true })
      .orderBy('order', 'asc')
      .limit(10)
      .get()

    // 获取摄影师信息
    const photographerRes = await db.collection('photographer')
      .limit(1)
      .get()

    // 获取精选作品集
    const albumRes = await db.collection('albums')
      .where({
        isActive: true,
        isFeatured: true
      })
      .orderBy('order', 'asc')
      .limit(6)
      .get()

    return {
      success: true,
      data: {
        banners: bannerRes.data || [],
        photographer: photographerRes.data[0] || {},
        featuredAlbums: albumRes.data || []
      }
    }
  } catch (err) {
    console.error('获取首页数据失败:', err)
    return {
      success: false,
      message: err.message
    }
  }
}
