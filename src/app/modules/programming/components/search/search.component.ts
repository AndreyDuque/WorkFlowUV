import { Component, OnInit } from '@angular/core';
import {CrmService} from "../../../core/services/crm.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchForm!: FormGroup;
  id:string= "265";
  placas: any[] =[];
  deals: any [] = [];
  state = 'C7:PREPARATION';
  campos: any = {};
  constructor(
    private readonly crm: CrmService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router
    ) {
  }

  ngOnInit(): void {
    this.campos = {
      placa: ['', [Validators.required]],
    }
    this.searchForm = this.formBuilder.group(this.campos)
    this.traerPlacas();
    // this.crm.getDealForId('crm.deal.get', '1483').subscribe({
    //   'next': (deal: any) => {
    //     console.log(('_').repeat(50))
    //     console.log(deal.result)
    //     console.log(('_').repeat(50))
    //   }
    // })
    let start = 0;
    let next = true
    // while(next){
    //
    //   start = start + 50;
    // }
    let options = {
      filter: {'STAGE_ID': `${this.state}`, 'UF_CRM_1659706567283': "SNX609"},
      select: ['UF_CRM_1659706567283', 'STAGE_ID']
    };
    this.crm.getDealList(0, options).subscribe({
      'next': (deal: any) => {
        console.log(deal)
        // deal.result.forEach((item: any)=> {
        //   //if(item.hasOwnProperty('UF_CRM_1659706567283'))
        //   this.deals.push(item)
        // })
      },
      'error': error => console.log(error),
    })
    console.log({deals: this.deals});
  }



  // getDataFromForm(form: any){
  //   const { placa } = form.value
  //   let options = {
  //     filter: {'STAGE_ID': `${this.state}`, 'UF_CRM_1659706567283': `${placa}`},
  //     select: ['UF_CRM_1659706567283', 'STAGE_ID']
  //   };
  // }

  traerPlacas(event?: any) {
    console.log(event)
    let options = {
          filter: { 'UF_CRM_1659061343591': `${this.id}`},
        };

    this.crm.getCompanyList(`${this.id}`, options).subscribe({
      'next': (companies: any) =>{
        console.log('_____companies______',companies)

        this.placas = companies.result;
      }
    });
  }

  searchRequest() {
    console.log(this.searchForm.value);
    this.router.navigate(['/programming/result-search'], {queryParams: { placa: this.searchForm.value.placa }}).then()
  }
}
// UF_CRM_1659706567283
// STAGE_ID: C7:PREPARATION
