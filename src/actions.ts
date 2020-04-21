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
    const actions = this.actions(command)

    if (actions.length == 0) {
      console.log('Action "' + command + '" does not exist.')
      return
    }
    if (actions.length > 1) {
      console.log('Ambiguous action: ', actions)
      return
    }

    let script
    try {
      const Script = this.loadAction(actions[0])
      script = new Script(this.loader, this.toggl, this.timeSlotter, this.asker, this.config)
    } catch {
      console.log(`Failed to load ${command}.`)
    }
    await script.run()
  }

  async show () {
    this.actions('.*')
      .forEach(it => {
        try {
          let Script = this.loadAction(it)
          let script = new Script(this.loader, this.toggl, this.timeSlotter, this.asker, this.config)
          console.log(`- ${it}: ${script.help()}`)
        } catch {}
      })
  }

  async install (action) {
    const githubRepo = `https://github.com/${action}`
    const actionFile = this.fileForAction(action)
    const destinationFolder = path.dirname(actionFile)

    if (this.files.exists(actionFile)) {
      console.log("Already installed.")
      return
    }

    this.git.clone(githubRepo, destinationFolder)
      .then(() => {
        try {
          new (this.loadAction(action))
          console.log('Installed.')
        } catch {
          console.log('Not a valid action.')
          this.files.delete(destinationFolder)
        }
      })
      .catch(() => console.log(`Cannot install action ${action}.`))
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

  private fileForAction (action: string) {
    const user = action.split('/')[0] || ''
    const repo = action.split('/')[1] || ''

    return path.join(this.actionFolder, user, repo, actionName)
  }

  private loadAction (action: string) {
    const actionFile = this.fileForAction(action)
    return this.loader.require(actionFile)
  }
}
