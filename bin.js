#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const configFile = path.join(require('os').homedir(), '.toggle-tracker.json')
const { compile } = require('./compile')
const { configurate } = require('./configurate')

async function main (command) {
  if (!fs.existsSync(configFile)) {
    console.log('### No configuration found. Force setup ###\n')
    await configurate(configFile)
  }

  switch (command) {
    case 'config': configurate(configFile); break
    default: compile(command, require(configFile))
  }
}

main(process.argv.slice(2)[0])
