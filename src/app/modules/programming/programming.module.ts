import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProgrammingRoutingModule } from './programming-routing.module';
import {CoreModule} from "../core/core.module";
import { SearchComponent } from './components/search/search.component';
import { ResultSearchComponent } from './components/result-search/result-search.component';
import { NegotiationInProgressComponent } from './components/negotiation-in-progress/negotiation-in-progress.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    SearchComponent,
    ResultSearchComponent,
    NegotiationInProgressComponent,

  ],
  imports: [
    CommonModule,
    ProgrammingRoutingModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ]
})
export class ProgrammingModule { }
