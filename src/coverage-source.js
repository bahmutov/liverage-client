'use strict'

const isSource = (data) => typeof data.source === 'string' && data.filename
const isCoverage = (data) => typeof data.coverage === 'string'
const isLineIncrement = (data) => typeof data.line === 'number'

function createCoverageStream () {
  /* global Rx, WebSocket, tinyToast */
  return Rx.Observable.create(function (observer) {
    // mutable data for now?
    var filename
    var source
    var coverage

    function setSource (s, f) {
      source = s
      filename = f
      coverage = null
      observer.onNext({source, coverage})
    }

    function setCoverage (c) {
      if (!filename) {
        coverage = null
      } else {
        // find the right coverage property
        Object.keys(c).some((name) => {
          if (filename === name) {
            coverage = c[name]
          }
        })
        observer.onNext({source, coverage})
      }
    }

    function incrementCoverage (line) {
      if (!source || !coverage) {
        return
      }

      const lineCoverage = coverage.l
      if (lineCoverage[line] === undefined) {
        // console.error('there is no source on line', line)
        return
      }
      lineCoverage[line] += 1
      observer.onNext({source, coverage})
    }

    const ws = new WebSocket('ws://localhost:3032')
    var successfullyConnected = false
    ws.onopen = function open () {
      console.log('opened socket')
      successfullyConnected = true
    }
    ws.onerror = function () {
      tinyToast.show('Could not connect to the web socket server').hide(4000)
    }
    ws.onmessage = function message (message) {
      console.log('received socket message', message)
      const data = JSON.parse(message.data)
      if (isSource(data)) {
        console.log('received new source')
        return setSource(data.source, data.filename)
      }
      if (isCoverage(data)) {
        console.log('received new code coverage')
        coverage = JSON.parse(data.coverage)
        return setCoverage(coverage)
      }
      if (isLineIncrement(data)) {
        return incrementCoverage(data.line)
      }
    }
    ws.onclose = function () {
      // TODO change ui?
      if (successfullyConnected) {
        tinyToast.show('Server has finished').hide(5000)
      }
    }

    // a couple of testing shortcuts
    window.liverage = {setSource, setCoverage, incrementCoverage}
  })
}

module.exports = createCoverageStream
