import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingLayoutComponent } from './components/billing-layout/billing-layout.component';

const routes: Routes = [
  {
    path: '',
    component: BillingLayoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillingRoutingModule { }
