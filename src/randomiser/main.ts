import { RomData } from "./rom";

let vanillaData : RomData;

export function init() {
    vanillaData = new RomData();

    //DEBUG
    // for (let i = 0; i < vanillaData.encounterTables.length; ++i) {
    //     const table = vanillaData.encounterTables.get(i);
    //     if (!table) continue;

    //     console.log(`=== TABLE ${table.id} ===`);
    //     table.groups.forEach((g) => {
    //         const group = vanillaData.enemyGroups.get(g);
    //         if (!group || g == 0) {
    //             return;
    //         }

    //         const slots : string[] = group.slots.filter((slot) => slot.enemy != 0).map((slot) => {
    //             return vanillaData.enemies.get(slot.enemy)?.name ?? '?';
    //         });

    //         console.log(group.id, slots.join(' ; '));
    //         return;
    //     });
    // }
}