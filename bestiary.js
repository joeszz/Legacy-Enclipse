/* ============================================================
   ECLIPSE RPG — BESTIARY / MONSTER INDEX
   ============================================================ */
const BESTIARY_KEY = 'eclipse_rpg_bestiary_v1';

const BESTIARY = {
  discovered: {},
  defeated: {},
  load() {
    try {
      const raw = localStorage.getItem(BESTIARY_KEY);
      if (raw) Object.assign(this, JSON.parse(raw));
    } catch (_) {}
  },
  save() {
    try {
      localStorage.setItem(BESTIARY_KEY, JSON.stringify({
        discovered: this.discovered,
        defeated: this.defeated
      }));
    } catch (_) {}
  },
  discover(def) {
    if (!def || !def.n) return;
    this.discovered[def.n] = true;
    this.save();
  },
  defeat(def) {
    if (!def || !def.n) return;
    this.discovered[def.n] = true;
    this.defeated[def.n] = (this.defeated[def.n] || 0) + 1;
    this.save();
  },
  isDiscovered(name) {
    return !!this.discovered[name];
  },
  countDiscovered() {
    return Object.keys(this.discovered).length;
  },
  countDefeated() {
    return Object.values(this.defeated).reduce((a, b) => a + b, 0);
  },
  getEntries() {
    return (typeof ET !== 'undefined' ? ET : []).map((def, index) => ({
      id: index,
      name: def.n,
      type: def.p,
      variant: def.v,
      hp: def.hp,
      atk: def.atk,
      discovered: !!this.discovered[def.n],
      defeated: this.defeated[def.n] || 0,
      boss: !!def.boss
    }));
  }
};

BESTIARY.load();

function bestiaryDiscover(def) {
  if (typeof BESTIARY !== 'undefined') BESTIARY.discover(def);
}

function bestiaryRecordDefeat(def) {
  if (typeof BESTIARY !== 'undefined') BESTIARY.defeat(def);
}
