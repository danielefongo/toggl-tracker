import fs from 'fs'
import { Asker } from './src/asker'
import { Config } from './src/model/config'

async function configurate (config: Config, configFile) {
  const asker = new Asker()
  const newConfig = await asker.init(config)
  fs.writeFileSync(configFile, JSON.stringify(newConfig, null, 2))
  console.log('\n### New configuration stored on ' + configFile + ' ###\n')
  return newConfig
}

export { configurate }
