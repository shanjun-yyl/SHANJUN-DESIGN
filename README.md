# 严依伦个人作品集网站

这是一个静态个人作品集网站，包含首页、作品分类详情页和轻量网页版作品集预览页。

## 页面入口

- `index.html`: 网站首页
- `gallery.html`: 作品分类详情页，通过 `?gallery=brand`、`?gallery=movie`、`?gallery=logo`、`?gallery=aigc` 切换分类
- `portfolio.html`: 轻量网页版作品集预览

## 本地预览

```bash
npm start
```

默认地址：

```text
http://127.0.0.1:4173/
```

也可以直接用浏览器打开 `index.html`，但本地服务更接近 GitHub Pages 的访问方式。

## 上传 GitHub

推荐上传当前目录下未被 `.gitignore` 排除的文件。详情页已经改为读取 `assets/gallery-optimized/` 下的 WebP 图片，因此原始大图目录不会进入 Git 仓库。

如果使用 GitHub Pages：

1. 新建 GitHub 仓库。
2. 推送本项目到 `main` 分支。
3. 在仓库 `Settings -> Pages` 中选择 `Deploy from a branch`。
4. Branch 选择 `main`，目录选择 `/root`。
5. 等待 GitHub Pages 生成访问链接。

## 资产说明

- 首页图片使用 `assets/optimized/`。
- 作品详情页图片使用 `assets/gallery-optimized/`。
- 作品集网页预览使用 `assets/portfolio-preview/`。
- `严依伦个人作品集-2026-light.pdf` 是压缩 PDF。
- `严依伦个人作品集-2026.pdf` 是高清原件，约 70MB，默认保留在本地并通过 `.gitignore` 排除，避免 GitHub 大文件警告。

## 检查命令

```bash
npm run check
```
