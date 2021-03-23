function pickIndex(prng, weights, totalWeight = undefined) {
    if (totalWeight == undefined) {
        totalWeight = 0;
        weights.forEach((w) => totalWeight += w);
    }

    var pick;
    var rand = prng.random() * totalWeight;
    for (var i = 0; i < weights.length && rand > 0; ++i) {
        pick = i;
        rand -= weights[i];
    }
    return pick;
}

module.exports = {pickIndex};