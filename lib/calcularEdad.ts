export function calcularEdad(fechaNacimiento: string | Date): number {
  const fecha = new Date(fechaNacimiento);
  const hoy = new Date();

  // La fecha de nacimiento es date-only: se guarda como medianoche UTC, así que
  // se lee en UTC (getUTC*). Si se leyera en hora local, al oeste de Greenwich
  // caería en el día anterior y la edad podía quedar corrida el día del
  // cumpleaños. "Hoy" sí es local (la fecha civil del que mira).
  let edad = hoy.getFullYear() - fecha.getUTCFullYear();
  const mes = hoy.getMonth() - fecha.getUTCMonth();
  const dia = hoy.getDate() - fecha.getUTCDate();

  // Si aún no cumplió años en el año actual, restamos 1
  if (mes < 0 || (mes === 0 && dia < 0)) {
    edad--;
  }

  return edad;
}

