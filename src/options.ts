import conf from 'byteballcore/conf'
import constants from 'byteballcore/constants'

import {IOption} from './event-types'

export default function (option: Partial<IOption>) {
  if (option.testnet) {
    // #region @see https://github.com/byteball/bot-example/blob/master/testnetify.sh#L2
    constants.version = '1.0t'
    constants.alt = '2'
    // #endregion
    conf.hub = 'byteball.org/bb-test'
    conf.ports = 16611
    /// Anything else❓
  }
  Object.assign(constants, option.constants)
  Object.assign(conf, option.conf)
}
