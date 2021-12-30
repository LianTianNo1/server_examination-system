// 导入模块
const express = require('express')
const router = express.Router()
const mysql = require('mysql')

const path = require('path')

const mysqlconfig = {
  host: '120.25.249.159',
  user: 'mycount',
  password: '8426826TL',
  database: 'mycount',
  port: 3306,
}
const connection = mysql.createConnection(mysqlconfig)
connection.connect(function (err) {
  if (err) {
    console.error(`error connecting: ${err.stack}`)
    return
  }
  console.log(`Mysql is connected! 连接id: ${connection.threadId}`)
})

// 读取用户的练习信息
router.post('/getTestInfo', function (req, res, next) {
  console.log(req.body)
  let nowUser = req.body.nowUser
  if (nowUser === '' || !nowUser) {
    res.json({ code: -1, msg: '请填写nowUser参数', data: null })
    return
  }
  const querySql = 'SELECT * FROM exercise where username = ?'
  const sqlParams = [`${nowUser}`]
  //执行
  connection.query(querySql, sqlParams, function (err, result) {
    if (err) {
      console.log('[QUERY ERROR] - ', err.message)
      res.json({ code: -1, msg: '获取练习数据失败' + err.message, data: null })
      return
    }
    // console.log('结果：', res)
    res.json({ code: -1, msg: '获取练习数据成功', data: result })
    return
  })
})

module.exports = router
