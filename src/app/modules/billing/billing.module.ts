import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BillingRoutingModule } from './billing-routing.module';
import { BillingLayoutComponent } from './components/billing-layout/billing-layout.component';


@NgModule({
  declarations: [
    BillingLayoutComponent
  ],
  imports: [
    CommonModule,
    BillingRoutingModule
  ]
})
export class BillingModule { }
