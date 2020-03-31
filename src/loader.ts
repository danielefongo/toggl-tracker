export class Loader {
  load(name) {
    return require("./model/" + name)
  }
}