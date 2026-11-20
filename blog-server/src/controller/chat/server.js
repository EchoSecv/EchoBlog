const axios = require('axios');
const { result, ERRORCODE, throwError } = require("../../result/index");
const errorCode = ERRORCODE.CHAT;

/**
 * 聊天控制器
 */
class AiChatController {
  /**
   * 获取 AI 回复
   */
  async getAIResponse(ctx) {
    try {
      const userMessage = ctx.request.body.message; // 从请求中获取用户消息

      if (!userMessage) {
        return ctx.app.emit("error", throwError(errorCode, "消息内容不能为空"), ctx);
      }

      // 构建请求的消息体
      const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userMessage }
      ];
      
      // 调用阿里云通义千问的 AI 对话接口
      const response = await axios.post(
        'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', // 通义千问 API URL
        {
          model: "qwen-plus", // 模型名称
          messages: messages, // 消息体
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`, // API Key
            'Content-Type': 'application/json',
          },
        }
      );

      const aiReply = response.data.choices[0].message.content; // 假设返回的数据结构包含 choices 和 message

      // 返回 AI 回复
      ctx.body = result("获取 AI 回复成功", { reply: aiReply });
    } catch (err) {
      console.error('Error during API call:', err);
      return ctx.app.emit("error", throwError(errorCode, "调用 AI 接口失败"), ctx);
    }
  }
}

module.exports = new AiChatController();
