const dateKey = new Date("2026-02-21").toISOString().split('T')[0];
console.log("DateKey for 2026-02-21 is:", dateKey);
const todayStr = "2026-02-21";
const d = new Date(todayStr);
console.log(isNaN(d.getTime()));
console.log(d.toISOString());
