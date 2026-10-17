# Bao 的像素小屋 · jiabao.wang

单文件静态站：`index.html`（无构建、无外部资源）。`CNAME` 用于 GitHub Pages 自定义域名。旧版简历页在 `old-index.html`。

## 添加一幅新的像素画

打开 `index.html`，找到 `const GALLERY = [`，追加一项：

```js
{ title:"作品名", year:"2026", desc:"点击后对话框里显示的介绍\n可以换行",
  palette:{ a:"#ff0000", b:"#00ff00" },   // 一个字符 = 一种颜色
  pixels:[                                // 12 行 × 12 个字符
    "aaaaaaaaaaaa",
    "abbbbbbbbbba",
    ...
  ] },
```

- 画布是 12×12，每个字符一个像素；不在 palette 里的字符（如 `.`）是透明的。
- 墙上从左往右排，每幅占 24 像素宽；墙上大约放得下 4 幅，多了会碰到书架，可以调整 `58+i*24` 里的起点/间距（画框和点击区域两处都要改）。
