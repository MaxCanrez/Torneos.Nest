export interface SeedEquipo {
  nombre: string;
  jugadores: string[];
  logoUrl: string;
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
    { nombre: 'Hunters', jugadores: ['Samuel', 'Sebas', 'Isaac', 'Erick'], logoUrl: "52ce63f4-582c-47c8-837a-b555da9b46a6-1762642022721.png"},
    { nombre: 'Raptors', jugadores: ['Juan', 'Luis', 'Pedro', 'Miguel'], logoUrl: "ea3d3507-0703-421b-b207-80d3aa50529d-1762643935247.png" },
    { nombre: 'Titans', jugadores: ['Ana', 'Carla', 'Sofía', 'Mónica'], logoUrl: "ee0cae23-2b3c-4cdd-8959-7e0719a661a7-1762643947849.png" },
    { nombre: 'Warriors', jugadores: ['Diego', 'Fernando', 'Mario', 'Carlos'], logoUrl: "98193c01-6204-4a83-8520-7ea02b4a0a6b-1762643816780.png" },
    { nombre: 'Gladiators', jugadores: ['Laura', 'Elena', 'Paula', 'Natalia'], logoUrl: "2595762b-1aef-4072-bceb-aeb4f4486ba2-1762643715914.png" },
    { nombre: 'Vikings', jugadores: ['Hugo', 'Iván', 'Raúl', 'Tomás'], logoUrl: "b8e5a959-8344-47b5-9e5f-6a7e867d65e1-1762643839524.jpg" },
    { nombre: 'Samurais', jugadores: ['Marta', 'Claudia', 'Lucía', 'Patricia'], logoUrl: "d4a8489e-dc73-48d7-8de1-d3e710d8b0d6-1762643878337.png" },
    { nombre: 'Dragons', jugadores: ['Andrés', 'Felipe', 'Raúl', 'Diego'], logoUrl: "9c43fbee-61c1-44a5-b592-50b4d027626a-1762643827127.png" },
    { nombre: 'Spartans', jugadores: ['Ricardo', 'Javier', 'Luis', 'Héctor'], logoUrl: "c6b037d4-8978-4aa4-87e3-e8194c5b0154-1762643866607.png" },
    { nombre: 'Phoenix', jugadores: ['Valeria', 'Camila', 'Sofía', 'Isabel'], logoUrl: "c2ae1b07-0b20-400c-8e4b-a22c359065a6-1762643854011.png" },
    { nombre: 'Sharks', jugadores: ['Mateo', 'Damián', 'Nicolás', 'Lucas'], logoUrl: "6ed0fd18-ea81-40ce-af89-7de846b98bd9-1762643758823.png" },
    { nombre: 'Tigers', jugadores: ['Diego', 'Sebastián', 'Jorge', 'Miguel'], logoUrl: "68e869b7-f530-49b4-a7dd-fb9f4c1594f4-1762643744283.png" },
    { nombre: 'Falcons', jugadores: ['Fernando', 'Raúl', 'Andrés', 'Hugo'], logoUrl: "0c5f020a-7d55-49bc-bf36-f8727d46627d-1762643093746.png" },
    { nombre: 'Bulls', jugadores: ['Carlos', 'Mario', 'Pedro', 'Luis'], logoUrl: "549fd8eb-6e19-4573-a081-c6a4f0c5d858-1762643729614.png" },
    { nombre: 'Eagles', jugadores: ['Laura', 'Ana', 'Paula', 'Claudia'], logoUrl: "e5256d36-4a6a-4e80-8397-6a4a72c6f694-1762643901963.png" },
    { nombre: 'Cobras', jugadores: ['Iván', 'Tomás', 'Diego', 'Ricardo'], logoUrl: "787d95cf-1538-4cb6-8cc8-99098b8c5e37-1762643794450.png" },
    { nombre: 'Panthers', jugadores: ['Mónica', 'Lucía', 'Natalia', 'Sofía'], logoUrl: "777a4f8b-81a9-447e-8d07-61760bbfd0f0-1762643772025.png" },
    { nombre: 'Ravens', jugadores: ['Javier', 'Héctor', 'Mateo', 'Damián'], logoUrl: "dfb783f0-582f-4a28-aec0-909d2a920d9b-1762643891199.png" },
    { nombre: 'Wolves', jugadores: ['Nicolás', 'Lucas', 'Diego', 'Sebastián'], logoUrl: "8a1ed2ca-55df-4988-a553-cf8c89056326-1762643805926.png" },
    { nombre: 'Hornets', jugadores: ['Andrés', 'Carlos', 'Pedro', 'Miguel'], logoUrl: "e6a0e147-80c6-4e36-b6a8-3d775bb9a0f9-1762643921152.png" },
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

