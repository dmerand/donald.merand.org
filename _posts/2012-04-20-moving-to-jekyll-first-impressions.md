---
layout: post
title: Moving to Jekyll - First Impressions
category: code
tags: jekyll php code
---

I got the itch about two weeks ago to make some changes to this site. I felt the need to ditch the entire thing and start over, but my lovely wife pointed out the futility of ditching all of the good work it represented. Maybe it would be better to just change the design? She was right, like she always is.

So I decided on a basic re-design. Maybe some CSS overhaul, maybe a few navigation changes. Nothing big. But then I learned about [Jekyll], and I got motivated again to make a bigger switch. As it turns out, Jekyll very elegantly does [what I was trying to all along][dlm_site] with my PHP code:

-   Posts formatted in [Markdown]. I [believe very strongly][dlm_believe] in Markdown as the way to do all of your text editing. I [am][md_am] [not][md_not] [alone][md_alone].
-   Post metadata contained in a special section at the top of each post. Since my original idea was also using one file/field per post, it makes sense to try to keep all the metadata in the same place. Evidently, this is a common problem: Jekyll uses (what I have now learned is a "standard") [YAML Front Matter][yfm]. It's always better to go with standards (that make sense), because it ensures portability and/or understandability.
-   Fast. Static HTML pages. They are the fastest.
-   Straightforward editing. What could be more straightforward than editing in your favorite text editor?
-   Straightforward deployment, in my case using [Github][dlm_github] as the engine. Assuming you think version control with Git is straightforward, that is :)


Conversion
==========

Learning about [Jekyll] took me about an hour. I liked that part. I wish Ruby on Rails had taken me an hour. Converting my whole site to [Jekyll], including deployment, took about 3 more hours. Granted, I already had a pile of posts in Markdown format, with the post metadata at the top. My templates were already abstracted in PHP, so conversion there was also minor and mostly involved changing things to Liquid. Also, I only had about 10 posts to work with. If it had been much more, I probably would have had to spend another 1/2 hour writing a script to convert my posts. But still, considering that the entire architecture of how the page is served has been altered, that's a pretty quick conversion.


Differences
===========

Static sites are faster, so that's good. I was concerned about the development side being awkward or slow, but in practice it's actually simpler than developing with PHP. I put a `server:true` and `auto:true` in my [Jekyll] `_config.yml`. That way, my changes get refreshed automatically, and I can preview them locally before deployment. Once everything looks good, I just run a `git commit` and then a `git push`. The Liquid template engine is fine: I should probably have been using a template engine before, but I wasn't so this is an improvement.

The new version of the page doesn't do everything the old version did. There is no site search (use a site: parameter in your search engine of choice). RSS exists, but only for the whole site, not for individual categories. Initially I was concerned about removing features, but after seeing my test version using [Jekyll], I was actually relieved. The site is simpler to use, and more understandable at a glance, which it needs to be.


Summary
=======

I am very pleased with [Jekyll]. It is conceptually very simple, which lets me focus on what I should be doing: writing content. Removing features, even ones that I thought were necessary like search, has actually made this site better. In a world where there are almost no constraints on what you _can_ do, working within constrained environments can force you to do better work.

[jekyll]: https://github.com/mojombo/jekyll "Jekyll: Static Site Generator written in Ruby"
[dlm_site]: http://donaldmerand.com/code/2012/02/29/about-this-site.html
[markdown]: http://daringfireball.net/projects/markdown/ "Markdown: Text markup for people"
[dlm_believe]: http://donaldmerand.com/code/2011/09/20/tsv-the-best-spreadsheet-format.html
[md_am]: http://512pixels.net/markdown-new-word51/
[md_not]: http://scienceblogs.com/gregladen/2010/02/what_is_markdown_and_why_use_i.php
[md_alone]: http://www.hiltmon.com/blog/2012/02/20/the-markdown-mindset/
[yfm]: https://github.com/mojombo/jekyll/wiki/yaml-front-matter
[dlm_github]: http://github.com/dmerand
