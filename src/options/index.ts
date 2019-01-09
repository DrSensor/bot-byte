import {IOption, LIVENET, TESTNET} from './types'

const filterEnum = ($enum: PlainObject<any>, blacklist: string[] = []) => Object.keys($enum).reduce(
  (obj: PlainObject<string>, item: any) => {
    if (isNaN(item) && !blacklist.includes(item)) obj[item] = $enum[item]
    return obj
  }, {}
)

let _options: Partial<IOption>

export function getOption() {
  const {constants, conf, ...others} = _options
  Object.assign(constants, require('byteballcore/constants'))
  Object.assign(conf, require('byteballcore/conf'))
  return {...others, conf, constants}
}

/**
 * This function do all necessary thing for merging the option
 * It make it possible to set `byteballcore/constants` and `bytballcore/conf` programatically
 */
export function setOption(option: Partial<IOption> = {}) {
  if (!option.constants) option.constants = {}

  if (!option.conf) option.conf = {}
  else throw new Error(`\`Bot.setOption({ conf: {} })\` not yet implemented (needs workaround)
  please consider using "conf.js" file 😉`)

  // default conf regardless LIVENET or TESTNET
  option.conf = {
    bLight: true,
    ...option.conf
  }

  // #region TODO: remove this if not buggy
  const {bLight, storage} = option.conf
  if (bLight && (!storage || storage === 'sqlite')) option.conf.database = {
    filename: 'byteball-light.sqlite', ...option.conf.database
  }
  // #endregion

  const conf_keys = ['hub', 'port']

  //#region begin merging option `conf` and `constants`
  if (option.testnet) {
    option.constants = {
      ...filterEnum(TESTNET, conf_keys),
      ...option.constants
    }
    option.conf = {
      port: 16611,
      hub: 'byteball.org/bb-test',
      ...option.conf
    }

    // @ts-ignore because this option not used either in bytbeallcore or headless-wallet
    option.constants.bTestnet = true
    /// Anything else❓

  } else { // if mainnet
    option.constants = {
      version: '1.0',
      alt: '1',
      ...filterEnum(LIVENET, conf_keys),
      ...option.constants
    }
    option.conf = {
      port: 6611,
      hub: 'byteball.org/bb',
      ...option.conf
    }
  }
  _options = option
  //#endregion

  // don't place this 👇 on top because it immediately print something upon require() 😓
  Object.assign(require('byteballcore/constants'), option.constants)

  /// can't merge it maybe because of https://github.com/byteball/byteballcore/blame/cd764e9bd1edd00e93ee46c2e2ec029c6a52210b/conf.js#L73-L103
  /// or https://github.com/byteball/byteballcore/blame/cd764e9bd1edd00e93ee46c2e2ec029c6a52210b/conf.js#L3
  // Object.assign(require('byteballcore/conf'), option.conf) //👈🤔 TODO: need workaround

}

export * from './types'
