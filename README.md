# smallyu 的博客

此仓库包含 [smallyu.net](https://smallyu.net) 网站的源代码，基于 [Hexo](https://hexo.io/) 构建，使用自定义主题 `yinplus`。

## 🛠️ 快速开始

1. **环境准备**
   确保已安装 Node.js (建议 v14 及以上)。

2. **安装依赖**
   ```bash
   npm install
   ```

3. **本地预览**
   启动本地服务器预览站点：
   ```bash
   npx hexo server
   ```
   访问 `http://localhost:4000` 查看效果。

4. **构建站点**
   生成静态文件到 `docs/` 目录（用于部署至 GitHub Pages）：
   ```bash
   npx hexo generate
   ```

## 📂 目录说明

- `source/_posts/`：Markdown 格式的博文源文件。
- `themes/yinplus/`：博客使用的自定义主题。
- `docs/`：构建生成的静态站点目录（`_config.yml` 中配置为 `public_dir: docs`）。
- `_config.yml`：Hexo 站点配置文件。

## ✍️ 常用命令

- `npx hexo new "文章标题"`：新建文章
- `npx hexo clean`：清除缓存文件 (db.json) 和静态文件 (docs/)
- `npx hexo generate` (或 `hexo g`)：生成静态文件
- `npx hexo server` (或 `hexo s`)：启动本地服务器

## ⚙️ 配置摘要

更多 Hexo 配置可参考 `_config.yml`。

```yaml
# Site
title: smallyu的博客
author: smallyu
language: zh-cn

# Directory
source_dir: source
public_dir: docs

# URL
url: https://smallyu.net
```

