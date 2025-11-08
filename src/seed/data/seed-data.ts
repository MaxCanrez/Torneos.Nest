export interface SeedEquipo {
  nombre: string;
  jugadores: string[];
}

export interface SeedTorneo {
  nombreTorneo: string;
  nombreDeporte: string;
  fechaInicio: string;
  fechaFin: string;
  fechaInscripcionLimite: string;
  minJugadores: number;
  maxJugadores: number;
  lugar: string;
  descripcion: string;
  detalles: string;
  reglas: string;
}

export interface SeedUsuario {
  nombre: string;
  email: string;
  expediente: string;
  password: string;
}

export interface SeedData {
  equipos: SeedEquipo[];
  torneos: SeedTorneo[];
  usuarios: SeedUsuario[];
}

export const initialData: SeedData = {
  equipos: [
    { nombre: 'Hunters', jugadores: ['Samuel', 'Sebas', 'Isaac', 'Erick'] },
    { nombre: 'Raptors', jugadores: ['Juan', 'Luis', 'Pedro', 'Miguel'] },
    { nombre: 'Titans', jugadores: ['Ana', 'Carla', 'Sofía', 'Mónica'] },
    { nombre: 'Warriors', jugadores: ['Diego', 'Fernando', 'Mario', 'Carlos'] },
    { nombre: 'Gladiators', jugadores: ['Laura', 'Elena', 'Paula', 'Natalia'] },
    { nombre: 'Vikings', jugadores: ['Hugo', 'Iván', 'Raúl', 'Tomás'] },
    { nombre: 'Samurais', jugadores: ['Marta', 'Claudia', 'Lucía', 'Patricia'] },
    { nombre: 'Dragons', jugadores: ['Andrés', 'Felipe', 'Raúl', 'Diego'] },
    { nombre: 'Spartans', jugadores: ['Ricardo', 'Javier', 'Luis', 'Héctor'] },
    { nombre: 'Phoenix', jugadores: ['Valeria', 'Camila', 'Sofía', 'Isabel'] },
    { nombre: 'Sharks', jugadores: ['Mateo', 'Damián', 'Nicolás', 'Lucas'] },
    { nombre: 'Tigers', jugadores: ['Diego', 'Sebastián', 'Jorge', 'Miguel'] },
    { nombre: 'Falcons', jugadores: ['Fernando', 'Raúl', 'Andrés', 'Hugo'] },
    { nombre: 'Bulls', jugadores: ['Carlos', 'Mario', 'Pedro', 'Luis'] },
    { nombre: 'Eagles', jugadores: ['Laura', 'Ana', 'Paula', 'Claudia'] },
    { nombre: 'Cobras', jugadores: ['Iván', 'Tomás', 'Diego', 'Ricardo'] },
    { nombre: 'Panthers', jugadores: ['Mónica', 'Lucía', 'Natalia', 'Sofía'] },
    { nombre: 'Ravens', jugadores: ['Javier', 'Héctor', 'Mateo', 'Damián'] },
    { nombre: 'Wolves', jugadores: ['Nicolás', 'Lucas', 'Diego', 'Sebastián'] },
    { nombre: 'Hornets', jugadores: ['Andrés', 'Carlos', 'Pedro', 'Miguel'] },
  ],
  torneos: [
    {
      nombreTorneo: 'Basquetbol',
      nombreDeporte: 'Basquetbol',
      fechaInicio: '2025-11-08',
      fechaFin: '2026-11-08',
      fechaInscripcionLimite: '2025-12-08',
      minJugadores: 5,
      maxJugadores: 20,
      lugar: 'Auditorio FIF',
      descripcion: 'Torneo de basquetbol universitario',
      detalles: 'Partidos en la uni',
      reglas: 'no matarseX2',
    },
    {
      nombreTorneo: 'Futbol',
      nombreDeporte: 'Futbol',
      fechaInicio: '2025-09-01',
      fechaFin: '2026-06-30',
      fechaInscripcionLimite: '2025-09-15',
      minJugadores: 7,
      maxJugadores: 22,
      lugar: 'Cancha Central',
      descripcion: 'Torneo de futbol interfacultades',
      detalles: 'Partidos los fines de semana',
      reglas: 'No agresión física',
    },
    {
      nombreTorneo: 'Voleibol',
      nombreDeporte: 'Voleibol',
      fechaInicio: '2025-10-01',
      fechaFin: '2026-04-01',
      fechaInscripcionLimite: '2025-10-15',
      minJugadores: 6,
      maxJugadores: 12,
      lugar: 'Gimnasio A',
      descripcion: 'Torneo de voleibol mixto',
      detalles: 'Partidos martes y jueves',
      reglas: 'Se permiten hasta 3 toques',
    },
    {
      nombreTorneo: 'Tenis',
      nombreDeporte: 'Tenis',
      fechaInicio: '2025-08-01',
      fechaFin: '2025-12-01',
      fechaInscripcionLimite: '2025-08-15',
      minJugadores: 1,
      maxJugadores: 2,
      lugar: 'Cancha 5',
      descripcion: 'Torneo de tenis individual',
      detalles: 'Partidos individuales',
      reglas: 'Tie-break a 7 puntos',
    },
    {
      nombreTorneo: 'Ajedrez',
      nombreDeporte: 'Ajedrez',
      fechaInicio: '2025-11-15',
      fechaFin: '2025-12-15',
      fechaInscripcionLimite: '2025-11-20',
      minJugadores: 1,
      maxJugadores: 1,
      lugar: 'Sala de Juegos',
      descripcion: 'Torneo de ajedrez rápido',
      detalles: 'Partidas de 15 minutos',
      reglas: 'Sistema suizo',
    },
  ],
usuarios: [
  { nombre: 'Maximiliano Cano', email: 'max@gmail.com', expediente: '1001', password: 'Abc123' },
  { nombre: 'Sofía López', email: 'sofia@gmail.com', expediente: '1002', password: 'Abc123' },
  { nombre: 'Diego Hernández', email: 'diego@gmail.com', expediente: '1003', password: 'Abc123' },
  { nombre: 'Valentina Torres', email: 'valentina@gmail.com', expediente: '1004', password: 'Abc123' },
  { nombre: 'Sebastián Morales', email: 'sebastian@gmail.com', expediente: '1005', password: 'Abc123' },
  { nombre: 'Camila Rojas', email: 'camila@gmail.com', expediente: '1006', password: 'Abc123' },
  { nombre: 'Javier González', email: 'javier@gmail.com', expediente: '1007', password: 'Abc123' },
  { nombre: 'Isabella Castro', email: 'isabella@gmail.com', expediente: '1008', password: 'Abc123' },
  { nombre: 'Fernando Pérez', email: 'fernando@gmail.com', expediente: '1009', password: 'Abc123' },
  { nombre: 'Martina Sánchez', email: 'martina@gmail.com', expediente: '1010', password: 'Abc123' },
  { nombre: 'Ricardo Díaz', email: 'ricardo@gmail.com', expediente: '1011', password: 'Abc123' },
  { nombre: 'Natalia Vega', email: 'natalia@gmail.com', expediente: '1012', password: 'Abc123' },
  { nombre: 'Andrés Ramírez', email: 'andres@gmail.com', expediente: '1013', password: 'Abc123' },
  { nombre: 'Lucía Herrera', email: 'lucia@gmail.com', expediente: '1014', password: 'Abc123' },
  { nombre: 'Oscar Medina', email: 'oscar@gmail.com', expediente: '1015', password: 'Abc123' },
  { nombre: 'Gabriela Fuentes', email: 'gabriela@gmail.com', expediente: '1016', password: 'Abc123' },
  { nombre: 'Emiliano Rivas', email: 'emiliano@gmail.com', expediente: '1017', password: 'Abc123' },
  { nombre: 'Paola Morales', email: 'paola@gmail.com', expediente: '1018', password: 'Abc123' },
  { nombre: 'Mateo Cruz', email: 'mateo@gmail.com', expediente: '1019', password: 'Abc123' },
  { nombre: 'Fernanda Ortiz', email: 'fernanda@gmail.com', expediente: '1020', password: 'Abc123' },
]

};

