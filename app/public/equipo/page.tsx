import React from "react";
import TeamLineup from "./TeamLineup";

// Jugador genérico
interface Player {
  id: string; // UUID o identificador único
  name: string; // Nombre del jugador
  position: string; // Ejemplo: "GK", "DF", "MF", "FW"
  nationality: string; // País (puede ser código ISO: "DE", "NG", "BR", etc.)
  isCaptain?: boolean; // True si es capitán
  shirtNumber?: number; // Número de camiseta
}

// Titulares con posición en el campo
interface StartingPlayer extends Player {
  fieldPosition: {
    row: number; // fila dentro del esquema táctico (ej: 1=portero, 2=defensas, etc.)
    column: number; // columna relativa (para ordenar izquierda-centro-derecha)
  };
}

// Suplentes
interface SubstitutePlayer extends Player {
  role?: string; // Ejemplo: "GK", "MF", "FW"
}

// Plantilla del equipo
interface TeamLineup {
  teamName: string;
  formation: string; // Ejemplo: "4-2-3-1"
  startingXI: StartingPlayer[]; // Titulares
  substitutes: SubstitutePlayer[]; // Banco
}

const page = () => {
  return <TeamLineup />;
};

export default page;
