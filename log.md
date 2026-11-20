# 变更日志 log.md

本文件记录 EchoBlog 项目的所有重要变更。每次修改都会追加一条记录。

---

## 2026-11-20 清理前后端废弃模块（聊天室 / 推荐模型 / 重复点赞接口 / 死代码）

### 背景

前台（blog-v3）历史上存在的「实时聊天室」功能已整体下线，前端不再有任何 WebSocket 连接与在线列表入口；同时多个模块存在重复实现或残留死代码。本次按「前台已删的功能 → 后端对应模块 → 管理端对应模块」的链路做一次彻底清理。

### 一、blog-server（后端）

#### 删除的文件

| 文件 | 原因 |
| --- | --- |
| `src/controller/chat/index.js` | 全文被注释，聊天室增删查控制器已废弃 |
| `src/service/chat/index.js` | 全文被注释，聊天室服务层已废弃 |
| `src/model/chat/chat.js` | `blog_chat` 表模型，仅被已删除的聊天室使用 |
| `src/model/recommend/recommend.js` | `blog_recommend` 表模型，全项目无任何引用 |
| `src/utils/websocket.js` | 聊天室 WebSocket 服务（端口 8889），前台已无对应连接 |
| `src/views/index.ejs`、`src/views/error.ejs` | EJS 模板文件，全项目无 `ctx.render` 调用 |

#### 修改的文件

- `src/main.js`
  - 移除 `koa-views` 引入与 `app.use(views(...))` 模板引擎初始化
  - 移除 `initWebsocket()` 调用及 `require("./utils/websocket")`
- `src/router/chat.js`
  - 清理全部注释掉的聊天室路由，仅保留 AI 聊天 `/chat/ai`
- `src/controller/comment/index.js`、`src/router/comment.js`
  - 移除已被统一 `/like` 接口取代的 `commentLike` / `cancelCommentLike` 及对应 `thumbUp`、`cancelCommentLike` 路由
- `src/controller/article/index.js`、`src/router/article.js`
  - 移除已被统一 `/like` 接口取代的 `articleLike` / `cancelArticleLike` 及对应 `/article/like/:id`、`/article/cancelLike/:id` 路由
  - 移除一次性数据迁移接口 `/article/updateUrl`（硬编码 `img.mrzym.top → mrzym.top` 的旧域名迁移脚本）
- `src/controller/talk/index.js`、`src/router/talk.js`
  - 移除已被统一 `/like` 接口取代的 `talkLike` / `cancelTalkLike` 及对应路由
- `src/controller/message/index.js`、`src/router/message.js`
  - 移除已被统一 `/like` 接口取代的 `messageLike` / `cancelMessageLike` 及对应路由
- `src/service/article/index.js`
  - 移除 `updateUrl()` 迁移方法及顶部 8 行注释死代码
- `src/result/index.js`
  - 移除未使用的 `RECOMMEND` 错误码
- `package.json`
  - 移除依赖 `ejs`、`koa-views`、`ws`

#### 保留说明

- `service/*` 中的 `articleLike`、`talkLike`、`messageLike`、`commentLike` 系列方法**保留**，因为统一点赞控制器 `controller/like/index.js` 仍在按 `type` 分发调用它们
- `notify`（消息通知）模块保留，仍被留言/评论/友链控制器调用，前台 `MessageBox` 组件仍在读通知列表
- `swagger.js`、`limit-request`、`mint-filter`（敏感词过滤）、`request` 保留，均仍在使用

### 二、blog-v3（博客前台）

#### 删除的文件

| 文件 | 原因 |
| --- | --- |
| `src/components/WelcomeComps/first.vue` | 无任何引用的旧版欢迎页组件 |
| `src/components/WelcomeComps/second.vue` | 无任何引用的旧版欢迎页组件 |
| `src/assets/img/apple-logo-white.svg` | 仅被已删的 `second.vue` 引用 |
| `src/assets/img/macbookpro.png` | 仅被已删的 `second.vue` 引用 |
| `src/icons/svg/comment.svg` | SVG 图标无任何 `name` 引用 |
| `src/icons/svg/delete.svg` | 同上 |
| `src/icons/svg/disc.svg` / `darkDisc.svg` / `lightDisc.svg` | 同上 |
| `src/icons/svg/rocket.svg` / `darkRocket.svg` / `lightRocket.svg` | 同上 |
| `src/icons/svg/greyHeart.svg` / `redHeart.svg` | 同上 |
| `src/icons/svg/search.svg` | 同上 |
| `src/icons/svg/user.svg` | 同上 |

#### 修改的文件

- `src/api/home.js`
  - 移除从未被调用的第三方接口封装 `getKey`、`getSentence`（luckycola 一言服务），仅保留 `homeGetStatistic`

#### 保留说明

- `image404`、`publish`、`smileFace`、`404` 四个 SVG 图标仍在使用，**未删除**
- `ChatAssistant`（AI 聊天小助手）是当前有效功能，保留
- `notify` 相关 api 与 `MessageBox` 组件保留

### 三、blog-v3-admin（博客后台）

#### 删除的文件

| 文件 | 原因 |
| --- | --- |
| `src/utils/sso.ts` | 自执行单点登录脚本，入口已被注释，属于模板遗留死代码 |
| `src/assets/img/bathymetry_bw_composite_4k.jpg` | 无任何引用 |
| `src/assets/img/earth.jpg` / `night.jpg` / `clouds.png` / `starfield.jpg` | 无任何引用 |
| `src/assets/status/403.svg` / `500.svg` | 无任何引用 |
| `src/assets/svg/exit_screen.svg` / `full_screen.svg` | 无任何引用 |

#### 修改的文件

- `src/router/index.ts`：移除 `// import "@/utils/sso";` 注释行
- `src/router/utils.ts`：移除 `// import { getAsyncRoutes } from "@/api/routes";` 注释行

### 四、补充清理（后台未引用文件扫描结果）

后台全量扫描发现 3 个疑似未引用文件，逐一核实后差异处理：

| 文件 | 结论 | 处理 |
| --- | --- | --- |
| `src/utils/http/types.d.ts` | **误报**，被 `utils/http/index.ts` 第 11 行 `import ... from "./types.d"` 显式引用 | 保留 |
| `src/utils/globalPolyfills.ts` | 官方注释说明的 `global is not defined` 兼容补丁，按需启用，当前未引入 | 保留（备用能力） |
| `src/utils/propTypes.ts` | 全项目零引用，仅依赖 `vue-types` | 删除 |

同时从 `blog-v3-admin/package.json` 移除依赖 `vue-types`（仅被已删的 `propTypes.ts` 使用）。

### 验证结果
| 验证项 | 结果 |
| --- | --- |
| 服务端全量 `require` 加载 60+ 模块 | FAILS=0 |
| 服务端 `node app.js` 启动 | 成功，`/` 返回 200 |
| 已删接口回归（`article/like`、`talk/like`、`message/like`、`comment/thumbUp`、`article/updateUrl`） | 全部 404 ✅ |
| 保留接口回归（`like/getIsLikeByIdOrIpAndType`、`chat/ai`、`talk/blogGetTalkList`、`comment/frontGetParentComment`、`article/getHotArticle`、`statistic`、`config`、`category/getCategoryDictionary`、`swagger.json`） | 全部 200 ✅ |
| 前台 `vite build` | 成功，114 个产物，25.35 MB |
| 后台 `npm run build` | 成功 |
| 后台补充清理后 `vite build` 复验 | 成功，350 个产物 |
| 源码残留扫描 | 前后端均 clean |

### 后续可选项（未执行）

- `blog-server/src/db/` 目录下 README 提到的 SQL 建表文件实际不存在，如需初始化数据库需另行补充
- `blog-server/directoryList.md` 仍是旧 Express 项目的目录说明，与当前 Koa 结构不符，建议后续重写
- `blog-server/package.json` 中 `koa-convert` 若确认无用可再移除；本次未做验证故保留
