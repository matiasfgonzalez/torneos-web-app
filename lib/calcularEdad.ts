export function calcularEdad(fechaNacimiento: string | Date): number {
  const fecha = new Date(fechaNacimiento);
  const hoy = new Date();

  let edad = hoy.getFullYear() - fecha.getFullYear();
  const mes = hoy.getMonth() - fecha.getMonth();
  const dia = hoy.getDate() - fecha.getDate();

  // Si aún no cumplió años en el año actual, restamos 1
  if (mes < 0 || (mes === 0 && dia < 0)) {
    edad--;
  }

  return edad;
}
