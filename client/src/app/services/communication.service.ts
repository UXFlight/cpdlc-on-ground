import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ErrorMessage {
  message : string
}

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  private readonly baseUrl = environment.serverUrl;

  private readonly snackDefaults: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'end',
    verticalPosition: 'bottom',
    panelClass: ['real-snack'],
  };

  constructor(
    private readonly http: HttpClient,
    private readonly snackBar: MatSnackBar
  ) {}

  async get<T>(endpoint: string): Promise<T | null> {
    const url = `${this.baseUrl}/${endpoint}`;
    try {
      return await firstValueFrom(this.http.get<T>(url));
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  //! bloat, slop, call it whatever you want. idc anymore
  private getErrorMessage(err: unknown): string {
    const defaultErr : string = 'An unexpected error occurred.';
    if (typeof err === 'string') return err || defaultErr;
    if (err instanceof HttpErrorResponse) {
      const ee = err.error as any;
      if (typeof ee === 'string' && ee.trim()) return ee;
      return ee?.message || err.message || defaultErr;
    }
    if (err instanceof Error) return err.message || defaultErr;
    if (err && typeof err === 'object') {
      const msg = (err as any).message;
      if (typeof msg === 'string' && msg.trim()) return msg;
    }
    return defaultErr;
  }
  
  handleError(error: unknown, opts?: MatSnackBarConfig & { action?: string; }): void {
    const message = this.getErrorMessage(error);
    const action = opts?.action ?? 'Dismiss';
  
    const config: MatSnackBarConfig = { ...this.snackDefaults, ...(opts || {}) };
    delete (config as any).action;
    delete (config as any).prefix;
    delete (config as any).log;
  
    this.snackBar.open(`${message}`, action, config);
    console.error('HTTP Error:', error);
  }
}
