import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Obsolete
 * gets wikipedia URL and provides it as service
 */
@Injectable()
export class WikipediaAPIService {
  /**
   * constructor of PlagPositionsService
   * @param http http service
   */
  constructor(private http: HttpClient) {
    // console.info('init WikipediaAPIService');
  }

  /**
   * returns observable with article data
   * @returns {Observable<R>} observable with article data
   */
  getArticleData(articleId: number) {
    return this.http.get('https://de.wikipedia.org/w/api.php?action=query&prop=info&pageids=' + articleId
      + '&inprop=url&format=json&origin=*');
  }
}
