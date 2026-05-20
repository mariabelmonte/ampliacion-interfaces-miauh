import { FormControl, FormGroup } from "@angular/forms";

export type TipoRegistroSalud = 'TRATAMIENTO' | 'VACUNA' | 'TEST' | 'DESPARASITACION';

export interface Tratamiento {
    id?: number;
    idAnimal: number;
    tipo?: TipoRegistroSalud;
    fecha: string;
    informacion?: string | null;
    nombreTipoVacuna?: string;
    nombreTipoTest?: string;
    nombreTipoDesparasitacion?: string;
    resultado?: boolean;
    medicacion?: string;
    vacuna?: VacunaInfo | null;
    test?: TestInfo | null;
    desparasitacion?: DesparasitacionInfo | null;
}

export interface VacunaInfo {
    idTipoVacuna: number | null;
}

export interface TestInfo {
    idTipoTest: number | null;
    resultado: boolean | null;
}

export interface DesparasitacionInfo {
    idTipoDesparasitacion: number | null;
    medicacion: string | null;
}

export interface SaludPayload {
    tipo: TipoRegistroSalud;
    idAnimal: number | null;
    fecha: Date;
    informacion: string | null;
    vacuna: VacunaInfo | null;
    test: TestInfo | null;
    desparasitacion: DesparasitacionInfo | null;
}

export interface SaludForm {
    idAnimal: FormControl<number | null>;
    fecha: FormControl<Date | null>;
    informacion: FormControl<string | null>;
    vacuna: FormGroup<{
        idTipoVacuna: FormControl<number | null>;
    }>;
    test: FormGroup<{
        idTipoTest: FormControl<number | null>;
        resultado: FormControl<boolean | null>;
    }>;
    desparasitacion: FormGroup<{
        idTipoDesparasitacion: FormControl<number | null>;
        medicacion: FormControl<string | null>;
    }>;
}
