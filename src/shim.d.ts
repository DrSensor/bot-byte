//#region helpers type
type PlainObject<T> = {
  // constructor: ObjectConstructor
  [key: string]: T
}
type LazyImport<T> = { [key: string]: T }
type AnyFunc = (...args: any) => any
type NonFunc = string | number | string[] | number[] | PlainObject<NonFunc>
type TaggedTemplateLiterals = (str: TemplateStringsArray, ...keys: any[]) => string
//#endregion

interface Wallet {
  signer: string
  setupChatEventHandlers()
  issueChangeAddressAndSendPayment(
    asset: string | null,
    amount: number,
    user_byteball_address: string,
    user_device_address?: string,
    calback: (err: Error, unit: number) => void
    )
  readSingleAddress(cb: (address: string) => void)
  readFirstAddress(cb: (address: string) => void)
}
declare module 'headless-byteball' {
  export default Wallet
}

interface Device {
  sendMessageToDevice(
    device_address: string,
    subject: 'text', // TODO: get full subject type
    body: string,
    callbacks?: () => void,
    conn?: any // TODO: need to create dts of https://github.com/byteball/byteballcore/blob/master/db.js
  )
}
declare module 'byteballcore/device' {
  export default Device
}

declare module 'byteballcore/desktop_app' {
  export const getAppDataDir: () => string
  export const getAppRootDir: () => string
}

declare module 'byteballcore/event_bus' {
  import {EventEmitter} from 'events'
  const event: EventEmitter
  export default event
}

declare module 'byteballcore/*' {
  const _: PlainObject<any>
  export default _
}
