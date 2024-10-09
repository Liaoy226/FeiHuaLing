Page({
  data: {
    keyword: '', // 存储搜索关键字
    poems: [], // 存储搜索结果的诗句数组
    // poemCount: 0, // 计数器，记录已获取的诗句数量
    currentPage: 1, // 当前显示的诗句页码
    totalPages: 200, // 总页数，假设为5
    // showNextPageButton: true, // 是否显示下一页按钮
    backgroundImage: 'url("https://636c-cloud1-2gpac81i40983a59-1327119078.tcb.qcloud.la/images/2.jpg?sign=afb862670dce877604a317cbc7af580c&t=1719125722")',
    htmls: [],
    url: []
  },

  onLoad: function (options) {
    if (options.keyword) {
      const keyword = options.keyword;
      this.setData({
        keyword: keyword
      });
      // 从第一页开始获取数据
      this.fetchPoemsPages(keyword);
    }
  },

  fetchPoemsPages: async function (keyword) {
    let util = require('../../utils/util.js');
    var html;
    if (this.data.currentPage == 1) {
      try{
        html = await util.req('ju', keyword)
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
      var htmls = Array.from(html.matchAll(/<option value=\'(.*)\'>第/g), m => m[1]);
      this.setData({
        htmls: htmls,
        totalPages: htmls.length+1
      })
    }
    else {
      try{
        html = await util.req('', '', this.data.htmls[this.data.currentPage-2])
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
    }
    this.parseHTML(html)
    // const that = this;
    // let html = ''; // 存储页面 HTML 内容
    // let flag = true; // 标志变量，表示是否是第一页
    // wx.request({
    //   url: 'https://www.gushici.net/search/s.php',
    //   method: 'GET',
    //   data: {
    //     type: 'ju',
    //     key: keyword
    //   },
    //   success: function (res) {
    //     html = res.data;
    //     // 循环解析每一页
    //     while (that.data.poemCount < 50000) { // 设置循环条件，直到获取条诗句数据为止
    //       let begin = html.indexOf('<option value=');
    //       if (begin < 0) break; // 如果找不到新页面链接，退出循环
    //       if (flag) {
    //         flag = false;
    //       } else {
    //         begin += 15;
    //       }
    //       const end = html.indexOf('\'>第');
    //       const newurl = html.substring(begin, end);
    //       // 发起请求获取下一页数据
    //       wx.request({
    //         url: 'https://www.gushici.net/' + newurl,
    //         method: 'GET',
    //         success: function (res) {
    //           const poems = that.parseHTML(res.data);
    //           // 记录已获取的诗句数量
    //           that.setData({
    //             poemCount: that.data.poemCount + poems.length
    //           });
    //           // 合并新获取的诗句数据到现有数据中
    //           const newPoems = that.data.poems.concat(poems);
    //           that.setData({
    //             poems: newPoems
    //           });
    //           // 更新按钮的显示状态
    //           that.updateButtonVisibility();
    //         },
    //         fail: function (err) {
    //           console.error('请求失败：', err);
    //         }
    //       });
    //       html = html.substring(end + 3);
    //     }
    //   },
    //   fail: function (err) {
    //     console.error('请求失败：', err);
    //   }
    // });
  },

  // updateButtonVisibility: function () {
  //   // 如果当前页码大于等于总页数，隐藏按钮
  //   if (this.data.currentPage >= this.data.totalPages) {
  //     this.setData({
  //       showNextPageButton: false
  //     });
  //   } else {
  //     this.setData({
  //       showNextPageButton: true
  //     });
  //   }
  // },

  loadNextPage: function () {
    // 如果当前页码小于总页数，则加载下一页数据
    // if (this.data.currentPage < this.data.totalPages) {
      this.setData({
        currentPage: this.data.currentPage + 1
      });
      this.fetchPoemsPages(this.data.keyword);
    // }
  },


  loadLastPage: function () {
    // If current page is greater than 1, load the previous page
    // if (this.data.currentPage > 1) {
      const lastPage = this.data.currentPage - 1;
      this.setData({
        currentPage: lastPage
      });
      this.fetchPoemsPages(this.data.keyword);
    // }
  },
  

  parseHTML: function (html) {
    // 解析 HTML 数据，提取诗句内容
    html = html.replace(/<font color=\'red\'>/g, '')  //去除强调关键字的格式
    html = html.replace(/<\/font>/g, '')
    const poems = Array.from(html.matchAll(/<a class="juzi".*>(.*)<\/a>/g), m => m[1]);
    const url = Array.from(html.matchAll(/<a class="jucc" href="(.*)">/g), m => m[1]);
    this.setData({
      poems: poems,
      url: url
    })
    // const reg = /<a class="juzi".*?>(.*?)<\/a>/g;
    // let match;
    // let count = 0; // 计数器，用于计算符合条件的诗句数量
  
    // while ((match = reg.exec(html)) !== null) {
    //   let poemContent = match[1];
    //   // 去除 HTML 标签
    //   poemContent = poemContent.replace(/<[^>]+>/g, '');
    //   // 判断诗句内容是否包含关键词
    //   if (poemContent.includes(this.data.keyword)) {
    //     poems.push({
    //       content: poemContent
    //     });
    //     count++;
    //   }
    // }
    // // 计算要显示的诗句范围
    // const startIndex = (this.data.currentPage - 1) * 20;
    // const endIndex = startIndex + 20;
    // // 更新 visiblePoems，追加新的诗句
    // const newVisiblePoems = this.data.poems.slice(startIndex, endIndex);
    // this.setData({
    //   visiblePoems: newVisiblePoems
    // });
  },

  async collect(e) {
    const poem = e.currentTarget.dataset.poem
    wx.showActionSheet({
      itemList: ['收藏'],
      success: async (res) =>{
        if (!wx.getStorageSync('collection')) {   //如果缓存里没有收藏列表
          wx.setStorageSync('collection', [])      //新建列表
        }
        var collection = wx.getStorageSync('collection')
        var flag = false
        for (var i of collection) {         //找有没有收藏过
          if (i.sentence == this.data.poems[poem]) {
            flag = true
            break
          }
        }
        if (!flag) {
          collection = collection.concat({
            sentence: this.data.poems[poem],
            poetry: this.data.url[poem]
          })
          wx.showToast({
            title: '收藏成功！',
            icon: 'success',
            duration: 1000
          });
          wx.setStorageSync('collection', collection)
        }
        else {
          wx.showToast({
            title: '已经收藏过！',
            icon: 'error',
            duration: 1000
          });
        }
      }
    })
  },

  detail(e) {
    const poem = e.currentTarget.dataset.poem;
    const partialUrl = this.data.url[poem]
    console.log(partialUrl);
    wx.navigateTo({
      url: '/pages/poetDetail/poetDetail?url=' + encodeURIComponent(partialUrl)
    });
  }
});