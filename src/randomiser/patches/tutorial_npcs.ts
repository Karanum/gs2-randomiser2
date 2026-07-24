import { FieldPsynergy } from "../data/abilities/enums";
import { SpriteId } from "../data/enums";
import { Facing, FacingType, MapCodeEntry } from "../data/map_code/enums";
import { EventBuilder, NpcBuilder } from "../data/map_code/model";
import { BOX, END, LINE } from "../data/text/control_characters";
import type { RomData } from "../rom";
import { Setting } from "../settings/enums";
import type { SettingsObject } from "../settings/settings";

const npcGeneral = new NpcBuilder(SpriteId.LEMURIA_YOUNG_MAN).setPosition(0x190, 0, 0x2A8)
    .setFacing(Facing.S, FacingType.RETURN_AFTER_INTERACT).build();
const npcRetreat = new NpcBuilder(SpriteId.ELVEN_MAN).setPosition(0x160, 0, 0x278)
    .setFacing(Facing.S, FacingType.RETURN_AFTER_INTERACT).build();

const eventGeneral = new EventBuilder().asNpc(8, 5488).build();
const eventGeneralMindRead = new EventBuilder().asObjectPsynergyTrigger(8, FieldPsynergy.MIND_READ, 5489).build();
const eventRetreat = new EventBuilder().asNpc(9, 5490).build();
const eventRetreatMindRead = new EventBuilder().asObjectPsynergyTrigger(9, FieldPsynergy.MIND_READ, 5491).build();


export function applyTutorialNpcPatch(rom : RomData, settings : SettingsObject)
{
    const settingAvoid = settings[Setting.ENABLE_AVOID_TOGGLE];
    const settingHints = settings[Setting.ENABLE_HINTS];

    const idejima = rom.mapCode.get(MapCodeEntry.IDEJIMA)!;
    idejima.hasChanged = true;

    // Add NPCs for general randomiser and Retreat info
    idejima.data.writeBlock(0x3844, npcGeneral);
    idejima.data.writeBlock(0x385C, npcRetreat);
    idejima.data.writeBlock(0x391C, eventGeneral);
    idejima.data.writeBlock(0x3928, eventGeneralMindRead);
    idejima.data.writeBlock(0x3934, eventRetreat);
    idejima.data.writeBlock(0x3940, eventRetreatMindRead);

    let npcAddr = 0x3874, eventAddr = 0x394C, npcId = 10;

    // Conditionally add an NPC for toggleable Avoid info
    if (settingAvoid) {
        idejima.data.writeBlock(npcAddr, 
            new NpcBuilder(SpriteId.HOODED_PERSON)
                .setPosition(0x120, 0, 0x280)
                .setFacing(Facing.S, FacingType.RETURN_AFTER_INTERACT)
                .build()
        );
        idejima.data.writeBlock(eventAddr, new EventBuilder().asNpc(npcId, 5492).build());
        idejima.data.writeBlock(eventAddr + 0xC,
            new EventBuilder().asObjectPsynergyTrigger(npcId++, FieldPsynergy.MIND_READ, 5493).build()
        );
        npcAddr += 0x18;
        eventAddr += 0x18;
    }

    // Conditionally add an NPC for hint system info
    // If both settings are enabled, the event table needs to be expanded
    if (settingHints) {
        if (settingAvoid) {
            idejima.data.expandAt(eventAddr, 0xC);
        }

        idejima.data.writeBlock(npcAddr,
            new NpcBuilder(SpriteId.IZUMO_SHOPKEEPER)
                .setPosition(0x100, 0, 0x280)
                .setFacing(Facing.S, FacingType.RETURN_AFTER_INTERACT)
                .build()
        );
        idejima.data.writeBlock(eventAddr, new EventBuilder().asNpc(npcId, 5494).build());
        idejima.data.writeBlock(eventAddr + 0xC,
            new EventBuilder().asObjectPsynergyTrigger(npcId++, FieldPsynergy.MIND_READ, 5495).build()
        );
    }

    // Add custom text lines
    rom.text.set(5488, `Welcome to the${LINE}GS2 Randomiser!${BOX}`
                    + `If you're new, make sure${LINE}to check the help pages${LINE}on the website.${BOX}`
                    + `Also, if you get stuck, you can${LINE}hold L + Start while selecting your save file${LINE}to warp to the last visited town.${END}`);
    rom.text.set(5489, `Started with Mind Read, huh?${LINE}Okay, let's see...${BOX}`
                    + `The next update will hopefully bring${LINE}the long-awaited entrance shuffle.${LINE}It'll be quite something!${END}`);
    rom.text.set(5490, `The randomiser has completely${LINE}changed how Retreat works!${BOX}`
                    + `Using it on the overworld lets${LINE}you teleport to any place${LINE}you've visited.${BOX}`
                    + `You can even use Retreat${LINE}inside towns now!${END}`);
    rom.text.set(5491, `Being able to Retreat in towns${LINE}means the Retreat glitch is${LINE}stronger, too!${BOX}`
                    + `If you're into that kind of thing,${LINE}try using it wherever you can${LINE}for some crazy effects!${END}`);
    rom.text.set(5492, `Avoid is now a toggle.${LINE}Use it to disable random battles.${BOX}`
                    + `Use it again to enable random battles.${LINE}It's that easy.${BOX}`
                    + `It also doesn't matter what level${LINE}your party is anymore.${LINE}It just always works.${END}`);
    rom.text.set(5493, `If Assured Overworld Djinn${LINE}is enabled, you'll encounter them${LINE}even through Avoid.${END}`);
    rom.text.set(5494, `There are six characters${LINE}who will give you cryptic hints${LINE}about the location of an item.${BOX}`
                    + `Master Poi, Master Maha, Akafubu,${LINE}King Hydros, the Contigo corn merchant,${LINE}and the elder in Prox.${END}`);
    rom.text.set(5495, `All hints are determined beforehand,${LINE}so sometimes they will tell you${LINE}something you already knew.${BOX}`
                    + `That's just how it goes.${END}`);
}