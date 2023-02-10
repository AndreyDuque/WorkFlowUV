import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { CrmService } from 'src/app/modules/core/services/crm.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-negotiation-in-progress',
  templateUrl: './negotiation-in-progress.component.html',
  styleUrls: ['./negotiation-in-progress.component.scss']
})
export class NegotiationInProgressComponent implements OnInit {

  updateProgramForm!: FormGroup;
  public placa: string = '';
  public idProgrammation: string = '';
  public embudo: string = '';
  campos: any = {};
  programationUpdate: any = {};
  files: any[] = [];
  contador: number = 0;
  private detailUrl: any[] = [];
  rowsProducts: any[] = [];
  cantidadHoras: number = 0;
  validarHorometroInicial: boolean = true;
  validarHorometro: boolean = true;
  activarBoton: boolean = false;
  horasStandBy: number = 0;
  valorStandBy: boolean = true;
  programmingTitle: string = "";
  setProduct: boolean = true;
  bills: boolean = false;
  empleados: any[] = [];
  gastos: any[] = [];
  idEmpleadoSeleccionado: string = "";
  material: string = "";
  campoEscombrera: boolean = false;
  validarFormGastos: boolean = true;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly crm: CrmService,
    private toastr: ToastrService,
    private readonly router: Router,
  ) {
  }

  ngOnInit(): void {

    this.route.queryParams.subscribe(query => {
      this.placa = query['placa'];
      this.idProgrammation = query['idProgrammation'];
      this.embudo = query['embudo'];
    })

    if (this.embudo === "9") {
      this.campos = {
        fotoRecibo: ['', [Validators.required]],
        numRecibo: ['', [Validators.required]],
        horometroInicial: [[Validators.required]],
        horometroFinal: [[Validators.required]],
        standByField: ['81', [Validators.required]],
        state: ['299', [Validators.required]]
      }
    }
    if (this.embudo === "7") {
      this.campos = {
        fotoRecibo: ['', [Validators.required]],
        archivoEscombrera: [''],
        archivoGasto: [''],
        numRecibo: ['', [Validators.required]],
        cantidad: ['', [Validators.required]],
        gastos: new FormControl(false),
        anticipo: [''],
        valorFactura: [''],
        concepto: [''],
        empleado: [''],
      }
    }
    if (this.embudo === "3") {
      this.campos = {
        fotoRecibo: ['', [Validators.required]],
        archivoGasto: [''],
        numRecibo: ['', [Validators.required]],
        gastos: new FormControl(false),
        anticipo: [''],
        valorFactura: [''],
        concepto: [''],
        empleado: [''],
      }
    }

    this.updateProgramForm = this.formBuilder.group(this.campos);
    this.definirStandBy();
    this.enableExpenses();
    this.consultarCampos();

    this.crm.getDealProductList(this.idProgrammation).subscribe((valueProducts: any) => {
      if (valueProducts) {
        this.rowsProducts.push(valueProducts.result[0]);
        console.log('Productos:', this.rowsProducts)
        this.material = this.rowsProducts[0].PRODUCT_NAME;
        let arrMaterial = this.material.split(' ');
        console.log('Material descompuesto:', arrMaterial)
        if (arrMaterial[0] === 'TIERRA' || arrMaterial[0] === 'ESCOMBRO' || arrMaterial[0] === 'ESCOMBROS') {
          this.campoEscombrera = true;
          this.updateProgramForm.valueChanges.subscribe(form => {
            if (this.campoEscombrera) {
              if (form.archivoEscombrera) {
                this.validarFormGastos = true;
              } else {
                this.validarFormGastos = false;
              }
              this.enableExpenses();
            }
          })
        }
      }
    });

  }

  showInput(embudo: string, inputName: string) {
    let show = false;
    switch (embudo) {
      case '3':
        // grua
        show = false;
        break;
      case '7':
        // volqueta
        show = inputName === 'cantidad';
        break;
      case '9':
        // Maquina
        show = true;
        break;
    }
    return show;
  }

  saveProgramationUpdate() {
    if (this.updateProgramForm.valid && this.validarFormGastos) {
      this.crm.uploadImage2().subscribe((value: any) => {
        if (value) {
          this.router.navigate(['/programming']).then();
          for (let j = 0; j < this.files.length; j++) {
            console.log('Archivos:', this.files[j])
            const file = this.newFile(this.files[j], `${this.files[j].nombre} - ${this.updateProgramForm.value.numRecibo}`);
            this.crm.uploadImage(value?.result.uploadUrl, file).subscribe((value2: any) => {
              if (value2) {
                this.crm.showImage(Number(value2.result.ID)).subscribe((value3: any) => {
                  if (value3) {
                    this.detailUrl.push(value3.result)
                    this.contador += 1;
                    if (this.contador == this.files.length) {
                      this.programationUpdate = this.updateProgramForm.value;
                      console.log('Programación:', this.programationUpdate);
                      this.programationUpdate['etapa'] = `C${this.embudo}:PREPARATION`;
                      this.programationUpdate['horasStandBy'] = this.horasStandBy;

                      // AGREGAR PRODUCTOS A PROGRAMACIÓN
                      if (this.embudo !== "3") {
                        let quantity;
                        if (this.embudo === '9') {
                          quantity = this.cantidadHoras;
                        } else {
                          quantity = this.updateProgramForm.value.cantidad;
                        }
                        const rowsProductsSend = [
                          {
                            PRODUCT_ID: this.rowsProducts[0].PRODUCT_ID,
                            PRICE: this.rowsProducts[0].PRICE,
                            QUANTITY: quantity
                          }
                        ]

                        this.crm.agregarProductosANuevaProgramacion(this.idProgrammation, rowsProductsSend).subscribe({
                          'next': (product: any) => {
                            if (product) this.updateProgramming();
                          },
                          'error': (error) => {
                            this.toastr.error('¡Algo salio mal!', '¡Error!');
                            console.log(error)
                          }
                        });
                      } else this.updateProgramming();
                    }
                  }
                })
              }
            })
          }
        }
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '¡Porfavor llene todos los campos!',
        // footer: '<a href="">Why do I have this issue?</a>'
      })
    }
  }

  updateProgramming() {
    if (this.setProduct) {
      this.crm.actualizarProgramacion(this.idProgrammation, this.programationUpdate, this.embudo, this.detailUrl).subscribe({
        'next': (programUpdate: any) => {
          if (programUpdate) {
            this.toastr.success('¡Programacion ' + this.idProgrammation + ' actualizada exitosamente!', '¡Bien!');
            // this.router.navigate(['/programming']).then();
          }
        },
        'error': err => {
          if (err) this.toastr.error('¡Algo salio mal!', '¡Error!');
        }
      });
    } else this.toastr.error('¡Algo salio mal!', '¡Error!');
  }

  uploadFileEvt(imgFile: any) {
    const filesLoad = imgFile.target.files;
    console.log('Archivo Recibo:', filesLoad)
    for (let i = 0; i < filesLoad.length; i++) {
      filesLoad[i].nombre = 'Recibo';
      this.files.push(filesLoad[i]);
      console.log('Recibo', this.files[i])
    }
  }

  cargarArchivoEscombrera(imgFile: any) {
    const filesLoad = imgFile.target.files;
    console.log('Archivo Escombrera:', filesLoad)
    for (let i = 0; i < filesLoad.length; i++) {
      filesLoad[i].nombre = 'Escombrera';
      this.files.push(filesLoad[i]);
      console.log('Escombrera', this.files)
    }
  }

  cargarArchivoGastos(imgFile: any) {
    const filesLoad = imgFile.target.files;
    console.log('Archivo Gastos:', filesLoad)
    for (let i = 0; i < filesLoad.length; i++) {
      filesLoad[i].nombre = 'Gastos';
      this.files.push(filesLoad[i]);
      console.log('Gastos', this.files)
    }
  }

  newFile(file: File, nroFactura: string) {
    const fileName = file.name.split('.');
    return new File([file], `${nroFactura} - ${new Date(Date.now()).valueOf()}.${fileName.pop()}`, { type: file.type });
  }

  calcularHoras() {
    this.updateProgramForm.valueChanges.subscribe(form => {
      let horasCalculadas = form.horometroFinal - form.horometroInicial;
      if (horasCalculadas < this.horasStandBy && form.standByField === '81') {
        this.cantidadHoras = this.horasStandBy;
        this.valorStandBy = true;
      } else {
        this.cantidadHoras = form.horometroFinal - form.horometroInicial;
        this.valorStandBy = false;
      }

      if (form.horometroInicial < 0) {
        this.validarHorometroInicial = false;
        this.activarBoton = true;
      } else if (form.horometroInicial === 0) {
        this.validarHorometroInicial = true;
        this.activarBoton = false;
      }

      if (form.horometroFinal < form.horometroInicial) {
        this.validarHorometro = false;
        this.activarBoton = true;
      } else {
        this.validarHorometro = true;
        this.activarBoton = false;
        if (form.horometroInicial < 0) {
          this.activarBoton = true;
        }
      }

      if (!this.cantidadHoras) {
        this.cantidadHoras = this.horasStandBy;
        if (form.standByField !== '81') {
          this.cantidadHoras = 0;
        } else {
          this.valorStandBy = true;
        }
      }
    })
  }

  definirStandBy() {
    this.crm.getDealForId(this.idProgrammation).subscribe({
      'next': ((deal: any) => {
        if (deal) {
          let horasStanBy = deal.result.UF_CRM_1654545361346;

          if (horasStanBy !== '') {
            this.horasStandBy = Number(horasStanBy);
            this.cantidadHoras = this.horasStandBy;
          }

          this.calcularHoras();

          this.programmingTitle = deal.result.UF_CRM_1659706553211;
        }
      }),
      'error': error => console.log(error)
    })
  }

  enableExpenses() {
    this.updateProgramForm.valueChanges.subscribe(form => {
      this.bills = form.gastos;
      if (this.bills) {
        if (form.anticipo && form.valorFactura && form.concepto && form.empleado && form.archivoGasto && form.concepto.length > 0) {
          this.validarFormGastos = true;
        } else {
          this.validarFormGastos = false;
        }
      } else {
        this.validarFormGastos = true;
        this.updateProgramForm.value.anticipo = "";
        this.updateProgramForm.value.valorFactura = "";
        this.updateProgramForm.value.concepto = [];
        this.updateProgramForm.value.empleado = "";
        this.updateProgramForm.value.archivoGasto = "";
      }
    })
  }

  consultarCampos() {
    this.crm.getCamposNegociacion().subscribe({
      'next': ((camposNegociacion: any) => {
        this.empleados = camposNegociacion.result.UF_CRM_1668523347831.items;
        this.gastos = camposNegociacion.result.UF_CRM_62CDABE0392BD.items;
        console.log('Empleados:', this.empleados)
        console.log('Gastos:', this.gastos)
      }),
      'error': error => console.log(error)
    })
  }

  validaciones() {
    if (this.bills) {
      this.updateProgramForm.value.anticipo
    }
  }

}
