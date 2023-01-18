export default class System extends EventTarget {
  id = crypto.randomUUID()
  children: System[] = []

  constructor(public name: string, public parent?: System) {
    super()
  }

  addChild(name: string) {
    const child = new System(name, this)
    this.children.push(child)
    return child
  }

  addListener(type: string, listener: (e: CustomEvent) => void) {
    this.addEventListener(type, listener as (e: Event) => void)
    if (this.parent) this.parent.addListener(type, listener)
  }

  dispatch(e: CustomEvent) {
    this.dispatchEvent(e)
  }
}