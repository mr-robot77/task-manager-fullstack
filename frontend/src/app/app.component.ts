import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="container">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main { padding-top: 16px; min-height: calc(100vh - 72px); }
    @media (max-width: 600px) { main { padding-top: 12px; } }
  `]
})
export class AppComponent {
  title = 'Production Line Operations Manager';
}
