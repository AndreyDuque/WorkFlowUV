import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { CrmService } from "../../../core/services/crm.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ServicesEnum } from "../../../core/utils/services.enum";
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

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
  fechaARecortar = this.fechaActual.toLocaleDateString();
  arrayFecha = this.fechaARecortar.substring(0, 10).split('/');
  fechaRecortada = `${this.arrayFecha[2]}-${this.arrayFecha[1]}-${this.arrayFecha[0]}`;
  updateAsignacion: boolean = false;
  idAsignacionAActualizar: string = "";
  tituloServicio: string = "";
  contadorActualizaciones: number = 0;
  asignacionesConPlaca: any[] = [];

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
      fecha: [this.fechaRecortada, [Validators.required]],
      obra: ['', [Validators.required]],
      material: ['', [Validators.required]],
      placa: [''],
    }

    switch (this.path) {
      case "volqueta":
        this.tituloServicio = "Volqueta"
        break;
      case "grua":
        this.tituloServicio = "Grúa"
        break;
      case "maquina":
        this.tituloServicio = "Máquina"
        break;
    }

    this.programForm = this.formBuilder.group(this.campos);
    this.getDataNegotiation();
    this.traerPlacas();
    this.actualizarNegociacionesAEnviar();
  }

  getDataNegotiation() {
    const options = {
      filter: {
        'STAGE_ID': `WON`, 'UF_CRM_1654179740278': `${this.codeService}`
      },
      select: [
        'ID', 'TITLE', 'STAGE_ID', 'CATEGORY_ID', 'COMPANY_ID', 'UF_CRM_1654545301774', 'UF_CRM_1654545361346'
      ]
    };
    this.crm.getDealList(0, options).subscribe({
      'next': (deals: any) => {
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

        }
      },
      'error': err => console.log(err)
    })
  }

  newProgram() {
    if (this.programForm.valid) {
      let program = this.programForm.value;
      if (this.path === ServicesEnum.maquina && this.productSelected.length > 0 && !this.edit) {
        const negociacionFiltrada = this.negociaciones.filter(negociacion => negociacion.ID === this.productSelected[0].OWNER_ID)[0]
        program.standBy = negociacionFiltrada.UF_CRM_1654545301774;
        program.horasStandBy = negociacionFiltrada.UF_CRM_1654545361346;
      }
      program.idCompañia = this.compañiaSeleccionada;
      program.producto = this.productSelected[0];

      this.asignacionesAEnviar.push(program);
      if (this.updateAsignacion) {
        this.actualizarAsignacion(program);
      } else {
        this.crearAsignacionEnB24(program);
      }

      this.programForm.reset();
      this.programForm.controls['fecha'].setValue(this.fechaRecortada);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '¡Porfavor llene todos los campos requeridos!',
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

  async crearAsignacionEnB24(asignacion: any) {
    let embudoId = "21";
    const idNegociacion: any = await this.crm.enviarProgramacion(`${this.path}`, asignacion, `${embudoId}`);
    if (idNegociacion) {
      const row = [
        {
          PRODUCT_ID: asignacion.producto.PRODUCT_ID,
          PRICE: asignacion.producto.PRICE,
          QUANTITY: asignacion.producto.QUANTITY
        }
      ]
      this.crm.agregarProductosANuevaProgramacion(`${idNegociacion.result}`, row).subscribe({
        'next': (productResult: any) => {
          if (productResult) {
            this.actualizarNegociacionesAEnviar();
          }
        },
        'error': error => {
          if (error) this.toastr.error('¡Algo salio mal!', '¡Error!');
        },
      })

    } else {
      this.toastr.error('¡Algo salio mal!', '¡Error!');
    }
  }

  actualizarNegociacionesAEnviar() {
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
        const negociacines = negociaciones.result;
        negociacines.forEach((negociacion: any) => {
          this.crm.getDealProductList(negociacion.ID).subscribe({
            'next': (producto: any) => {
              let placa = negociacion.UF_CRM_1659706567283;
              if (!placa) {
                placa = "";
              }
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
              this.edit = false;
              this.programForm.controls['obra'].enable();
              this.updateAsignacion = false;
            },
            'error': error => console.log(error)
          })
        })
      },
      'error': error => console.log(error)
    })
  }

  editarProgramacion(negociacion: any) {
    this.crm.getDealProductList(negociacion.customId).subscribe({
      'next': (products: any) => {
        this.materiales = products.result;
        this.productSelected = []
        this.productSelected = this.materiales.filter(
          product => product.PRODUCT_NAME === negociacion.material
        );
      },
      'error': error => console.log(error)
    })

    this.edit = true;
    this.updateAsignacion = true;
    this.idAsignacionAActualizar = negociacion.customId;
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

  actualizarAsignacion(negociacion: any) {
    let fields = {
      UF_CRM_1663861549162: negociacion.fecha,
      UF_CRM_1659706553211: negociacion.obra,
      UF_CRM_1659706567283: negociacion.placa
    }
    const row = [
      {
        PRODUCT_ID: negociacion.producto.PRODUCT_ID,
        PRICE: negociacion.producto.PRICE,
        QUANTITY: negociacion.producto.QUANTITY
      }
    ]
    this.crm.actualizarAsignacion(this.idAsignacionAActualizar, fields).subscribe({
      'next': asignacion => {
        console.log('Asignación actualizada:', asignacion);
        this.crm.agregarProductosANuevaProgramacion(this.idAsignacionAActualizar, row).subscribe({
          'next': producto => {
            console.log('Producto asignado:', producto);
          },
          'error': error => console.log(error)
        })
        setTimeout(() => {
          this.actualizarNegociacionesAEnviar();
        }, 1000);

      },
      'error': error => console.log(error)
    })
  }

  actualizarEstadoDeAsiganciones() {
    if (this.contadorActualizaciones === 0) {
      this.asignacionesConPlaca = this.negociacionesAEnviar.filter(negocion => negocion.placa !== null);
    }
    if (this.asignacionesConPlaca.length > 0) {
      let fields = {
        UF_CRM_1670719588: 519,
        STAGE_ID: "C21:WON"
      }
      this.crm.actualizarAsignacion(this.asignacionesConPlaca[this.contadorActualizaciones].customId, fields).subscribe({
        'next': respuesta => {
          console.log('Respuesta actualización asignación', respuesta);
          this.toastr.success('¡Programacion ' + this.asignacionesConPlaca[this.contadorActualizaciones].customId + ' creada exitosamente!', '¡Bien!');
          this.contadorActualizaciones++;
          if (this.contadorActualizaciones < this.asignacionesConPlaca.length) {
            this.actualizarEstadoDeAsiganciones();
          } else {
            this.router.navigate(['/services']).then();
          }
        },
        'error': error => {
          console.log(error);
          if (error) this.toastr.error('¡Programacion ' + this.asignacionesConPlaca[this.contadorActualizaciones].customId + ' Algo salio mal!', '¡Error!');
          this.contadorActualizaciones++;
          if (this.contadorActualizaciones < this.asignacionesConPlaca.length) {
            this.actualizarEstadoDeAsiganciones();
          } else {
            this.router.navigate(['/services']).then();
          }
        },
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '¡Porfavor llene todos los campos de al menos una programación!',
        // footer: '<a href="">Why do I have this issue?</a>'
      })
    }
  }

}
