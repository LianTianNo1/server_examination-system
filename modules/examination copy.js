// 导入模块
const express = require('express')
const router = express.Router()
const fs = require('fs')
const multer = require('multer')
const path = require('path')
const upload = multer({ dest: 'uploads/' })
const xlsx = require('node-xlsx')
const { db } = require('./mysql')

/* POST users listing. */

// 显示页面
router.get('/showPage', (req, res) => {
  const newNamePath = __dirname.replace('modules', 'public/')
  res.sendFile(path.join(newNamePath, 'read_file.html'))
})
// 显示页面
router.get('/h5test', (req, res) => {
  const newNamePath = __dirname.replace('modules', 'public/')
  res.sendFile(path.join(newNamePath, 'xlfj/login.html'))
})
// 注册
router.post('/reg', async (req, res) => {
  console.log('看看请求.body', req.body)
  let params = req.body
  if (params.name && params.password) {
    let getSql = xqsql.get(
      'user',
      {
        type: 'one',
        key: 'name',
        ids: [params.name],
      },
      'default',
      'id,name'
    )
    let getSqlResult = await db(getSql)
    console.log('注册的结构', getSqlResult)
    if (getSqlResult.code == 200 && getSqlResult.data.list.length == 0) {
      let addParams = [
        {
          name: params.name,
          password: params.password,
        },
      ]
      let addFields = [
        {
          name: '用户名',
          value: 'name',
          isMust: true,
        },
        {
          name: '密码',
          value: 'password',
          isMust: true,
        },
      ]
      let addSql = xqsql.add('user', addParams, addFields)
      let addSqlResult = await db(addSql)
      if (addSqlResult.code == 200) {
        return res.json({
          code: 200,
          msg: 'get_succ',
          data: {
            info: '注册成功！',
          },
        })
      } else {
        return res.json(addSqlResult)
      }
    } else {
      return res.json({
        code: 101,
        msg: 'get_succ',
        data: {
          info: '用户已存在！',
        },
      })
    }
  } else {
    return res.json({
      code: 101,
      msg: 'get_succ',
      data: {
        info: '用户名和密码不能为空！',
      },
    })
  }
})

// 登录
router.post('/login', async (req, res) => {
  let params = req.body
  if (params.name && params.password) {
    let getSql = xqsql.get(
      'user',
      {
        type: 'one',
        key: 'name',
        ids: [params.name],
      },
      'default',
      'id,name,password'
    )
    let getSqlResult = await db(getSql)
    if (getSqlResult.code == 200 && getSqlResult.data.list.length) {
      let userInfo = getSqlResult.data.list[0]
      if (
        params.name == getSqlResult.data.list[0].name &&
        params.password == getSqlResult.data.list[0].password
      ) {
        let loginInfo = req.session.user
        if (loginInfo && loginInfo.name == params.name) {
          return res.json({
            code: 101,
            msg: 'get_fail',
            data: {
              info: '用户已登录！',
            },
          })
        } else {
          let user = {
            name: params.name,
          }
          req.session.user = user
          return res.json({
            code: 200,
            msg: 'get_succ',
            data: {
              info: '登录成功！',
            },
          })
        }
      } else {
        return res.json({
          code: 101,
          msg: 'get_fail',
          data: {
            info: '用户名或者密码错误！',
          },
        })
      }
    } else {
      return res.json({
        code: 101,
        msg: 'get_fail',
        data: {
          info: '用户不存在！',
        },
      })
    }
  } else {
    return res.json({
      code: 101,
      msg: 'get_succ',
      data: {
        info: '用户名和密码不能为空！',
      },
    })
  }
})
// 退出登录
router.post('/logout', (req, res) => {
  let user = req.session.user
  if (user && user.name != '') {
    req.session.user = null
    return res.json({
      code: 200,
      msg: 'get_succ',
      data: {
        info: '退出登录成功！',
      },
    })
  } else {
    return res.json({
      code: 101,
      msg: 'get_fail',
      data: {
        info: '用户未登录！',
      },
    })
  }
})

// 读取上传的文件并处理
router.post('/readFile', upload.single('file'), function (req, res, next) {
  let fileName = ''
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
