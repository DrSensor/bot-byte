interface Wallet {
  setupChatEventHandlers()
  issueChangeAddressAndSendPayment(
    asset: string | null,
    amount: number,
    user_byteball_address: string,
    user_device_address?: string,
    calback: (err: Error, unit: number) => void
  )
}
declare module 'headless-byteball' {
  export const setupChatEventHandlers: any
  export const issueChangeAddressAndSendPayment: Wallet.issueChangeAddressAndSendPayment
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
  export const sendMessageToDevice: Device.sendMessageToDevice
}

declare module 'byteballcore/event_bus' {
  import {EventEmitter} from 'events'
  const event: EventEmitter
  export default event
}

declare module 'byteballcore/*' {
  const _: any
  export default _
}
