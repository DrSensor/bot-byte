export interface IMessage {
  readonly from_address: string
  readonly text: string
  readonly count: number
  readonly response: (text: string) => void
}

export interface IBot {
  init: void
  passphrase: void
  ready: (device: Device) => void
  message: (message: IMessage) => void
  error: (error: Error) => void
}
