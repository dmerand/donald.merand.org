---
layout: post
title: DNS is a Thing that People Hack Now, I Made an Open-Source App to Help
category: code
tags: dns ruby gem cli
---

[This article](https://krebsonsecurity.com/2020/01/does-your-domain-have-a-registry-lock/) about recent DNS hijacking attacks is a wake-up call. I recommend you read it, but here's a bit of a summary in case you're not a big link-clicker (emphasis mine):

> In the case of e-hawk.net, however, the scammers managed to trick an OpenProvider customer service rep into transferring the domain to another registrar with a ... social engineering ruse — and without triggering any verification to the real owners of the domain.

These folks were able to hijack DNS using old-fashioned social engineering techniques. They got a domain registrar to transfer a domain over the phone! Then they stole all of the data.  Okay, there's a lot more to it, you should maybe go read the article... 

The big take-home actions for me (they're listed at the end of that article) were:

1. Set up multi-factor authentication at your domain registrar. If they don't do multi-factor, consider changing to a registrar that does, because you are now at risk due to their lax security.
1. Configure DNSSEC signing zones + validating responses. See above if your registrar doesn't have this.
1. Lock your domains with a [domain lock](https://www.icann.org/resources/pages/locked-2013-05-03-en). This is different from a "transfer lock" because it requires a laborious personal contact process to undo. This is what you want once your domain is configured correctly. Don't do it until you've got things configured correctly!
1. Monitor your DNS

On that last point, I have some news for you:

# DNS-Monitor, a New Ruby-Based CLI Tool

I found myself wishing that I had a little robot to monitor all of my hostnames and warn me if there were any changes to them. So, I wrote that app yesterday and open-sourced it as the [DNS-Monitor Gem](https://github.com/exploration/dns-monitor). The big thing you get is a command-line utility called `dns-monitor`. Here's how it works:

1. You feed it a text file with all of your host names (just one line per host).
1. You figure out the [RDAP](https://en.wikipedia.org/wiki/Registration_Data_Access_Protocol) (JSON WHOIS) endpoint of your domain registrar. I've done zero research on who uses RDAP, but it seems like a thing many of them use? [Where I work](https://www.explo.org), we use [Pair Networks](https://pairdomains.com), so I put their server in as a default, but you can change it with the `-u` or `--rdap_url` flag.
    - Note that in the current configuration, I'm assuming only one registrar (because that's what we have). Send a pull request if you'd like to add the ability for multiple RDAP servers! :)
1. You run the app like this: `dns-monitor --check` or `dns-monitor -c`. It will run through your list of hosts, and compare the current RDAP (WHOIS) value for that host with a (SQLite3) database of previous values.
1. The output of the program is a JSON array of all of your domain RDAP (WHOIS) information, with a diff showing changes for any domains that have them.
1. At work we use Google Hangouts Chat for 'bot notifications, and Mandrill for transactional email, so I put in some extra functionality for those two things. If you send a Mandrill API key + email you can get email notifications if any domain has changed. But even if you use neither of those things, you can just pipe the program output into whichever utility you do use.

I'm using it currently, and it works pretty well for my use case. If you'd like to give it a try, just `gem install dns-monitor` to get it for yourself. Here's an example cron script for how we use it in practice. It does some extra work to specify where the `hosts.txt` and database files live:

<script src="https://gist.github.com/dmerand/236fd3f66ebc751dbf0e9c3fb56350db.js"></script>

In summary, DNS is scary now, I hope this helps. Send me a note if you end up using it!
