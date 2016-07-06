# SKQW

![SKQW Logo](src/assets/images/logo.svg)

A native desktop audio visualizer, built with Electron and Angular 2.

SKQW (pronounced "skew") allows you to visualize the audio output of you computer's sound card. Visualizations are written in JavaScript.

## Building From Source

I develop SKQW on a Windows machine, so I can only provide instructions for building on Windows for now. I intend to eventually provide builds for OSX and Linux too.

### Requirements

- Visual Studio (for compiling the native node modules). You can download the [community edition](https://www.visualstudio.com/en-us/products/visual-studio-community-vs.aspx) for free.
- [Node](https://nodejs.org/en/). Make sure the node version is 64-bit for building for x64 versions of Windows, and vice-versa.

### Steps to Build

1. Clone this repo
2. `npm install` - installs the dev dependencies
3. `cd src`
4. `npm install` - installs the runtime dependencies (native node modules)
5. `cd ..`
7. `npm run typings:install` - install global type definitions for TypeScript.
6. `./node_modules/.bin/electron-rebuild.cmd -m src/node_modules` - rebuild the native modules for electron
7. `npm run app:build` - build the app
8. `npm run electron:start` - test the app in dev mode
8. `npm run dist:win64` - create a Windows 64-bit binary. Will be created in the `dist` folder.

## Roadmap

Here is a rough list of things I want to add:

- Hosted binaries for Windows, OSX & Linux
- A decent library of visualizations
- Dev guide for visualization authors
- Chromecast support.
