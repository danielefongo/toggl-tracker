import { Toggl } from './toggl'
import { TimeSlotter } from './timeSlotter'
import { Asker } from './asker'
import { Config } from './model/config'
import path from 'path'
import { Loader } from './loader'
import { Git } from './git'
import { Files } from './files'

const actionName = 'action.js'

export class Actions {
  private readonly actionFolder: string
  private readonly loader: Loader
  private readonly toggl: Toggl
  private readonly timeSlotter: TimeSlotter
  private readonly asker: Asker
  private readonly config: Config
  private git: Git
  private files: Files

  constructor (files: Files, git: Git, loader: Loader, actionFolder: string, toggl: Toggl, timeSlotter: TimeSlotter, asker: Asker, config: Config) {
    this.files = files
    this.git = git
    this.actionFolder = actionFolder
    this.loader = loader
    this.toggl = toggl
    this.timeSlotter = timeSlotter
    this.asker = asker
    this.config = config
  }

  async run (command) {
    let script
    try {
      const action = this.uniqueAction(command)
      script = this.loadAction(action)
    } catch(err) {
      console.log(err.message)
      return
    }
    await script.run()
  }

  async show () {
    this.actions('.*')
      .forEach(it => {
        try {
          let script = this.loadAction(it)
          console.log(`- ${it}: ${script.help()}`)
        } catch {}
      })
  }

  async install (action) {
    const githubRepo = `https://github.com/${action}`
    const actionFile = this.fileForAction(action)
    const destinationFolder = this.folderForAction(action)

    if (this.files.exists(actionFile)) {
      console.log('Already installed.')
      return
    }

    this.git.clone(githubRepo, destinationFolder)
      .then(() => {
        try {
          this.loadAction(action)
          console.log(`Installed ${action}.`)
        } catch {
          console.log('Not a valid action.')
          this.files.delete(destinationFolder)
        }
      })
      .catch(() => console.log(`Cannot install action ${action}.`))
  }

  uninstall (command) {
    try {
      const action = this.uniqueAction(command)
      const installationFolder = this.folderForAction(action)
      this.files.delete(installationFolder)
      console.log(`Uninstalled ${action}.`)
    } catch(err) {
      console.log(err.message)
    }
  }

  async update() {
    this.actions('.*').forEach(this.updateOne.bind(this))
  }

  private async updateOne (action) {
    const installationFolder = this.folderForAction(action)

    let oldHash
    let hash
    try {
      oldHash = await this.git.currentHash(installationFolder)
      await this.git.pullRebase(installationFolder)
      hash = await this.git.currentHash(installationFolder)
    } catch(err) {
      console.log(`Cannot update ${action}.`)
      return
    }

    try {
      this.loadAction(action)
      if(hash !== oldHash) console.log(`Updated ${action}.`)
    } catch {
      console.log(`Invalid update for ${action}. Reverting.`)
      await this.git.resetMasterHard(installationFolder, oldHash)
    }
  }

  private uniqueAction (command: string) {
    const actions = this.actions(command)

    if (actions.length == 0) {
      throw new Error(`Action ${command} does not exist.`)
    }
    if (actions.length > 1) {
      throw new Error(`Ambiguous action: ${actions.join(', ')}`)
    }

    return actions[0]
  }

  actions (command: string) {
    const regex = new RegExp('(/|^)' + command + '$', 'g');

    const actionFiles = this.files.find(this.actionFolder, `/*/*/${actionName}`)
    return actionFiles
      .map(it => this.actionForFile(it))
      .filter(it => it.match(regex) && it.match(regex).length == 1)
  }

  private actionForFile (filename: string) {
    const userFolder = path.basename(path.dirname(path.dirname(filename)))
    const repoFolder = path.basename(path.dirname(filename))
    return path.join(userFolder, repoFolder)
  }

  private folderForAction (action: string) {
    const actionFile = this.fileForAction(action)
    return path.dirname(actionFile)
  }

  private fileForAction (action: string) {
    const user = action.split('/')[0] || ''
    const repo = action.split('/')[1] || ''

    return path.join(this.actionFolder, user, repo, actionName)
  }

  private loadAction (action: string) {
    try {
      const actionFile = this.fileForAction(action)
      const Script = this.loader.require(actionFile)
      return new Script(this.loader, this.toggl, this.timeSlotter, this.asker, this.config)
    } catch {
      throw new Error(`Failed to load ${action}.`)
    }
  }
}
