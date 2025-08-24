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

const fulhamLineup: TeamLineup = {
  teamName: "Fulham",
  formation: "4-2-3-1",
  startingXI: [
    {
      id: "1",
      name: "Leno",
      position: "GK",
      nationality: "DE",
      isCaptain: true,
      fieldPosition: { row: 1, column: 2 },
    },
    {
      id: "2",
      name: "Tete",
      position: "DF",
      nationality: "NL",
      fieldPosition: { row: 2, column: 1 },
    },
    {
      id: "3",
      name: "Andersen",
      position: "DF",
      nationality: "DK",
      fieldPosition: { row: 2, column: 2 },
    },
    {
      id: "4",
      name: "Bassey",
      position: "DF",
      nationality: "NG",
      fieldPosition: { row: 2, column: 3 },
    },
    {
      id: "5",
      name: "Castagne",
      position: "DF",
      nationality: "BE",
      fieldPosition: { row: 2, column: 4 },
    },
    {
      id: "6",
      name: "Lukić",
      position: "MF",
      nationality: "RS",
      fieldPosition: { row: 3, column: 2 },
    },
    {
      id: "7",
      name: "Berge",
      position: "MF",
      nationality: "NO",
      fieldPosition: { row: 3, column: 3 },
    },
    {
      id: "8",
      name: "Iwobi",
      position: "MF",
      nationality: "NG",
      fieldPosition: { row: 4, column: 1 },
    },
    {
      id: "9",
      name: "King",
      position: "MF",
      nationality: "GB",
      fieldPosition: { row: 4, column: 2 },
    },
    {
      id: "10",
      name: "Sessegnon",
      position: "MF",
      nationality: "GB",
      fieldPosition: { row: 4, column: 3 },
    },
    {
      id: "11",
      name: "Muniz",
      position: "FW",
      nationality: "BR",
      fieldPosition: { row: 5, column: 2 },
    },
  ],
  substitutes: [
    {
      id: "12",
      name: "Benjamin Lecomte",
      position: "GK",
      nationality: "FR",
      role: "GK",
    },
    { id: "13", name: "Harrison Reed", position: "MF", nationality: "GB" },
    { id: "14", name: "Raúl Jiménez", position: "FW", nationality: "MX" },
    { id: "15", name: "Harry Wilson", position: "MF", nationality: "GB" },
    { id: "16", name: "Tom Cairney", position: "MF", nationality: "GB" },
    { id: "17", name: "Adama Traoré", position: "FW", nationality: "ES" },
    { id: "18", name: "Jorge Cuenca", position: "DF", nationality: "ES" },
    { id: "19", name: "Emile Smith Rowe", position: "MF", nationality: "GB" },
    { id: "20", name: "Antonee Robinson", position: "DF", nationality: "US" },
  ],
};

const page = () => {
  return <TeamLineup />;
};

export default page;
