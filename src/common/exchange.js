import _ from 'lodash'
import moment from 'moment'
import download from 'downloadjs'
import list from './list'
import storage from './storage'
import browser from 'webextension-polyfill'

const importFromText = (compatible, data) => {
  const lists = compatible ? data.split('\n\n')
    .filter(i => i)
    .map(i => i.split('\n')
      .filter(j => j)
      .map(j => j.split('|').map(k => k.trim()))
      .map(([url, title]) => ({ url, title })))
    .map(i => list.createNewTabList({tabs: i}))
    : JSON.parse(data).map(i => list.createNewTabList(i))

  return browser.runtime.sendMessage({import: {lists}})
}

const exportToText = async compatible => {
  const lists = await storage.getLists()
  if (compatible) return lists.map(list => list.tabs.map(tab => tab.url + ' | ' + tab.title).join('\n')).join('\n\n')
  return JSON.stringify(lists.map(i => _.pick(i, ['tabs', 'title', 'time'])), null, 4)
}

const exportToFile = (text, {type, suffix}) => {
  const name = 'BetterOnetab_backup_' + moment().format('L') + suffix
  download(text, name, type)
}

const types = {
  JSON: { type: 'application/json', suffix: '.json' },
  TEXT: { type: 'plain/text', suffix: '.txt' },
}

export default {
  importFromText,
  exportToText,
  exportToFile,
  types,
}
