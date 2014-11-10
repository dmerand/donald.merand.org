---
layout: post
title: Doing One Thing Well with SetGetGo
category: code
tags: setgetgo code web cli
---

The [UNIX philosophy](https://en.wikipedia.org/wiki/Unix_philosophy#McIlroy:_A_Quarter_Century_of_Unix) has been a real guiding force in my work with computers:

    Write programs that do one thing and do it well. Write programs to work together.
    
I may have [alluded](http://donaldmerand.com/code/2011/09/20/tsv-the-best-spreadsheet-format.html) to this [before](http://donaldmerand.com/code/2012/07/20/how-i-actually-convert-dokuwiki-to-latex.html) without ever explicitly stating it, but the designers of UNIX really had it right. The best programs are the ones that stick to a limited problem domain, but *really nail it* within that domain. The worst programs (Microsoft Word comes to mind) try to branch out and solve every problem for everybody, and end up getting in the way of everybody's workflow with all of their options. In UNIX, you chain simple programs together and they give you immense power.

A few years back, I came across the [SetGetGo API](http://setgetgo.com/), and only recently noticed how perfect this service is at what it does, and how much I've come to rely on it. I use it in two ways: remote variable storage, and random word generation.


## Remote Variable Storage with SetGetGo

This is the most basic usage of the SetGetGo API, and all I did was write a couple of simple command-line wrappers around it called [wwwset](https://github.com/dmerand/dlm-dot-bin/blob/master/wwwset) and [wwwget](https://github.com/dmerand/dlm-dot-bin/blob/master/wwwset). 

When I'm in the command line, I can call `wwwset key value` and it sends the key/value pair off to the SetGetGo server for storage. As long as I'm using the same API key, I can retrieve that value from any computer anywhere with `wwwget key`. This has been the building block of many a shell script, and even for use as a temporary scratchpad or for sending values to others.

Obviously, the caveat of this service is that your data is stored on the SetGetGo servers. If I were to use it for anything serious (I dunno, password storage, say), I'd probably encrypt my values before sending them off. Maybe someday I'll update the script with GPG hooks for that kind of thing.

## Generating Random Words with SetGetGo

The makers of SetGetGo also helpfully provide a [random word API](http://randomword.setgetgo.com/). I use these in my work almost every single day. For example, I'll use them to generate passwords for my users by generating 10 or twenty random words, and picking a few to string together in combination. By using words that aren't real, and combining at least two or three words together, with spaces, you make a password that is hard to crack against a dictionary, takes too long to crack with brute force, but that is surprisingly simple to remember and type in, especially on a mobile keyboard. I also use random words as my name on social media services where I want to fly more under the radar.

My implementation of this is similar to `wwwset` and `wwwget`. I made a shell script called [randomword](https://github.com/dmerand/dlm-dot-bin/blob/master/randomword). You call it with the number of random words you want like this: `randomword 10`, and it returns the string of them.

I made another web-based implementation of this for the others in my office who aren't as apt to open up a [terminal](http://www.iterm2.com/#/section/home) as I am. That one is hosted on Explo's lab; you can visit it [here](http://lab.explo.org/randomword).

Simple utilities like these really ease along the workday for information workers. You might not use it for 3 months, but when you do it's really handy to have it in your back pocket. That's what coding is all about!
