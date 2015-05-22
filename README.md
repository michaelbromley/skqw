# SKQW

Yet another audio/canvas thing. 

The aim is to be able to visualize any sound playing on your computer - a universal visualizer than can be programmed in JavaScript.

Work in progress.

If you are feeling brave and want to check this out already, then clone or download the repo and then `npm install` it. 

Note that the node-core-audio module needs to compile a dependency (PortAudio) using node-gyp. This initially caused problems for me using Windows 8, but I managed to get it to compile by using a flag to specify the version of Visual Studio I have (2013):
`npm install --msvs_version=2013`

If you get it all installed, then run `node server/server.js` and go to `localhost:3000` in your browser.
