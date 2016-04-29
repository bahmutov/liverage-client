'use strict'

/* global CycleDOM, Cycle */

const {makeDOMDriver} = CycleDOM
const coverageDom = require('./virtual-coverage')
const coverageSource = require('./coverage-source')

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
