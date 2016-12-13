![SKQW Logo](src/assets/images/logo.png)

#### A native desktop audio visualizer, built with Electron and Angular 2.

SKQW (pronounced "skew") allows you to visualize the audio output of you computer's sound card. It is inspired by my love of the old Winamp plugins like [Milkdrop](https://www.google.com/search?tbm=isch&q=milkdrop+plugin+visualization) and [Geiss](https://www.google.com/search?q=geiss+plugin+visualization&tbm=isch). Visualizations are written in JavaScript and use HTML Canvas (2d or 3d) to render.

For installation, build, and development guides, see https://michaelbromley.github.io/skqw

## Guide to This Repo

Since this is an Electron app, you'll find the meat of the code split between the `src/main` folder for the main process code, and `src/render` for the render process (browser app) code.

The docs are generated from markdown files in the `docs/source` folder.

## Troubleshooting (Windows)

#### Visualizations don't react to audio
In the Windows "sound" dialog (right click icon in system tray), go to "recording devices" tab and make sure "stereo mix" is enabled and not muted.

## Credits

SKQW is built on top of the following open source projects:

* [node-core-audio](https://github.com/ZECTBynmo/node-core-audio) (using a custom fork)
* [Electron](http://electron.atom.io/)
* [Angular 2](http://angular.io/)
* [TypeScript](http://www.typescriptlang.org/)
* [Webpack](https://webpack.github.io/)
* [Hexo](https://hexo.io/) (for documentation site)
