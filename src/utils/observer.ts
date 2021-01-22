export default class Oberver {
  private _listener: any[];
  constructor() {
    this._listener = [];
  }
  public update(...args) {
    this._listener.forEach((fn) => fn(...args));
  }
  public subscribe(fn) {
    this._listener.push(fn);
  }
  public unSubscribe(fn) {
    this._listener = this._listener.filter(fn);
  }
}
