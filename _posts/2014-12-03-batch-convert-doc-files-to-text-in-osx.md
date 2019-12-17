---
layout: post
title: Batch Convert Doc Files to Text in OS X
category: code
tags: code cli osx text doc docx html rtf
---

# OH NO MS Word Batch Conversion!
I recently had to convert an entire directory of `.doc`, `.docx`, and `.rtf` files into plain text files. If you've ready anything else I've written here, you'll have figured out that I'm not a big fan of word processors (_especially_ MS Word), [opting ](https://donaldmerand.com/code/2012/07/20/how-i-actually-convert-dokuwiki-to-latex.html) [instead](https://donaldmerand.com/code/2011/09/20/tsv-the-best-spreadsheet-format.html) for the lighter-weight syntax of [markdown](https://daringfireball.net/projects/markdown/syntax) and text-based formats in general. I *really* wanted to solve this problem without having to resort to opening up a full-blown word processor and converting these files manually. Ideally, I'd be able to make an Automator drop-application that would do the conversion automatically.

I searched fruitlessly around the internet for a while, trying various Automator and Applescript hacks, searched the App Store, searched the [homebrew](https://brew.sh/) repositories, and eventually made my way to Stack Overflow, where I saw [this gem](https://stackoverflow.com/questions/1043768/quickly-convert-rtf-doc-files-to-markdown-syntax-with-php).

Get this: if you've got an OS X machine, you have a built-in batch text converter than can handle the following formats: `txt, html, rtf, rtfd, doc, docx, wordml, odt, or webarchive`. That's right, it can read + write old _and_ new MS Word documents, as well as a variety of other standbys. It is a command-line utility called `textutil`, and it is the glorious solution for this one painful job. It has the ability to infer file types based on file content, take files from a directory listing, or from STDIN, and output files concatenated together, batched out individually, or to STDOUT.

The STDIN/STDOUT capability also means that you can chain it with my [other favorite text converter](https://donaldmerand.com/code/2012/07/20/how-i-actually-convert-dokuwiki-to-latex.html) [pandoc](https://johnmacfarlane.net/pandoc/). This gives you a mind-blowing toolchain of text file conversion.

I've put together a few sample incantations to do amazing things. Weep with joy at what you can now do. And try not to weep further that it was hidden on your machine since version 10.4.

# Textutil Tips and Tricks

- Convert a web page to a `FORMAT` document.
    `curl www.google.com | textutil -stdin -convert FORMAT`
- Find all word-type documents and convert them to `FORMAT`
    `textutil -convert FORMAT *.doc*`
- Find all word-type documents and concatenate them into one `FORMAT` document
    `textutil -cat FORMAT *.doc*`
- Use in combination with [pandoc](https://johnmacfarlane.net/pandoc/) to get even more file conversion possibilites (eg markdown to docx).
    `pandoc -f markdown -t html file.markdown | textutil -stdin -convert docx -o file.docx`
    * pandoc's input formats: docbook, docx, epub, haddock, html, json, latex, markdown, markdown_github, markdown_mmd, markdown_phpextra, markdown_strict, mediawiki, native, opml, org, rst, t2t, textile
