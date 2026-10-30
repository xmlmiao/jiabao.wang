# 小屋公共信箱

网站继续由 GitHub Pages 托管。原来的左侧邮箱打开匿名留言表单，调用站长自己账号下的 Cloudflare Worker `bao-guestbook`，留言保存在该账号下的 D1 `bao-guestbook`。

Worker 地址：https://bao-guestbook.wangjiabao0725.workers.dev
接口：GET /api/messages、POST /api/messages

昵称最长 24 字，留言最长 500 字；回复关联到原留言；每个来源 30 秒内只允许一次投递。数据库仅保存来源地址的散列用于限速，不向访客返回此字段。网页按文本显示留言，避免将访客输入解释为 HTML。

`schema.sql` 与 D1 已创建表一致，`wrangler.json` 对应已创建 Worker 和绑定。部署前先由账号所有者完成官方工具登录，再从本目录运行 `wrangler deploy`。不要将令牌或 OAuth 登录文件提交到仓库。

本地开发：先从仓库根目录运行 `wrangler d1 execute DB --local --config workers/wrangler.json --file workers/schema.sql` 初始化独立测试库，再运行 `wrangler dev --local --config workers/wrangler.json --port 4197`。另一个终端运行 `npm run dev`；Vite 会把留言接口代理到本地 Worker。正式构建直接访问上面的 Cloudflare 地址，不经过本地代理。

用 Node.js 24 运行 `node workers/verify.mjs` 验证回复、输入校验、限速和跨站访问限制。测试使用内存数据库，不写入正式 D1。

GitHub Issue #2 保留历史交流。先前的 Sites 留言服务按用户要求暂时保留，不作为新表单的存储来源。
