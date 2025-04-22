import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActorDTO } from './types/ActorDTO';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  private http = inject(HttpClient);
  constructor() { }

  getThumbnails(movieid: number): Observable<string[]> {
    return this.http.get<string[]>(`http://localhost:5105/Movies/${movieid}/thumbs`);
  }

  getCast(movieid: number): Observable<ActorDTO[]> {
    return this.http.get<ActorDTO[]>(`http://localhost:5105/Movies/${movieid}/cast`);
  }
}
