import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CallCenterComponent } from './features/calls/call-center.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CallCenterComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'InsureFlow CRM';
}
