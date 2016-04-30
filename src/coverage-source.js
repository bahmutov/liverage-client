'use strict'

const connect = require('./connect')

const isSource = (data) => typeof data.source === 'string' && data.filename
const isCoverage = (data) => typeof data.coverage === 'string'
const isLineIncrement = (data) => typeof data.line === 'number'
const isError = (x) => x instanceof Error

function formServerUrl () {
  return 'ws://localhost:3032'
}

function createCoverageStream () {
  /* global Rx, tinyToast */
  const url = formServerUrl()

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

    connect(url).subscribe({
      onNext: (wsOrError) => {
        if (isError(wsOrError)) {
          tinyToast.show('Could not connect to the liverage server, retrying').hide(4000)
          return
        }

        const ws = wsOrError
        ws.onmessage = function message (message) {
          const data = JSON.parse(message.data)
          console.log('received socket message with', Object.keys(data))

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
          tinyToast.show('Server has finished').hide(5000)
          observer.onCompleted()
        }
      },
      onError: (err) => {
        console.error('connection error', err)
      },
      onCompleted: () => {
        console.log('connection completed')
      }
    })

    // a couple of testing shortcuts
    window.liverage = {setSource, setCoverage, incrementCoverage}
  })
}

module.exports = createCoverageStream
