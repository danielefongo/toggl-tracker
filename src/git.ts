const { exec } = require("child_process");

export class Git {
  async clone (url, location) {
    return this.run(`git clone ${url} ${location}`)
  }

  async pullRebase (location) {
    return this.run(`git -C ${location} pull --rebase`)
  }

  async currentHash (location) {
    return this.run(`git -C ${location} rev-parse HEAD`)
  }

  async resetMasterHard (location, hash) {
    return this.run(`git -C ${location} reset ${hash} --hard`)
  }

  private run(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, out) => {
        if (error) reject()
        else resolve(out)
      });
    })
  }
}
