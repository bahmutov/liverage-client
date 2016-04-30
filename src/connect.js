'use strict'

/* global WebSocket, tinyToast */

function connect (url) {
  return new Promise(function (resolve, reject) {
    const ws = new WebSocket(url)
    var successfullyConnected = false
    ws.onopen = function open () {
      console.log('opened socket')
      successfullyConnected = true
      resolve(ws)
    }

    ws.onerror = function () {
      tinyToast.show('Could not connect to the web socket server').hide(4000)
    }

    ws.onclose = function () {
      // TODO change ui?
      if (successfullyConnected) {
        tinyToast.show('Server has finished').hide(5000)
      } else {
        reject(new Error('Could not connect to ' + url))
      }
    }
  })
}

module.exports = connect
