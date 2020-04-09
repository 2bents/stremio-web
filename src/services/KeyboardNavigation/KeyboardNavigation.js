// Copyright (C) 2017-2020 Smart code 203358507

function KeyboardNavigation() {
    let active = false;

    function onKeyDown(event) {
        if (event.keyboardNavigationPrevented || event.target.tagName === 'INPUT') {
            return;
        }

        switch (event.code) {
            case 'Digit0': {
                window.location = '#/search';
                break;
            }
            case 'Digit1': {
                window.location = '#/';
                break;
            }
            case 'Digit2': {
                window.location = '#/discover';
                break;
            }
            case 'Digit3': {
                window.location = '#/library';
                break;
            }
            case 'Digit4': {
                window.location = '#/settings';
                break;
            }
            case 'Digit5': {
                window.location = '#/addons';
                break;
            }
            case 'Backspace': {
                if (event.ctrlKey) {
                    window.history.forward();
                } else {
                    window.history.back();
                }

                break;
            }
            case 'KeyF': {
                if (document.fullscreenElement === document.documentElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
                }

                break;
            }
        }
    }
    function start() {
        if (active) {
            return;
        }

        window.addEventListener('keydown', onKeyDown);
        active = true;
    }
    function stop() {
        window.removeEventListener('keydown', onKeyDown);
        active = false;
    }

    Object.defineProperties(this, {
        active: {
            configurable: false,
            enumerable: true,
            get: function() {
                return active;
            }
        }
    });

    this.start = start;
    this.stop = stop;

    Object.freeze(this);
}

module.exports = KeyboardNavigation;
