![SKQW Logo](src/assets/images/logo.png)

A native desktop audio visualizer, built with Electron and Angular 2.

SKQW (pronounced "skew") allows you to visualize the audio output of you computer's sound card. 

It is inspired by my love of the old Winamp plugins like [Milkdrop](https://www.google.com/search?tbm=isch&q=milkdrop+plugin+visualization) and [Geiss](https://www.google.com/search?q=geiss+plugin+visualization&tbm=isch).

Visualizations are written in JavaScript and use HTML Canvas (2d or 3d) to render.

## Installation (Windows)

1. Go to the [releases page](https://github.com/michaelbromley/skqw/releases) to get the latest installer binary. The app will be installed to `Users/<username>/AppData/Local/SKQW`, but should automatically create a shortcut on the desktop.
2. Then get some visualizations from the [SKQW library repo](https://github.com/michaelbromley/skqw-library). You can download a [zip with the full contents here](https://github.com/michaelbromley/skqw-library/archive/master.zip). Unzip somewhere.
3. In SKQW, open the settings panel by clicking the icon in the top right.
4. Open up the "library path" selector and point it to where you unzipped the files from 2.

#### Notes:
* The installer is not signed. This means Windows will warn you that it is not trusted and you shouldn't install it. If you trust me, you can disregard this warning ;) If there is enough interest I will consider purchasing a code-signing certificate to make such warnings go away.
* This is alpha software. It is likely you will encounter bugs. Please open issues in this repo (if you know how) so I can fix them for the next release.
* I would love to make installers for Mac OS X and Linux, but I have not had the opportunity yet. If you want to see them too, [let me know](https://twitter.com/michlbrmly)! In the mean time, if you feel brave, you can try building from source (see below).


## Writing Visualizations

- [SKQW developer guide - intro](./docs/dev-guide.md)
- [SKQW API Docs](./docs/api.md)

## Building From Source (Windows / OS X / Linix)

I develop SKQW on a Windows machine, so I can only provide instructions for building on Windows for now. 

I intend to eventually provide instructions and pre-built binaries for Windows, OSX and Linux.

Those who are familiar with compiling electron apps and native node modules on OSX / Linux may be able to follow along with these instructions and modify the platform-specific parts. If you succeed, please let me know how you did it, so I can add instructions for those platforms.

### Requirements

- Visual Studio (for compiling the native node modules). You can download the [community edition](https://www.visualstudio.com/en-us/products/visual-studio-community-vs.aspx) for free.
- [Windows SDK version 8.1](https://developer.microsoft.com/en-us/windows/downloads/windows-8-1-sdk) or above - only applicable if you are on Windows 7 or below.
- [Node](https://nodejs.org/en/). Make sure the node version is 64-bit for building for x64 versions of Windows, and vice-versa.

### Steps to Build

1. Clone this repo
2. `npm install` - installs the dev dependencies
3. `cd src`
4. `npm install` - installs the runtime dependencies (native node modules)
5. `cd ..`
7. `npm run typings:install` - install global type definitions for TypeScript.
6. `.\node_modules\.bin\electron-rebuild.cmd -m src/node_modules` - rebuild the native modules for electron
7. `npm run app:build` - build the app
8. `npm run electron:start` - test the app in dev mode
9. `npm run dist:win64` - create a Windows 64-bit binary. Will be created in the `dist` folder.

When you fire it up, you should see the default visualization. You can set the visualization library folder in the settings panel (click the icon in the top right), then select the `skqw/visualizations` folder.

Currently there are only some work-in-progress tests, but that should give you an idea of how it works.

## Roadmap

Here is a rough list of things I want to add:

- Hosted binaries for Windows, OSX & Linux
- ~~Test with WebGL / Three.js ~~
- A decent library of visualizations
- Dev guide for visualization authors
- Saving of presets
- Built-in beat detection?
- Chromecast support? 

## Troubleshooting (Windows)

#### Visualizations don't react to audio
In the Windows "sound" dialog (right click icon in system tray), go to "recording devices" tab and make sure "stereo mix" is enabled and not muted.
