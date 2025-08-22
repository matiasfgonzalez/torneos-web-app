"use client";

import "./player-card.css";

export function PlayerCard() {
  return (
    <div className="wrapper">
      <div className="card">
        <div
          className="imgContainer"
          style={{ ["--imgUrl" as string]: "url(/jugadores/thor.jpg)" }}
        ></div>
        <div
          className="img"
          style={{ ["--pngImgUrl" as string]: "url(/jugadores/thor.png)" }}
        >
          <div className="overLayer"></div>
        </div>
      </div>
    </div>
  );
}
