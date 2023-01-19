import { assert, assertThrows } from "https://deno.land/std@0.161.0/testing/asserts.ts";
import System from "./System.ts";

Deno.test("System", async (t) => {
  // construct a hydroponic wall system comprised of a root node 
  // and 3 "row" sub-systems that each have 4 "plant" sub-systems
  const hydroponic_wall = new System("hydro_root")
  const rows = [
    "row_0",
    "row_1",
    "row_2",
  ].map(name => hydroponic_wall.addChild(name))
  const plants = [
    "plant_0",
    "plant_1",
    "plant_2",
    "plant_3"
  ].flatMap(name => rows.map(row => row.addChild(name)))

  await t.step("System and sub-systems linked", () => {
    assert(plants.length === 12)
    assert(plants[0] === hydroponic_wall.children[0].children[0])
  })

  await t.step("Cannot dispatch events before connection", () => {
    let ran = false
    rows[0].addEventListener("bad-event", () => ran = true)
    assertThrows(() => rows[0].dispatchEvent(new CustomEvent("bad-event", { detail: "how can I exist when the system isn't connected?" })))
    assert(!ran)

    hydroponic_wall.connect(hydroponic_wall.id)
    hydroponic_wall.dispatchEvent(new CustomEvent("bad-event"))

    // should this be false? i.e. do we not run listeners from parents events
    // if the node that the listener was added to is not connected? 
    // seeing as listeners are intended to be control actions, probably... 
    //
    // thought about it more and decided that the listeners should run.
    // it's up to the listener to check if the node to take action on is connected or not
    // however, there should be a sendEvent method for outputting from a system that checks if it is connected
    assert(ran)
  })

  await t.step("Sub-systems connect and receive events from ancestors", () => {
    let event: CustomEvent | undefined

    hydroponic_wall.connect([rows[0].id, plants[0].id])
    plants[0].addEventListener("temperature", (e) => event = e)
    hydroponic_wall.dispatchEvent(new CustomEvent("temperature", { detail: 27 }))

    assert(event)
    assert(event.target === hydroponic_wall)
    assert(event.detail === 27)
  })
})

