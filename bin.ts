#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { homedir } from 'os'
import { Config } from './src/model/config'
import { program } from 'commander'
import { configurate } from './src/functions'
import { run } from './run'

const configFile = path.join(homedir(), '.toggl-tracker.json')

main()

async function main () {
  if (!fs.existsSync(configFile)) {
    console.log('### No configuration found. Force setup ###\n')
    await configurate(new Config(require('./config.json')), configFile)
  }

  const loadedConfig = new Config(require(configFile))
  addOptions(program, loadedConfig)
  addCommand(program, 'append', 'compile from the last recorded activity')
  addCommand(program, 'picky', 'compile not-filled selected past (and future) holes')
  addCommand(program, 'check', 'show inserted entries')
  addCommand(program, 'summary', 'show a summary of tracked hours for all projects in the workspace')
  addCommand(program, 'config', 'change configuration')
  addCommand(program, 'install', 'install action from github (experimental)')
  addCommand(program, 'run', 'run action installed from github (experimental)')
  addCommand(program, 'help', 'help for actions (experimental)')
  addCommand(program, 'plugin', 'custom plugin')

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