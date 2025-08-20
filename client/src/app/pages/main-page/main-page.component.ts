import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '@app/components/header/header.component';
import { LogsComponent } from '@app/components/logs-comp/logs.component';

@Component({
    selector: 'app-main-page',
    standalone: true,
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
    imports: [CommonModule, HeaderComponent, LogsComponent],
})
export class MainPageComponent {
}