"use client";

import "./player-card.css";

interface PlayerCardProps {
  name: string;
  team: string;
  imageFront: string;
  imageBack: string;
}

export function PlayerCard({
  name,
  team,
  imageFront,
  imageBack,
}: PlayerCardProps) {
  return (
    <div className="wrapper">
      <div className="card">
        <div
          className="imgContainer"
          style={{ ["--imgUrl" as any]: "url(/jugadores/thor.jpg)" }}
        ></div>
        <div
          className="img"
          style={{ ["--pngImgUrl" as any]: "url(/jugadores/thor.png)" }}
        >
          <div className="overLayer"></div>
        </div>
      </div>
    </div>
  );
}
