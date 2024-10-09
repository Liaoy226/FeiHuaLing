Page({
  data: {
    currentTab: 'poem',
    poemRank: [],
    poetRank: []
  },

  onLoad: function() {
    wx.cloud.init({      
      env: 'cloud1-2gpac81i40983a59',
    })
  },

  onShow: function() {
    this.getPoemRank();
    this.getPoetRank();

    // setInterval(() => {
    //   this.getPoemRank();
    //   this.getPoetRank();
    // }, 10 * 60 * 1000); // 十分钟更新一次
  },

  showPoemRank: function() {
    this.setData({
      currentTab: 'poem'
    });
  },

  showPoetRank: function() {
    this.setData({
      currentTab: 'poet'
    });
  },

  getPoemRank: async function() {
    try {
      const db = wx.cloud.database();
      const $ = db.command.aggregate
      let poems = db.collection('poems')
      var res = await poems.aggregate().sort({
        times: -1
      }).group({
        _id: '$name',
        totalTimes: $.sum('$times'),
        mostUsedLine: $.first('$line'),
        name: $.first('$name'),
        url: $.first('$url'),
        author: $.first('$author')
      }).sort({
        totalTimes: -1
      }).limit(10).end()
      res = res.list
      // // 获取所有诗词数据
      // const res = await db.collection('poems').get();
  
      // // 用于存储合并后的诗词数据
      // const poemMap = {};
  
      // // 遍历返回的诗词数据
      // res.data.forEach(poem => {
      //   const key = poem.title + poem.author;
      //   if (!poemMap[key]) {
      //     poemMap[key] = {
      //       name: poem.name,
      //       author: poem.author,
      //       totalTimes: 0,
      //       lines: [],
      //       url: poem.url
      //     };
      //   }
      //   poemMap[key].totalTimes += poem.times;
      //   poemMap[key].lines.push({ text: poem.line, times: poem.times });
      // });
  
      // // 将合并后的诗词数据转换为数组
      // const poemArray = Object.values(poemMap);
  
      // // 找出每首诗中使用次数最多的句子
      // poemArray.forEach(poem => {
      //   const mostUsedLine = poem.lines.reduce((max, line) => 
      //     line.times > max.times ? line : max, 
      //     { text: '', times: 0 }
      //   );
      //   poem.mostUsedLine = mostUsedLine.text;
      //   poem.mostUsedTimes = mostUsedLine.times;
      // });
  
      // // 按总使用次数排序，并选取前10名
      // const topPoems = poemArray.sort((a, b) => b.totalTimes - a.totalTimes).slice(0, 10);
  
      // 将结果设置到 data 中
      this.setData({
        poemRank: res
      });
  
      // 输出到控制台（可选）
      console.log("Poem Rank:", this.data.poemRank);
    } catch (e) {
      console.error("Failed to fetch poem rank:", e);
    };
  },
  
  
  getPoetRank: async function() {
    const db = wx.cloud.database();
    let poets = db.collection('poets')
    let util = require('../../utils/util.js');
    try {
      // 获取 popularity 排名前十的诗人
      var res = await poets
        .orderBy('times', 'desc')
        .limit(10)
        .get();

      // console.log("Poets Rank:", res);  // 将获取的内容输出到控制台
      res = res.data
      for (var poet of res) {
        if (!('url' in poet) && poet.name != '佚名') {
          try {
            var html = await util.req('zuozhe', poet.name)
          }
          catch(err) {
            wx.showToast({
              title: err.message,
              icon: 'error',
              duration: 2000
            });
            console.error('请求失败:', err);
            return
          }
          console.log(html)
          let dynasty = html.match('<p class="source"><a href="/chaxun/all/.*">(.*)</a><span>')[1]
          let url = html.match('<p><a style=.* href="(.*)" target="_blank"><b>.*</b></a></p>')
          if (url) url = url[1]
          var avatar = html.match('<img src="(.*)" width=.*简介"/>')
          poet.dynasty = dynasty
          poet.url = url
          if (avatar) {
            avatar = avatar[1]
            console.log(avatar)
            avatar = await this.downloadFile(avatar, poet.name)
          }
          console.log(avatar)
          await util.database_func('update', poets, {
            name: poet.name
          }, {
            dynasty: dynasty,
            url: url,
            avatar: avatar
          })
        }
        else if (!poet.avatar) {
          poet.avatar = 'cloud://cloud1-2gpac81i40983a59.636c-cloud1-2gpac81i40983a59-1327119078/images/0.png'
        }
      }
      this.setData({
        poetRank: res
      });
    } catch (e) {
      console.error("Failed to fetch poem rank:", e);
    };
  },

  uploadToCloud(filePath, name) {
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath: 'poets/'+ name + '.jpg', // 云存储文件路径
        filePath: filePath, // 临时文件路径
        success: function(res) {
          console.log('上传成功，文件ID:', res.fileID);
          resolve(res.fileID)
          // 上传成功后的处理
          // 可以将 res.fileID 存储到数据库中，或者在界面中显示等
        },
        fail: function(err) {
          reject(err)
        }
      })
    })
  },  

  downloadFile(avatar, name) {
    let that = this
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: 'https://www.gushici.net' + avatar, // 网络图片的 URL
        success: async function(res) {
          if (res.statusCode === 200) {
            const filePath = res.tempFilePath;
            console.log('下载成功，文件路径:', filePath);
            
            // 下载成功后，调用上传函数
            avatar = await that.uploadToCloud(filePath, name)
            resolve(avatar)
          } else {
            reject(res)
          }
        },
        fail: function(err) {
          reject(err)
        }
      });
    })
  },

  navigateToPoetryDetail: function(event) {
    const partialUrl = event.currentTarget.dataset.url;
    console.log(partialUrl);
    if (partialUrl) {
      wx.navigateTo({
        url: '/pages/poetryDetail/poetryDetail?url=' + encodeURIComponent(partialUrl)
      });
    }
    else {
      wx.showToast({
        title: '没有详情页',
        icon: 'error',
        duration: 2000
      });
    }
  },

  navigateToPoetDetail: function(event) {
    const partialUrl = event.currentTarget.dataset.url;
    console.log(partialUrl);
    if (partialUrl) {
      wx.navigateTo({
        url: '/pages/poetDetail/poetDetail?url=' + encodeURIComponent(partialUrl)
      });
    }
    else {
      wx.showToast({
        title: '没有详情页',
        icon: 'error',
        duration: 2000
      });
    }
  },

  onPullDownRefresh: function() {
    // 下拉刷新时重新获取数据
    this.getPoemRank();
    this.getPoetRank();
  },
});
