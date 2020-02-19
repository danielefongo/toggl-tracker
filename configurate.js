const fs = require('fs')
const Asker = require('./src/asker')

exports.configurate = async function (config, configFile) {
  const asker = new Asker()
  const newConfig = await asker.init(config)
  fs.writeFileSync(configFile, JSON.stringify(newConfig, null, 2))
  console.log('\n### New configuration stored on ' + configFile + ' ###\n')
}
