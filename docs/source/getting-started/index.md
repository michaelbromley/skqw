---
title: Getting Started
date: 2016-08-20 06:48:50
---

## Installation (Windows / Mac)

1. Go to the [releases page](https://github.com/michaelbromley/skqw/releases) to get the latest installer binary for your platform. On Windows, the app will be installed to `Users/<username>/AppData/Local/SKQW`, but should automatically create a shortcut on the desktop.
2. Then get some visualizations from the [SKQW library repo](https://github.com/michaelbromley/skqw-library). You can download a [zip with the full contents here](https://github.com/michaelbromley/skqw-library/archive/master.zip). Unzip somewhere.
3. In SKQW, open the settings panel by clicking the icon in the top right.
4. Open up the "library path" selector and point it to where you unzipped the files from 2.

#### Notes:
* The installer is not signed. This means Windows will warn you that it is not trusted and you shouldn't install it. If you trust me, you can disregard this warning ;) If there is enough interest I will consider purchasing a code-signing certificate to make such warnings go away.
* This is beta software. It is likely you will encounter bugs. Please open issues in this repo (if you know how) so I can fix them for the next release.

## Building From Source (Windows / OS X / Linux)

I develop SKQW on a Windows machine, so I can only provide exact instructions for building on Windows for now. Since SKQW makes use of a natively-compiled node addon for sound card access, it needs to be compiled on the target platform.

Those who are familiar with compiling electron apps and native node modules on OSX / Linux may be able to follow along with these instructions and modify the platform-specific parts. If you succeed, please let me know how you did it, so I can add instructions for those platforms.

### Requirements

- [**Windows**] Visual Studio (for compiling the native node modules). You can download the [community edition](https://www.visualstudio.com/en-us/products/visual-studio-community-vs.aspx) for free. [**OS X / Linux**] See the [node-gyp docs](https://github.com/nodejs/node-gyp#installation) for requirements for compiling native addons.
- [**Windows 7 only**] [Windows SDK version 8.1](https://developer.microsoft.com/en-us/windows/downloads/windows-8-1-sdk) or above - only applicable if you are on Windows 7 or below.
- [Node](https://nodejs.org/en/). Make sure the node version is 64-bit for building for x64 versions of Windows, and vice-versa.
- [**Windows**] If you have Visual Studio 2015 update 3+, make sure your npm version is > 3.10.5, otherwise you will get an error when trying to run `dist:win64`

### Steps to Build

1. `git clone https://github.com/michaelbromley/skqw.git`
2. `npm install` - installs the dev dependencies
3. `cd src`
4. `npm install` - installs the runtime dependencies (native node addons)
5. `cd ..`
7. `npm run typings:install` - install global type definitions for TypeScript.
6. `.\node_modules\.bin\electron-rebuild.cmd -m src/node_modules` - rebuild the native modules for electron
7. `npm run app:build` - build the app
8. `npm run electron:start` - test the app in dev mode
9. `npm run dist:win64` - create a Windows 64-bit binary. Will be created in the `dist` folder.

##### Build issue with Node 6.4.0 / Windows

I just upgraded to Node 6.4.0. This caused some problems with incompatible dependencies which have not upgraded some of their own dependencies to newer versions. Here's what I needed to do to get the build to work:

1. Update the npm version inside electron-rebuild to the latest version, so that we get a newer node-gyp which does not break with VS2015 update 3.
