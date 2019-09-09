import { DomSanitizer } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';

/**
 * DomSanitizer HTML security is bypassed and the given value is trusted to be safe HTML.
 * Otherwise, the id attributes of <span> tags in the received HTML code would not be accessible.
 */
@Pipe({name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {
  }

  transform(value: any) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
