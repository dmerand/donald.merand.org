---
layout: post
title: How I Actually Convert Dokuwiki to LaTeX (and Other Formats Too!)
category: code
---

I [wrote an article](http://donaldmerand.com/code/2011/07/18/dokuwiki-to-latex-converter.html) a while back about a utility that I wrote to convert [DokuWiki] files into [LaTeX] files. I've noticed that a lot of the web traffic that I get is about this topic, so I thought I'd write a followup post to describe my new improved dokuwiki conversion method.

The disadvantage of my [old utility](https://gist.github.com/2414353) is mainly that it is incomplete - it doesn't catch all of the syntax that DokuWiki supports. This is partly because I wrote it as an exercise in writing Awk/Sed code (regular expressions - so hot right now), and partly because at the time that I wrote it I didn't need any fancy features like tables, etc. The other disadvantage of that code is that in *only* converts to [LaTeX].

I used to write my personal notes in [DokuWiki] format using [Notational Velocity]. But then I learned about [Markdown] and [became enamored of that syntax](http://localhost:4000/code/2011/09/20/tsv-the-best-spreadsheet-format.html), so now I write my notes in [Markdown] instead. The reason I bring this up is that my needs shifted once I started using Markdown, and I wanted a more general-purpose way to convert my [Markdown] notes into LaTeX, but also HTML, Textile, whatever the situation calls for. Enter [Pandoc].

Let me take a moment to talk about how awesome [Pandoc] is. I don't know what you're doing right now, but if you use [Markdown], you need to have [Pandoc] installed. It will convert *all of the formats*, to and from each other. Markdown to LaTeX? No problem. Textile to HTML? HTML to epub? Whatever. It is amazing. Except it doesn't support DokuWiki.

However, knowing what I now know about [Pandoc], I realized that all I really need is to be able to convert [DokuWiki] to HTML, and I could then feed that structured HTML into [Pandoc] to convert [DokuWiki] syntax into any other format, including, yes, LaTeX. Fortunately for me, DokuWiki does all of the hard work, since converting DokuWiki syntax into HTML is, you know, precisely what the whole thing is designed to do. So what I needed is merely a way to access DokuWiki's syntax conversion from the command line. Here's how I do it:

1. Install [Pandoc] following whichever instructions suit your fancy on John McFarlane's site.
2. Install an empty copy of [DokuWiki] that you will use merely as a syntax converter.
3. Download the [DokuWiki CLI Utility](http://www.dokuwiki.org/tips:dokuwiki_parser_cli), which I have handily found for you.
4. Download my script, called [doku2html](https://github.com/dmerand/dlm-dot-bin/blob/master/doku2html). This script (you'll notice from looking at the line that says `phpcli=~/.bin/lib/dokuwiki/bin/dokucli.php`) assumes that you've installed your DokuWiki installation into `~/.bin/lib/dokuwiki/` and the `dokucli.php` file into the `/bin/` folder of your DokuWiki installation.
5. Put that script into your `$PATH`, and you'll be able to say `doku2html FILE`, or even just run `doku2html` on Standard Input, and get HTML as the output.

I wrote *another script* called [doku2md](https://github.com/dmerand/dlm-dot-bin/blob/master/doku2md), which illustrates how you might convert [DokuWiki] to [Markdown] using a system script. Modifying this script for [LaTeX] is pretty trivial.

In practice, I usually use a command like `doku2html FILE | pandoc -f html -s -t latex` to create a [LaTeX] document from a [DokuWiki] file. Then if I want to get *really* fancy and make a PDF straight from my [LaTeX] file I will pipe that over to my [pdl](https://github.com/dmerand/dlm-dot-bin/blob/master/pdl) (PDFLaTex) utility which expects a LaTeX file or pipe, and passes it to `xelatex` and makes a PDF, and then opens it up in Preview (on OSX).

So easy, right? Well, it's easier than converting by hand.

[DokuWiki]: http://dokuwiki.org
[LaTeX]: http://www.latex-project.org
[Markdown]: daringfireball.net/projects/markdown
[Notational Velocity]: http://notational.net
[Pandoc]: http://johnmacfarlane.net/pandoc
