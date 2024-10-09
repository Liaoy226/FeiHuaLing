const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  formatTime,
  req,
  find_key,
  get_openid,
  database_func
}

function req(type = '', key = '', url = '', times = 0) {
  if (times > 5) {
    return new Promise((resolve, reject) => {
      reject(new Error('请求失败'));
    });
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: url === '' ? 'https://www.gushici.net/search/s.php' : 'https://www.gushici.net/' + url,
      method: 'GET',
      data: url === '' ? { type: type, key: key } : {},
      success: async (res) => {
        if (res.statusCode >= 300) {
          reject(res);
        } else {
          resolve(res.data);
        }
      },
      fail: async (err) => {
        console.log(err);
        setTimeout(async () => {
          try {
            const retryResult = await req(type, key, url, times + 1);
            resolve(retryResult);
          } catch (retryError) {
            reject(retryError);
          }
        }, 2000);
      }
    });
  });
}


function find_key(words, word, flag) {
  var list = words.split(/[。，；！：？]/)   //无论输入什么，只取短句且不取符号
  var element = ''
  for (element of list){
    if (flag && element.indexOf(word) >= 0  //是包含关键词的短句
    || !flag && element==word) {            //是对应的短句
      return element;    //返回短句
    }
  }
  return null;    //返回错误
}

function get_openid() {
  return new Promise((resolve, reject) => {
    wx.login({
      success:(res)=>{
        wx.request({
          url: `https://api.weixin.qq.com/sns/jscode2session?appid=wxd666f90d656f4738&secret=21f4663be55bbfa3f8c7a5f091602da3&js_code=${res.code}&grant_type=authorization_code`,
          success:(res)=>{
            resolve(res.data.openid)
          }
        })
      },
      fail(err) {
        reject(err)
      }
    })
  });
}

function database_func(type, set, where=null, data=null) {
  return new Promise((resolve, reject) => {
    switch (type) {
      case "add": {
        set.add({
          data: data,
          success: function(res) {
            resolve(res._id)
          },
          fail: function(err) {
            reject(err)
          }
        })
        break
      }
      case "get": {
        set.where(where).get({
          success: function(res) {
            resolve(res.data)
          },
          fail: function(err) {
            reject(err)
          }
        })
        break
      }
      case "update": {
        set.where(where).update({
          data: data,
          success: function(res) {
            resolve(res.stats.updated)
          },
          fail: function(err) {
            reject(err)
          }
        })
        break
      }
      case "remove": {
        set.where(where).remove({
          success: function(res) {
            resolve(res.stats.removed)
          },
          fail: function(err) {
            reject(err)
          }
        })
        break
      }
      case "watch": {
        let watcher = set.where(where).watch({
          onChange: function(snapshot) {
            if (snapshot.docs.length > 0) {
              watcher.close()
              resolve(snapshot.docs)
            }
          },
          onError: function(err) {
            watcher.close()
            reject(err)
          }
        })
        break
      }
    }
  })
}
