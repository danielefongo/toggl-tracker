const fs = require('fs')
const path = require('path')
const configFile = path.join(require('os').homedir(), '.toggle-compile.json')
const Asker = require('./src/asker')

var config = require('./config.json')
if (fs.existsSync(configFile)) { config = require(configFile) }

async function configure () {
  const asker = new Asker()
  const newConfig = await asker.init(config)
  fs.writeFileSync(configFile, JSON.stringify(newConfig, null, 2))
  console.log('new configuration stored on ' + configFile)
}

configure()
