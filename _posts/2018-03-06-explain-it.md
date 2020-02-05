---
layout: post
title: Explain It Like I’m {[5, 10, 15, 20]}
category: code
tags: explainlikeimfive, pedagogy
---

__Note: This was originally published on [dev.to](https://dev.to/explo/explain-it-like-im-5-10-15-20--4odf), where it makes a bit more sense contextually.__

According to [Richard Feynmann](https://kottke.org/17/06/if-you-cant-explain-something-in-simple-terms-you-dont-understand-it), the true measure of understanding a concept is to be able to relate it to a toddler. This is what I love about [#explainlikeimfive](https://dev.to/t/explainlikeimfive) channels: explaining tech concepts in a couple of pithy paragraphs, without too much technical jargon, is a fun challenge to see if I myself truly understand the concept. I [may](https://dev.to/dmerand/comment/2fih) [have](https://dev.to/dmerand/comment/2fn5) [a](https://dev.to/dmerand/comment/2fn1) [problem](https://dev.to/dmerand/comment/2fnn) with compulsively commenting on these discussions...

But there _is_ one thing that bothers me: I'm not sure that the asker always wants an answer suitable for a five-year-old! Five-year-olds aren't typically concerned with specific terminology, but responses to [#explainlikeimfive](https://dev.to/t/explainlikeimfive) are often very jargon-heavy. The requester may have wanted that, but that's not an answer you'd want to give a 5-year-old! Not that it matters whether the requester _truly_ wanted a 5-year-old response versus a 7-year-old response, or what-have-you. What truly matters is that when your response doesn't match the question, you run the risk of being ignored or misunderstood.

I think understanding these nuances is fun! I'm going to try explaining the same concept to a theoretical 5, 10, 15, and 20-year old. In doing this, I hope to learn something about my own process of teaching, and hopefully find some varying approaches that work well. I'll attempt to [Explain Git + GitHub Like I'm Five](https://dev.to/webdevdeja/explain-git--github-like-im-five--3pak) (and Ten, and Fifteen, and Twenty).

## #EXPLAINLIKEIMFIVE
One good way to #explainlikeimfive is to tell a short story which is an analogy. Five-year-olds aren't typically concerned with specific terminology, but they are very good at understanding metaphor. Your goal here would be to get them to understand how this idea solves a problem that's very similar to one that they may have had.

> Say you are writing a short story and you want to do a really good job. You might write the story on one sheet of paper, and then get another sheet of paper and write another version, and then keep writing more versions on more sheets of paper. After a while, you'd end up with lots of sheets of paper that weren't the version you were currently writing. You might put those sheets in a folder so that you can go back and see old drafts of your story.
>
> You give that folder to your mom to keep track of, because you know that you can always ask mom for one of the versions of your story if you need it. Plus, mom keeps photocopies so she can give versions of your story to your siblings. Mom also keeps similar folders for the stories that your siblings write.
>
> `Git` is the folder, and your pieces of paper are `code`. Your mom is `GitHub`.

Notice that in the story above, technical terms aren't integrated into the story, and the list of actual terms is drastically simplified (and could be omitted entirely without negatively impacting understanding).

## #EXPLAINLIKEIMTEN
Ten-year-olds are ready for terminology, but they can lose a thread if you digress too much or get too technical. You can still succesfully employ an analogy, but they also tend to enjoy more integrated references to technical terms. [Thing Explainer](https://xkcd.com/thing-explainer/) by Randall Munroe is another approach that works - explain how a thing works using universal words and concepts, because at ten, people tend to understand all of the truly important concepts already.

> Think of computer `apps` as stories. Say you are writing a story and you want to do a really good job. You might write several revisions of your story. You don't want to lose your revisions though - what if you had a good idea earlier that you want to revisit later? So you decide to keep all of your revisions in a folder. You can think of `git` as the idea of folders that hold revisions, and your `repository` (or `repo`) is the folder that holds this one story you're writing, and all of its revisions.
>
> You might want to share the story that you're writing! Maybe you want to share the writing with friends, or maybe you just want a place for folks to go to read it. `GitHub` is such a place - a web `app` that holds your `repos`, and gives you a `web site` for them to share. From `GitHub`, anybody you allow can get their own photocopy of your story, and make changes to their copy. In `git` that's called a `fork`. If the person who `forked` your `repo` wants to share their changes with you, so that you can have them in your `repo`, they can give you a `pull request` on `GitHub` - a bit like handing you a version of your story with changes in red, and asking you to use that as your story instead.

## #EXPLAINLIKEIMFIFTEEN
At fifteen, people are capable of truly excelling in areas that interest them. They can handle terminology and abstract concepts: metaphor, while helpful, isn't a tool you need to lean on quite so much. But you might still be dealing with a short attention span, so keep your descriptions on-topic and don't concern yourself too much with asides.

> Say you are writing some code, but you worry that when you change your code you might want to `undo` your changes. So you need a `version control` system that you can tell "I've made some changes, please remember them". `Git` is an example of a version control system. Your `repository` or `repo` is your code, which you `check in` or `commit` to your version control system as you work. Later, you might create other `git` `repos` for other code projects you're working on.
>
> `GitHub` is an app that gives you a web site for your repo. Others can go to this web site, and download your repo to run the code, or make their own changes in their own copy (if they want to!). The idea of everybody getting their own copy of your `repo` and being able to make their own changes to it is called `distributed version control`. `GitHub` gives you the ability to manage `pull requests`. `Pull requests` are changes that other people have made to their copies of your `repo`, that they'd like you to include in (or `merge` into) your copy.

## #EXPLAINLIKEIMTWENTY
For a twenty-year-old, you can lay out all of your terms once, and then explain the concept using those fully-explained terms. A twenty-year-old can be expected to look up words in the dictionary, or check out concepts on Wikipedia, without needing prompting, so you don't need to belabor your explanations. Your job is to explain how those terms relate to each other. You can also diverge a bit into related topics without worrying that the person will lose track of the main thread.

> `Git` is a `version control system` (`VCS`), similar to `CVS`, `SVN`, or `Mercurial`. A `VCS` is a system for `committing` code changes to a `code repository` (`repo`) in an `append-only` fashion such that at any given point you can see the history of all changes made to the code up to that point.
>
> `Git` is a `distributed version control system` (`DVCS`), meaning that if multiple people are working on the same code project, they each have an independent copy (a `fork`) of the `repo`, which can diverge from other copies. Changes from other copies (called `remotes` in `git`), are `merged` into a given `repo` through a text-based `differential comparison` `algorithm`. Changes in a given `repo` can also be `branched` and then `merged later`, to give the developer an opportunity to work on specific ideas without the pressure of `committing` them to the main `branch` of the `repo`. `Mercurial` is another `DVCS`, whereas `SVN` and `CVS` rely on a central "master" code `repo` on a `server`, which is typically referred to as a `trunk`.
>
> `GitHub` is a web app that provides a social network around `git` `repos`. `GitHub` will give each repo a unique `URL`, which can be used for `forking` or downloading a `repo`. `GitHub` also provides `pull requests`, wherein a developer can `fork` a `repo`, create changes, and then request that those changes be `merged` into another fork. `GitHub` provides other services such as `issue tracking`, `wikis`, `visualizations` of code history, and more. People often use services such as `GitHub` or `Bitbucket` because they don't want to have to manage their own git server, or because they want the extra features such as `pull requests` or `issue tracking`.

Notice that this version is the first time that alternatives to Git, such as SVN or Mercurial, even get mentioned. I'm assuming that a twenty-year-old will want to do further research if they're interested, so providing bigger context such as naming alternative approaches can be very helpful toward that end.

## Conclusion
Explaining things to people is fun! It is a good test of your personal knowledge on a topic, and it is also deeply rewarding to share knowledge with people who want to learn. Keeping your audience's abilities and desires in mind drastically increases the likelihood that what you say will be received and absorbed.

Do I think you should start using the hashtag #explainlikeimten or #explainlikeimtwenty just to be more precise? No, I do not! Please don't do that! I love that we have the one hashtag here which generally means "I'm new to this and would like some help." This was just a fun thought experiment meant to shed some light onto my own teaching process. I'm hoping that posting it here will be inspiring in some way!

Who have you found (here on Dev.to, or elsewhere) that's good at explaining? What is it that you like about their explanations?
