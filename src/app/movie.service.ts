import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  private http = inject(HttpClient);
  constructor() { }

  getThumbnails(movieid: number): Observable<string[]> {
    return this.http.get<string[]>(`http://localhost:5105/Movies/${movieid}/thumbs`);
  }
}
