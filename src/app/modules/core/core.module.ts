import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AuthService} from "./services/auth.service";
import {HttpClientModule} from "@angular/common/http";
import {CrmService} from "./services/crm.service";

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  providers: [AuthService, CrmService],
})
export class CoreModule { }
