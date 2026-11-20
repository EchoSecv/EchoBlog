/**
 * 聊天路由
 * @author: M
 */
const Router = require("koa-router");
const router = new Router();

const AiChatController = require("../controller/chat/server");

// AI 聊天接口
router.post("/chat/ai", AiChatController.getAIResponse);

module.exports = router;
