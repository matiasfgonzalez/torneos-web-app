import { PlayerCard } from "@/components/jugadores/player-card";

const players = [
  {
    name: "Lionel Messi",
    team: "Inter Miami CF",
    imageFront: "/messi-front.jpg",
    imageBack: "/messi-back.jpg",
  },
  {
    name: "Cristiano Ronaldo",
    team: "Al-Nassr",
    imageFront: "/ronaldo-front.jpg",
    imageBack: "/ronaldo-back.jpg",
  },
  {
    name: "Kylian Mbappé",
    team: "Real Madrid",
    imageFront: "/mbappe-front.jpg",
    imageBack: "/mbappe-back.jpg",
  },
];

const page = () => {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-center">
        <h1 className="text-red-900 text-5xl pb-1">Jugadores del equipo</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center">
        {players.map((player) => (
          <PlayerCard
            key={player.name}
            name={player.name}
            team={player.team}
            imageFront={player.imageFront}
            imageBack={player.imageBack}
          />
        ))}
      </div>
    </main>
  );
};

export default page;
