import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Log } from '@app/interfaces/Log';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private logsSubject = new BehaviorSubject<Log[]>([]);
  logs$: Observable<Log[]> = this.logsSubject.asObservable();

  constructor() {}

  setLogs(logs: Log[]): void {
    this.logsSubject.next(logs);
  }

  writeLog(log : Log): void {
    const currentLogs = this.logsSubject.getValue();
    this.logsSubject.next([...currentLogs, log]);
  }
}
