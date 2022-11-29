import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {MainLayoutComponent} from "./modules/core/shared/components/main-layout/main-layout.component";
import { CheckImageLinkDirective } from './modules/core/directives/check-image-link.directive';
import {PageNotFoundComponent} from "./modules/core/shared/components/page-not-found/page-not-found.component";
import {ToastrModule} from "ngx-toastr";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { FooterComponent } from './modules/core/shared/components/footer/footer.component';
import { SpinnerModule } from './modules/core/shared/components/spinner/spinner.module';

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    CheckImageLinkDirective,
    PageNotFoundComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ToastrModule.forRoot(),
    SpinnerModule
  ],
  exports: [
    MainLayoutComponent,
    FooterComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
