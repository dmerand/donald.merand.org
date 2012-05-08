---
layout: post
title: How to Convert a Spreadsheet Into a DokuWiki Table
category: code
---

Remember [that article I wrote](http://donaldmerand.com/code/2011/09/20/tsv-the-best-spreadsheet-format.html) about how TSV is the best format for spreadsheets? Well, here's some more proof:

Earlier today I needed to convert a spreadsheet in XLS format into a table in DokuWiki. I've been avoiding using tables in DokuWiki until now because I find that typing table markup by hand is error-prone and frustrating. But I had to for this job, so I went to review the [DokuWiki syntax for tables](http://www.dokuwiki.org/syntax#tables), and what I saw seemed... familiar to me. It looked exactly like the output from my [tsvfmt](https://github.com/dmerand/dlm-dot-bin/blob/master/tsvfmt) command line utility!

(Incidentally, you can also download tsvfmt as part of a bundle of command line utilities I've made in my [dlm-dot-bin](https://github.com/dmerand/dlm-dot-bin) repository on GitHub.)

As it turns out, the output of `tsvfmt` is Dokuwiki-syntax tables. Who knew? The only caveat is that if you a header row, you have to convert the "|" character into a "^" character. I'll leave modifying the script to do that as an exercise to my one reader.


Here's How It Works
-------------------

1.  Save your spreadsheet in Tab-delimited (TSV) format. We'll assume
    for the purposes of this document that you saved it in
    `/Users/phil/Desktop/spreadsheet.tsv` .
2.  Download [Donald's tsvfmt Command-Line
    Utility](https://github.com/dmerand/dlm-dot-bin/blob/master/tsvfmt "https://github.com/dmerand/dlm-dot-bin/blob/master/tsvfmt").
    I'll assume you've put it in `/Users/phil/Desktop/tsvfmt` .
3.  Open up your favorite [Terminal
    Application](http://www.iterm2.com/ "http://www.iterm2.com/").
4.  Generally, you type `tsvfmt < spreadsheet.tsv`. That command will
    output the Dokuwiki-formatted version of your table.

    - For the purposes of this file, you might want to first type `cd /Users/phil/Desktop/` and then type `sh tsvfmt spreadsheet.tsv|pbcopy`. That will run the conversion and copy the results to the system clipboard.

5.  The **ONE CAVEAT** of this conversion is that if your spreadsheet
    has a header row, you'll want to convert the `|` characters to `^`
    characters in the first row. See [DokuWiki
    Syntax](http://www.dokuwiki.org/syntax#tables "http://www.dokuwiki.org/syntax#tables")
    for details on why.
6.  Paste your results into your DokuWiki and bask in glory.


Source
------

For those too lazy to click links, here's the source:

<script src="https://gist.github.com/2577157.js"> </script>
