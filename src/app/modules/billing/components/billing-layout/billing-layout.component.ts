import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-billing-layout',
  templateUrl: './billing-layout.component.html',
  styleUrls: ['./billing-layout.component.scss']
})
export class BillingLayoutComponent implements OnInit {

  filtroSeleccionado = '';

  constructor(
    private readonly formBuilder: FormBuilder,
  ){}

  ngOnInit(): void {
    //this.seleccionarFiltro();
  }

  seleccionarFiltro(event?: any){
    if (event) {
      this.filtroSeleccionado = event.target.value;
      console.log('Filtro seleccionado: ', this.filtroSeleccionado);
    }
  }

}

