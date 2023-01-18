import { assert } from "https://deno.land/std@0.161.0/testing/asserts.ts";
import System from "./System.ts";

Deno.test("System", async (t) => {
  // construct a hydroponic wall system comprised of a root node 
  // and 3 "row" sub-systems that each have 4 "plant" sub-systems
  const hydroponic_wall = new System("hydro_root")
  const rows = [
    "row_1",
    "row_2",
    "row_3",
  ].map(name => hydroponic_wall.addChild(name))
  const plants = [
    "plant_1",
    "plant_2",
    "plant_3",
    "plant_4"
  ].flatMap(name => rows.map(row => row.addChild(name)))

  await t.step("Sub-systems correctly added", () => {
    assert(plants.length === 12)
    assert(plants[0] === hydroponic_wall.children[0].children[0])
  })

  await t.step("Sub-systems correctly receive events from parent systems", () => {
    let event: CustomEvent | undefined
    plants[0].addListener("temperature", (e) => event = e)
    hydroponic_wall.dispatch(new CustomEvent("temperature", { detail: 27 }))

    assert(event)
    assert(event.target === hydroponic_wall)
    assert(event.detail === 27)
  })
})

