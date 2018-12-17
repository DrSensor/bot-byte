import {ReadLineOptions} from 'readline'

/**
 * Shim readline.createInterface()
 * @see https://nodejs.org/api/readline.html#readline_readline_createinterface_options
 */
export function createInterface(_options: ReadLineOptions) {
  return {
    question(_query: string, answering: (response: string | void) => void) {
      answering()
    },
    close() {}
  }
}
