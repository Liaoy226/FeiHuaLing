// pages/poetryDetail/poetryDetail.js

Page({
  data: {
    partialUrl: '',   // 诗词部分链接
    // poetryUrl: '',    // 完整的诗词链接
    poetryContent: '' // 诗词内容
  },

  onLoad: function(options) {
    // 接收传递的部分链接，这里假设是诗词的部分URL
    const partialUrl = options.url;
    // 输出 partialUrl，可以在控制台查看其值
    // console.log('Partial URL:', partialUrl);
    
    // 更新页面数据
    this.setData({ partialUrl: partialUrl });

    // 补全诗词的完整URL
    // const poetryUrl = 'https://www.gushici.net/' + partialUrl;
    // // 更新页面数据
    // this.setData({ poetryUrl: poetryUrl });

    // 在这里可以根据诗词的完整URL进行数据请求或其他逻辑处理
    this.fetchPoetryContent();
  },

  fetchPoetryContent: async function() {
    var that = this;
    const util = require('../../utils/util.js');
    try {
      const rawHtml = await util.req('', '', that.data.partialUrl);  // 获取原始 HTML 内容
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
        const chineseOnly = rawHtml.replace(/[^\u4e00-\u9fa5\s，。！？；：“”《》]/g, '');  // 过滤非中文字符及空格和常见标点符号
  
        // Split into paragraphs based on two or more consecutive empty lines
        const paragraphs = chineseOnly.split(/\n\s*\n\s*\n+/);
  
        // Initialize variables for storing the seventh paragraph and relevant paragraphs
        let seventhParagraph = '';
        let relevantParagraphs = [];
  
        // Extract seventh paragraph (if it exists)
        if (paragraphs.length > 5) {
          seventhParagraph = paragraphs[5].trim();
        }
  
        // Extract paragraphs starting with specified patterns
        paragraphs.forEach((paragraph, index) => {
          // Match patterns like "译文及注释", "创作背景", "评析", "赏析"
          if (/^(译文及注释|创作背景|评析|赏析)/.test(paragraph.trim())) {
            relevantParagraphs.push(paragraph.trim());
          }
  
          // Match patterns like "**简介", "***简介", "****简介"
          if (/^\*{2,4}简介/.test(paragraph.trim())) {
            relevantParagraphs.push(paragraph.trim());
          }
        });
  
        // Combine seventh paragraph and relevant paragraphs into a single text
        const combinedText = seventhParagraph + '\n\n' + relevantParagraphs.join('\n\n');
  
        // Split combinedText into paragraphs based on a single empty line
        const finalParagraphs = combinedText.split(/\n\s*\n/);
  
        // Filter out paragraphs containing "参考资料"
        const filteredParagraphs = finalParagraphs.filter(paragraph => !paragraph.includes("参考资料"));
  
        // Join filtered paragraphs with double newline for separation
        const outputText = filteredParagraphs.join('\n\n');
  
        // 更新页面数据，显示第七段和符合条件的后续段落内容（不含"参考资料"）
        that.setData({ poetryContent: outputText });
      
  },
  
  
    
  
  
  parsePoetryHtml: function(html) {
    // 假设这里是解析 HTML 的函数，用于提取诗词内容
    // 返回解析后的诗词内容
    return '这里是诗词的内容解析结果';
  }
});
