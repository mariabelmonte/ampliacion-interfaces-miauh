import { Injectable } from "@angular/core";
import { HttpService } from "../../../core/services/http.service";
import { RUTAS } from "../../../core/config/endpoints";
import { Vacuna } from "../models/vacuna.model";
import { Desparasitacion } from "../models/desparasitacion.model";
import { Test } from "../models/test.model";

@Injectable({
    providedIn: 'root'
})
export class GestionTratamientosService {

    /**
     * @param _http Servicio de utilidad para realizar peticiones HTTP (GET, POST, etc.)
     */
    constructor(private _http: HttpService) { }

    saveVacuna(vacuna: Vacuna): Promise<Vacuna> {
        return this._http.apiPost<Vacuna, Vacuna>(RUTAS.tiposVacuna.save, vacuna);
    }

    saveDesparacitacion(desparacitacion: Desparasitacion): Promise<Desparasitacion> {
        return this._http.apiPost<Desparasitacion, Desparasitacion>(RUTAS.tiposDesparasitacion.save, desparacitacion);
    }

    saveTest(test: Test): Promise<Test> {
        return this._http.apiPost<Test, Test>(RUTAS.tiposTest.save, test);
    }
}
