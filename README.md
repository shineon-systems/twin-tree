# System Tree 🌲💠🌿

A framework for remotely modelling and managing control systems as trees.

## Construct a system tree

```
const plantBed = new System("plant_bed")
const flowers = plantBed.addChild("flower_section")
const vegetables = plantBed.addChild("veg_section")

const marigold = flowers.addChild("marigold")
const sunflower = flowers.addChild("sunflower")

const beetroot = vegetables.addChild("beetroot")
const carrots = vegetables.addChild("carrots")
const potato = vegetables.addChild("potato")
```

This would result in a system tree that looks like:

```
├── plant_bed
│   ├── flower_section
│   │   ├── marigold
│   │   ├── sunflower
│   ├── veg_section
│   │   ├── beetroot
│   │   ├── carrots
│   │   ├── potato
```

The `plant_bed` system is the root of the tree and has two sub-systems, `flower_section` and `veg_section`. These in turn have their own plant sub-systems.

## Confirm system connection

Each system in the tree represents a real device with sensors and actuators, etc. So before we can interact with them we must confirm we are connected to the real device. You are responsible for managing this connection state through APIs like `fetch` or `Web Serial`.

```
(id) => {
  const connectedSystem = plant_bed.connect(id)
  console.log(`${connectedSystem.name} connected: ${connectedSystem.connected}`)
}
```

## Set up event logic

The system tree works by listening to the real devices represented by each system and then creating the necessary control actions. This is done by dispatching and emtting events.

`System` extends `EventTarget`, so each system is designed to have `EventListeners` that perform actions when an event happens. When calling the `addEventListener` method on a system, the provided listener will also be added to all ancestor systems. This means a temperature event dispatched to the `flower_section` system can trigger event listeners on the `marigold` and `sunflower` systems.

You are responsible for dispatching events into system via your device API integrations.

```
marigold.addEventListener("temperature", (e) => {
  if (e.detail > 25) {
    console.log("marigold is too hot...")
    flower_section.dispatchEvent(new CustomEvent("control", detail: { temperature: 25 }))
  }
})
```

Dispatching `CustomEvents` of type `control` is the recommended way to signify a control action is to be made. Implement your own `EventListeners` that listen for `control` events on systems and communicate the necessary instructions to the real device via APIs.