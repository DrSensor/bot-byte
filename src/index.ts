import {run} from '@oclif/command'

if (require.main === module) {
  run()
    .then(require('@oclif/command/flush'))
    // @ts-ignore miss error
    .catch(require('@oclif/errors/handle'))
}
