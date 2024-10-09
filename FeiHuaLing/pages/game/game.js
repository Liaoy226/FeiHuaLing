// pages/game/game.js
let util = require('../../utils/util.js');
let watcher = null;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    self_score: 0,
    other_score: 0,
    best_score: 0,
    poetry: "", //诗句输入
    total_time: 10,   //限时时间上限
    time: 10,         //目前剩余时间，单位s
    countdown: '00:00',    //用来输出倒计时
    flag: true,
    words: ['春', '江', '花', '月', '夜', '南', '窗', '柳', '色', '暖', '西', '楼', '人', '心', '愁', '夏', '日', '雪', '地', '溪', '河', '情', '恨', '泪', '金', '玉', '万', '湖', '水', '岸', '冬', '朝', '海', '云', '关', '北', '庭', '鸟', '声', '寒', '东', '家', '酒', '梦', '残', '秋', '山', '风', '雨', '天'],
    easy_words: ['春', '江', '花', '月', '夜'],
    difficult_words: ['南', '窗', '柳', '色', '暖', '西', '楼', '人', '心', '愁', '夏', '日', '雪', '地', '溪', '河', '情', '恨', '泪', '金', '玉', '万', '湖', '水', '岸', '冬', '朝', '海', '云', '关', '北', '庭', '鸟', '声', '寒', '东', '家', '酒', '梦', '残', '秋', '山', '风', '雨', '天'],
    //关键词随机列表
    word: '',   //当局的关键词
    is_disable: true,   //控制关键词或者输入是否可用
    used: [],
    cant_self: false,
    mode: 0,
    recover: [false, false, false],
    html: null,
    messages: [],
    toView: '',
    openid: null,
    contest: null,
    now: null,
    self_avatar: null,
    other_avatar: null,
    in_game: false,
    self_name: '',
    other_name: '',
    load: true,       //加载中，不显示其他组件，只显示双方头像和名字，VS
    wait: false       //等待答案是否正确的结果
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.cloud.init({      
      env: 'cloud1-2gpac81i40983a59',
    })
    if (!options.bot) {
      this.setData({
        mode: 3,
        self_name: wx.getStorageSync('nickName'),
        other_name: options.other_name,
        other_avatar: options.other_avatar
      })
      this.match(options.contest, options.first)
    }
    else {
      this.setData({
        load: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    if (!wx.getStorageSync('best')) {   //如果缓存里没有当前最佳记录
      wx.setStorageSync('best', 0)      //设为0
    }
    this.setData({
      best_score: wx.getStorageSync('best'),  //读取最佳记录
      self_avatar: wx.getStorageSync('avatarUrl')
    })
    if (!wx.getStorageSync('history')) {   //如果缓存里没有对战记录
      wx.setStorageSync('history', [])      //新建列表
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    if (this.data.in_game) {
      this.game_over("结束")
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    if (this.data.in_game) {
      this.game_over("结束")
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  bandleChange(e) {
    switch (e.detail.value) {
      case "difficult": {
        this.setData({
          total_time: 20,
          time: 20,
          cant_self: true,
          mode: 0,
          recover: [false, true, false]
        })
        break
      }
      case "simple": {
        this.setData({
          total_time: 40,
          time: 40,
          cant_self: true,
          mode: 1,
          recover: [true, false, false]
        })
        break
      }
      case "practice": {
        this.setData({
          total_time: 40,
          time: 40,
          cant_self: false,
          mode: 2,
          recover: [false, false, true]
        })
        break
      }
    }
    this.setData({
      is_disable: false
    })
  },

  input(e) {        //输入诗句修改poetry
    this.setData({
      poetry: e.detail.value
    })
  },

  input_word(e) {   //输入关键词修改word
    this.setData({
      word: e.detail.value
    })
  },

  begin(e) {      //开始游戏
    if (!this.data.word)    //如果没有输入或随机关键词
      this.random_word()    //随机关键词
    this.setData({
      time: this.data.total_time,             //初始化倒计时
      is_disable: true,                       //设置关键词不可输入和修改
      messages: [],
      used: [],
      self_score: 0,
      in_game: true
    })
    this.countdown()        //开始倒计时
  },

  random_word(e) {          //随机获取关键词
    switch (this.data.mode) {
      case 0: {
        const r = Math.floor(Math.random() * this.data.difficult_words.length)
        this.setData({
          word: this.data.difficult_words[r]
        })
        break
      }
      case 1: {
        const r = Math.floor(Math.random() * this.data.easy_words.length)
        this.setData({
          word: this.data.easy_words[r]
        })
        break
      }
      case 3:
      case 2: {
        const r = Math.floor(Math.random() * this.data.words.length)
        this.setData({
          word: this.data.words[r]
        })
        break
      }
    }
  },

  dispose(word) {   //检查是否合法
    word = word.replace(' ', '')
    var element = util.find_key(word, this.data.word, true);  //获取包含关键词的短句
    if (element && this.data.used.indexOf(element) < 0) {     //查看是否被使用过
      this.setData({
        poetry: element
      })
      console.log(element)
      return element
    }
    return null
  },

  async commit(e) {     //确认输入
    this.setData({
      wait: true
    })
    //首先确定是否包含关键词
    if (this.data.poetry.indexOf(this.data.word) >= 0) {
      //然后确定是否回答过
      if (!this.dispose(this.data.poetry)) {
        wx.showToast({
          title: '已经回答过',
          icon: 'error',
          duration: 1000
        });
        console.log('已经回答过');
        let that = this
        setTimeout(()=>{
          that.setData({
            wait: false
          })
          this.countdown()
        }, 1000);
      }
      else {
        try{
          var html = await util.req('ju', this.data.poetry);
        }
        catch(err) {
          wx.showToast({
            title: err.message,
            icon: 'error',
            duration: 2000
          });
          console.error('请求失败:', err);
          this.game_over('结束')
          return
        }
        if (html.includes('没有搜索到')) {
          wx.showToast({
            title: '回答诗词错误',
            icon: 'error',
            duration: 1000
          });
          console.log('没有搜索到');
          let that = this
          setTimeout(()=>{
            that.setData({
              wait: false
            })
            this.countdown()
          }, 1000);
        } 
        else {
          html = html.replace(/<font color=\'red\'>/g, '')  //去除强调关键字的格式
          html = html.replace(/<\/font>/g, '')
          var ju = html.match('<a class="juzi" href="/mingju/.+.html">(.*)</a>')
          var full_ju = ju[1]
          ju = util.find_key(ju[1], this.data.poetry, false)
          if (!ju) {
            wx.showToast({
              title: '请回答完整诗句',
              icon: 'error',
              duration: 1000
            });
            console.log('诗句不完整');
            let that = this
            setTimeout(()=>{
              that.setData({
                wait: false
              })
              this.countdown()
            }, 1000);
          }
          else {
            wx.showToast({
              title: '回答正确！',
              icon: 'success',
              duration: 1000
            });
            var jucc = html.match(/<a class="jucc" href="\/shici\/.+\.html">(.*)<\/a>/)
            if (jucc) {
              // 提取 jucc 标签中的内容
              var juccContent = jucc[1];
              
              var author = '';
              var poemName = '';
              var authorDynasty = '未知';
              var url = html.match('<a class="jucc" href="(.*)"')
              if (url) url = url[1]
              var authorAndTitleMatch = juccContent.match(/([^《]+)《([^》]+)》/);
              if (authorAndTitleMatch) {
                 // 提取句子对应的作者名和诗词名
                author = authorAndTitleMatch[1];
                poemName = authorAndTitleMatch[2];
              }
            }
            this.setData({
              used: this.data.used.concat(ju)
            })
            let db = wx.cloud.database()
            let _ = db.command
            let poems = db.collection('poems')
            let poets = db.collection('poets')
            let res = await util.database_func("update", poems, {
              line: ju, author: author
            }, {
              times: _.inc(1)
            })
            if (res == 0) {
              await util.database_func("add", poems, '', {
                times: 1,
                name: poemName,
                author: author,
                line: ju,
                url: url
              })
            }

            let res1 = await util.database_func("update", poets, {
              name: author
            }, {
              times: _.inc(1)
            })

            if(res1 == 0) {
              await util.database_func("add", poets, '', {
                times: 1,
                name: author,
                dynasty: authorDynasty
              })
            }
            const newMessage = {
              id: `message-${this.data.messages.length}`,
              sender: 'user',
              content: this.data.poetry,
              //avatarUrl: '../../images/user-avatar.png'
              avatarUrl: this.data.self_avatar
            };
            // 将新消息添加到 messages 数组中
            const updatedMessages = this.data.messages.concat(newMessage);
                
            // 更新页面数据
            this.setData({
              time: this.data.total_time,
              messages: updatedMessages,
              self_score: this.data.self_score + 1,
              poetry: "",
              toView: `message-${this.data.messages.length - 1}`  // 设置滚动的目标位置为最后一条消息的 id
            });
            console.log('搜索到相关结果');
            if (this.data.mode < 3)
              setTimeout(this.answer, 1000);  //电脑回答
            else 
              setTimeout(this.send, 1000);  //对方回答
          }
        }
      }
    }
    else {
      wx.showToast({
        title: '不包含关键词',
        icon: 'error',
        duration: 1000
      });
      console.log('不包含关键词');
      let that = this
      setTimeout(()=>{
        that.setData({
          wait: false
        })
        this.countdown()
      }, 1000);
    }
  },

  countdown(){    //倒计时
    if (this.data.wait) return
    var minute=Math.floor(this.data.time  / 60 );
    var second=this.data.time  % 60
    second<10?second='0'+second:'';
    this.setData({
        countdown:minute+':'+second,
        time:this.data.time-1
    })
    if (this.data.time >= 0) {
      setTimeout(this.countdown, 1000);
    }
    else if (this.data.in_game && this.data.is_disable){   //如果在进行中，倒计时结束
      wx.showToast({
        title: '超时！结束',
        icon: 'error',
        duration: 2000
      });
      this.game_over("超时")
    }
  },

  async answer() {
    if (!this.data.html) {    //因为是按搜索结果顺序答的，所以记录最新的页面以减少遍历次数
      try{
        var html = await util.req('ju', this.data.word)
      }
      catch(err) {
        wx.showToast({
          title: err.message,
          icon: 'error',
          duration: 2000
        });
        console.error('请求失败:', err);
        this.game_over()
        return
      }
      this.setData({
        html: html  //查询
      })
    }
    html = this.data.html
    html = html.replace(/<font color=\'red\'>/g, '')  //去除强调关键字的格式
    html = html.replace(/<\/font>/g, '')
    while (true) {
      var ju = html.match('<a class="juzi" href="/mingju/.+.html">(.*)</a>')
      if (!ju) {    //如果没有句子，就取下一页
        html = html.substr(html.lastIndexOf('selected>第'), html.length)
        var next = html.match('<option value=\'(.*)\'>第')
        this.setData({
          html: html
        })
        if (!next) {
          wx.showToast({
            title: '没有诗句了！',
            icon: 'success',
            duration: 2000
          });
          this.game_over()
          break
        }
        next = next[1]
        try{
          html = await util.req('', '', next);    //取下一页
        }
        catch(err) {
          wx.showToast({
            title: err.message,
            icon: 'error',
            duration: 2000
          });
          console.error('请求失败:', err);
          this.game_over('结束')
          return
        }
        html = html.replace(/<font color=\'red\'>/g, '')
        html = html.replace(/<\/font>/g, '')
        ju = html.match('<a class="juzi" href="/mingju/.+.html">(.*)</a>')
      }
      ju = ju[1]
      var e = this.dispose(ju)
      if (e) {
        const newMessage = {
            id: `message-${this.data.messages.length}`,  // 设置新消息的 id
            sender: 'bot',
            content: e,
            avatarUrl: '../../images/bot-avatar.png'
        };
    
        // 将新消息添加到 messages 数组中
        const updatedMessages = this.data.messages.concat(newMessage);
    
        // 更新页面数据
        this.setData({
          poetry: '',
          time: this.data.total_time,
          used: this.data.used.concat(e),
          messages: updatedMessages,
          toView: `message-${this.data.messages.length - 1}`  // 设置滚动的目标位置为最后一条消息的 id
        });
        break;  // 跳出循环
      }
    
      html = html.substring(html.lastIndexOf(ju), html.length)
      this.setData({
        html: html
      })
    }
    this.setData({
      wait: false
    })
    this.countdown()
  },

  end(e) {      //结束游戏
    this.game_over('')
  },
  
  async game_over(status) {
    if (!this.data.contest) {
      const best = this.data.self_score > this.data.best_score ? this.data.self_score : this.data.best_score
      wx.setStorageSync('best', best) //存到缓存里
      var history = wx.getStorageSync('history')
      switch(this.data.mode){
        case 0: {
          var mode = "困难" 
          break
        }
        case 1: {
          var mode = "简单" 
          break
        }
        case 2: {
          var mode = "练习"
          break
        }
      }
      wx.setStorageSync('history', history.concat({   //存储历史记录
        time: util.formatTime(new Date()),  //当前时间
        mode: mode,                         //游戏模式
        keyword: this.data.word,            //关键词
        score: this.data.self_score + "分",        //得分
        answers: this.data.messages,        //回答过的诗词
        open: false
      }))
      this.setData({    //存到显示里
        best_score: best,
        is_disable: false,
        time: 0,
        in_game: false
      })
    }
    else {
      var history = wx.getStorageSync('history')
      wx.setStorageSync('history', history.concat({   //存储历史记录
        time: util.formatTime(new Date()),  //当前时间
        mode: "对战",                       //游戏模式
        keyword: this.data.word,            //关键词
        score: this.data.other_score + "分 : " + this.data.self_score + "分",  //得分
        answers: this.data.messages,        //回答过的诗词
        open: false
      }))
      watcher.close()
      let db = wx.cloud.database()
      if (status == "delete") {
        let contests = db.collection('contest')
        let messages = db.collection('message')
        await util.database_func("remove", contests, {
          _id: this.data.contest
        })
        await util.database_func("remove", messages, {
          contest: this.data.contest
        })
      }
      else {
        let messages = db.collection('message')
        await util.database_func("add", messages, '', {
          contest: this.data.contest,
          time: util.formatTime(new Date()),
          status: status
        })
      }
      this.setData({
        is_disable: false,
        time: 0,
        in_game: false,
        contest: null
      })
    }
  },

  async match(contest, first) {
    this.setData({
      openid: await util.get_openid()
    })
    this.setData({
      contest: contest,
      mode: 3,
      total_time: 40,
      messages: [],
      used: [],
      self_score: 0,
      other_score: 0,
      in_game: true
    })
    let db = wx.cloud.database()
    let contests = db.collection('contest')
    if (first) {
      this.random_word()
      await util.database_func("update", contests, {
        _id: this.data.contest
      }, {
        word: this.data.word,
        score: [0, 0]
      })
      let that = this
      setTimeout(()=>{
        that.setData({
          load: false,
          time: 40,              //初始化倒计时
          now: util.formatTime(new Date())
        })
        that.checkfinish()
        that.countdown()        //开始倒计时
      }, 2000)
    }
    else {
      const _ = db.command;
      let res = await util.database_func("get", contests, {
        _id: this.data.contest,
        word: _.exists(true)
      })
      if (res.length == 0) {
        res = await util.database_func("watch", contests, {
          _id: this.data.contest,
          word: _.exists(true)
        })
      }
      let that = this
      setTimeout(()=>{
        that.setData({
          word: res[0].word,
          load: false,
          now: util.formatTime(new Date()),
          is_disable: false
        })
        that.checkfinish()
        that.wait()
      }, 2000)
    }
  },

  checkfinish() {
    let that = this
    let db = wx.cloud.database()
    let _ = db.command
    let messages = db.collection('message')
    watcher = messages.where({
      contest: that.data.contest,
      status: _.exists(true),
      time: _.gt(that.data.now)
    })
    .watch({
      onChange: function(snapshot) {
        if (snapshot.docs.length > 0) {
          watcher.close()
          const message = snapshot.docs[0]
          if (message.status == "结束") {
            wx.showToast({
              title: '游戏被结束',
              icon: 'error',
              duration: 2000
            });
            console.log('游戏被结束');
            that.game_over("delete")
          }
          else if (message.status == "超时") {
            wx.showToast({
              title: '对方超时',
              icon: 'success',
              duration: 2000
            });
            console.log('对方超时');
            that.game_over("delete")
          }
        }
      },
      onError: function(err) {
        watcher.close()
        console.log(err)
      }
    })
  },
  
  async send() {
    let db = wx.cloud.database()
    let _ = db.command
    let messages = db.collection('message')
    let contests = db.collection('contest')
    this.setData({
      now: util.formatTime(new Date()),
      time: 0,
      is_disable: false
    })
    await util.database_func("add", messages, '', {
      content: this.data.used[this.data.used.length-1],
      contest: this.data.contest,
      sender: this.data.openid,
      time: this.data.now
    })
    await util.database_func("update", contests, {
      _id: this.data.contest,
      user: this.data.openid
    }, {
      'score.$': _.inc(1)
    })
    this.wait()
  },

  async wait() {
    let db = wx.cloud.database()
    let _ = db.command
    let messages = db.collection('message')
    let res = await util.database_func("watch", messages, {
      contest: this.data.contest,
      time: _.gt(this.data.now)
    })
    const message = res[0]
    if (!message.hasOwnProperty('status')) {
      const newMessage = {
        id: `message-${this.data.messages.length}`,
        sender: 'bot',
        content: message.content,
        avatarUrl: this.data.other_avatar
      };
      // 将新消息添加到 messages 数组中
      const updatedMessages = this.data.messages.concat(newMessage);
                      
      // 更新页面数据
      this.setData({
        is_disable: true,
        used: this.data.used.concat(message.content),
        messages: updatedMessages,
        other_score: this.data.other_score + 1,
        time: this.data.total_time,
        poetry: "",
        toView: `message-${this.data.messages.length - 1}`  // 设置滚动的目标位置为最后一条消息的 id
      });
      this.setData({
        wait: false
      })
      this.countdown()        //开始倒计时
    }
  }
})