import { Injectable } from '@angular/core';
import { Md5 } from 'ts-md5';
import { PlagResponse } from '../models/responses/plag-response';

/**
 * Managing local storage
 * Idea is to save requests the user have done recently
 * Format:
 * key: plag+{md5 checksum of input text}
 * value: base64 encoded json response which was given by the server last time
 */
@Injectable()
export class LocalStorageManagerService {

  /**
   * Check if a given input text + response is already stored in local storage
   * @param {string} inputText the given input text
   * @returns {boolean} true in case the input text already exists
   */
  requestAlreadyInLocalStorage(inputText: string): boolean {
    if (localStorage.getItem('plag:' + Md5.hashStr(inputText).toString()) === null) {
      // Request isn't cached in local storage
      return false;
    }
    return true;
  }

  /**
   * Clean the local storage of this page
   */
  clean() {
    window.localStorage.clear();
  }

  /**
   * Get all requests from local storage
   * @returns {PlagResponse[]} an array with all stored PlagResponses
   */
  getRecentlyStoredRequests(): PlagResponse[] {
    const keys = Object.keys(localStorage);
    const storedPlags = [];
    // Iterate through each key in localStorage and check if its a plag
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].indexOf('plag') !== -1) {
        storedPlags.push(<PlagResponse>JSON.parse(atob(localStorage.getItem(keys[i]))));
      }
    }

    // Sort by date of creation
    storedPlags.sort((a, b) => ((<PlagResponse>b).created_at - (<PlagResponse>a).created_at));

    return storedPlags;
  }

  /**
   * Save a currently received response to local storage
   * @param {string} inputText
   * @param {string} response
   */
  saveResponseToLocalStorage(inputText: string, response: string) {
    // Remove non printable ascii chars -->  https://www.w3resource.com/javascript-exercises/javascript-string-exercise-32.php
    // https://stackoverflow.com/questions/24229262/match-non-printable-non-ascii-characters-and-remove-from-text
    const valueBase64 = btoa(response.replace(/[^ -~äöüÖÄÜ]+/g, ''));
    const keyChecksum = Md5.hashStr(inputText).toString();
    localStorage.setItem('plag:' + keyChecksum, valueBase64);
  }

  /**
   * Get the saved response object from local storage
   * @param {string} inputText the input text which was entered by user
   * @returns {string} the response which was given from server as a json string
   */
  getResponseFromLocalStorage(inputText: string): string {
    return atob(localStorage.getItem('plag:' + Md5.hashStr(inputText).toString()));
  }
}
