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
  start: number = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly crm: CrmService,
    private readonly router: Router
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(query => {
      this.placa = query['placa']
    })
    this.getDataNegotiation()
  }

  getDataNegotiation() {
    const options = {
      filter: {
        'UF_CRM_1659706567283': `${this.placa}`,
        'STAGE_ID': ['C7:NEW', 'C3:NEW', 'C9:NEW']
      },
    };
    this.crm.getDealList(this.start, options).subscribe({
      'next': (deals: any) => {
        if (deals.result) {
          this.negociaciones = deals.result;
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
          negociacion.PRODUCT_NAME = "N/A"
        }
      })
    })
  }

}
