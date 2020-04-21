const { exec } = require("child_process");

export class Git {
  async clone (url, location) {
    return this.run(`git clone ${url} ${location}`)
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
