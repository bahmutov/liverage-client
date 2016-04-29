/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	/* global CycleDOM, Cycle */

	const {makeDOMDriver} = CycleDOM
	const coverageDom = __webpack_require__(1)
	const coverageSource = __webpack_require__(2)

	function main ({DOM}) {
	  // dirty code
	  const coverage$ = coverageSource()
	  const dom$ = coverageDom(coverage$)

	  return {
	    DOM: dom$
	  }
	}
	const sources = {
	  DOM: makeDOMDriver('#app')
	}
	Cycle.run(main, sources)


/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict'

	/* global CycleDOM */
	const {pre, table, tr, td} = CycleDOM

	function sourceLineToRow (coverage, sourceLine, index) {
	  const line = String(index + 1)
	  const lineCover = coverage ? coverage.l[line] : 0
	  const hasSource = lineCover !== undefined

	  let lineClass = '.cline-neutral'
	  if (hasSource) {
	    lineClass = lineCover ? '.cline-yes' : '.cline-no'
	  }
	  const lineCount = lineCover ? lineCover + '×' : ''
	  return tr('.line', [
	    td('.linecount .quiet', line),
	    td('.cline-any ' + lineClass, lineCount),
	    td('.text',
	      pre('.lang-js', sourceLine)
	    )
	  ])
	}

	function coverageDom ({source, coverage}) {
	  const lines = source.split('\n')
	  return table('.coverage', lines.map(sourceLineToRow.bind(null, coverage)))
	}

	module.exports = (coverage__) => coverage__.map(coverageDom)


/***/ },
/* 2 */
/***/ function(module, exports) {

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
	    ws.onopen = function open () {
	      console.log('opened socket')
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
	      tinyToast.show('Server has finished').hide(5000)
	      // TODO change ui?
	    }

	    // a couple of testing shortcuts
	    window.liverage = {setSource, setCoverage, incrementCoverage}
	  })
	}

	module.exports = createCoverageStream


/***/ }
/******/ ]);