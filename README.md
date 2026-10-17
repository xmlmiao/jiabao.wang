# Bao 的像素小屋

Vite + TypeScript + PixiJS，保留原来的 192×128 像素房间、居中标题、场景内像素对话框与四幅等大的画。HTML/CSS 负责文字和对话框，PixiJS 负责场景分层、猫咪、纸箱、道具、动态窗景和鼠标/触屏点击。

## 本地开发

使用 Node.js 24：

```sh
npm ci
npm run dev
```

开发预览为 `http://127.0.0.1:4176`。

```sh
npm test
npm run build
npm run preview
```

生产构建输出到 `dist/`，生产包预览为 `http://127.0.0.1:4177`。构建前执行严格 TypeScript 检查；依赖版本由 `package-lock.json` 固定。

## 代码结构

| 文件 | 用途 |
| --- | --- |
| `src/main.ts` | 启动、缩放、减少动态效果偏好、页面可见性 |
| `src/scene.ts` | PixiJS 场景与原生 pointer 点击区域、精灵及遮挡顺序 |
| `src/room-art.ts` | 原房间像素绘图，按时段生成缓存纹理 |
| `src/cat/model.ts` | 独立于渲染的 Baxa 状态、移动、进出小窝 |
| `src/cat/atlas.ts` | 精灵图帧坐标、尺寸与位置对齐数据 |
| `src/clock.ts` | 固定 60 Hz 时间步进，后台返回不追赶积压时间 |
| `src/gallery.ts` | 画廊作品、预览资源与统一排列 |
| `src/dialog.ts` | 原版打字对话框、画廊箭头及键盘翻页 |
| `src/interactions.ts` | 房间物件点击区域和介绍文字 |
| `src/styles.css` | 原版页面与像素对话框样式 |
| `public/assets/` | 猫咪精灵、毕业照等静态素材 |

原房间背景只在时段变化时生成纹理；猫、箱子前后壁、白爪、毛线球和窗景是独立的 PixiJS 对象。逻辑坐标和画布仍是 192×128，采用 nearest 取样、关闭抗锯齿，不拉伸猫的身体制造动作。动画图加载失败时显示简易猫兜底。

## 画廊与交互

编辑 `src/gallery.ts` 的 `GALLERY`。像素作品使用 `pixels` 字符串数组及 `palette`，图片作品使用 `img`、`thumb`，可选 `crop:[x,y,w,h]` 设置墙上取景。素材放在 `public/assets/gallery/`，数据路径写 `assets/gallery/文件名.png`。

墙上统一为 20×20 像素，含框 24×24，目前排四幅。点开统一显示完整作品和说明，使用 ◀ / ▶ 或键盘左右键循环翻页，点击正文或图片关闭，Esc 退出。保持原来的场景交互，不增加页面按钮栏。

Baxa 小窝固定在右侧地板，先走到箱子旁再钻进去，出窝后再活动；点箱子可叫它回窝。参考生成素材及提示词记录在 `public/assets/baxa/animation-atlas.md`，旧精灵保留作历史参考。

## 调试参数

- `?phase=day|dusk|night` 强制时段，默认按访客本地时间。
- `?cat=left|right` 持续向指定方向走动。
- `?cat=sit|stand|walk|lie|sleep|look|groom|play|back|box` 固定姿势；`box` 直接放在固定窝内。
- `?cloud=edge` 检查窗边裁剪。

## 发布

GitHub Pages 使用 `.github/workflows/deploy.yml` 自动构建和发布 `dist/`，不再直接发布根目录源码。推送 main 后先安装锁定依赖、运行猫咪测试和 TypeScript 检查，再构建、上传并部署。无需外部服务器或部署密钥。

自定义域名保持 `jiabao.wang`，根目录 `CNAME` 和用于输出的 `public/CNAME` 内容保持一致。Vite 的 `base` 为 `/`。不要提交 `node_modules`、`dist`、`.env`、token 或虚拟环境，不 force push。

提交前本地检查 1280×800 和 390×844 截图、控制台、画廊翻页、触屏、对话框边界及猫咪小窝。迁移前后截图用于确认布局与像素画保持一致。
