/**
 * Title: app.component.ts
 * Author: Jocelyn Dupuis
 * Date: 01/18/2024
 * Description: ts file for app component
 */

// imports statements
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <!-- This router-outlet displays the content of the BaseLayout or AuthLayout components -->
    <router-outlet></router-outlet>
  `,
  styles: []
})
//exports
export class AppComponent {
}
