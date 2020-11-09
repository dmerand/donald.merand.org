---
layout: post
title: ExAirtable - Airtable in your Elixir
description: If you use Elixir and like Airtable, check out a new library I wrote called [ExAirtable](https://github.com/exploration/ex_airtable].
category: portfolio
tags: elixir airtable phoenix cms
---

**tl;dr: If you use Elixir and like Airtable, check out a new library I wrote called [https://github.com/exploration/ex_airtable](ExAirtable).**

At [EXPLO](https://www.explo.org), we often reach for [Airtable](https://airtable.com) when we're trying out new ideas. We love it because it really reduces friction for putting together simple relational systems that are the backbone of knowledge work. We are also very happy with [Elixir](https://elixir-lang.org) and [Phoenix](https://www.phoenixframework.org) when it comes time to build apps for the web, which seems to happen more and more these days!

I've often wondered whether we could use Airtable as a content management back-end for some of these sites. It solves a few problems that we consistently have:

1. A simple and consistent management front-end that includes relational data along with tabular views, forms, calendars, etc.
2. File-hosting and image auto-resizing! You just make a "file" field type and you can upload files right into your 'tables. Images get automatically scaled to a variety of sizes.
3. API! Every project has the same API structure and the API is sane to use.

We've used Ruby with Sinatra or Rails and the excellent [AirRecord ](https://github.com/Sirupsen/airrecord) library to do Airtable-based sites before. But for Elixir, the current set Airtable API libraries didn't seem to be in active development, and didn't have features like rate-limiting or caching. But it would be so cool if we had an Elixir library that would allow us to handle Airtable rate-limiting and caching as a single Elixir-native dependency! 

Meanwhile, Ricardo Garcia Vega wrote [this amazing article](https://dev.to/bigardone/headless-cms-fun-with-phoenix-liveview-and-airtable-pt-1-4anj) demonstrating the use of Elixir and Phoenix as a caching layer for Airtable for a content management system. This "native" Elixir solution was just the push I needed to fix Elixir's Airtable library problem.

So here's the buried lede: I wrote an Airtable library (actually two! read onward...) for Elixir called [ExAirtable](https://github.com/exploration/ex_airtable). This library aims to provide a solid foundation to use Elixir ([with](https://github.com/exploration/ex_airtable_phoenix) or without Phoenix) with Airtable interaction. It handles rate-limiting against the Airtable API, and (optionally) caches all requests in local memory to drastically speed up reads.

## A Solid Foundation

I designed ExAirtable to work in two different ways:

1. Just hit the Airtable API directly. Don't worry about rate limits too much and give me all of the pages of data when I want a list. You'd use this method if you have a simple case where you don't expect things to get crazy in terms of number of requests or size of data.

2. Run as a supervised, cached, and rate-limited server tree. All client requests will go into a per-base queue which will never exceed 5 API requests per second. All desired data will be stored in an in-memory cache that is periodically refreshed via the API. Client request retrieved from the cache whenever possible to drastically speed up read times. This mode is useful when you're dealing with larger bases or apps that may have a lot of clients performing read and write operations.

Here's how the system comes together:

![ExAirtable - System Overview](https://dev-to-uploads.s3.amazonaws.com/i/sg85ziscccoxl6v3g3io.png)
 
If you decide to run the service in cached and rate-limited mode, here's how the supervision tree comes together:

![ExAirtable - Supervision Structure](https://dev-to-uploads.s3.amazonaws.com/i/guy0qqcj9n0ntrezyc34.png) 

If folks are interested, I can write more articles with code examples. In the meantime [the documentation](https://hexdocs.pm/ex_airtable/ExAirtable.html) has tons of examples and information. I've tried hard to make it comprehensive and useful all by itself, which is a truly game-changing trick that I've learned from the Elixir community.

## Use with Phoenix and/or Ecto

Realistically, most folks who want to try this with Elixir are going to use Phoenix as their application framework. Since Phoenix plays so well with Ecto, I found it beneficial to create a set of conventions around creating ExAirtable Table models in an Ecto context with embedded schemas.

That library (called ExAirtable.Phoenix) is here: <https://github.com/exploration/ex_airtable_phoenix>

Once again, I can write more follow-up if folks are interested. In the meantime, give it a try and let me know what you think!
