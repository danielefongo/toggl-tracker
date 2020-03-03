#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { compile } from './compile'
import { configurate } from './configurate'
import { homedir } from 'os'

const configFile = path.join(homedir(), '.toggl-tracker.json')

async function main (command) {
  if (!fs.existsSync(configFile)) {
    console.log('### No configuration found. Force setup ###\n')
    await configurate(require('./config.json'), configFile)
  }

  const config = require(configFile)

  switch (command) {
    case 'config': configurate(config, configFile); break
    default: compile(command, config)
  }
}

main(process.argv.slice(2)[0])
