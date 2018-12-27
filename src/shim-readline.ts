import conf from 'byteballcore/conf'
import {ReadLineOptions} from 'readline'

import {bot, Question} from './event-handler'

/**
 * Shim readline.createInterface()
 * @see https://nodejs.org/api/readline.html#readline_readline_createinterface_options
 */
export function createInterface(_options: ReadLineOptions) {
  return {
    close: bot.answered,
    question(query: string, answering: (response: string | void) => void) {
      // #region helpers
      query = query.toLocaleLowerCase()
      const on = (event: Question) => {
        const cb = bot.onAsking[event]
        return Promise.resolve(cb ? cb() : conf.devicename)
      }
      const questionIncludes = (keywords: string[]) => keywords.every(keyword => query.includes(keyword))
      // #endregion helpers

      // in case someone register started event as async function
      Promise.resolve(bot.started(query)).then(async () => {
        if (questionIncludes(['passphrase'])) answering(await on('passphrase'))
        else if (questionIncludes(['device', 'name'])) answering(await on('devicename'))
        else answering(undefined)
      }).catch(bot.onError.started)
    }
  }
}
