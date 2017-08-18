![SKQW Logo](src/assets/images/logo.png)

#### A native desktop audio visualizer, built with Electron and Angular.

SKQW (pronounced "skew") allows you to visualize the audio output of you computer's sound card. It is inspired by my love of the old Winamp plugins like [Milkdrop](https://www.google.com/search?tbm=isch&q=milkdrop+plugin+visualization) and [Geiss](https://www.google.com/search?q=geiss+plugin+visualization&tbm=isch). Visualizations are written in JavaScript and use HTML Canvas (2d or 3d) to render.

For installation, build, and development guides, see https://michaelbromley.github.io/skqw

## Guide to This Repo

Since this is an Electron app, you'll find the meat of the code split between the `src/main` folder for the main process code, and `src/render` for the render process (browser app) code.

The docs are generated from markdown files in the `docs/source` folder.

## Building From Source (Windows / OS X / Linux)

I develop SKQW on a Windows machine, so I can only provide exact instructions for building on Windows for now. Since SKQW makes use of a natively-compiled node addon for sound card access, it needs to be compiled on the target platform.

Those who are familiar with compiling electron apps and native node modules on OSX / Linux may be able to follow along with these instructions and modify the platform-specific parts. If you succeed, please let me know how you did it, so I can add instructions for those platforms.

### Requirements

- [**All platforms**] [Python 2.7](https://www.python.org/downloads/) is required for [node-gyp](https://github.com/nodejs/node-gyp) to build the native addon.
- [**Windows**] Visual Studio 2015 for compiling the native node addon. You can download the [community edition](https://www.visualstudio.com/en-us/products/visual-studio-community-vs.aspx) for free. VS 2017 is currently not well supported by node-gyp. Alternatively, install the [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools) package.
- [**OS X / Linux**] See the [node-gyp docs](https://github.com/nodejs/node-gyp#installation) for requirements for compiling native addons.
- [**Windows 7 only**] [Windows SDK version 8.1](https://developer.microsoft.com/en-us/windows/downloads/windows-8-1-sdk) or above - only applicable if you are on Windows 7 or below.
- [Node](https://nodejs.org/en/). Make sure the node version is 64-bit for building for x64 versions of Windows, and vice-versa.
- [**Windows**] If you have Visual Studio 2015 update 3+, make sure your npm version is > 3.10.5, otherwise you will get an error when trying to run `dist:win64`

### Steps to Build

1. `git clone https://github.com/michaelbromley/skqw.git`
2. `npm install` - installs the dev dependencies
3. `cd src`
4. `npm install` - installs the runtime dependencies (native node addons)
5. `cd ..`
6. `npm run electron:rebuild` - rebuild the native modules for electron
7. `npm run app:build` - build the app
8. `npm run electron:start` - test the app in dev mode
9. `npm run dist:win64` - create a Windows 64-bit binary. Will be created in the `dist` folder.

##### Build issue with Node 6.4.0 / Windows

I just upgraded to Node 6.4.0. This caused some problems with incompatible dependencies which have not upgraded some of their own dependencies to newer versions. Here's what I needed to do to get the build to work:

1. Update the npm version inside electron-rebuild to the latest version, so that we get a newer node-gyp which does not break with VS2015 update 3.


## Building The Docs

The docs are build with Hexo. In development, go to the `/docs` folder and run `hexo serve`

To deploy, run `hexo generate --deploy`

## Troubleshooting (Windows)

#### Visualizations don't react to audio
In the Windows "sound" dialog (right click icon in system tray), go to "recording devices" tab and make sure "stereo mix" is enabled and not muted.

## Credits

SKQW is built on top of the following open source projects:

* [node-core-audio](https://github.com/ZECTBynmo/node-core-audio) (using a custom fork)
* [Electron](http://electron.atom.io/)
* [Angular](http://angular.io/)
* [TypeScript](http://www.typescriptlang.org/)
* [Webpack](https://webpack.github.io/)
* [Hexo](https://hexo.io/) (for documentation site)
