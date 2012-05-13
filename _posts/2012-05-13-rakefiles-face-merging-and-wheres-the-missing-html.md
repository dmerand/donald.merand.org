---
title: Rakefiles, Face Merging, and Where's the Missing HTML?
layout: post
category: code
---

Face Merging
------------

At [Explo](http://www.explo.org), we take an ID photograph for each student and faculty member when they show up. We take the photos with a mobile device, and within a day they get a lanyard with their photo ID, which they have to carry around all summer. It's nice when you've got 3000 students across three campuses, running field trips all over New England and beyond, to be able to tell who is associated with Explo and who isn't.

Recently I had the idea: we've got these 3000 photo IDs, what does the "average" Explo person look like? I did a quick search online for things like "face morph", "merge faces", etc, and you'd be surprised at the proliferation of [hideously](http://www.mergingfaces.com/Index.php) [designed](http://www.morphthing.com/) sites claiming to do this. Most of them allow you to merge two different photographs together. None of them allow uploading of 3000 images :)

I don't have the time to create a solution which does [facial geography mapping](http://www.faceresearch.org/demos/average) and morphs each image into another face, so I figured an approach more like [Francis Galton's](http://www.faceresearch.org/tech/prototyping) "multiple exposure" method from the 1800s, except using computers, would be the ticket. Now I love me some [ImageMagick](http://imagemagick.org) and [BASH scripting](http://tldp.org/LDP/abs/html/), so I figured I could probably do this that way.

I knew I had to present the results in a better way than just emailing a photo to my coworkers, so [I made a website](http://www.explo.org/facesofexplo) to display the results and the process. Go [check it out](http://www.explo.org/facesofexplo). That page also has more about my failed attempts and what's going on. You can also view the source of the [image merge](https://gist.github.com/2490678) script I wrote, and the [source for the entire "Faces of Explo" page](https://github.com/exploration/faces-of-explo).



Rakefiles
---------

"Wait," you're asking, "You promised me rakefiles! You promised me HTML!" You're absolutely right, thanks for hanging in there, I'm getting to that.

Since creating the web page itself was a relatively trivial process, I thought I'd take the opportunity to try out a couple of new things that had been on my list of cool things I keep reading about on [Hacker News](http://news.ycombinator.com/). One of those things is using a Rakefile to help with development and deployment. For those of you who don't know what the hell that is, I found [these](http://jasonseifer.com/2010/04/06/rake-tutorial) [three](http://railscasts.com/episodes/66-custom-rake-tasks) [articles](http://www.jbarnette.com/2009/08/27/on-rake.html) to be immensely helpful. In short, you write a file that contains the typical things you'd want to do in whatever software project you're working on, and you can quickly access them from the shell. 

For example, on this project, I wanted to be able to:

- Watch/compile my [CoffeeScript](http://jashkenas.github.com/coffee-script/) and [SCSS](http://sass-lang.com/) while I was developing without always having to open up two tabs in my terminal and run the watcher routine for both.
- Compress, strip, interlace, and otherwise prepare any image files for the web.
- Deploy the entire site using rsync (since this is a static site).

I managed to be able to do all of that. Now I can type things like `rake compile:all` or `rake deploy` instead of having to remember the command line incantation every time I just want to make a simple change. [Here is the rakefile](https://github.com/exploration/faces-of-explo/blob/master/Rakefile) – I owe much to the rakefile from the [Octopress](http://octopress.org/) project, which is a nice thing to behold.


Where's the Missing HTML?
-------------------------

Take a look at [the source for the Faces of Explo index HTML page](https://github.com/exploration/faces-of-explo/blob/master/public/index.html). If you write any HTML code at all, a few things will probably stick out for you immediately: "Hey! He's not closing any of his paragraph tags? Where's the HTML tag? Where's the body? WHAT THE HELL IS GOING ON HERE?"

That's what I would have thought a week ago looking at the source. That's before I read [Google's HTML/CSS StyleGuide](http://google-styleguide.googlecode.com/svn/trunk/htmlcssguide.xml). As it turns out, [many HTML tags are optional](http://google-styleguide.googlecode.com/svn/trunk/htmlcssguide.xml?showone=Optional_tags#Optional_tags) in HTML5. Whoa. As they say in the guide, 

> (This approach may require a grace period to be established as a wider guideline as it is significantly different from what web developers are typically taught. For consistency and simplicity reasons it is best served omitting all optional tags, not just a selection.)
    
Why is it that nobody's talking about this new part of the HTML5 spec? I've been reading the cool "learn HTML5" sites, and haven't seen anything about this. I learned it from a footnote in the Google styleguide: let's bring this syntax into a wider discussion.

I've found that you can learn a lot from a style guide. Since they are a condensation of all the things that bug people when they read other people's code, they are a good guideline for how to write good code, even if you don't necessarily agree with everything they say. I for one am probably not going to use the abbreviated HTML syntax in my bigger public-facing pages just yet, as I'm concerned about it breaking on older browsers, and maybe even breaking tools like [Modernizr](http://www.modernizr.com/).



The Takeaway
------------

Stay away from doing Google searches for image morphing, use Rakefiles for automating development tasks, and read other people's style guides - you might learn something fascinating! Thanks for reading.
