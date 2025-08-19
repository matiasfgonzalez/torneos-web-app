import { PlayerCard } from "@/components/jugadores/player-card";
import Aurora from "@/components/reactbits/aurora/Aurora";
import LightRays from "@/components/reactbits/lightRays/LightRays";
import Particles from "@/components/reactbits/particles/Particles";

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
    <div className="relative w-full min-h-screen">
      {/* Contenedor del Aurora */}
      <div className="absolute inset-0 -z-10">
        {/*<Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />*/}
        <Particles
          particleColors={["#ffffff", "#ffffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Contenido */}
      <main className="relative z-10 min-h-screen p-8">
        <div className="flex justify-center mb-8">
          <h1 className="text-white text-5xl font-bold text-center">
            Jugadores del equipo
          </h1>
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
    </div>
  );
};

export default page;
