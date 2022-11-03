import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Globals } from '../globals';
import { AuthData } from './auth-data-model';
import { Subject } from 'rxjs';

//injecting Service to Root (app.module.ts)
@Injectable({providedIn: 'root'})

export class AuthService {
  private isAuthenticated = false;
  private token: any;
  private authStatusListener = new Subject<boolean>();
  private tokenTimer: any;

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth () {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post(Globals.API_URL + '/user/signup', authData)
    .subscribe(response => {
      console.log(response);
    })
  }

  login(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post<{token: string, expiresIn: number}>(Globals.API_URL + '/user/login', authData)
    .subscribe(response => {
      this.token = response.token;
      if (response.token) {
        const expiresInDuration = response.expiresIn;
        this.setAuthTimer(expiresInDuration);
        this.isAuthenticated = true;
        this.authStatusListener.next(true);
        const now = new Date();
        const expiration = new Date(now.getTime() + expiresInDuration * 1000);
        this.saveAuthData(this.token, expiration);
        this.router.navigate(["/"]);
      }
    })
  }

  autoAuthUser() {
    const authInformation:any = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn:any = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(["/"]);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData (token: string, expirationDate: Date) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate)
    }
  }

}
