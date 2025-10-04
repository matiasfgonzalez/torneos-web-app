const stats = [
  { number: "15", label: "Torneos Activos" },
  { number: "248", label: "Equipos Registrados" },
  { number: "1.247", label: "Partidos Jugados" },
  { number: "3.891", label: "Goles Anotados" },
];

export default function Stats() {
  return (
    <section className="bg-[#16213e] py-16 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-6">
        {stats.map((s) => (
          <div
            key={s.number}
            className="text-center p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:-translate-y-2 hover:border-purple-400/50 transition"
          >
            <span className="block text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-indigo-300 bg-clip-text text-transparent">
              {s.number}
            </span>
            <span className="block text-gray-300 mt-2">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
