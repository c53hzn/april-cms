var express = require("express");
var fs = require("fs");
var fm = require('front-matter');
var hljs = require('highlight.js');
var markdownIt = require('markdown-it');
var markdownItToc = require('markdown-it-toc');
var open = require("open");

var app = express();
var md = markdownIt({
  html:         false,        // 在源码中启用 HTML 标签
  xhtmlOut:     false,        // 使用 '/' 来闭合单标签 （比如 <br />）。
  breaks:       false,        // 转换段落里的 '\n' 到 <br>。
  langPrefix:   'language-',  // 给围栏代码块的 CSS 语言前缀。对于额外的高亮代码非常有用。
  linkify:      false,        // 将类似 URL 的文本自动转换为链接。
  typographer:  false,
  quotes: '“”‘’',
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {}
    }
    return ''; // 使用额外的默认转义
  }
});
md.use(markdownItToc);

var singleBlog = function(fullPath,slug,isContentRequired,isMD,isDev) {
	var blog = {};
	var content = fm(fs.readFileSync(fullPath, "utf8"));
	blog = content.attributes;
	blog.slug = slug;
	if (isContentRequired && !isMD) {
		let html = md.render('@[toc]( )\n' + content.body);
		// add class "hljs" for dark theme rendering
		if (isDev) {
			html = html.replace(/src=\"?(\/)img/g,"src=\"http://127.0.0.1:4000/img");
		}
		blog.content = html.replace(/\<pre/g,"<pre class='hljs'");
	} else if (isContentRequired && isMD) {
		blog.content = content.body;
	}
	return blog;
}

//return blog related contents
app.get("/blogs", function(req, res) {
	// allow cross orign access
	res.header('Access-Control-Allow-Origin', '*');
	
	var blogPath = __dirname + '\\blogs';
	var imgPath = __dirname + '\\img\\blogs';
	var files = fs.readdirSync(blogPath);

	var json = {};// result to be returned

	var qSlug = req.query.slug || "";
	var qTag = req.query.tag || "";
	var qImg = req.query.img || "";
	var qIsMD = (req.query.ismd == "true") || false;
	var qIsDev = (req.query.isdev == "true") || false;
	if (qSlug) {// with blog slug query
		json = singleBlog(`${blogPath}\\${qSlug}.md`,qSlug,true,qIsMD,qIsDev);
		for (let k = 0; k < files.length; k++) {// add prev and next blog
			if (qSlug == files[k].replace(/\.md$/, "")) {
				if (k === 0) {
					json.next = files[k+1].replace(/\.md$/,"");
				} else if (k === files.length-1) {
					json.prev = files[k-1].replace(/\.md$/,"");
				} else {
					json.prev = files[k-1].replace(/\.md$/,"");
					json.next = files[k+1].replace(/\.md$/,"");
				}
			}
		}
	} else if (qTag) {// with tag query
		if (qTag == "all_tags") {// returns list of all available tags
			json.tags = {};
			for (let i = 0; i < files.length; i++) {
				let blogPost = singleBlog(blogPath+"\\"+files[i],files[i].replace(/\.md$/, ""));
				let tags = blogPost.tags || ['none'];
				let entry = {
					title: blogPost.title,
					slug: blogPost.slug
				};
				for (let j = 0; j < tags.length; j++) {
					if (json.tags[tags[j]]) {
						json.tags[tags[j]]++;
					} else {
						json.tags[tags[j]] = 1;
					}
				}
			}
		} else {// returns blog list of specific tag
			json.blogs = [];
			for (let i = 0; i < files.length; i++) {
				let blogPost = singleBlog(blogPath+"\\"+files[i], files[i].replace(".md", ""));
				let tags = blogPost.tags || ['none'];
				let entry = {
					title: blogPost.title,
					slug: blogPost.slug
				};
				for (let j = 0; j < tags.length; j++) {
					if (tags[j] == qTag) {
						json.blogs.unshift(blogPost);
					}
				}
			}
		}
	} else if (qImg) {// with img query
		if (qImg == "all_imgs") {
			json.imgs = {};
			var imgFolders = fs.readdirSync(imgPath);
			for (let i = 0; i < imgFolders.length; i++) {
				let imgs = fs.readdirSync(imgPath+"\\"+imgFolders[i]);
				json.imgs[imgFolders[i]] = imgs;
			}
		}
	} else {//without requirement, returns list of all blogs
		json.blogs = [];
		for (let i = 0; i < files.length; i++) {
			let blogPost = singleBlog(blogPath+"\\"+files[i], files[i].replace(".md", ""));
			json.blogs.unshift(blogPost);
		}
	}
	res.send(json);
});

//return blog content editor page
app.use(express.static(__dirname));
app.get("/", function(req, res) {
  	// allow cross orign access
	res.header('Access-Control-Allow-Origin', '*');
	res.sendFile(__dirname+"\\index.html");
});

//api to submit post
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());
// Access the parse results as request.body
app.post('/savepost', function(req, res){
	var obj = req.body;
	var fileName = __dirname+"\\blogs\\"+obj.slug+".md";
    fs.writeFileSync(fileName, obj.str);
    //Client will get status of failure w/o this
    //even if data is saved to server successfully
    res.send({"status": "success"});
});
// delete post
app.post('/deletepost', function(req, res){
	var obj = req.body;
	var fileName = __dirname+"\\blogs\\"+obj.slug+".md";
	try {
		fs.unlinkSync(fileName);
		//file removed
	} catch(err) {
		console.error(err);
	}
    //Client will get status of failure w/o this
    //even if data is saved to server successfully
    res.send({"status": "success"});
});

/* when testing api alone and run dev/build/generate */
/* nuxt is using port 3000, so choose another one */
app.listen(4000, () => {
	console.log("express server running at http://127.0.0.1:4000")
});

open("http://127.0.0.1:4000", {app: "chrome.exe"});