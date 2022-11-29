import { Component, OnInit } from '@angular/core';
import { SpinnerService } from '../../../services/spinner.service';

@Component({
  selector: 'spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {
  isLoading$ = this.spinnerSvc.isLoading$;
  constructor(
    private spinnerSvc: SpinnerService
  ) { }

  ngOnInit(): void {
  }

}
