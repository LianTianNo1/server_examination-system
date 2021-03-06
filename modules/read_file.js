const express = require('express')
const router = express.Router()
const fs = require('fs')
// 导入模块
const xlsx = require('node-xlsx')
/* POST users listing. */
router.post('/', function (req, res, next) {
  let fileName = ''
  // console.log(
  //   req.file.mimetype,
  //   'application/vnd.openxmlformats-officedocument.spreadsheetml.shee'
  // )
  if (!req.file) {
    res.json({ code: -1, msg: '文件为空 ', data: null, error: '文件为空' })
  }
  if (
    req.file.mimetype !==
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    res.json({
      code: -1,
      msg: '你选择的不是excel文件 ',
      data: null,
      error: '你选择的不是excel文件',
    })
    return
  }
  if (req.file.size > 100000) {
    res.json({
      code: -1,
      msg: '文件过大，抱歉你选择10M以内的文件大小的Excel ',
      data: null,
      error: '文件过大，抱歉你选择10M以内的文件大小的Excel ',
    })
    return
  }
  if (req.file !== undefined) {
    // 新的名字：时间+原文件名
    fileName = new Date().getTime() + '_' + req.file.originalname
    const newNamePath = __dirname.replace('modules', 'uploads/') + fileName
    //重命名，加后缀，不然文件可能会显示乱码，打不开
    fs.renameSync(req.file.path, newNamePath)
    // console.log(newNamePath)
  }
  // 刚才上传的文件
  const db_path = `uploads/${fileName}`
  // const db_path = req.file

  try {
    obj = xlsx.parse(db_path)
    const read_data = obj[0]['data']
    const head_item = read_data[0]
    const title_index = head_item.findIndex((item) => item === '题目')
    const result_index = head_item.findIndex((item) => item === '答案')
    const A_index = head_item.findIndex((item) => item === 'A')
    const B_index = head_item.findIndex((item) => item === 'B')
    const C_index = head_item.findIndex((item) => item === 'C')
    const D_index = head_item.findIndex((item) => item === 'D')
    if (
      title_index === -1 ||
      result_index === -1 ||
      A_index === -1 ||
      B_index === -1 ||
      C_index === -1 ||
      D_index === -1
    ) {
      res.json({
        code: -1,
        msg: '文件读取的格式没有按照要求来 ',
        data: null,
        error: '文件读取的格式没有按照要求来',
      })
      return
    }
    res.json({
      code: 1,
      msg: '文件读取成功 ',
      data: {
        title_index,
        result_index,
        A_index,
        B_index,
        C_index,
        D_index,
        data: read_data,
      },
      error: null,
    })
    return
  } catch (error) {
    res.json({ code: -1, msg: '文件读取失败 ', data: null, error: error })
    return
  }
})

module.exports = router
