---
layout: post
title: About This Site  
context: Code  
tags: code credits php
---

_Note: Since writing this article, I've decided to migrate my page to being hosted on [GitHub](http://github.com/donaldmerand) using [jekyll](https://github.com/mojombo/jekyll). Sooo, it's all basically out-of-date. But the PHP code was a fun exercise!_


When designing this site, I envisioned it as a blog/pulpit,résume, and code/ideas repository. My mission is to make the site as usable as possible with as few elements as possible. Within that framework, I still want to have the elements one expects a modern web site, such as cross-platform compatibility, site search, RSS feeds, web-based content management, syntax highlighting of code snippets, and so forth. I'm also using the opportunity to try new approaches, and thought maybe it would be nice to share how the site works. 


#	Why?

I've gone back and forth for a long time about whether it's even worth having a web site. The reason I quit Friendster and MySpace and never even joined Facebook is because of the self-referential black hole having an online presence can be. You can get really tied up in an identity that's not you, it's just self-marketing.

But on the other hand, self-marketing can be a good thing if, for instance, you _are_ your own brand because you work for yourself. Also, I want to be able to share the cool things I learn like [how to convert DokuWiki to LaTeX](http://donaldmerand.com/view/1312559520) and [the album I wrote and recorded in six weeks](http://donaldmerand.com/view/1313497556). Maybe somebody can find my code useful, or get some enjoyment out of an album or drawing or photo I made.


#	The Idea

When I started on this site I was really getting into BASH scripting and the whole UNIX toolset. I _love_ the UNIX philosophy of each program doing one thing, and one thing well. Then you chain the programs together in arbitrary ways and you have Real Ultimate Power on your hands. The UNIX toolset is _so_ powerful, in fact, that you can actually just use BASH to be the content management for your web page as a CGI script.

While the concept of having my entire web page be a big fat BASH script is appealing, I didn't want to actually injure my brain writing the site. So I decided to use PHP for the scripting,  but use the file-system for my content management instead of a database system like MySQL. That way, I can get the relative easy of inline scripting that you get with PHP, but also have access to the UNIX utilities like `grep` that I have come to love for some of the functions of the site.


#	The Execution

The articles themselves are stored as plain-text files on the webserver. The text files are written using the [markdown](http://daringfireball.net/projects/markdown/) syntax, with a slight modification that allows me to tag files arbitrarily. Have I mentioned how awesome Markdown is? I converted all of my notes a year or so back, and now I can use [pandoc](http://johnmacfarlane.net/pandoc/) to convert my notes to any format under the sun! PDF, you got it. LaTeX, no problem. Textile (for BaseCamp)? Okay! But I digress...

I keep a single text-based cache of all of text files under content management. Using a cache, iterating through things like titles and tags doesn't rely on a filesystem traversal of the whole document tree. Article files are stored and referenced using the timestamp of their creation. Uploaded content for articles (such as MP3s, images, etc) all get stored in a directory named after the file timestamp. Effectively the creation timestamp is the article ID. This system would work for content management for anybody except people who might have content being simultaneously submitted by multiple users at the exact same time: a pretty rare case in my usage.

I wrote [an article](http://donaldmerand.com/view/1312559543) about the kinds of things I have come to think friendly web sites should do. Here's how I do those things:


#	Clean URLs

Since I'm using Apache as the webserver for this site, I've been able to use .htaccess re-writes to modify the URLs from a basic HTML post-based URL system. You might notice that when viewing an article you might see a URL such as `http://donaldmerand.com/view/1313497556`, instead of `http://donaldmerand.com/view.php?id=1313497556`. 

People tell you a lot of reasons why you should have clean URLs. The Rails community will go on and on about RESTfulness, which is a lofty if confusing goal. You'll hear about search engines who spit on your doorstep after seeing your ugly question marks in the URLs (a question mark in a URL is like a rusty car on blocks in the front yard ). But my reason for doing clean URLs is aesthetics. I don't like ugly URLs because they look ugly. So that had to go.

I can tell you that writing them by hand can be painful unless you're up on your regular expressions. But then, you should be up on your regular expressions because using them properly makes you feel like a wizard. I learned from the book [Sed and Awk](http://shop.oreilly.com/product/9781565922259.do), which I heartily recommend for any UNIX user.


#	Search

Speaking of regular expressions, you can use them in the search bar of this site. Why? Because I'm using grep as my search engine. Since my pages are all stored as text files, grep is a logical choice to do search because you can assume that the people writing grep are more concerned with optimizing regular expressions edge cases than you are. It's going to be pretty fast. I don't know how fast for zillions of articles, but I don't plan on writing zillions of articles. I think it'll scale pretty well over the life of this site.

And yes, I do escape search input so you can't do any funky filesystem calls in my search bar. Jeez.


#	RSS Feeds

People will tell you that Twitter and Facebook are replacing the RSS feed. This may be true for people who don't care about computers, but it's not true for me. You can pry RSS out of my cold dead hands. My site needs to have RSS.

For this site, I've implemented my own RSS functions in PHP. I wrote it so that you can get an RSS feed for either the whole site, or for any of the sub-categories (Projects, Code, etc.). That was a lot of fun, but there's not a lot to report about it. RSS is a pretty easy and well-defined syntax.


#	Print/PDF-Ability

Sometimes you want to print a web page. Or if you're like me, sometimes you want to make a PDF out of a web page. CSS print stylesheets are a remarkably under-used thing on the web, but it always irks me when I go to print a web page and it's all munged up.

In this site, you'll notice that the navigation elements disappear, and the text size and margins adjust for an optimal on-paper/PDF reading experience when you print. Like RSS, it's a thing into which you put a lot of effort as a site designer that most people will never see. But it's important!


#	What Not to Include

It's just as important to make choices about what _not_ to include. I opt against social network integration, comment systems, and advertising on this site. Among those things, comments are the only thing I've chosen against that would add any value for users of the site. But I don't want to write a comment system, so sorry folks, you'll have to send me an email.

I realize that all web applications at this point are social to some degree, but I believe you should be able to make the choice not to have little "pin this, like that" buttons everywhere and not be made a pariah for it. I hope you'll agree. I don't want advertising because I don't want my identity to be associated with other people's schemes to get your money and make you feel bad.


#	Credits

This site uses:

  - [Hashify Editor](https://bitbucket.org/davidchambers/hashify-editor) for editing and previewing page content.
     - You should check out [Hashify](http://hashify.me) for a great online Markdown previewer/editor.
  - [File Uploader](http://github.com/valums/file-uploader) for uploading files.
  - [Prettify](https://code.google.com/p/google-code-prettify/) for syntax highlighting of code snippets.

The rest was all me. Thanks for getting this far!
