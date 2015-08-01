# SKQW

Yet another audio/canvas thing. 

The aim is to be able to visualize any sound playing on your computer - a universal visualizer than can be programmed in JavaScript.

Work in progress.

If you are feeling brave and want to check this out already, then clone or download the repo and then `npm install` it. 

Note that the node-core-audio module needs to compile a dependency (PortAudio) using node-gyp. This initially caused problems for me using Windows 8, but I managed to get it to compile by using a flag to specify the version of Visual Studio I have (2013):
`npm install --msvs_version=2013`

###Version of nodejs
Until now the core-audio utility only works with nodejs 0.10

##Mac osx install
First you will need [Xcode](http://itunes.apple.com/us/app/xcode/id497799835?ls=1&mt=12) wich can be downloaded from the App Store, and the command line tools.

To install the command line tools simply run:

`$ xcode-select --install`

Using [homebrew](http://brew.sh/) and the versions tap it is possible to install nodejs version 0.10

If you already have installed node before first delete the installed version with:

`$ brew uninstall --force node`

Then tap versions:

`$ brew tap homebrew/versions`

Now install node 0.10 with:

`$ brew install homebrew/versions/node010`

Now you are ready to npm install this repository

If you get it all installed, then run `node server/server.js` and go to `localhost:3000` in your browser.
