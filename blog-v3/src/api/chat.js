import http from "@/config/request";

// 获取 AI 聊天接口
export const chat = (data) => {
  return new Promise((resolve, reject) => {
    http
      .post("/api/chat/ai", data)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
