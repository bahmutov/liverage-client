'use strict'

/* global Rx, WebSocket */

function openConnection (url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url)
    ws.onopen = () => {
      resolve(ws)
    }
    ws.onerror = () => {
      reject()
    }
  })
}

function connect (url) {
  // we could use exponential backoff strategy but for now lets make it faster
  // http://blog.johnryding.com/post/78544969349/how-to-reconnect-web-sockets-in-a-realtime-web-app
  return Rx.Observable.create(function (observer) {
    const interval = 2000

    function attempConnection () {
      openConnection(url).then((ws) => {
        console.log('opened socket')
        observer.onNext(ws)
        observer.onCompleted()
      }, () => {
        observer.onNext(new Error('Could not connect to the web socket server, retrying'))
        setTimeout(attempConnection, interval)
      })
    }

    attempConnection()
  })
}

module.exports = connect
