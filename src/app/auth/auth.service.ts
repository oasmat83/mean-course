import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Globals } from '../globals';
import { AuthData } from './auth-data-model';

//injecting Service to Root (app.module.ts)
@Injectable({providedIn: 'root'})

export class AuthService {
  constructor(private http: HttpClient) {}

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post(Globals.API_URL + '/user/signup', authData)
    .subscribe(response => {
      console.log(response);
    })
  }

  login(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post(Globals.API_URL + '/user/login', authData)
    .subscribe(response => {
      console.log(response);
    })
  }
}
