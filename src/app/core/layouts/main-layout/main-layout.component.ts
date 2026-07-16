import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  toggleSidebar() {
    // If mobile, toggle mobile-open. If desktop, toggle collapsed.
    if (window.innerWidth <= 768) {
      this.sidebar.toggleMobile();
    } else {
      this.sidebar.toggleCollapse();
    }
  }

  get isSidebarCollapsed() {
    return this.sidebar ? this.sidebar.isCollapsed() : false;
  }
}
