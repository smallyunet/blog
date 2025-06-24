# smallyu 的博客

此仓库包含 [smallyu.net](https://smallyu.net) 网站的源代码，基于 [Hexo](https://hexo.io/) 构建，主题位于 `themes/yinwang`。

## 快速开始

1. 安装 Node.js (建议 v14 及以上)。
2. 安装依赖：

   ```bash
   npm install
   ```

3. 启动本地服务器预览站点：

   ```bash
   npx hexo server
   ```

4. 生成静态文件到 `docs/` 目录（用于部署至 GitHub Pages 等静态主机）：

   ```bash
   npx hexo generate
   ```

## 目录说明

- `source/_posts`：Markdown 博文源文件。
- `themes/yinwang`：博客使用的主题。
- `docs/`：生成的静态站点目录，`_config.yml` 中的 `public_dir` 指向该目录。

更多 Hexo 配置可参考 `_config.yml`。例如：

```yaml
# Hexo Configuration
## Docs: https://hexo.io/docs/configuration.html
## Source: https://github.com/hexojs/hexo/

# Site
title: smallyu的博客
subtitle: smallyu的博客
title_tooltip:
description:
keywords: smallyu,blog
author: smallyu
# language: en
language: zh-cn
timezone:
```

以及：

```yaml
permalink: :year/:month/:day/:title/
permalink_defaults:

# Directory
source_dir: source
public_dir: docs
tag_dir: tags
archive_dir: archives
category_dir: categories
code_dir: downloads/code
```

