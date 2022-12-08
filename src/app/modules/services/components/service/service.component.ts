import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { CrmService } from "../../../core/services/crm.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as $ from 'jquery';
import { ServicesEnum } from "../../../core/utils/services.enum";
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { logMessages } from "@angular-devkit/build-angular/src/builders/browser-esbuild/esbuild";

@Component({
  selector: 'volqueta',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss']
})
export class ServiceComponent implements OnInit {

  programForm!: FormGroup;
  negociacionesAEnviar: any[] = [];
  asignacionesAEnviar: any[] = [];
  productosAEnviar: any[] = [];
  codeService = '';
  id = '';
  embudoId = '';
  negociaciones: any[] = [];
  compañiaSeleccionada: number = 0;
  materiales: any[] = []
  placas: any[] = [];
  campos: any = {};
  productSelected: any[] = [];
  path = '';
  servicesEnum = ServicesEnum;
  nomLabel = "";
  valuePlaceholder = "";
  edit: boolean = false;
  fechaActual = new Date();
  fechaARecortar = this.fechaActual.toISOString();
  fechaRecortada = this.fechaARecortar.substring(0, 10);

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly crm: CrmService,
    private readonly router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(param => {
      this.path = param['service'];
    })

    this.route.queryParams.subscribe(query => {
      this.codeService = query['service'];
      this.id = query['id'];
      this.getDataNegotiation();
      this.embudoId = query['embudo'];
    })

    if (this.embudoId !== "9") {
      this.nomLabel = "Placa";
      this.valuePlaceholder = "Buscar placa..."
    } else {
      this.nomLabel = "Equipo";
      this.valuePlaceholder = "Buscar equipo..."
    }

    this.campos = {
      fecha: [this.fechaRecortada],
      obra: ['', [Validators.required]],
      material: ['', [Validators.required]],
      placa: [''],
    }

    this.programForm = this.formBuilder.group(this.campos)
    this.traerPlacas();
    this.actualizarNegociacionesAEnviar();
    // $('#datalistOptions2').click(function (e) {
    //   console.log(e)
    // })
  }

  getDataNegotiation() {
    const options = {
      filter: { 'STAGE_ID': `WON`, 'UF_CRM_1654179740278': `${this.codeService}` },
    };
    this.crm.getDealList(0, options).subscribe({
      'next': (deals: any) => {
        // this.negociaciones = [];
        if (deals.result) {
          this.negociaciones = deals.result;
          if (deals.total > 50) {
            let totalNegociaciones = deals.total;
            let iniciador = 50;
            while (iniciador < totalNegociaciones) {
              this.crm.getDealList(iniciador, options).subscribe({
                'next': (dealsSiguiente: any) => {
                  const negociacionesSiguientes = dealsSiguiente.result;
                  for (let i = 0; i < negociacionesSiguientes.length; i++) {
                    this.negociaciones.push(negociacionesSiguientes[i]);
                  }
                },
                'error': err => console.log(err)
              })
              iniciador += 50;
            }
          }

          if (this.path === ServicesEnum.maquina) {
            this.negociaciones.forEach(negociacion => {
              this.insertarStandBy(negociacion)
            });
          }

        }
      },
      'error': err => console.log(err)
    })
  }

  newProgram() {
    if (this.programForm.valid) {
      let program = this.programForm.value;
      // this.programForm.controls['fecha'].setValue(this.fechaActual.toISOString());
      if (this.productSelected.length > 0) {
        const negociacionFiltrada = this.negociaciones.filter(negociacion => negociacion.ID === this.productSelected[0].OWNER_ID)[0]
        program.standBy = negociacionFiltrada.standBy;
        program.horasStandBy = negociacionFiltrada.horasStandBy;
      }
      program.idCompañia = this.compañiaSeleccionada;
      program.producto = this.productSelected[0];

      this.asignacionesAEnviar.push(program);
      console.log('Asignaciones a enviar:', this.asignacionesAEnviar);
      this.enviarProgramaciones("asignacion");

      this.programForm.reset();
      this.programForm.controls['fecha'].setValue(this.fechaRecortada);
      this.getDataNegotiation();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '¡Porfavor llene todos los campos!',
        // footer: '<a href="">Why do I have this issue?</a>'
      })
    }
  }

  negociacionSeleccionada(event?: any) {
    if (event) {
      this.compañiaSeleccionada = this.negociaciones.filter((negociacion: any) => negociacion.TITLE === event)[0].COMPANY_ID
      this.crm.getDealProductList(`${this.negociaciones.filter((negociacion: any) => negociacion.TITLE === event)[0].ID}`).subscribe({
        'next': (products: any) => {
          this.materiales = products.result;
        }
      });
    }
  }

  actualizarProgramacionesAEnviar(event: any) {
    this.negociacionesAEnviar = event;
  }

  traerPlacas(event?: any) {
    if (event) {
      this.productSelected = []
      this.productSelected = this.materiales.filter(
        product => product.PRODUCT_NAME === event.target.value
      );
      console.log('Producto seleccionado:', this.productSelected)
    }
    let options = {
      filter: { 'UF_CRM_1659061343591': `${this.id}` },
    };

    this.crm.getCompanyList(0, `${this.id}`, options).subscribe({
      'next': (companies: any) => {
        this.placas = companies.result;
        if (companies.total > 50) {
          let start = 50;
          while (start < companies.total) {
            this.crm.getCompanyList(start, `${this.id}`, options).subscribe({
              'next': (companiesSiguientes: any) => {
                const companies = companiesSiguientes.result;
                for (let i = 0; i < companies.length; i++) {
                  this.placas.push(companies[i]);
                }
              },
              'error': error => console.log(error)
            })
            start += 50;
          }
        }
      },
      'error': error => console.log(error)
    });
  }

  async enviarProgramaciones(embudo: string) {
    let i = 0;
    let embudoId = this.embudoId;
    let negociacionesAEnviar = this.negociacionesAEnviar;
    console.log('this.negociacionesAEnviar', this.negociacionesAEnviar)
    let totalNegociaciones = this.negociacionesAEnviar.length;
    if (embudo === 'asignacion') {
      totalNegociaciones = this.asignacionesAEnviar.length;
      i = totalNegociaciones - 1;
      embudoId = "21";
      negociacionesAEnviar = this.asignacionesAEnviar;
    }
    if (totalNegociaciones !== 0) {
      while (i < totalNegociaciones) {
        const idNegociacion: any = await this.crm.enviarProgramacion(`${this.path}`, negociacionesAEnviar[i], `${embudoId}`)

        if (idNegociacion) {

          if (this.path === this.servicesEnum.volqueta || this.path === this.servicesEnum.maquina || this.path === this.servicesEnum.grua) {
            const row = [
              {
                PRODUCT_ID: negociacionesAEnviar[i].producto.PRODUCT_ID,
                PRICE: negociacionesAEnviar[i].producto.PRICE,
                QUANTITY: negociacionesAEnviar[i].producto.QUANTITY
              }
            ]
            this.crm.agregarProductosANuevaProgramacion(`${idNegociacion.result}`, row).subscribe({
              'next': (productResult: any) => {
                if (productResult && embudo !== 'asignacion') {
                  this.toastr.success('¡Nueva programacion ' + idNegociacion.result + ' creada exitosamente!', '¡Bien!');
                } else {
                  this.actualizarNegociacionesAEnviar();
                }
              },
              'error': error => {
                if (error) this.toastr.error('¡Algo salio mal!', '¡Error!');
              },
            })
          } else {
            if (embudo !== 'asignacion') {
              this.toastr.success('¡Nueva programacion ' + idNegociacion.result + ' creada exitosamente!', '¡Bien!');
            }
          }

        } else {
          this.toastr.error('¡Algo salio mal!', '¡Error!');
        }
        i++;
        if (embudo === 'asignacion') {
          break;
        }
      }
    }
    if (embudo !== 'asignacion') {
      this.router.navigate(['/services']).then()
    }
  }

  insertarStandBy(negociacion: any) {
    this.crm.getDealForId(negociacion.ID).subscribe({
      'next': ((negociacionVenta: any) => {
        negociacion.standBy = negociacionVenta.result.UF_CRM_1654545301774;
        negociacion.horasStandBy = negociacionVenta.result.UF_CRM_1654545361346;
      }),
      'error': error => console.log(error)
    })
  }

  actualizarNegociacionesAEnviar() {
    console.log('Fecha:', this.fechaActual.toISOString());
    this.negociacionesAEnviar = [];
    const options = {
      filter:
      {
        'STAGE_ID': 'C21:NEW',
        'UF_CRM_1654179740278': this.codeService
      },
      select:
        [
          "ID", "COMPANY_ID", "UF_CRM_1663861549162", "UF_CRM_1659706553211", "UF_CRM_1659706567283",
          "UF_CRM_1654545301774", "UF_CRM_1654545361346"
        ]
    };
    this.crm.getDealList(0, options).subscribe({
      'next': (negociaciones: any) => {
        console.log('Negociaciones pendientes de asignación:', negociaciones);
        const negociacines = negociaciones.result;
        negociacines.forEach((negociacion: any) => {
          this.crm.getDealProductList(negociacion.ID).subscribe({
            'next': (producto: any) => {
              let fecha = negociacion.UF_CRM_1663861549162;
              let fechaRecortada = fecha.substring(0, 10).split('-');
              let fechaAMostrar = `${fechaRecortada[2]}/${fechaRecortada[1]}/${fechaRecortada[0]}`;
              this.negociacionesAEnviar.push(
                {
                  customId: negociacion.ID,
                  idCompañia: negociacion.COMPANY_ID,
                  fecha: negociacion.UF_CRM_1663861549162,
                  fechaAMostrar: fechaAMostrar,
                  obra: negociacion.UF_CRM_1659706553211,
                  material: producto.result[0].PRODUCT_NAME,
                  placa: negociacion.UF_CRM_1659706567283,
                  standBy: negociacion.UF_CRM_1654545301774,
                  horasStandBy: negociacion.UF_CRM_1654545361346,
                  producto: producto.result[0]
                }
              );
            },
            'error': error => console.log(error)
          })
        })
        console.log('Negociaciones a enviar:', this.negociacionesAEnviar);
      },
      'error': error => console.log(error)
    })
  }

  editarProgramacion(negociacion: any) {
    // let fechaActual = this.fechaActual.toISOString();
    // let fechaRecortada = fechaActual.substring(0, 10);
    this.edit = true;
    this.programForm.controls['obra'].disable();
    this.programForm.controls['fecha'].setValue(this.fechaRecortada);
    this.programForm.controls['obra'].setValue(negociacion.obra);
    this.programForm.controls['material'].setValue(negociacion.material);
    this.programForm.controls['placa'].setValue(negociacion.placa);
  }

  cancelarEdicionProgramacion() {
    this.edit = false;
    this.programForm.controls['obra'].enable();
    this.programForm.reset();
    this.programForm.controls['fecha'].setValue(this.fechaRecortada);
  }

}
