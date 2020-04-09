// Copyright (C) 2017-2020 Smart code 203358507

var UrlUtils = require('url');
var EventEmitter = require('events');

function withStreamingServer(Video) {
    function StreamingServerVideo(options) {
        var video = new Video(options);
        var events = new EventEmitter();
        var destroyed = false;
        var stream = null;

        events.on('error', function() { });

        function onError(error) {
            if (!error) {
                return;
            }

            Object.freeze(error);
            events.emit('error', error);
            if (error.critical) {
                video.dispatch({ commandName: 'stop' });
            }
        }

        function on(eventName, listener) {
            if (!destroyed) {
                events.on(eventName, listener);
            }

            video.on(eventName, listener);
        }
        function dispatch(args) {
            if (!destroyed && args && args.commandName === 'load') {
                stream = null;
                video.dispatch({ commandName: 'stop' });
                if (args.commandArgs && args.commandArgs.stream && typeof args.commandArgs.stream.infoHash === 'string' && typeof args.commandArgs.streamingServerUrl === 'string') {
                    stream = args.commandArgs.stream;
                    if (stream.fileIdx !== null && !isNaN(stream.fileIdx)) {
                        video.dispatch({
                            commandName: 'load',
                            commandArgs: {
                                autoplay: args.commandArgs.autoplay,
                                time: args.commandArgs.time,
                                stream: {
                                    url: UrlUtils.resolve(args.commandArgs.streamingServerUrl, stream.infoHash + '/' + String(stream.fileIdx))
                                }
                            }
                        });
                    } else {
                        fetch(UrlUtils.resolve(args.commandArgs.streamingServerUrl, stream.infoHash + '/create'), {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json'
                            },
                            body: JSON.stringify({
                                torrent: {
                                    infoHash: stream.infoHash
                                }
                            })
                        }).then(function(resp) {
                            return resp.json();
                        }).then(function(resp) {
                            if (stream !== args.commandArgs.stream) {
                                return;
                            }

                            if (!Array.isArray(resp.files) || resp.files.length === 0) {
                                onError({
                                    message: 'Unable to get files from torrent',
                                    critical: true
                                });
                                return;
                            }

                            var fileIdx = resp.files.reduce((fileIdx, _, index, files) => {
                                if (files[index].length > files[fileIdx].length) {
                                    return index;
                                }

                                return fileIdx;
                            }, 0);
                            video.dispatch({
                                commandName: 'load',
                                commandArgs: {
                                    autoplay: args.commandArgs.autoplay,
                                    time: args.commandArgs.time,
                                    stream: {
                                        url: UrlUtils.resolve(args.commandArgs.streamingServerUrl, stream.infoHash + '/' + String(fileIdx))
                                    }
                                }
                            });
                        }).catch(function(error) {
                            if (stream !== args.commandArgs.stream) {
                                return;
                            }

                            onError({
                                message: 'Unable to get files from torrent',
                                critical: true,
                                error: error
                            });
                        });
                    }
                }
            } else {
                if (args && args.commandName === 'destroy') {
                    destroyed = true;
                    stream = null;
                    events.removeAllListeners();
                    events.on('error', function() { });
                }

                video.dispatch(args);
            }
        }

        this.on = on;
        this.dispatch = dispatch;

        Object.freeze(this);
    }

    StreamingServerVideo.manifest = Object.freeze({
        name: Video.manifest.name + 'WithStreamingServer',
        embedded: true,
        props: Object.freeze(Video.manifest.props)
    });

    Object.freeze(StreamingServerVideo);

    return StreamingServerVideo;
}

module.exports = withStreamingServer;
