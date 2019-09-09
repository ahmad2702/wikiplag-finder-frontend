import { Injectable } from '@angular/core';
import swal from 'sweetalert';

/**
 * Small service / wrapper for sweetalerts
 */
@Injectable()
export class AlertService {

  /**
   * Shows a sweet alert
   * @param {string} title
   * @param {string} text
   * @param {string} icon
   * @returns {Promise<any>}
   */
  showAlert(title: string, text: string, icon: string): Promise<any> {
    const params: any = {
      title: title,
      text: text,
      icon: icon
    };

    return swal(params);
  }

  showConfirmDialogue(title: string, text: string, icon: string): Promise<any> {
    const params: any = {
      title: title,
      text: text,
      icon: icon,
      dangerMode: true,
      buttons: ['Zurück', 'Ok!'],
    };
    return swal(params);
  }
}
