import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { format } from 'date-fns';
import { Observable, map } from "rxjs";
import { ModalConfirmComponent } from "../ui/modal-confirm/modal-confirm.component";


@Injectable({
	providedIn: 'root'
})

export class GenericMethods {


    static formatNumberES(n: number, d: number = 0): string {
        const formatted = new Intl.NumberFormat("de-DE", {
            minimumFractionDigits: d,
            maximumFractionDigits: d
        }).format(n);
        return formatted;
      }

	static isNullOrEmpty(value: unknown): boolean {
		return value === null || value === undefined || value === '';
	}
	
	static getGuid(): string {
		function s4(): string {
			const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			let ret = "";
			for (let i = 0; i < 4; i++) {
				ret = ret + alphabet.charAt(Math.floor(Math.random() * alphabet.length) % alphabet.length);
			}
			return ret;
		}

		function b36(n: number): string {
			const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			let ret = "";
			let r;
			while (n > 0) {
				r = n % alphabet.length;
				ret = "" + alphabet.charAt(r) + ret;
				n = Math.floor(n / alphabet.length);
			}
			return ret;
		}

		return "" + b36(Date.now()).substr(-8, 8) + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
	}

	//static formatDate(fecha,conhoras?){
	//	if(conhoras){
	//		return format(new Date(fecha), "H:mm, dd-MM-uuuu")
	//	}else{
	//		return format(new Date(fecha), "dd-MM-uuuu")
	//	}
	//}

	
	static formatDate(fecha: string, conhoras?: boolean): string {
		if (!fecha) return '';

		const fechaIso = fecha.replace(' ', 'T');
		const date = new Date(fechaIso);

		if (isNaN(date.getTime())) {
			return 'Fecha inválida';
		}

		if (conhoras) {
			return format(date, "dd-MM-uuuu, H:mm");
		} else {
			return format(date, "dd-MM-uuuu");
		}
	}


	static calcularEdad(fechaNacimiento: Date): number {
		const fechaActual = new Date();
		const fechaNac = new Date(fechaNacimiento);
		let edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
		const mesActual = fechaActual.getMonth();
		const diaActual = fechaActual.getDate();
		const mesNacimiento = fechaNac.getMonth();
		const diaNacimiento = fechaNac.getDate();
		if (mesActual < mesNacimiento || (mesActual === mesNacimiento && diaActual < diaNacimiento)) {
		  edad--;
		}
		return edad;
	  }

	static confirmarBorrado(
		dialog: MatDialog,
		title = 'Confirmar borrado',
		comment = 'Seguro que quieres borrar este registro?'
	): Observable<boolean> {
		return dialog.open(ModalConfirmComponent, {
			width: '420px',
			data: { title, comment }
		}).afterClosed().pipe(
			map((result) => result === 'aceptar')
		);
	}


}




