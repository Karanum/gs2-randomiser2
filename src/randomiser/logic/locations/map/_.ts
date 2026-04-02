import { type Progression } from '../../enums';
import type { LogicMap, LogicMapLocation } from '../types';
import locAirsRock from './AirsRock';
import locAlhafra from './Alhafra';
import locAlhafranCave from './AlhafranCave';
import locAnemosInnerSanctum from './AnemosInnerSanctum';
import locAngaraCavern from './AngaraCavern';
import locAnkohlRuins from './AnkohlRuins';
import locApojiiIslands from './ApojiiIslands';
import locAquaRock from './AquaRock';
import locAttekaCavern from './AttekaCavern';
import locAttekaInlet from './AttekaInlet';
import locChampa from './Champa';
import locContigo from './Contigo';
import locDaila from './Daila';
import locDehkanPlateau from './DehkanPlateau';
import locETundariaIslet from './ETundariaIslet';
import locGabombaCatacombs from './GabombaCatacombs';
import locGabombaStatue from './GabombaStatue';
import locGaiaRock from './GaiaRock';
import locGaroh from './Garoh';
import locGondowanCliffs from './GondowanCliffs';
import locGondowanSettlement from './GondowanSettlement';
import locHesperiaSettlement from './HesperiaSettlement';
import locIdejima from './Idejima';
import locIndraCavern from './IndraCavern';
import locIsletCave from './IsletCave';
import locIzumo from './Izumo';
import locJupiterLighthouse from './JupiterLighthouse';
import locKaltIsland from './KaltIsland';
import locKandoreanTemple from './KandoreanTemple';
import locKibombo from './Kibombo';
import locKibomboMountains from './KibomboMountains';
import locLemuria from "./Lemuria";
import locLemurianShip from './LemurianShip';
import locLoho from './Loho';
import locMadra from './Madra';
import locMadraCatacombs from './MadraCatacombs';
import locMagmaRock from './MagmaRock';
import locMarsLighthouse from './MarsLighthouse';
import locMikasalla from './Mikasalla';
import locNaribwe from './Naribwe';
import locNOseniaIslet from './NOseniaIslet';
import locOseniaCavern from './OseniaCavern';
import locOseniaCliffs from './OseniaCliffs';
import locOverworld from './Overworld';
import locProx from './Prox';
import locSeaGodShrine from './SeaGodShrine';
import locSEAngaraIslet from './SEAngaraIslet';
import locSeaOfTime from './SeaOfTime';
import locSeaOfTimeIslet from './SeaOfTimeIslet';
import locShamanVillage from './ShamanVillage';
import locShamanVillageCave from './ShamanVillageCave';
import locStartingInventories from './StartingInventories';
import locSWAttekaIslet from './SWAttekaIslet';
import locTaopoSwamp from './TaopoSwamp';
import locTreasureIsle from './TreasureIsle';
import locTundariaTower from './TundariaTower';
import locWIndraIslet from './WIndraIslet';
import locYallam from './Yallam';
import locYampiDesert from './YampiDesert';
import locYampiDesertCave from './YampiDesertCave';

/**
 * Combines two sets of access rules.
 */
function combineAccess(locationAccess : Progression[][], nodeAccess? : Progression[][]) : Progression[][] {
    if (locationAccess.length == 0) {
        if (nodeAccess == undefined) return [];
        return structuredClone(nodeAccess);
    }
    if (nodeAccess == undefined || nodeAccess.length == 0) {
        return structuredClone(locationAccess);
    }

    const rules : Progression[][] = [];
    locationAccess.forEach(locRule => {
        nodeAccess.forEach(nodeRule => {
            rules.push(locRule.concat(nodeRule));
        });
    });
    return rules;
}

/**
 * Processes the logic data for a single location.
 * @param logicMap The logic map to insert the data into
 * @param location The location data
 */
function loadLocation(logicMap : LogicMap, location : LogicMapLocation) {
    location.items?.forEach(node => {
        logicMap.items.push({ ...node, access: combineAccess(location.access, node.access) });
    });
    location.djinn?.forEach(node => {
        logicMap.djinn.push({ flag: node.flag, access: combineAccess(location.access, node.access) });
    });
    location.progression?.forEach(node => {
        logicMap.progression.push({ key: node.key, access: combineAccess(location.access, node.access) });
    });
}

/**
 * Loads all location data.
 */
function loadAll() : LogicMap {
    const logicMap : LogicMap = { items: [], djinn: [], progression: [] };

    const locations = [locAirsRock, locAlhafra, locAlhafranCave, locAnemosInnerSanctum, locAngaraCavern, locAnkohlRuins,
        locApojiiIslands, locAquaRock, locAttekaCavern, locAttekaInlet, locChampa, locContigo, locDaila, locDehkanPlateau,
        locETundariaIslet, locGabombaCatacombs, locGabombaStatue, locGaiaRock, locGaroh, locGondowanCliffs,
        locGondowanSettlement, locHesperiaSettlement, locIdejima, locIndraCavern, locIsletCave, locIzumo, locJupiterLighthouse,
        locKaltIsland, locKandoreanTemple, locKibombo, locKibomboMountains, locLemuria, locLemurianShip, locLoho, locMadra,
        locMadraCatacombs, locMagmaRock, locMarsLighthouse, locMikasalla, locNaribwe, locNOseniaIslet, locOseniaCavern,
        locOseniaCliffs, locOverworld, locProx, locSeaGodShrine, locSEAngaraIslet, locSeaOfTime, locSeaOfTimeIslet,
        locShamanVillage, locShamanVillageCave, locStartingInventories, locSWAttekaIslet, locTaopoSwamp, locTreasureIsle,
        locTundariaTower, locWIndraIslet, locYallam, locYampiDesert, locYampiDesertCave];

    locations.forEach(loc => loadLocation(logicMap, loc));
    return logicMap;
}

const allNodes : LogicMap = loadAll();

/**
 * Returns a deep copy of all location logic nodes.
 */
export function getAllNodes() : LogicMap {
    return structuredClone(allNodes);
}