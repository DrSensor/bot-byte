botbyte
=======

> WORK IN PROGRESS
An abstraction layer for creating Byteball bot

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/botbyte.svg)](https://npmjs.org/package/botbyte)
[![CircleCI](https://circleci.com/gh/DrSensor/bot-byte/tree/master.svg?style=shield)](https://circleci.com/gh/DrSensor/bot-byte/tree/master)
[![Codecov](https://codecov.io/gh/DrSensor/bot-byte/branch/master/graph/badge.svg)](https://codecov.io/gh/DrSensor/bot-byte)
[![Downloads/week](https://img.shields.io/npm/dw/botbyte.svg)](https://npmjs.org/package/botbyte)
[![License](https://img.shields.io/npm/l/botbyte.svg)](https://github.com/DrSensor/bot-byte/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g botbyte
$ botbyte COMMAND
running command...
$ botbyte (-v|--version|version)
botbyte/0.0.0 linux-x64 node-v10.14.1
$ botbyte --help [COMMAND]
USAGE
  $ botbyte COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`botbyte hello [FILE]`](#botbyte-hello-file)
* [`botbyte help [COMMAND]`](#botbyte-help-command)
* [`botbyte new [FILE]`](#botbyte-new-file)
* [`botbyte run [FILE]`](#botbyte-run-file)

## `botbyte help [COMMAND]`

display help for botbyte

```
USAGE
  $ botbyte help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.4/src/commands/help.ts)_

## `botbyte new [FILE]`

describe the command here

```
USAGE
  $ botbyte new [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/new.ts](https://github.com/DrSensor/bot-byte/blob/v0.0.0/src/commands/new.ts)_

## `botbyte run [FILE]`

describe the command here

```
USAGE
  $ botbyte run [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/run.ts](https://github.com/DrSensor/bot-byte/blob/v0.0.0/src/commands/run.ts)_
<!-- commandsstop -->
