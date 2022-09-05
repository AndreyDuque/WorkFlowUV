import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {ServicesEnum} from "../../../core/utils/services.enum";

@Component({
  selector: 'app-service-layout',
  templateUrl: './service-layout.component.html',
  styleUrls: ['./service-layout.component.scss']
})
export class ServiceLayoutComponent implements OnInit {

  servicesForm!: FormGroup;
  services: any[] = [
    {value: 'volqueta', code: ServicesEnum.volqueta},
    {value: 'grúa', code: ServicesEnum.grua},
    {value: 'maquina', code: ServicesEnum.maquina},
  ]

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
  ) {
  }

  ngOnInit(): void {
    this.servicesForm = this.formBuilder.group({
      service: ['', [Validators.required]],
    })
  }


  goToProgrammingModule() {
    if (!this.servicesForm.valid) return;
    let queryParams = {};
    switch (this.servicesForm.value.service) {
      case ServicesEnum.volqueta:
          queryParams= {
            embudo: 7,
            id: 265,
            service: 63,
          }
        break;case ServicesEnum.grua:
          queryParams= {
            embudo: 3,
            id: 265,
            service: 67,
          }
        break;case ServicesEnum.maquina:
          queryParams= {
            embudo: 9,
            id: 289,
            service: 65 ,
          }
        break;
    }
    this.router.navigate(['/services/'+this.servicesForm.value.service], {queryParams}).then()
  }

}
