import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import Swal from 'sweetalert2';
import { CrmService } from "../../../core/services/crm.service";

@Component({
  selector: 'app-result-search',
  templateUrl: './result-search.component.html',
  styleUrls: ['./result-search.component.scss']
})
export class ResultSearchComponent implements OnInit {
  public negociaciones: any[] = [];
  public placa: string = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly crm: CrmService,
    private readonly router: Router
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(query => {
      this.placa = query['placa']
      this.getDataNegotiation()
    })
  }

  getDataNegotiation() {
    const options = {
      // 'STAGE_ID': `C7:NEW`,
      filter: {
        'UF_CRM_1659706567283': `${this.placa}`
      },
    };
    this.crm.getDealList(0, options).subscribe({
      'next': (deals: any) => {
        this.negociaciones = [];
        this.negociaciones = deals.result;
        this.negociaciones = this.negociaciones.filter(negociacion => negociacion.STAGE_ID === "C7:NEW" || negociacion.STAGE_ID === "C3:NEW" || negociacion.STAGE_ID === "C9:NEW")
        this.negociaciones.forEach(negociacion => {
          this.getProduct(negociacion)
        })
        if (this.negociaciones.length == 0) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: '¡No hay programaciones, seleccione otra placa!',
            // footer: '<a href="">Why do I have this issue?</a>'
          })
          this.router.navigate(['/programming']);
        }
      },
      'error': err => console.log(err)
    })
  }

  getProduct(negociacion: any) {
    this.crm.getDealProductList(negociacion.ID).subscribe({
      'next': ((product: any) => {
        if (product.result[0]) {
          let productName = product.result[0].PRODUCT_NAME
          negociacion.PRODUCT_NAME = productName
        } else {
          negociacion.PRODUCT_NAME = "No hay material asociado a la programación"
        }
      })
    })
  }

}
