import glob from 'glob'
import fs from 'fs-extra'

export class Files {
  find (location, pattern) {
    return glob.sync(location + pattern)
  }

  exists(filename) {
    return fs.existsSync(filename)
  }

  delete(filename) {
    fs.removeSync(filename)
  }
}
