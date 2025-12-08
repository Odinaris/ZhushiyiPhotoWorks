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
      .limit(10)
      .get()
    
    console.log('精选作品集查询结果:', {
      totalCount: albumRes.data.length,
      albums: albumRes.data.map(item => ({
        id: item._id,
        title: item.title,
        isActive: item.isActive,
        isFeatured: item.isFeatured
      }))
    })

    // 临时测试：如果没有精选作品，添加一些测试数据
    const featuredAlbumsData = albumRes.data || []
    if (featuredAlbumsData.length === 0) {
      console.log('没有精选作品，添加测试数据')
      // 这里可以暂时返回一些测试数据来验证前端显示逻辑
      featuredAlbumsData.push({
        _id: 'test-album-1',
        title: '测试精选作品1',
        categoryName: '人像摄影',
        coverImage: 'https://636c-cloud1-3g610zw50df8fd55-1259564738.tcb.qcloud.la/life/%7Fic_your_life.jpg?sign=353a3d40845bc882d3cd54d914092c62&t=1765208603',
        images: [
          { url: 'https://636c-cloud1-3g610zw50df8fd55-1259564738.tcb.qcloud.la/life/%7Fic_your_life.jpg?sign=353a3d40845bc882d3cd54d914092c62&t=1765208603', order: 0 }
        ]
      })
    }

    return {
      success: true,
      data: {
        banners: bannerRes.data || [],
        photographer: photographerRes.data[0] || {},
        featuredAlbums: featuredAlbumsData
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
