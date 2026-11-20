<template>
  <div>
    <div @click="toggleChat" class="chat-icon">
      <i v-if="isChatOpen" class="iconfont icon-AIChat-select"></i>
      <i v-else class="iconfont icon-AIChat"></i>
    </div>

    <!-- 聊天框 -->
    <div v-if="isChatOpen" class="chatbox">
      <div class="chatbox-header">
        <span class="iconText">AI 聊天小助手</span>
        <i @click="toggleChat" class="iconfont icon-close iconStyle"></i>
      </div>
      <div class="chatbox-body">
        <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.type]">
          <span>{{ msg.text }}</span>
        </div>
      </div>
      <div class="chatbox-footer">
        <el-input
          v-model="userMessage"
          placeholder="输入你的消息..."
          @keyup.enter="sendMessage"
          clearable
          class="input-message"
        ></el-input>
        <el-button @click="sendMessage" type="primary" class="send-button">
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElInput, ElButton } from 'element-plus';
import { chat } from "@/api/chat";

// 创建响应式变量
const isChatOpen = ref(false); // 控制聊天框的显示与隐藏
const userMessage = ref(''); // 用户输入的消息
const messages = ref<{ text: string, type: string }[]>([]); // 消息列表，添加 type 字段区分消息类型

// 切换聊天框显示与隐藏
const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
};

// 发送消息
const sendMessage = async () => {
  if (userMessage.value.trim()) {
    messages.value.push({ text: `你: ${userMessage.value}`, type: 'user' }); // 用户消息
    await getAIResponse(userMessage.value); // 获取 AI 回复
    userMessage.value = ''; // 清空输入框
  }
};

// 获取 AI 回复
const getAIResponse = async (message: string) => {
  try {
    // 调用 chat 方法，传递用户输入的消息
    const response = await chat({ message });

    const aiReply = response.result.reply;
    messages.value.push({ text: `AI: ${aiReply}`, type: 'ai' });
  } catch (error) {
    console.error('Error fetching AI response:', error);
    messages.value.push({ text: 'AI: 无法获取回复，请稍后再试。', type: 'ai' });
  }
};


</script>

<style scoped>
.iconfont {
  font-size: 2.5rem;
}

.chat-icon {
  position: fixed;
  left: 1.04vw;
  bottom: 1.85vh;
  width: 2.08vw;
  height: 3.7vh;
  z-index: 1500;
  cursor: pointer;
}

.chatbox {
  position: fixed;
  left: 1.04vw;
  bottom: 6vh;
  width: 31.25vw;
  height: 55.56vh;
  z-index: 1500;
  border: none;
  background-color: #fff;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 20px rgba(0, 0, 0, 0.1);
}

.chatbox-header {
  background-color: #000;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.iconText {
  background: linear-gradient(180deg, #FFFFFF 5%, #ff0000 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  font-size: 0.9vw;
  font-weight: 600;
}

.iconStyle {
  color: #fff;
  background-color: #000;
}

.chatbox-body {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.chatbox-footer {
  display: flex;
  padding: 10px;
}

.chatbox-footer input {
  flex: 1;
  padding: 5px;
}

.chatbox-footer button {
  padding: 5px 10px;
  margin-left: 10px;
}

/* 消息样式 */
.message {
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 10px;
  max-width: 80%;
}

.message.user {
  background-color: #4caf50;
  align-self: flex-end;
  color: white;
}

.message.ai {
  background-color: #e0e0e0;
  align-self: flex-start;
  color: black;
}
</style>
