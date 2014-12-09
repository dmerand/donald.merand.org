---
layout: post
title: Converting from Notational Velocity to GitHub's Atom
category: code
tags: code osx text notational atom editor
---

I used Notational Velocity (the [nvALT fork](http://brettterpstra.com/projects/nvalt/), writing the notes in Markdown and synching them via Dropbox/Google Drive, for 3-4 years. I've recently made the switch to GitHub's [Atom](http://atom.io) for note-taking, because a) I was concerned about the lack of development on the Notational projects and b) I wanted a few customizations to the user experience without having to hack the source and re-compile that project etc. Atom seems like a much more extensible editor, so I'm trying it on the theory that I can make it very Notational-like. It's been working very well for the way I use it for about a month now.

Here are some of the things I do to make it more NV-like / use it like I used NV:

- Used [an OS X service keyboard shortcut](http://www.macosxautomation.com/services/learn/tut01/index.html) to make the application launch with a hotkey. This was my favorite part of NV and Atom lacks it as a built-in option.
- I still keep all of my notes in one single folder, like NV did. This aids sync, and makes it so I can do a ⌘-Shift-F to do a search of all notes, similar to the "omnibar search" of NV.
- For simpler note reference, or where I already know the note title, I use the ⌘-T keyboard shortcut to call up the "file opener" dialog window.
- If you want the "notes list" like you had in NV, you can use the ⌘-\ keyboard shortcut to show the "Tree View", which is pretty similar, especially if (like me) you had the notes list on the left in NV.
- I also made some stylesheet changes so that my text editing is always centered in the pane, and the line numbering in the left gutter is right-justified:

```css
// always center the scroll view
atom-text-editor {
  .gutter {
  -webkit-flex: 1;
  text-align: right;
    .line-number {
      width: 100%;
    }
  }

  .scroll-view {
  padding-left: 10px;
  -webkit-flex: 3;
  }
}
```

Other things that I can do now that I couldn't in NV:

- [VIM Mode](https://github.com/atom/vim-mode). Yay for using VIM shortcuts in my note-taking app! YMMV. I also installed a plugin that lets me open files in VIM for when the VIM mode plugin doesn't cut it (regex search/replace comes to mind)
- [Markdown PDF Export](https://github.com/travs/markdown-pdf)
- [Solarized](http://ethanschoonover.com/solarized) color scheme, both for editing and UI. I had to hack NV to make this work.

Hopefully some of that info is helpful to those of you considering making the switch.
