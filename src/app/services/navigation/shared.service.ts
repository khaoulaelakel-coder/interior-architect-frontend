import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private parentTitleSource = new BehaviorSubject<string>('Dashboared');
  currentParenttitle$ = this.parentTitleSource.asObservable();

  setparentTitle(title: string) {
    this.parentTitleSource.next(title);
  }
  constructor() { }
}
