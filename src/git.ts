import clone from 'git-clone'

export class Git {
  async clone (url, location) {
    return new Promise((resolve, reject) => {
      clone(url, location, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}
