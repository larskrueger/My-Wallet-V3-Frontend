/* eslint-disable semi */
angular
  .module('walletApp')
  .factory('ExportHistory', ExportHistory)

function ExportHistory ($q, Wallet, MyBlockchainApi) {
  const service = {}
  const shouldEscape = '=+-'

  service.json2csv = (json) => {
    let headers = Object.keys(json[0])
    let makeRow = (obj) => JSON.stringify(Object.keys(obj).map(key => obj[key])).slice(1, -1)
    return [headers.join(',')].concat(json.map(makeRow)).join('\n')
  }

  service.escapeCSV = (s) => shouldEscape.indexOf(s[0]) > -1 ? ('\'' + s) : s

  service.addNoteToTx = (tx) => {
    tx.note = service.escapeCSV(Wallet.getNote(tx.tx) || '')
    return tx
  }

  service.fetch = (start, end, active, coinCode) => {
    let currency = Wallet.settings.currency
    return $q.resolve(MyBlockchainApi.exportHistory(active, currency.code, { start, end, coinCode }))
      .then(history => {
        if (!history.length) return $q.reject('NO_HISTORY')
        return service.json2csv(history.map(service.addNoteToTx))
      })
      .catch(e => {
        let error = e.message || e
        if (typeof error === 'string' && error.indexOf('Too many transactions') > -1) {
          error = 'TOO_MANY_TXS'
        }
        return $q.reject(error)
      })
  }

  return service
}
