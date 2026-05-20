
/**
 * Interface que define la estructura de las rutas de la API de Animales.
 */
interface AnimalEndpoints {
    findAll: string;
    findById: string;
    findByEspecie: string;
    findPerros: string;
    findGatos: string;
    save: string;
    delete: string;
    updateSituacion: string;
    findDisponibles: string;
}

/**
 * Interface que define la estructura de las rutas de la API.
 */
interface AdoptanteEndpoints {
    findAll: string;
    findById: string;
    save: string;
    findAdopcionesByAdoptante: string;
    findAcogidasByAdoptante: string;
}

interface TransaccionEndpoints {
    findAllAcogidas: string;
    findAllAdopciones: string;
    findAnimalesDisponibles: string;
    findAdoptantesDisponibles: string;
    findByIdAcogida: string;
    findByIdAdopcion: string;
    saveAcogida: string;
    saveAdopcion: string;
}

interface CalendarioEndpoints {
    findAll: string;
    save: string;
    delete: string;
    update: string;
    completeEvent: string;
}

interface SeguimientoEndpoints {
    findAll: string;
    findById: string;
    save: string;
}

interface TratamientoEndpoints {
    findByAnimal: string;
    save: string;
    delete: string;
}

interface TiposTratamientoEndpoints {
    findByAnimal: string;
    save: string;
}

interface AuthEndpoints {
    login: string;
    register: string;
}

interface UserEndpoints {
    findAll: string;
    findById: string;
    me: string;
    save: string;
    create: string;
    update: string;
    cambiarRol: string;
    activar: string;
    desactivar: string;
    findUser: string;
}



/**
 * Interface que define la estructura global de los endpoints de la aplicación.
 */
interface AppEndpoints {
    animales: AnimalEndpoints;
    especies: { findAll: string };
    razas: { findAll: string; findByEspecie: string };
    ubicaciones: { findAll: string };
    situaciones: { findAll: string };
    adoptantes: AdoptanteEndpoints;
    transacciones: TransaccionEndpoints;
    calendario: CalendarioEndpoints;
    seguimientos: SeguimientoEndpoints;
    tratamientos: TratamientoEndpoints;
    tiposVacuna: TiposTratamientoEndpoints;
    tiposTest: TiposTratamientoEndpoints;
    tiposDesparasitacion: TiposTratamientoEndpoints;
    auth: AuthEndpoints;
    users: UserEndpoints;
}

/**
 * @description Constante global que centraliza todas las rutas de la API utilizadas en la aplicación.
 * Facilita el mantenimiento y previene el uso de strings "mágicas" en los servicios.
 */
export const RUTAS: AppEndpoints = {
    animales: {
        findAll: 'api/animal/findAll',
        findById: 'api/animal/{id}',
        findByEspecie: 'api/animal/findByEspecie/{especieId}',
        findPerros: 'api/animal/findPerros',
        findGatos: 'api/animal/findGatos',
        save: 'api/animal/save',
        delete: 'api/animal/{id}',
        updateSituacion: 'api/animal/situacion',
        findDisponibles: 'api/animal/disponibles'
    },
    especies: {
        findAll: 'api/especie/findAll'
    },
    razas: {
        findAll: 'api/raza/findAll',
        findByEspecie: 'api/raza/findByEspecie/{especieId}'
    },
    ubicaciones: {
        findAll: 'api/ubicacion/findAll'
    },
    situaciones: {
        findAll: 'api/situacion/findAll'
    },
    adoptantes: {
        findAll: 'api/adoptante/findAll',
        findById: 'api/adoptante/{id}',
        save: 'api/adoptante/save',
        findAdopcionesByAdoptante: 'api/adopcion/findByAdoptante/{id}',
        findAcogidasByAdoptante: 'api/acogida/findByAdoptante/{id}'
    },
    transacciones: {
        findAllAcogidas: 'api/acogida/findAll',
        findAllAdopciones: 'api/adopcion/findAll',
        findAnimalesDisponibles: 'api/animal/disponibles',
        findAdoptantesDisponibles: 'api/adoptante/disponibles',
        findByIdAcogida: 'api/acogida/{id}',
        findByIdAdopcion: 'api/adopcion/{id}',
        saveAcogida: 'api/acogida/save',
        saveAdopcion: 'api/adopcion/save'
    },
    calendario: {
        findAll: 'api/calendario/findAll',
        save: 'api/calendario/save',
        delete: 'api/calendario/{id}',
        update: 'api/calendario/update',
        completeEvent: 'api/calendario/completar/{id}'
    },
    seguimientos: {
        findAll: 'api/seguimiento/findAll',
        findById: 'api/seguimiento/{id}',
        save: 'api/seguimiento/save'
    },
    tratamientos: {
        findByAnimal: 'api/tratamiento/findByAnimal/{idAnimal}',
        save: 'api/tratamiento/save',
        delete: 'api/tratamiento/{id}'
    },
    tiposVacuna: {
        findByAnimal: 'api/tipo-vacuna/findByAnimal/{idAnimal}',
        save: 'api/tipo-vacuna'
    },
    tiposTest: {
        findByAnimal: 'api/tipo-test/findByAnimal/{idAnimal}',
        save: 'api/tipo-test'
    },
    tiposDesparasitacion: {
        findByAnimal: 'api/tipo-desparasitacion/findByAnimal/{idAnimal}',
        save: 'api/tipo-desparasitacion'
    },
    auth: {
        login: 'api/auth/login',
        register: 'api/auth/register'
    },
    users: {
        findAll: 'api/usuarios/findAll',
        findById: 'api/usuarios/{id}',
        me: 'api/usuarios/me',
        save: 'api/usuarios/save',
        create: 'api/usuarios/save',
        update: 'api/usuarios/save',
        cambiarRol: 'api/usuarios/{id}/rol/{rol}',
        activar: 'api/usuarios/{id}/activar',
        desactivar: 'api/usuarios/{id}/desactivar',
        findUser: 'api/usuarios/{id}'
    }

};
