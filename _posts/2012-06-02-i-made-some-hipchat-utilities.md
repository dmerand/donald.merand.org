---
layout: post
title: I Made Some HipChat Utilities
category: code
---

We recently converted to [HipChat] at one of my jobs. Because we're geographically distributed, we need a solid chat client to handle our internal discussions. We landed on HipChat after trying a bunch of others such as CampFire, Skype, GChat/IM. The thing is, it's not any one feature that makes it killer for getting things done. It's the combination of _all the things_, and how well they all work together.

For example, when you upload a file it's stored at Amazon (S3), and is available forever, no matter what your client. That is rad. There are clients for any conceivable device, especially considering that there's XMPP/Jabber integration, so you could even use your favorite chat client to connect in that way. As a bonus, the search is good, which you'd expect except that all other clients have non-existent or crappy search. That's just a few examples, but in short there are no barriers to getting in contact with people and sharing stuff, which makes it ideal for distributed teams.

Also, there's a API for it, which I love. I love it so much that I wrote *two* different interfaces to it. I wrote [FMHipChat] for posting from FileMaker, and I wrote a [HipChat CLI][HipChatCLI] (command line) client as well, mostly because I didn't notice that [there already was one](https://github.com/hipchat/hipchat-cli).



FMHipChat
=========

Yeah, so I made a utility for posting messages to HipChat from FileMaker. It's called [FMHipChat] and you can find it on my [GitHub][dlm_github] page. The super, awesome, amazing thing about it is that it is cross-platform, and should even work from FileMaker Go! I managed to do cross-platform POST to the API by using a webviewer that constructs a dynamic HTML form, then posts it automatically via javascript. It's a technique that's worth a look, though slow. I also included an alternate, OSX-only version that uses CURL, master of the URLs, to do API calls, and it's fast as can be.

There are some caveats to using the file, such as the fact that you have to get an API key, and import your group's rooms before the thing works. But, you know, there _are_ instructions on how to do that.

I imagine using it mainly as a notifier for the end of long script runs, but let me know if you've got some novel use..


HipChat CLI
===========

If you're like me (got this far? you're probably like me.), then you probably wanna post to HipChat from some shell scripts every now and then. Say a CRON job that runs an `fmsadmin` task, or something like that. So I cooked up a [real nice client][HipChatCLI] for that as well.

Similar caveats to FMHipChat apply - you need an API token, and you have to modify the script to use it.

Usage is pretty simple - type `hipchat -h` for options.

By the way, while you're at [GitHub][dlm_github] check out some of the [other shell scripts](https://github.com/dmerand/dlm-dot-bin) I wrote that I use from time to time.

Thanks for reading, and happy HipChatting.

[HipChat]: https://hipchat.com "Chat it up real nice"
[FMHipChat]: https://github.com/dmerand/FMHipChat "FMHipChat - Post to HipChat from FileMaker!"
[HipChatCLI]: https://github.com/dmerand/dlm-dot-bin/blob/master/hipchat "HipChat from the CLI"
[dlm_github]: https://github.com/dmerand/ "Donald Merand on GitHub - epic."
