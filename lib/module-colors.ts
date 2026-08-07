const colors = [
  "bg-gradient-to-br from-blue-400 to-indigo-600 text-white",
  "bg-gradient-to-br from-purple-400 to-pink-600 text-white",
  "bg-gradient-to-br from-cyan-400 to-blue-500 text-white",
  "bg-gradient-to-br from-emerald-400 to-green-600 text-white",
  "bg-gradient-to-br from-orange-400 to-amber-600 text-white",
  "bg-gradient-to-br from-rose-400 to-red-600 text-white",
  "bg-gradient-to-br from-fuchsia-400 to-purple-600 text-white",
  "bg-gradient-to-br from-lime-400 to-emerald-600 text-white",
];

export function getModuleColor(seed: string) {
  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash =
      seed.charCodeAt(i) +
      ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}