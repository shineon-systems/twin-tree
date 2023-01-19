type CustomEventListener = (e: CustomEvent) => unknown

export default class System extends EventTarget {
  // constructed once then deserialised from storage
  // so consistent uuid is hard-coded into device
  id = crypto.randomUUID()
  connected = false
  children: System[] = []

  constructor(public name: string, public parent?: System) {
    super()
  }

  connect(id: string | string[]) {
    if (Array.isArray(id)) id.forEach(id => this.connect(id))
    else if (this.id === id) this.connected = true
    else this.children.forEach(child => child.connect(id))
  }

  disconnect(id: string) {
    if (this.id === id) this.connected = false
    else this.children.forEach(child => child.disconnect(id))
  }

  checkConnect() {
    if (!this.connected) {
      throw new Error(`System with name ${this.name} and id ${this.id} is not connected`)
    }
  }

  addChild(name: string) {
    const child = new System(name, this)
    this.children.push(child)
    return child
  }

  dispatchEvent(e: CustomEvent) {
    this.checkConnect()
    return EventTarget.prototype.dispatchEvent.call(this, e)
  }

  addEventListener(type: string, listener: CustomEventListener | { handleEvent: CustomEventListener } | null) {
    if (!listener) throw new Error(`Listener function not provided for event with ${type} on system with name ${this.name} and id ${this.id}`)
    if (typeof listener !== "function") listener = listener.handleEvent

    if (this.parent) this.parent.addEventListener(type, listener)
    return EventTarget.prototype.addEventListener.call(this, type, listener as EventListener)
  }
}