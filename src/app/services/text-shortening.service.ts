import { Injectable } from '@angular/core';
import { SummarizedOutputTextPiece } from '../models/summarized-output-text-piece';

/**
 * Service which provides an option to short a given output text and split into "text" and "plagarism" pieces
 * for better visualizing in html output component
 */
@Injectable()
export class TextShorteningService {

  shortenedPlagarismText: SummarizedOutputTextPiece[];
  constructor() { }

  /**
   * Get the next end position for a plag ...
   * @param {string} text the text which should contain a marked plag, ... <span id="2">My Plag </span> ...
   * @param {number} charsBeforeAndAfterPlag the number of chars which should be in front of the plag and behind
   * @returns {number} the end position + charsBeforeAndAfterPlag
   */
  private getNextEndPos(text: string, charsBeforeAndAfterPlag: number): number {
    const nextEndTag = text.indexOf('</span>') + 7;
    // Adjust end tag position
    if (nextEndTag + charsBeforeAndAfterPlag <= text.length - 1) {
      return nextEndTag + charsBeforeAndAfterPlag;
    }
    return nextEndTag;
  }

  /**
   * Get the next start position for a plagarism
   * @param {string} text the text which should contain a marked plag, ... <span id="2">My Plag </span> ...
   * @param {number} charsBeforeAndAfterPlag the number of chars which should be in front of the plag and behind
   * @returns {number} the end position + charsBeforeAndAfterPlag
   */
  private getNextStartTag(text: string, charsBeforeAndAfterPlag: number): number {
    const startPos = text.indexOf('<span');
    // Adjust start tag position in case text is too short
    if (startPos - charsBeforeAndAfterPlag > 0) {
      return startPos - charsBeforeAndAfterPlag;
    } else if (startPos === -1) {
      return -1;
    }
    return 0;
  }

  /**
   * remove the first detected plag from tagged_input_text and add to shortenedPlagarismText
   * @param {number} startPosOfPlag
   * @param {number} endPosOfPlag
   * @param {string} tagged_input_text the current text
   * @returns {string} text without the detected plag
   */
  private splitFirstPlanOccurrence(startPosOfPlag: number, endPosOfPlag: number, tagged_input_text: string): string {
    if (startPosOfPlag !== -1) {
      let plagElem = tagged_input_text.substring(startPosOfPlag, endPosOfPlag);
      // Cut text by space seperator
      let firstSpacePos = 0;
      if (plagElem.substring(0, plagElem.indexOf(' ')).indexOf('<span') === -1) {
        firstSpacePos = plagElem.indexOf(' ');
      }

      let lastSpacePos = plagElem.length;
      if (plagElem.substring(plagElem.lastIndexOf(' '), plagElem.length - 1).indexOf('</span') === -1) {
        lastSpacePos = plagElem.lastIndexOf(' ');
      }

      startPosOfPlag += firstSpacePos;

      // Search for rest of normal text, split at startPos position, push to text array and remove from original text
      tagged_input_text = this.removeTextBeforeFirstPlagarism(tagged_input_text, startPosOfPlag);


      plagElem = plagElem.substring(firstSpacePos, lastSpacePos);
      const count = plagElem.split('<span').length - 1;
      if (count >= 2) {
        plagElem = plagElem.substring(firstSpacePos, plagElem.lastIndexOf('<span'));
      }

      this.shortenedPlagarismText.push({type: 'plag', text: plagElem, active: true});

      // Remove elem from original text
      tagged_input_text = tagged_input_text.replace(plagElem, '');
    } else {
      // Search for rest of normal text, split at startPos position, push to text array and remove from original text
      tagged_input_text = this.removeTextBeforeFirstPlagarism(tagged_input_text, startPosOfPlag);
    }

    return tagged_input_text;
  }

  /**
   * Filters the text before a plagiarism, add it to shortenedPlagarismText
   * @param {string} tagged_input_text
   * @param {number} nextStartTag the start position of the plagiarism
   * @returns {string} text without the text before a plagiarism
   */
  private removeTextBeforeFirstPlagarism(tagged_input_text: string, nextStartTag: number): string {
    let textBeforeSpanTag = '';
    if (tagged_input_text.indexOf('<span') !== -1) {
      textBeforeSpanTag = tagged_input_text.substring(0, nextStartTag);
      if (textBeforeSpanTag.indexOf('<span') !== -1) {
        textBeforeSpanTag = textBeforeSpanTag.substring(0, textBeforeSpanTag.indexOf('<span') - 5);
      }

      if (textBeforeSpanTag !== '') {
          // Add last part of text
        this.shortenedPlagarismText.push({type: 'text', text: textBeforeSpanTag, active: false});
      }
    } else {
      if (tagged_input_text !== '') {
        // Add last part of text
        this.shortenedPlagarismText.push({type: 'text', text: tagged_input_text, active: false});
      }


      textBeforeSpanTag = tagged_input_text;
    }
    return tagged_input_text.replace(textBeforeSpanTag, '');
  }

  /**
   * Split a given text with plagiarisms into parts of text and plagiarisms
   * @param {string} text
   * @param charsBeforeAndAfterPlag
   * @returns {SummarizedOutputTextPiece[]}
   */
  shorteningText(text: string, charsBeforeAndAfterPlag: number): SummarizedOutputTextPiece[] {
    this.shortenedPlagarismText = [];

    let nextStartTag = this.getNextStartTag(text, charsBeforeAndAfterPlag);
    while (text !== '') {
      // Search for next plag elem, push to array and remove from original text
      const nextEndTag = this.getNextEndPos(text, charsBeforeAndAfterPlag);

      text = this.splitFirstPlanOccurrence(nextStartTag, nextEndTag, text);

      nextStartTag = this.getNextStartTag(text, charsBeforeAndAfterPlag);
    }

    return this.shortenedPlagarismText;
  }
}
