export class Loader {
  load(name) {
    return require("./model/" + name)
  }

  require(module) {
    return require(module)
  }
}