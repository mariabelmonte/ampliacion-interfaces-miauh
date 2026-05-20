import { Injectable } from '@angular/core';

export type HttpQueryParams = Record<
  string,
  string | number | boolean | readonly (string | number | boolean)[]
>;

export type JsonRequestBody = object | readonly unknown[] | null;

type RolUsuario = 'USER' | 'SUPERUSER' | 'ADMINISTRATOR';

interface Catalogo {
  id: number;
  nombre: string;
}

interface Especie extends Catalogo {
  idEspecie?: number;
}

interface Raza extends Catalogo {
  idRaza: number;
  especie: Especie;
}

interface AnimalMock {
  id: number;
  nombre: string;
  capa: string;
  sexo: string;
  tamanyo: string;
  procedencia: string | null;
  fechaNacimiento: string | null;
  fechaIngreso: string | null;
  esterilizado: boolean;
  numeroChip: string | null;
  comentarios: string | null;
  imagenUrl?: string;
  imagenAlt?: string;
  imagenTamanyo?: 'sm' | 'md' | 'lg';
  ppp?: boolean | null;
  raza?: Raza;
  situacion?: Catalogo;
  ubicacion?: Catalogo;
  especie?: Especie;
  nombreRaza?: string;
  nombreEspecie?: string;
  nombreSituacion?: string;
  nombreUbicacion?: string;
}

interface AdoptanteMock {
  id: number;
  identificacion: string;
  nombre: string;
  apellidos: string;
  nombreCompleto: string;
  telefonoPrincipal: string;
  telefonoAdoptante: string;
  telefonoSecundario?: string;
  email: string;
  direccion: Record<string, string | number | undefined>;
  observaciones?: string;
  totalAnimales: number;
  numeroAnimales?: number;
}

interface TransaccionMock {
  id: number;
  idAdoptante: number;
  idAnimal: number;
  nombreAdoptante?: string;
  telefonoAdoptante: string;
  nombreAnimal?: string;
  fechaInicio: string | null;
  fechaAdopcion?: string | null;
  fechaFin?: string | null;
  fechaSalida?: string | null;
  observaciones: string;
  tipo: 'ACOGIDA' | 'ADOPCION';
}

interface EventoMock {
  id: number;
  titulo: string;
  descripcion?: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  color: string;
  idRefeExterna: number | null;
  tipoRefeExterna: 'ANIMAL' | 'TRATAMIENTO' | 'ADOPCION' | 'GENERAL';
  nombreCategoria: string;
  completado: boolean;
  tipo: 'EVENTO' | 'SEGUIMIENTO';
  realizado?: boolean;
  comentarios?: string;
  idReferencia?: number;
}

interface SeguimientoMock {
  id: number;
  adopcion: number;
  fechaPrevista: string;
  realizado: boolean;
  comentario: string;
}

interface TratamientoMock {
  id: number;
  idAnimal: number;
  tipo: string;
  fecha: string;
  informacion?: string | null;
  nombreTipoVacuna?: string;
  nombreTipoTest?: string;
  nombreTipoDesparasitacion?: string;
  resultado?: boolean | null;
  medicacion?: string | null;
}

interface UsuarioMock {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  rol: RolUsuario;
  activo: boolean;
}

interface MockDb {
  animales: AnimalMock[];
  adoptantes: AdoptanteMock[];
  transacciones: TransaccionMock[];
  eventos: EventoMock[];
  seguimientos: SeguimientoMock[];
  tratamientos: TratamientoMock[];
  especies: Especie[];
  razas: Raza[];
  ubicaciones: Catalogo[];
  situaciones: Catalogo[];
  tiposVacuna: Catalogo[];
  tiposTest: Catalogo[];
  tiposDesparasitacion: Catalogo[];
  usuarios: UsuarioMock[];
}

type MutableCollection =
  | 'animales'
  | 'adoptantes'
  | 'transacciones'
  | 'eventos'
  | 'seguimientos'
  | 'tratamientos'
  | 'tiposVacuna'
  | 'tiposTest'
  | 'tiposDesparasitacion'
  | 'usuarios';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly storageKey = 'miauh_mock_db';

  async apiGet<T>(endpoint: string, _params: HttpQueryParams = {}): Promise<T> {
    return this.resolve<T>('GET', endpoint);
  }

  async apiPost<T, TBody = JsonRequestBody>(endpoint: string, body: TBody): Promise<T> {
    return this.resolve<T>('POST', endpoint, body);
  }

  async apiPut<T, TBody = JsonRequestBody>(endpoint: string, body: TBody): Promise<T> {
    return this.resolve<T>('PUT', endpoint, body);
  }

  async apiDelete<T>(endpoint: string, _params: HttpQueryParams = {}): Promise<T> {
    return this.resolve<T>('DELETE', endpoint);
  }

  async apiPatch<T, TBody = JsonRequestBody>(endpoint: string, body: TBody): Promise<T> {
    return this.resolve<T>('PATCH', endpoint, body);
  }

  setConfig(_config: string): void {
    return;
  }

  async apiUsuariosGet<T>(endpoint: string, params: HttpQueryParams = {}): Promise<T> {
    return this.apiGet<T>(endpoint, params);
  }

  async apiUsuariosPost<T, TBody = JsonRequestBody>(endpoint: string, body: TBody): Promise<T> {
    return this.apiPost<T, TBody>(endpoint, body);
  }

  async apiUsuariosPatch<T, TBody = JsonRequestBody>(endpoint: string, body: TBody): Promise<T> {
    return this.apiPatch<T, TBody>(endpoint, body);
  }

  async apiCalendarioGet<T>(endpoint: string, params: HttpQueryParams = {}): Promise<T> {
    return this.apiGet<T>(endpoint, params);
  }

  async apiCalendarioPost<T, TBody = JsonRequestBody>(endpoint: string, body: TBody): Promise<T> {
    return this.apiPost<T, TBody>(endpoint, body);
  }

  async apiCalendarioDelete<T>(endpoint: string, params: HttpQueryParams = {}): Promise<T> {
    return this.apiDelete<T>(endpoint, params);
  }

  async apiCalendarioPatch<T, TBody = JsonRequestBody>(endpoint: string, body: TBody): Promise<T> {
    return this.apiPatch<T, TBody>(endpoint, body);
  }

  private resolve<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
    const db = this.readDb();
    const cleanEndpoint = endpoint.split('?')[0];
    const result = this.handleRequest(method, cleanEndpoint, body, db);
    this.writeDb(db);
    return Promise.resolve(this.clone(result) as T);
  }

  private handleRequest(method: string, endpoint: string, body: unknown, db: MockDb): unknown {
    if (endpoint === 'api/auth/login' && method === 'POST') return this.login(body, db);
    if (endpoint === 'api/auth/register' && method === 'POST') return this.register(body, db);

    if (endpoint === 'api/usuarios/me' && method === 'GET') return this.publicUser(db.usuarios[0]);
    if (endpoint === 'api/usuarios/findAll' && method === 'GET') return db.usuarios.map((user) => this.publicUser(user));
    if (endpoint === 'api/usuarios/save' && method === 'POST') return this.saveUsuario(body, db);
    if (endpoint.startsWith('api/usuarios/') && method === 'GET') {
      return this.publicUser(this.findById(db.usuarios, this.idFromEndpoint(endpoint)));
    }
    if (endpoint.includes('/rol/') && method === 'PATCH') return this.cambiarRol(endpoint, db);
    if (endpoint.endsWith('/activar') && method === 'PATCH') return this.setUsuarioActivo(endpoint, db, true);
    if (endpoint.endsWith('/desactivar') && method === 'PATCH') return this.setUsuarioActivo(endpoint, db, false);

    if (endpoint === 'api/especie/findAll') return db.especies;
    if (endpoint === 'api/raza/findAll') return db.razas;
    if (endpoint.startsWith('api/raza/findByEspecie/')) {
      const especieId = this.idFromEndpoint(endpoint);
      return db.razas.filter((raza) => raza.especie.id === especieId || raza.especie.idEspecie === especieId);
    }
    if (endpoint === 'api/ubicacion/findAll') return db.ubicaciones;
    if (endpoint === 'api/situacion/findAll') return db.situaciones;

    if (endpoint === 'api/animal/findAll') return db.animales;
    if (endpoint === 'api/animal/findPerros') return this.animalesByEspecie(db, 1);
    if (endpoint === 'api/animal/findGatos') return this.animalesByEspecie(db, 2);
    if (endpoint === 'api/animal/disponibles') return this.animalesDisponibles(db);
    if (endpoint.startsWith('api/animal/findByEspecie/')) return this.animalesByEspecie(db, this.idFromEndpoint(endpoint));
    if (endpoint === 'api/animal/save' && method === 'POST') return this.saveAnimal(body, db);
    if (endpoint === 'api/animal/situacion' && method === 'PUT') return this.updateSituacion(body, db);
    if (endpoint.startsWith('api/animal/') && method === 'GET') return this.findById(db.animales, this.idFromEndpoint(endpoint));
    if (endpoint.startsWith('api/animal/') && method === 'DELETE') return this.deleteById(db.animales, this.idFromEndpoint(endpoint));

    if (endpoint === 'api/adoptante/findAll') return this.adoptantesConTotales(db);
    if (endpoint === 'api/adoptante/save' && method === 'POST') return this.saveAdoptante(body, db);
    if (endpoint.startsWith('api/adoptante/') && method === 'GET') return this.findById(this.adoptantesConTotales(db), this.idFromEndpoint(endpoint));
    if (endpoint.startsWith('api/adopcion/findByAdoptante/')) return this.animalesVinculados(db, this.idFromEndpoint(endpoint), 'ADOPCION');
    if (endpoint.startsWith('api/acogida/findByAdoptante/')) return this.animalesVinculados(db, this.idFromEndpoint(endpoint), 'ACOGIDA');

    if (endpoint === 'api/acogida/findAll') return this.transaccionesConNombres(db, 'ACOGIDA');
    if (endpoint === 'api/adopcion/findAll') return this.transaccionesConNombres(db, 'ADOPCION');
    if (endpoint === 'api/acogida/save' && method === 'POST') return this.saveTransaccion(body, db, 'ACOGIDA');
    if (endpoint === 'api/adopcion/save' && method === 'POST') return this.saveTransaccion(body, db, 'ADOPCION');
    if (endpoint.startsWith('api/acogida/') && method === 'GET') return this.findTransaccion(db, this.idFromEndpoint(endpoint), 'ACOGIDA');
    if (endpoint.startsWith('api/adopcion/') && method === 'GET') return this.findTransaccion(db, this.idFromEndpoint(endpoint), 'ADOPCION');

    if (endpoint === 'api/calendario/findAll') return db.eventos;
    if ((endpoint === 'api/calendario/save' || endpoint === 'api/calendario/update') && method === 'POST') return this.saveEvento(body, db);
    if (endpoint.startsWith('api/calendario/completar/') && method === 'PATCH') return this.completarEvento(db, this.idFromEndpoint(endpoint));
    if (endpoint.startsWith('api/calendario/') && method === 'DELETE') return this.deleteById(db.eventos, this.idFromEndpoint(endpoint));

    if (endpoint === 'api/seguimiento/findAll') return this.seguimientosCalendario(db);
    if (endpoint === 'api/seguimiento/save' && method === 'POST') return this.saveSeguimiento(body, db);
    if (endpoint.startsWith('api/seguimiento/') && method === 'GET') return this.findById(db.seguimientos, this.idFromEndpoint(endpoint));

    if (endpoint.startsWith('api/tratamiento/findByAnimal/')) {
      const idAnimal = this.idFromEndpoint(endpoint);
      return db.tratamientos.filter((item) => item.idAnimal === idAnimal);
    }
    if (endpoint === 'api/tratamiento/save' && method === 'POST') return this.saveTratamiento(body, db);

    if (endpoint.startsWith('api/tipo-vacuna/findByAnimal/')) return db.tiposVacuna;
    if (endpoint.startsWith('api/tipo-test/findByAnimal/')) return db.tiposTest;
    if (endpoint.startsWith('api/tipo-desparasitacion/findByAnimal/')) return db.tiposDesparasitacion;
    if (endpoint === 'api/tipo-vacuna' && method === 'POST') return this.saveCatalogo('tiposVacuna', body, db);
    if (endpoint === 'api/tipo-test' && method === 'POST') return this.saveCatalogo('tiposTest', body, db);
    if (endpoint === 'api/tipo-desparasitacion' && method === 'POST') return this.saveCatalogo('tiposDesparasitacion', body, db);

    console.warn(`Endpoint mock no definido: ${method} ${endpoint}`);
    return method === 'GET' ? [] : {};
  }

  private login(body: unknown, db: MockDb): unknown {
    const data = this.asRecord(body);
    const email = String(data['email'] ?? '');
    const user = db.usuarios.find((item) => item.email === email && item.activo) ?? db.usuarios[0];
    return this.authResponse(user);
  }

  private register(body: unknown, db: MockDb): unknown {
    const user = this.saveUsuario(body, db) as Omit<UsuarioMock, 'password'>;
    const storedUser = this.findById(db.usuarios, user.id);
    return this.authResponse(storedUser);
  }

  private saveUsuario(body: unknown, db: MockDb): unknown {
    const data = this.asRecord(body);
    const id = this.numberOrNull(data['id']) ?? this.nextId(db.usuarios);
    const existing = db.usuarios.find((user) => user.id === id);
    const user: UsuarioMock = {
      id,
      nombre: String(data['nombre'] ?? existing?.nombre ?? ''),
      apellidos: String(data['apellidos'] ?? existing?.apellidos ?? ''),
      email: String(data['email'] ?? existing?.email ?? ''),
      password: String(data['password'] ?? existing?.password ?? 'mock1234'),
      rol: this.toRol(data['rol'] ?? existing?.rol),
      activo: Boolean(data['activo'] ?? existing?.activo ?? true),
    };
    this.upsert(db.usuarios, user);
    return this.publicUser(user);
  }

  private cambiarRol(endpoint: string, db: MockDb): unknown {
    const parts = endpoint.split('/');
    const id = Number(parts[2]);
    const rol = this.toRol(parts[4]);
    const user = this.findById(db.usuarios, id);
    user.rol = rol;
    return this.publicUser(user);
  }

  private setUsuarioActivo(endpoint: string, db: MockDb, activo: boolean): unknown {
    const user = this.findById(db.usuarios, this.idFromEndpoint(endpoint));
    user.activo = activo;
    return this.publicUser(user);
  }

  private saveAnimal(body: unknown, db: MockDb): AnimalMock {
    const data = this.asRecord(body);
    const id = this.numberOrNull(data['id']) ?? this.nextId(db.animales);
    const existing = db.animales.find((animal) => animal.id === id);
    const especie = this.findOptional(db.especies, this.numberOrNull(data['especieId']) ?? existing?.especie?.id ?? 1);
    const raza = this.findOptional(db.razas, this.numberOrNull(data['razaId']) ?? existing?.raza?.id ?? 1);
    const ubicacion = this.findOptional(db.ubicaciones, this.numberOrNull(data['ubicacionId']) ?? existing?.ubicacion?.id ?? 1);
    const situacion = this.findOptional(db.situaciones, this.numberOrNull(data['situacionId']) ?? existing?.situacion?.id ?? 1);
    const animal = this.decorateAnimal({
      id,
      nombre: String(data['nombre'] ?? existing?.nombre ?? ''),
      capa: String(data['capa'] ?? existing?.capa ?? ''),
      sexo: String(data['sexo'] ?? existing?.sexo ?? ''),
      tamanyo: String(data['tamanyo'] ?? existing?.tamanyo ?? ''),
      procedencia: this.stringOrNull(data['procedencia'] ?? existing?.procedencia),
      fechaNacimiento: this.stringOrNull(data['fechaNacimiento'] ?? existing?.fechaNacimiento),
      fechaIngreso: this.stringOrNull(data['fechaIngreso'] ?? existing?.fechaIngreso),
      esterilizado: Boolean(data['esterilizado'] ?? existing?.esterilizado ?? false),
      numeroChip: this.stringOrNull(data['numeroChip'] ?? existing?.numeroChip),
      comentarios: this.stringOrNull(data['comentarios'] ?? existing?.comentarios),
      ppp: Boolean(data['ppp'] ?? existing?.ppp ?? false),
      imagenUrl: this.stringOrNull(data['imagenUrl'] ?? existing?.imagenUrl ?? this.defaultAnimalImage(especie?.nombre)) ?? undefined,
      imagenAlt: this.stringOrNull(data['imagenAlt'] ?? existing?.imagenAlt) ?? undefined,
      imagenTamanyo: this.toImageSize(data['imagenTamanyo'] ?? existing?.imagenTamanyo ?? 'md'),
      especie,
      raza,
      ubicacion,
      situacion,
    });
    this.upsert(db.animales, animal);
    return animal;
  }

  private updateSituacion(body: unknown, db: MockDb): AnimalMock {
    const data = this.asRecord(body);
    const animalData = this.asRecord(data['animal']);
    const animal = this.findById(db.animales, Number(animalData['id']));
    const situacionNombre = String(data['situacion'] ?? '');
    animal.situacion = db.situaciones.find((item) => item.nombre === situacionNombre) ?? animal.situacion;
    return this.decorateAnimal(animal);
  }

  private saveAdoptante(body: unknown, db: MockDb): AdoptanteMock {
    const data = this.asRecord(body);
    const id = this.numberOrNull(data['id']) ?? this.nextId(db.adoptantes);
    const existing = db.adoptantes.find((adoptante) => adoptante.id === id);
    const nombre = String(data['nombre'] ?? existing?.nombre ?? '');
    const apellidos = String(data['apellidos'] ?? existing?.apellidos ?? '');
    const telefono = String(data['telefonoAdoptante'] ?? data['telefonoPrincipal'] ?? existing?.telefonoPrincipal ?? '');
    const adoptante: AdoptanteMock = {
      id,
      identificacion: String(data['identificacion'] ?? existing?.identificacion ?? ''),
      nombre,
      apellidos,
      nombreCompleto: `${nombre} ${apellidos}`.trim(),
      telefonoPrincipal: telefono,
      telefonoAdoptante: telefono,
      telefonoSecundario: this.stringOrNull(data['telefonoSecundario'] ?? existing?.telefonoSecundario) ?? undefined,
      email: String(data['email'] ?? existing?.email ?? ''),
      direccion: this.toDireccion(data['direccion'] ?? existing?.direccion ?? {}),
      observaciones: this.stringOrNull(data['observaciones'] ?? existing?.observaciones) ?? undefined,
      totalAnimales: existing?.totalAnimales ?? 0,
    };
    this.upsert(db.adoptantes, adoptante);
    return adoptante;
  }

  private saveTransaccion(body: unknown, db: MockDb, tipo: 'ACOGIDA' | 'ADOPCION'): TransaccionMock {
    const data = this.asRecord(body);
    const id = this.numberOrNull(data['id']) ?? this.nextId(db.transacciones);
    const adoptante = this.findById(db.adoptantes, Number(data['idAdoptante']));
    const animal = this.findById(db.animales, Number(data['idAnimal']));
    const transaccion: TransaccionMock = {
      id,
      idAdoptante: adoptante.id,
      idAnimal: animal.id,
      nombreAdoptante: adoptante.nombreCompleto,
      telefonoAdoptante: adoptante.telefonoPrincipal,
      nombreAnimal: animal.nombre,
      fechaInicio: this.stringOrNull(data['fechaInicio']),
      fechaFin: this.stringOrNull(data['fechaFin']),
      fechaSalida: this.stringOrNull(data['fechaSalida']),
      fechaAdopcion: tipo === 'ADOPCION' ? this.stringOrNull(data['fechaInicio']) : null,
      observaciones: String(data['observaciones'] ?? ''),
      tipo,
    };
    this.upsert(db.transacciones, transaccion);
    return transaccion;
  }

  private saveEvento(body: unknown, db: MockDb): EventoMock {
    const data = this.asRecord(body);
    const id = this.numberOrNull(data['id']) ?? this.nextId(db.eventos);
    const existing = db.eventos.find((evento) => evento.id === id);
    const evento: EventoMock = {
      id,
      titulo: String(data['titulo'] ?? existing?.titulo ?? ''),
      descripcion: this.stringOrNull(data['descripcion'] ?? existing?.descripcion) ?? undefined,
      fechaHoraInicio: String(data['fechaHoraInicio'] ?? existing?.fechaHoraInicio ?? new Date().toISOString()),
      fechaHoraFin: String(data['fechaHoraFin'] ?? existing?.fechaHoraFin ?? new Date().toISOString()),
      color: String(data['color'] ?? existing?.color ?? '#1976d2'),
      idRefeExterna: this.numberOrNull(data['idRefeExterna'] ?? existing?.idRefeExterna),
      tipoRefeExterna: String(data['tipoRefeExterna'] ?? existing?.tipoRefeExterna ?? 'GENERAL') as EventoMock['tipoRefeExterna'],
      nombreCategoria: String(data['nombreCategoria'] ?? existing?.nombreCategoria ?? 'OTROS'),
      completado: Boolean(data['completado'] ?? existing?.completado ?? false),
      tipo: String(data['tipo'] ?? existing?.tipo ?? 'EVENTO') as EventoMock['tipo'],
      realizado: Boolean(data['realizado'] ?? existing?.realizado ?? false),
      comentarios: this.stringOrNull(data['comentarios'] ?? existing?.comentarios) ?? undefined,
      idReferencia: this.numberOrNull(data['idReferencia'] ?? existing?.idReferencia) ?? undefined,
    };
    this.upsert(db.eventos, evento);
    return evento;
  }

  private completarEvento(db: MockDb, id: number): void {
    const evento = db.eventos.find((item) => item.id === id);
    if (evento) {
      evento.completado = true;
      evento.realizado = true;
    }
    const seguimiento = db.seguimientos.find((item) => item.id === id);
    if (seguimiento) seguimiento.realizado = true;
  }

  private saveSeguimiento(body: unknown, db: MockDb): SeguimientoMock {
    const data = this.asRecord(body);
    const id = this.numberOrNull(data['id']) ?? this.nextId(db.seguimientos);
    const seguimiento: SeguimientoMock = {
      id,
      adopcion: Number(data['adopcion'] ?? 1),
      fechaPrevista: String(data['fechaPrevista'] ?? new Date().toISOString()),
      realizado: Boolean(data['realizado'] ?? false),
      comentario: String(data['comentario'] ?? ''),
    };
    this.upsert(db.seguimientos, seguimiento);
    return seguimiento;
  }

  private saveTratamiento(body: unknown, db: MockDb): void {
    const data = this.asRecord(body);
    const tipo = String(data['tipo'] ?? 'TRATAMIENTO');
    const id = this.numberOrNull(data['id']) ?? this.nextId(db.tratamientos);
    const tratamiento: TratamientoMock = {
      id,
      idAnimal: Number(data['idAnimal'] ?? 1),
      tipo,
      fecha: String(data['fecha'] ?? new Date().toISOString()).substring(0, 10),
      informacion: this.stringOrNull(data['informacion']),
      nombreTipoVacuna: this.nombreTipo(data['vacuna'], 'idTipoVacuna', db.tiposVacuna),
      nombreTipoTest: this.nombreTipo(data['test'], 'idTipoTest', db.tiposTest),
      nombreTipoDesparasitacion: this.nombreTipo(data['desparasitacion'], 'idTipoDesparasitacion', db.tiposDesparasitacion),
      resultado: this.asRecord(data['test'])['resultado'] as boolean | null | undefined,
      medicacion: this.stringOrNull(this.asRecord(data['desparasitacion'])['medicacion']),
    };
    this.upsert(db.tratamientos, tratamiento);
  }

  private saveCatalogo(collection: MutableCollection, body: unknown, db: MockDb): unknown {
    const data = this.asRecord(body);
    const items = db[collection] as Catalogo[];
    const id = this.numberOrNull(data['id']) ?? this.nextId(items);
    const item = { id, nombre: String(data['nombre'] ?? '') };
    this.upsert(items, item);
    return item;
  }

  private animalesByEspecie(db: MockDb, especieId: number): AnimalMock[] {
    return db.animales.filter((animal) => animal.especie?.id === especieId || animal.especie?.idEspecie === especieId);
  }

  private animalesDisponibles(db: MockDb): AnimalMock[] {
    return db.animales.filter((animal) => animal.situacion?.nombre !== 'Adoptado');
  }

  private adoptantesConTotales(db: MockDb): AdoptanteMock[] {
    return db.adoptantes.map((adoptante) => {
      const total = db.transacciones.filter((item) => item.idAdoptante === adoptante.id).length;
      return { ...adoptante, totalAnimales: total, numeroAnimales: total };
    });
  }

  private transaccionesConNombres(db: MockDb, tipo: 'ACOGIDA' | 'ADOPCION'): TransaccionMock[] {
    return db.transacciones.filter((item) => item.tipo === tipo).map((item) => this.decorateTransaccion(item, db));
  }

  private findTransaccion(db: MockDb, id: number, tipo: 'ACOGIDA' | 'ADOPCION'): TransaccionMock {
    return this.decorateTransaccion(this.findById(db.transacciones.filter((item) => item.tipo === tipo), id), db);
  }

  private decorateTransaccion(item: TransaccionMock, db: MockDb): TransaccionMock {
    const adoptante = db.adoptantes.find((record) => record.id === item.idAdoptante);
    const animal = db.animales.find((record) => record.id === item.idAnimal);
    return {
      ...item,
      nombreAdoptante: adoptante?.nombreCompleto ?? item.nombreAdoptante,
      telefonoAdoptante: adoptante?.telefonoPrincipal ?? item.telefonoAdoptante,
      nombreAnimal: animal?.nombre ?? item.nombreAnimal,
    };
  }

  private animalesVinculados(db: MockDb, idAdoptante: number, tipo: 'ACOGIDA' | 'ADOPCION'): unknown[] {
    return this.transaccionesConNombres(db, tipo)
      .filter((item) => item.idAdoptante === idAdoptante)
      .map((item) => ({
        idOperacion: item.id,
        idAnimal: item.idAnimal,
        nombreAnimal: item.nombreAnimal,
        tipoOperacion: item.tipo,
        fechaInicio: item.fechaInicio,
        fechaFin: item.fechaFin ?? item.fechaSalida,
      }));
  }

  private seguimientosCalendario(db: MockDb): unknown[] {
    return db.seguimientos.map((seguimiento) => {
      const transaccion = db.transacciones.find((item) => item.id === seguimiento.adopcion);
      const animal = db.animales.find((item) => item.id === transaccion?.idAnimal);
      return {
        id: seguimiento.id,
        animal_nombre: animal?.nombre ?? 'Animal',
        fecha_programada: seguimiento.fechaPrevista,
        realizado: seguimiento.realizado,
        comentarios: seguimiento.comentario,
        id_adopcion: seguimiento.adopcion,
      };
    });
  }

  private nombreTipo(value: unknown, idKey: string, catalogo: Catalogo[]): string | undefined {
    const data = this.asRecord(value);
    const id = this.numberOrNull(data[idKey]);
    return catalogo.find((item) => item.id === id)?.nombre;
  }

  private decorateAnimal(animal: AnimalMock): AnimalMock {
    animal.nombreEspecie = animal.especie?.nombre;
    animal.nombreRaza = animal.raza?.nombre;
    animal.nombreUbicacion = animal.ubicacion?.nombre;
    animal.nombreSituacion = animal.situacion?.nombre;
    animal.imagenUrl = animal.imagenUrl ?? this.defaultAnimalImage(animal.nombreEspecie);
    animal.imagenAlt = animal.imagenAlt ?? `Foto de ${animal.nombre}, ${animal.nombreEspecie ?? 'animal'} ${animal.nombreRaza ?? ''}`.trim();
    animal.imagenTamanyo = animal.imagenTamanyo ?? (animal.nombreEspecie === 'Gato' ? 'sm' : 'lg');
    return animal;
  }

  private authResponse(user: UsuarioMock): unknown {
    return {
      token: this.fakeJwt(user),
      id: user.id,
      nombre: user.nombre,
      apellidos: user.apellidos,
      email: user.email,
      rol: user.rol,
    };
  }

  private fakeJwt(user: UsuarioMock): string {
    const header = this.base64Url({ alg: 'none', typ: 'JWT' });
    const payload = this.base64Url({
      id: user.id,
      sub: user.email,
      name: `${user.nombre} ${user.apellidos}`.trim(),
      nombre: user.nombre,
      email: user.email,
      role: user.rol,
      rol: user.rol,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    });
    return `${header}.${payload}.mock`;
  }

  private base64Url(value: unknown): string {
    return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  private publicUser(user: UsuarioMock): unknown {
    const { password: _password, ...publicUser } = user;
    return publicUser;
  }

  private findById<T extends { id: number }>(items: T[], id: number): T {
    const item = items.find((record) => record.id === id);
    if (!item) throw new Error(`No existe el registro mock con id ${id}`);
    return item;
  }

  private findOptional<T extends { id: number }>(items: T[], id: number): T | undefined {
    return items.find((record) => record.id === id);
  }

  private deleteById<T extends { id: number }>(items: T[], id: number): void {
    const index = items.findIndex((record) => record.id === id);
    if (index >= 0) items.splice(index, 1);
  }

  private upsert<T extends { id: number }>(items: T[], item: T): void {
    const index = items.findIndex((record) => record.id === item.id);
    if (index >= 0) {
      items[index] = item;
      return;
    }
    items.push(item);
  }

  private nextId(items: { id: number }[]): number {
    return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  }

  private idFromEndpoint(endpoint: string): number {
    const id = Number(endpoint.match(/(\d+)(?!.*\d)/)?.[1] ?? 0);
    if (!id) throw new Error(`Endpoint mock sin id valido: ${endpoint}`);
    return id;
  }

  private toRol(value: unknown): RolUsuario {
    if (value === 'ADMINISTRATOR' || value === 'SUPERUSER' || value === 'USER') return value;
    return 'USER';
  }

  private toImageSize(value: unknown): 'sm' | 'md' | 'lg' {
    return value === 'sm' || value === 'md' || value === 'lg' ? value : 'md';
  }

  private defaultAnimalImage(especie: string | undefined): string {
    return especie === 'Gato' ? '/animals/gato-milo.svg' : '/animals/perro-luna.svg';
  }

  private numberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private stringOrNull(value: unknown): string | null {
    if (value === null || value === undefined || value === '') return null;
    return String(value);
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
  }

  private toDireccion(value: unknown): Record<string, string | number | undefined> {
    const source = this.asRecord(value);
    return Object.keys(source).reduce<Record<string, string | number | undefined>>((direccion, key) => {
      const item = source[key];
      if (typeof item === 'string' || typeof item === 'number' || item === undefined) {
        direccion[key] = item;
      }
      return direccion;
    }, {});
  }

  private clone<T>(value: T): T {
    return value === undefined ? value : JSON.parse(JSON.stringify(value)) as T;
  }

  private readDb(): MockDb {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const db = JSON.parse(stored) as MockDb;
        db.animales = db.animales.map((animal) => this.decorateAnimal(animal));
        this.writeDb(db);
        return db;
      } catch {
        localStorage.removeItem(this.storageKey);
      }
    }

    const db = this.seedDb();
    this.writeDb(db);
    return db;
  }

  private writeDb(db: MockDb): void {
    localStorage.setItem(this.storageKey, JSON.stringify(db));
  }

  private seedDb(): MockDb {
    const perro: Especie = { id: 1, idEspecie: 1, nombre: 'Perro' };
    const gato: Especie = { id: 2, idEspecie: 2, nombre: 'Gato' };
    const ubicaciones = [
      { id: 1, nombre: 'Refugio' },
      { id: 2, nombre: 'Casa de acogida' },
      { id: 3, nombre: 'Clinica veterinaria' },
    ];
    const situaciones = [
      { id: 1, nombre: 'Disponible' },
      { id: 2, nombre: 'En acogida' },
      { id: 3, nombre: 'Adoptado' },
    ];
    const razas: Raza[] = [
      { id: 1, idRaza: 1, nombre: 'Mestizo', especie: perro },
      { id: 2, idRaza: 2, nombre: 'Labrador', especie: perro },
      { id: 3, idRaza: 3, nombre: 'Comun europeo', especie: gato },
      { id: 4, idRaza: 4, nombre: 'Siames', especie: gato },
    ];

    return {
      especies: [perro, gato],
      razas,
      ubicaciones,
      situaciones,
      tiposVacuna: [{ id: 1, nombre: 'Rabia' }, { id: 2, nombre: 'Polivalente' }],
      tiposTest: [{ id: 1, nombre: 'Leishmania' }, { id: 2, nombre: 'Inmunodeficiencia felina' }],
      tiposDesparasitacion: [{ id: 1, nombre: 'Interna' }, { id: 2, nombre: 'Externa' }],
      animales: [
        this.decorateAnimal({
          id: 1,
          nombre: 'Luna',
          capa: 'Canela',
          sexo: 'Hembra',
          tamanyo: 'Mediano',
          procedencia: 'Rescate',
          fechaNacimiento: '2022-03-14',
          fechaIngreso: '2024-01-12',
          esterilizado: true,
          numeroChip: '941000000001',
          comentarios: 'Sociable y tranquila.',
          imagenUrl: '/animals/perro-luna.svg',
          imagenAlt: 'Foto ilustrada de Luna, perra mestiza de capa canela',
          imagenTamanyo: 'lg',
          ppp: false,
          especie: perro,
          raza: razas[0],
          ubicacion: ubicaciones[0],
          situacion: situaciones[0],
        }),
        this.decorateAnimal({
          id: 2,
          nombre: 'Milo',
          capa: 'Atigrado',
          sexo: 'Macho',
          tamanyo: 'Pequeno',
          procedencia: 'Colonia',
          fechaNacimiento: '2023-06-02',
          fechaIngreso: '2024-02-20',
          esterilizado: false,
          numeroChip: null,
          comentarios: 'Necesita seguimiento veterinario.',
          imagenUrl: '/animals/gato-milo.svg',
          imagenAlt: 'Foto ilustrada de Milo, gato atigrado en acogida',
          imagenTamanyo: 'sm',
          ppp: false,
          especie: gato,
          raza: razas[2],
          ubicacion: ubicaciones[1],
          situacion: situaciones[1],
        }),
      ],
      adoptantes: [
        {
          id: 1,
          identificacion: '12345678A',
          nombre: 'Maria',
          apellidos: 'Lopez Garcia',
          nombreCompleto: 'Maria Lopez Garcia',
          telefonoPrincipal: '600111222',
          telefonoAdoptante: '600111222',
          telefonoSecundario: '600333444',
          email: 'maria@example.com',
          direccion: {
            via: 'Calle Mayor',
            numero: '12',
            codigoPostal: '28001',
            municipio: 'Madrid',
            provincia: 'Madrid',
            pais: 'Espana',
          },
          observaciones: 'Prefiere animales tranquilos.',
          totalAnimales: 1,
        },
      ],
      transacciones: [
        {
          id: 1,
          idAdoptante: 1,
          idAnimal: 2,
          nombreAdoptante: 'Maria Lopez Garcia',
          telefonoAdoptante: '600111222',
          nombreAnimal: 'Milo',
          fechaInicio: '2024-03-01',
          fechaFin: null,
          observaciones: 'Acogida temporal.',
          tipo: 'ACOGIDA',
        },
      ],
      eventos: [
        {
          id: 1,
          titulo: 'Revision veterinaria de Luna',
          descripcion: 'Control anual y vacuna.',
          fechaHoraInicio: '2026-05-25T10:00:00',
          fechaHoraFin: '2026-05-25T10:30:00',
          color: '#1976d2',
          idRefeExterna: 1,
          tipoRefeExterna: 'ANIMAL',
          nombreCategoria: 'VETERINARIO',
          completado: false,
          tipo: 'EVENTO',
        },
      ],
      seguimientos: [
        {
          id: 1,
          adopcion: 1,
          fechaPrevista: '2026-05-27T17:00:00',
          realizado: false,
          comentario: 'Llamada de seguimiento.',
        },
      ],
      tratamientos: [
        {
          id: 1,
          idAnimal: 1,
          tipo: 'VACUNA',
          fecha: '2026-04-15',
          informacion: 'Sin incidencias.',
          nombreTipoVacuna: 'Rabia',
        },
      ],
      usuarios: [
        {
          id: 1,
          nombre: 'Maria',
          apellidos: 'Belmonte',
          email: 'mariabelmontebg@gmail.com',
          password: '1234',
          rol: 'ADMINISTRATOR',
          activo: true,
        },
        {
          id: 2,
          nombre: 'Voluntario',
          apellidos: 'Demo',
          email: 'voluntario@miauh.local',
          password: '1234',
          rol: 'USER',
          activo: true,
        },
      ],
    };
  }
}
