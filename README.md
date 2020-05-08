# april-cms 

[april-cms English description](#april-cms-English-description)

[april-cms 中文说明](#april-cms-中文说明)

## april-cms English description

A flat-file and also API-based CMS(content management system), initially designed for my Nuxt blog website project.

### Start and run

To start API and open interface on Chrome, run the following command. If you haven't installed Chrome, please have a try, and this interface is designed to be opened on Chrome by default.

```
npm start
```

### Interface

You can use the interface to create/modify/delete blog articles, which are stored as Markdown files in `blogs` folder.

Interface Preview

![preview](img/preview.png)

### API

And you can use it for `Nuxt` or any `JAMstack` projects.

For blog list, just call `http://127.0.0.1:4000/blogs`

For specific blog article content, if under dev mode, call `http://127.0.0.1:4000/blogs?slug=yourslug&isdev=true`

If it is static/server mode, call `http://127.0.0.1:4000/blogs?slug=yourslug`

For tag list, call `http://127.0.0.1:4000/blogs?tag=all_tags`

For blog article list of specific tag, call `http://127.0.0.1:4000/blogs?tag=yourtag`

And if you want to scrape the image assets, you can call `http://127.0.0.1:4000/blogs?img=all_imgs`.

Feedbacks are more than welcome~

## april-cms 中文说明

本项目为操作纯文本文件的基于 API 的内容管理系统，最初是为 Nuxt 博客网站项目设计的。

### 启动

要启动 API 并在 Chrome 上打开操作界面，请在命令行中使用以下的命令。如果你的电脑上没有安装 Chrome，趁此机会装一个吧。本项目的操作界面默认打开 Chrome 浏览器。

```
npm start
```

### 操作界面

你可以使用操作界面来创建/修改/删除博客文章，相关文章将会以 Markdown 文件格式保存在 `blogs` 文件夹里面.

操作界面预览

![preview](img/preview.png)

### API

如果你有一些 `Nuxt` 或任何 `JAMstack` 的项目，都可以用这个 CMS 的 API.

要获取所有文章列表，可以使用此 API： `http://127.0.0.1:4000/blogs`

要获取特定文章的内容，如果在开发模式下，可以使用此 API： `http://127.0.0.1:4000/blogs?slug=yourslug&isdev=true`

如果是在生成静态文件时或者是服务器上使用，可以用这个 API： `http://127.0.0.1:4000/blogs?slug=yourslug`

要获取标签列表，可以使用此 API： `http://127.0.0.1:4000/blogs?tag=all_tags`

要获取某标签下的文章列表，可以使用此 API： `http://127.0.0.1:4000/blogs?tag=yourtag`

如果你想获取 CMS 里面所有图片资源，可以用这个 API： `http://127.0.0.1:4000/blogs?img=all_imgs`.

欢迎讨论本项目的任何问题~
