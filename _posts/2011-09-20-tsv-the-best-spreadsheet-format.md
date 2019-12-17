---
layout: post
title: TSV - The Best Spreadsheet Format  
category: code  
tags: TSV BASH awk  
---

There's no question that [Markdown](https://daringfireball.net/projects/markdown/) is the darling of the coding/internet/people who write communities. It's the default syntax at [GitHub](https://github.com/), [Stack Overflow](http://stackoverflow.com/), [Reddit](http://reddit.com) and others. A [lot](http://markedapp.com/) of [popular](http://brettterpstra.com/project/nvalt/) [text](http://itunes.apple.com/us/app/elements-dropbox-and-markdown/id382752422?mt=8) [editors](http://sourceforge.net/p/retext/home/ReText/) are built around it.

Markdown's appeal is its simplicity. It is easy to learn, and easy to read even in native form. It's easy to extend: the pages on this site, for example, are written in a Markdown variant -- something I'll write more about later.

Okay, we all love Markdown - great, but what does this have to do with spreadsheets? Well, there's a Markdown for spreadsheets, and it's been hiding in plain sight practically as long as we've had computers. -- tab separated variables. Think about it -- TSV format is so simple that you can view it on any device. You can import it into practically _any_ spreadsheet software. And it's one _hell_ of a lot easier to parse programatically than CSV format.

Parsing a CSV file is a pain in the ass. There are at least four different implementations, mostly centering around the concept of whether variables should be quoted or not, and under what circumstances, and what to do with internal quotes. The only question with TSV is... what to do if you want to put a tab in your data. Most software I've seen just substitutes a space, or a few spaces. But only one exception to catch means that when you're parsing a TSV file programatically you don't have to look for a lot.

There aren't a lot of great utilities out there for working with TSV files, so I'm going to post a couple that I use all the time.


# TSVFMT

_A Spreadsheet for Your Command Line_

I wrote this BASH script, which I've named `tsvfmt`, to address the problem of alignment when viewing TSV files in the command line or a text editor. It takes a TSV and uses awk to space it out and place a "\|" character between columns. So this:

    this	is	a	test
{: .mv3 }

... would become this:

    this | is | a | test | 
{: .mv3 }

Here's the script:

<script src="https://gist.github.com/2577157.js"> </script>


# TSV2HTML

_Convert a TSV File to an HTML Snippet_

This one is a little more self-explanatory. Pass it a TSV file, either from STDIN or piped over, and it'll convert it to an HTML table. Best used in conjunction with [bcat](https://rtomayko.github.com/bcat/), which is _awesome_.

<script src="https://gist.github.com/2577179.js"> </script>

*UPDATE* (2012.05.02 10:58:18) - both of the above files are now available as part of the [dlm-dot-bin](https://github.com/dmerand/dlm-dot-bin) project that I've shared on GitHub.
