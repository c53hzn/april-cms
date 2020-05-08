# april-cms
A flat-file and also API-based CMS(content management system), initially designed for my Nuxt blog website project.

To start API and open interface on Chrome. If you haven't installed Chrome, please have a try, and this interface is designed to be opened on Chrome by default.

```
npm start
```

You can use the interface to create/modify/delete blog articles, which are stored as Markdown files in `blogs` folder.

And you can use it for `Nuxt` or any `JAMstack` projects.

For blog list, just call `http://127.0.0.1:4000/blogs`

For specific blog article content, if under dev mode, call `http://127.0.0.1:4000/blogs?slug=yourslug&isdev=true`

If it is static/server mode, call `http://127.0.0.1:4000/blogs?slug=yourslug`

For tag list, call `http://127.0.0.1:4000/blogs?tag=all_tags`

For blog article list of specific tag, call `http://127.0.0.1:4000/blogs?tag=yourtag`

And if you want to scrape the image assets, you can call `http://127.0.0.1:4000/blogs?img=all_imgs`.

Feedbacks are welcome~