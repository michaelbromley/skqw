/**
 * {SKQW}
 */
var skqw;
angular.module('app', [])
    .run(init)
    .controller('AppController', AppController);

function init() {
    skqw = SKQW(document.querySelector('#container'));

    for(var key in visLibrary) {
        if (visLibrary.hasOwnProperty(key)) {
            var visFn = visLibrary[key];
            skqw.loadVisualization(key, visFn);
        }
    }

    skqw.setVisualization(Object.keys(visLibrary)[1]);
    skqw.start();

    skqwDat(skqw);
}

function AppController() {
    var vm = this;

    vm.visLibrary = Object.keys(visLibrary);
    vm.selectVis = function() {
        skqw.setVisualization(vm.currentVis);
        skqw.start();
    };
}


