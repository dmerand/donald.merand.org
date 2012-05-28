---
title: My Own Personal Embed Server
category: code
layout: post
---

I've stopped hosting this site on my own webserver, and moved to [Github's](https://github.com) [Pages](http://pages.github.com/) using [Jekyll](https://github.com/mojombo/jekyll), and I couldn't be happier. I don't have to worry about the 1KB/month in bandwidth of people reading the site, load times are fast, and deployment is dead simple. I love the static site concept, and am very grateful to Github for being magnanimous enough to host all of us hacker types' personal web pages using their totally rad system.

I do have one problem though: what if I want to host big files, or media files, the kind that you don't exactly want in a `git` repository? For example, [entire albums of mp3s](http://donaldmerand.com/projects/2011/08/16/album-exploration-slideshow.html) or [a bunch of images](http://donaldmerand.com/art/2011/12/04/old-drawings.html)? Naturally, I could use one of the zillion "cloud" providers of file storage (eg. Dropbox, Photobucket, Imgur, Soundcloud, etc.), and indeed I do use [Flickr](http://www.flickr.com/photos/79212667@N07/) to host my photos. But in general, I don't trust/don't want to pay for cloud providers, and I also want a little bit more control over how/where my files are being stored.

The simplest thing to do would be this: upload files to my existing webserver by hand, put them in custom folders, and link to those files using manual URLs when I'm writing blog posts. But I write programs for a living, I can do something better than that! Right in the middle of writing a post, I want to be able to quickly upload a file to _my_ webserver, and get the URL for that file back, paste that URL into my blog post and continue right on writing. Low friction - it's the only kind of friction I can handle when I'm working. When things get in my way I have a bad habit of moving on to something more fun or (worse) avoiding the difficult/boring thing completely.



So I Wrote It...
================

I figure that all I need are two things: 

1. A web-side script which can take files via POST, put them into folders, and return the URL of the file on the server.
2. A client-side script which I can use to pass files to my webscript.

... So I wrote it. I wrote it in PHP, which is still the easiest for droppin' on webservers and having it just work. I posted the code [right here](https://github.com/dmerand/post_file), so go and clone it!




Usage
=====

- Put the entire `public/` directory somewhere on your server.
- Then, use the `post_file.sh` script like this:
  - Modify the script to point to your server, with your username etc, and your security token (see below).
  - Type `sh post_file.sh file_name` in [your favorite terminal program](http://www.iterm2.com/).
  - You should get a link like `http://your.site/1338166636/your_file`

    - The directory before your file is the UNIX timestamp of when you uploaded the file. The thinking is that you might want to upload the same file twice, so you want each file to be located in its own unique directory.
  - Take that link and paste it wherever you need it.
  - If you need/want to delete that uploaded file for whatever reason, use `sh post_file.sh 1338166636`. More on this below.
- The ability to delete files via the "api" becomes necessary on shared hosts (such as mine) where the web user and the SSH user don't have the same privileges. You upload a file, but then you can't delete it when you're logged on to the webserver since the 'www' user (or some such) is the owner! To get around this, I modified the PHP script to accept HTTP DELETE requests as well. That's like web 3.0 right there. You still need a token though.
- Security is handled two different ways. One, there is an API "token" that you need for the PHP script to do anything. I recommend changing the default. Two, I've enabled HTTP Basic Authentication and built that into the scripts. So, when cloning the files be sure to change both the API token, and to add a `.htaccess` and `.passwd` file to the `public` directory if you want to use HTTP authentication (I've omitted mine from the repository to make it four seconds harder for you to figure out the information contained in them).
