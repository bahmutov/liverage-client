'use strict'

/* global Rx, WebSocket, tinyToast */

function connect (url) {
  return Rx.Observable.create(function (observer) {
    const ws = new WebSocket(url)
    var successfullyConnected = false
    ws.onopen = function open () {
      console.log('opened socket')
      successfullyConnected = true
      observer.onNext(ws)
      observer.onCompleted()
    }

    ws.onerror = function () {
      tinyToast.show('Could not connect to the web socket server').hide(4000)
      observer.onError(new Error('Could not connect to the web socket server'))
    }

    ws.onclose = function () {
      if (successfullyConnected) {
        tinyToast.show('Server has finished').hide(5000)
      }
      observer.onCompleted()
    }
  })
}

module.exports = connect
