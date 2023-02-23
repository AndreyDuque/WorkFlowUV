import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { CrmService } from 'src/app/modules/core/services/crm.service';
import {ServicesEnum} from "../../../core/utils/services.enum";

@Component({
  selector: 'table-services',
  templateUrl: './table-services.component.html',
  styleUrls: ['./table-services.component.scss']
})
export class TableServicesComponent implements OnInit {

  @Input() negociaciones: any[] = [];
  @Output() nuevasNegociaciones = new EventEmitter();
  @Output() editNegociacion = new EventEmitter();
  path = '';
  servicesEnum = ServicesEnum;
  embudoId = "";
  campoTabla = "";
  constructor(
    private readonly route: ActivatedRoute,
    private readonly crm: CrmService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(param => {
      this.path = param['service'];
    })

    this.route.queryParams.subscribe(query => {
      this.embudoId = query['embudo'];
    })

    if (this.embudoId !== "9") {
      this.campoTabla = "Placa";
    } else {
      this.campoTabla = "Equipo";
    }
  }

  eliminarProgramacion(id: number){
    this.crm.dealDelete(id).subscribe({
      'next': respuesta => {
      },
      'error': error => console.log(error)
    })
    this.negociaciones = this.negociaciones.filter(negociacion => negociacion.customId !== id);
    this.nuevasNegociaciones.emit(this.negociaciones);
  }

  editarProgramacion(negociacion: any) {
    this.editNegociacion.emit(negociacion);
  }

}
