import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  standBy: string = "No";
  standByField: boolean = true;
  horasStandBy: number = 0;
  programmingTitle: string = "";

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
        standByField: ['81', [Validators.required]]
      }
    }
    if (this.embudo === "7") {
      this.campos = {
        fotoRecibo: ['', [Validators.required]],
        numRecibo: ['', [Validators.required]],
        cantidad: ['', [Validators.required]]
      }
    }
    if (this.embudo === "3") {
      this.campos = {
        fotoRecibo: ['', [Validators.required]],
        numRecibo: ['', [Validators.required]]
      }
    }

    this.updateProgramForm = this.formBuilder.group(this.campos);
    this.definirStandBy();
    // this.calcularHoras()

    this.crm.getDealProductList(this.idProgrammation).subscribe((valueProducts: any) => {
      if (valueProducts) {
        this.rowsProducts.push(valueProducts.result[0]);
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
    if (this.updateProgramForm.valid) {
      this.crm.uploadImage2().subscribe((value: any) => {
        if (value) {
          for (let j = 0; j < this.files.length; j++) {
            const file = this.newFile(this.files[j], this.updateProgramForm.value.numRecibo);
            this.crm.uploadImage(value?.result.uploadUrl, file).subscribe((value2: any) => {
              if (value2) {
                this.crm.showImage(Number(value2.result.ID)).subscribe((value3: any) => {
                  if (value3) {
                    this.detailUrl.push(value3.result)
                    this.contador += 1;
                    if (this.contador == this.files.length) {
                      this.programationUpdate = this.updateProgramForm.value;
                      this.programationUpdate['etapa'] = `C${this.embudo}:PREPARATION`;

                      this.crm.actualizarProgramacion(this.idProgrammation, this.programationUpdate, this.embudo, this.detailUrl).subscribe({
                        'next': (programUpdate: any) => {
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

                            this.crm.agregarProductosANuevaProgramacion(this.idProgrammation, rowsProductsSend).subscribe();
                          }
                          if (programUpdate) this.toastr.success('¡Programacion ' + this.idProgrammation + ' actualizada exitosamente!', '¡Bien!');
                        },
                        'error': err => {
                          if (err) this.toastr.error('¡Algo salio mal!', '¡Error!');
                        }
                      });
                      this.router.navigate(['/programming']).then();
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

  uploadFileEvt(imgFile: any) {
    const filesLoad = imgFile.target.files;
    for (let i = 0; i < filesLoad.length; i++) {
      this.files.push(filesLoad[i]);
    }
    console.log('Archivos: ', this.files);
  }

  newFile(file: File, nroFactura: string) {
    const fileName = file.name.split('.');
    return new File([file], `${nroFactura} - ${new Date(Date.now()).valueOf()}.${fileName.pop()}`, { type: file.type });
  }

  calcularHoras() {
    // if (this.standBy === "Si") {
    //   this.cantidadHoras = this.horasStandBy;
    // }

    this.updateProgramForm.valueChanges.subscribe(form => {
      console.log('this.cantidadHoras', this.cantidadHoras)
      let horasCalculadas = form.horometroFinal - form.horometroInicial;
      if (this.standBy === "Si" && horasCalculadas < this.horasStandBy && form.standByField === '81') {
        this.cantidadHoras = this.horasStandBy;
        this.standByField = true;
      } else {
        this.cantidadHoras = form.horometroFinal - form.horometroInicial;
        this.standByField = false;
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
        if (form.horometroInicial < 0) {
          this.activarBoton = true;
        }
      }

      if (!this.cantidadHoras) {
        this.cantidadHoras = this.horasStandBy;
        if (form.standByField !== '81') {
          this.cantidadHoras = 0;
          this.standByField = false;
        } else {
          this.standByField = true;
        }
      }
    })
  }

  definirStandBy() {
    this.crm.getDealForId(this.idProgrammation).subscribe({
      'next': ((deal: any) => {
        console.log('deal', deal.result)
        if (deal) {
          let valorStandBy = deal.result.UF_CRM_1654545301774;
          let horasStanBy = deal.result.UF_CRM_1654545361346;
          switch (valorStandBy) {
            case '81':
              this.standBy = 'Si';
              break;

            case '83':
              this.standBy = 'No';
              break;

            case '87':
              this.standBy = 'N/A';
              break;

            default:
              break;
          }

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

}
