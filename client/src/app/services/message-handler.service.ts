import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ResponseToken {
  id: string;
  text: string;
  type?: 'token' | 'quick' | 'freetext';
  category?: string; // Optional category for grouping
}

@Injectable({
  providedIn: 'root'
})
export class MessageHandlerService {
  private messagePreviewSubject = new BehaviorSubject<ResponseToken[]>([]);

  readonly messagePreview$: Observable<ResponseToken[]> = this.messagePreviewSubject.asObservable();

  constructor() {}

  addToken(token: ResponseToken): void {
    const current = this.messagePreviewSubject.value;
    this.messagePreviewSubject.next([...current, token]);
  }

  removeToken(tokenId: string): void {
    const current = this.messagePreviewSubject.value;
    this.messagePreviewSubject.next(current.filter(t => t.id !== tokenId));
  }

  clearTokens(): void {
    this.messagePreviewSubject.next([]);
  }

  setTokens(tokens: ResponseToken[]): void {
    this.messagePreviewSubject.next(tokens);
  }
}
