var express = require("express");
var fs = require("fs");
var fm = require('front-matter');
var hljs = require('highlight.js');
var markdownIt = require('markdown-it');
var markdownItToc = require('markdown-it-toc');
var open = require("open");
var config = require(__dirname+"\\config.js");

var app = express();
var md = markdownIt({
  html:         true,        // 在源码中启用 HTML 标签
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

var slugToFileName = function(slug,isSlugUseDate) {
	var result = "";
	if (isSlugUseDate) {
		result = slug+".md";
	} else {
		var files = fs.readdirSync(config.blogPath);
		var slugs = files.map(function(e) {
			return e.substring(11,e.length);
		});	
		for (let i = 0; i < slugs.length; i++) {
			if (slugs[i]==slug+".md") {
				result = files[i];
				break;
			}
		}
	}
	return result;
}
var fileNameToSlug = function(filename,isSlugUseDate) {
	if (isSlugUseDate) {
		return filename.substring(0,filename.length-3);
	} else {
		return filename.substring(11,filename.length-3);
	}
}

var singleBlog = function(fullPath,slug,isContentRequired,isMD,isDev) {
	var blog = {};
	var content = fm(fs.readFileSync(fullPath, "utf8"));
	blog = content.attributes;
	blog.slug = slug;
	blog.date = fullPath.replace(config.blogPath+"\\","").replace("-"+slug,"").replace(".md","");
	if (isContentRequired && !isMD) {
		let html = md.render('@[toc]( )\n' + content.body);
		// add class "hljs" for dark theme rendering
		if (isDev) {
			html = html.replace(/src=\"(\/)?img/g,"src=\"http://127.0.0.1:4000/img");
		}
		blog.content = html.replace(/\<pre/g,"<pre class='hljs'");
	} else if (isContentRequired && isMD) {
		blog.content = content.body;
	}
	return blog;
}

//return blog related contents
app.get("/blog", function(req, res) {
	// allow cross orign access
	res.header('Access-Control-Allow-Origin', '*');
	
	var blogPath = config.blogPath;
	var imgPath = config.imgPath;
	var files = fs.readdirSync(blogPath);

	var json = {};// result to be returned

	var qSlug = req.query.slug || "";
	var qTag = req.query.tag || "";
	var qImg = req.query.img || "";
	var qIsMD = req.query.ismd == "true";
	var qIsDev = req.query.isdev == "true";
	var isSlugUseDate = (req.query.iseditor == "true")?true:config.isSlugUseDate;

	if (qSlug) {// with blog slug query
		json = singleBlog(`${blogPath}\\${slugToFileName(qSlug,isSlugUseDate)}`,qSlug,true,qIsMD,qIsDev);
		for (let k = 0; k < files.length; k++) {// add prev and next blog
			if (qSlug == fileNameToSlug(files[k])) {
				if (k === 0) {
					json.next = fileNameToSlug(files[k+1]);
				} else if (k === files.length-1) {
					json.prev = fileNameToSlug(files[k-1]);
				} else {
					json.prev = fileNameToSlug(files[k-1]);
					json.next = fileNameToSlug(files[k+1]);
				}
			}
		}
	} else if (qTag) {// with tag query
		if (qTag == "all_tags") {// returns list of all available tags
			json.tags = {};
			for (let i = 0; i < files.length; i++) {
				let blogPost = singleBlog(blogPath+"\\"+files[i],fileNameToSlug(files[i]));
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
				let blogPost = singleBlog(blogPath+"\\"+files[i],fileNameToSlug(files[i]));
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
			let blogPost = singleBlog(blogPath+"\\"+files[i],fileNameToSlug(files[i],isSlugUseDate));
			json.blogs.unshift(blogPost);
		}
	}
	res.send(json);
});
app.get("/config", function(req, res) {
	// allow cross orign access
	res.header('Access-Control-Allow-Origin', '*');
	res.send(config);
});


//return blog content editor page
app.use(express.static(__dirname));
app.get("/", function(req, res) {
  	// allow cross orign access
	res.header('Access-Control-Allow-Origin', '*');
	res.sendFile(__dirname+"\\app.html");
});

//api to submit post
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());
// Access the parse results as request.body
app.post('/savepost', function(req, res){
	var obj = req.body;
	var fileName = config.blogPath+"\\"+obj.slug+".md";
    fs.writeFileSync(fileName, obj.str);
    //Client will get status of failure w/o this
    //even if data is saved to server successfully
    res.send({"status": "success"});
});
// delete post
app.post('/deletepost', function(req, res){
	var obj = req.body;
	var fileName = config.blogPath+"\\"+obj.slug+".md";
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

// "chrome.exe" for Chrome, "msedge.exe" for MS Edge, "firefox.exe" for Firefox
// "iexplore.exe" for IE, which is not recommended
open("http://127.0.0.1:4000", {app: "chrome.exe"});