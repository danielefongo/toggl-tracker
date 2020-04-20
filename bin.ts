#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { homedir } from 'os'
import { Config } from './src/model/config'
import { program } from 'commander'
import { run } from './run'

const configFile = path.join(homedir(), '.toggl-tracker.json')

main()

async function main () {
  if (!fs.existsSync(configFile)) {
    console.log('### No configuration found. Force setup ###\n')
    await (new Config(require('./config.json'))).configure(configFile)
  }

  const loadedConfig = new Config(require(configFile))
  addOptions(program, loadedConfig)
  addCommand(program, 'config', 'change configuration')
  addCommand(program, 'install', 'install action from github (experimental)')
  addCommand(program, 'list', 'show actions (experimental)')
  addCommand(program, 'run', 'run action installed from github (experimental)')

  program.parse(process.argv)
}

function addOptions (program, config) {
  let defaultWorkingDaysOverrided = false

  function collectWorkingDays (day, days) {
    if (!defaultWorkingDaysOverrided) {
      days = []
      defaultWorkingDaysOverrided = true
    }
    return days.concat([day])
  }

  program
    .option('-wd, --workingDays <days>', 'working day', collectWorkingDays, config.workingDays)
    .option('-wi, --workingHoursIntervals <intervals>', 'working hours intervals', config.workingHoursIntervals)
    .option('-fd, --lookForwardDays <days>', 'forward days', config.lookForwardDays)
    .option('-bd, --lookBehindDays <days>', 'behind days', config.lookBehindDays)
    .option('-tt, --togglToken <token>', 'toggl token', config.togglToken)
    .option('-tw, --togglWorkspace <workspace>', 'toggl workspace id', config.togglWorkspace)
    .option('-gt, --googleToken <token>', 'google token', config.googleToken)
    .option('-gl, --googleLocale <locale>', 'google locale', config.googleLocale)

  return program
}

function addCommand (program, command, description) {
  program
    .command(command)
    .description(description)
    .action(function (context) {
      const subcommand = context.args[0]
      const config = new Config(context.parent.opts())
      if (!config.isValid()) {
        console.log('Invalid options: ' + config.whatsWrong().join(', '))
        return
      }
      run(command, subcommand, config)
    })
}