---
layout: post
title: TSV - The Best Spreadsheet Format  
context: Code  
tags: TSV BASH awk  
---

There's no question that [Markdown](http://daringfireball.net/projects/markdown/) is the darling of the coding/internet/people who write communities. It's the default syntax at [GitHub](https://github.com/), [Stack Overflow](http://stackoverflow.com/), [Reddit](http://reddit.com) and others. A [lot](http://markedapp.com/) of [popular](http://brettterpstra.com/project/nvalt/) [text](http://itunes.apple.com/us/app/elements-dropbox-and-markdown/id382752422?mt=8) [editors](http://sourceforge.net/p/retext/home/ReText/) are built around it.

Markdown's appeal is its simplicity. It is easy to learn, and easy to read even in native form. It's easy to extend: the pages on this site, for example, are written in a Markdown variant -- something I'll write more about later.

Okay, we all love Markdown - great, but what does this have to do with spreadsheets? Well, there's a Markdown for spreadsheets, and it's been hiding in plain sight practically as long as we've had computers. -- tab separated variables. Think about it -- TSV format is so simple that you can view it on any device. You can import it into practically _any_ spreadsheet software. And it's one _hell_ of a lot easier to parse programatically than CSV format.

Parsing a CSV file is a pain in the ass. There are at least four different implementations, mostly centering around the concept of whether variables should be quoted or not, and under what circumstances, and what to do with internal quotes. The only question with TSV is... what to do if you want to put a tab in your data. Most software I've seen just substitutes a space, or a few spaces. But only one exception to catch means that when you're parsing a TSV file programatically you don't have to look for a lot.

There aren't a lot of great utilities out there for working with TSV files, so I'm going to post a couple that I use all the time.


# TSVFMT - A Spreadsheet for Your Command Line

I wrote this BASH script, which I've named `tsvfmt`, to address the problem of alignment when viewing TSV files in the command line or a text editor. It takes a TSV and uses awk to space it out and place a "|" character between columns. So this:

    this	is	a	test

... would become this:

    this | is | a | test | 

Here's the script:

{% highligh bash %}
#!/bin/sh
#tsvfmt - TSV Formatter
#Author: Donald L. Merand
#07.07.2011
#----------
#Takes a TSV file, and outputs a text-only representation of the table,
#+ justified to the max width of each column. Basically, you use it when 
#+ you want to "preview" a TSV file, or print it prettily.
#----------
#Accepts standard input, or piped/redirected files
#----------

#set this to whatever you want to show up between columns
field_separator=" | "

#take file input, or standard input, and redirect to a temporary file
#also, convert mac line-endings to UNIX ones
perl -p -e 's/(:?\r\n?|\n)/\r\n/g' > .tsv_tmp.txt

#now we're going to extract max record widths from the file
#send the contents to awk
cat .tsv_tmp.txt |
awk '
BEGIN {	
	FS="\t"
	max_nf = 0 
}
{
	for (i=1; i<=NF; i++) {
		#set the max-length to this field width if it is the biggest
		if (max_length[i] < length($i)) { max_length[i] = length($i) }
	}
	if (max_nf < NF) { max_nf = NF }
}
END {
	for (i=1; i<=max_nf; i++) {
		printf("%s\t", max_length[i])
	}
	printf("\n")
}
' > .tsv_widths.txt #store widths in a TSV temp file

#now start over by sending our temp file to awk. THIS time we have a widths
#+file to read which gives us the maximum width for each column
cat .tsv_tmp.txt |
awk -v field_sep="$field_separator" '
BEGIN {
	FS="\t"
	#read the max width of each column
	getline w < ".tsv_widths.txt"
	#split widths into an array
	split(w, widths, "\t")
	#get the max number of fields
	max_nf = 0
	for (i in widths) { max_nf++ }
}
{
	for (i=1; i < max_nf; i++) {
		printf("%-*s%s", widths[i], $i, field_sep)
	}
	printf("\n")
}
'
#now we're done. remove temp files
rm .tsv_tmp.txt .tsv_widths.txt

{% endhighlight %}

#	TSV2HTML - Convert a TSV File to an HTML Snippet

This one is a little more self-explanatory. Pass it a TSV file, either from STDIN or piped over, and it'll convert it to an HTML table. Best used in conjunction with [bcat](http://rtomayko.github.com/bcat/), which is _awesome_.

{% highlight bash %}
#!/bin/sh
#convert a TSV file to an HTML file
#author: Donald L. Merand

#note: this is most useful in conjunction with 
#bcat, which sends results to the browser
# you can get bcat on OS X using homebrew
# http://mxcl.github.com/homebrew/
# then type "brew install bcat"

#also note: this script only creates an HTML snippet.
# you'll probably want to wrap
# it in some pretty CSS, not to mention <html> and <body> tags

#convert Mac line endings, if any
perl -p -e 's/\r/\n/g' |

#now do the conversion
awk '
BEGIN {
	FS="\t"
	printf "&lt;table>\n"
}
{
	printf "\n\n&lt;tr>"
	for (i=1;i&lt;=NF;i++) {
		printf "&lt;td>%s&lt;/td>", $i
	}
	printf "&lt;/tr>"
}
END {
	printf "\n&lt;/table&gt;"
}'
{% endhighlight %}
