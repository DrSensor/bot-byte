/**
 * This file implement all custom event handler which not base on EventEmitter
 * mostly it's for shimming
 */
type Response = string | void
type Callback = (query?: string) => (Response | Promise<Response>)
type EventHandler<T extends string> = { [key in T]?: Callback }

export type Question = 'passphrase' | 'devicename'
export type ErrorEvent = Question | keyof Event
export interface Event {
  started: Callback,
  answered: Callback,
  onAsking: EventHandler<Question>
  onError: EventHandler<ErrorEvent>
}

// #region where the event handler being stored
export const bot: Event = {
  started: () => {},
  answered: () => {},
  onAsking: {},
  onError: {}
}
// #endregion

/**
 * Register event handler
 * each event represent the lifecycle of the bot
 * and each handler support both normal and async function
 */
export default {
  started: (callback: Callback) => { bot.started = callback },
  onAsking: (question: Question, callback: Callback) => { bot.onAsking[question] = callback },
  onError: (event: ErrorEvent, callback: Callback) => { bot.onError[event] = callback }
}
