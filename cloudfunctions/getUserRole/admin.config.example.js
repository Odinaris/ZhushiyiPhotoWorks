/**
 * 管理员 openId 白名单配置示例
 * 
 * 使用方法：
 * 1. 复制此文件为 admin.config.js
 * 2. 填入真实的管理员 openId
 * 3. 上传云函数
 */

module.exports = {
  // 管理员 openId 白名单
  ADMIN_OPENIDS: [
    'oXXXX-aaaaaaaaaaaaaaaaaaaa',  // 管理员A的 openId
    'oYYYY-bbbbbbbbbbbbbbbbbbbb',  // 管理员B的 openId
  ]
}
