import { Injectable } from '@angular/core';
import { PlagResponse } from '../models/responses/plag-response';
import * as jsPDF from 'jspdf';
import { TextShorteningService } from './text-shortening.service';
import { SummarizedOutputTextPiece } from '../models/summarized-output-text-piece';


@Injectable()
export class PdfGeneratorService {
  currentVerticallytTextPointer: number;
  splittedText: SummarizedOutputTextPiece[];
  plagResponse: PlagResponse;
  printedPlagiarismCounter: number;
  pageHeight: number;

  constructor(private textShorteningService: TextShorteningService) {
  }

  /**
   * A service which creates a pdf document from a given plag response using jspdf
   * A headline with document title is created. Each plagiarism is print in red color and
   * all potential sources from wikipedia are linked under each article
   * @param {PlagResponse} plagResponse
   */
  generatePDF(plagResponse: PlagResponse) {
    // Split text into text and plag pieces
    this.splittedText = this.textShorteningService.shorteningText(plagResponse.tagged_input_text, 0);

    this.plagResponse = plagResponse;
    this.printedPlagiarismCounter = 0;
    const doc = new jsPDF();

    // assign height of the document
    this.pageHeight = doc.internal.pageSize.getHeight();

    // Print headline
    this.printHeadline(doc, this.plagResponse.name);

    // Go through each piece of text
    for (let i = 0; i < this.splittedText.length; i++) {
      if (this.splittedText[i].type === 'plag') {
        this.preprocessPlagiarism(doc, i);
      } else {
        doc.setTextColor(0, 0, 0);
      }

      this.printTextToPdf(doc, this.splittedText[i].text);

      // Print each link of an plagiarism
      if (this.splittedText[i].type === 'plag') {
        this.printLinksOfPlagiarism(doc);
      }
    }

    doc.save(plagResponse.name + '.pdf');
  }

  /**
   * Print a given headline to document
   * @param doc
   * @param headline
   */
  printHeadline(doc, headline) {
    doc.setFontSize(22);
    this.currentVerticallytTextPointer = 20;
    doc.text(15, this.currentVerticallytTextPointer, headline);

    doc.setFontSize(18);
    this.currentVerticallytTextPointer += 9;
  }

  /**
   * Some preprocess for a given plagiarism. Remove html markup, make text color red and iterate plagiarism counter
   * @param doc
   * @param i
   */
  preprocessPlagiarism(doc: any, i) {
    this.splittedText[i].text = this.removeHTML(this.splittedText[i].text);
    // Plagiarisms will be in red color
    doc.setTextColor(255, 0, 0);
    this.printedPlagiarismCounter++;
  }

  /**
   * Print the links of a given plagiarism into pdf file
   * @param doc the currently used pdf document
   */
  printLinksOfPlagiarism(doc: any) {
    for (let j = 0; j < this.plagResponse.plags[this.printedPlagiarismCounter - 1].wiki_excerpts.length; j++) {
      const link = '--> https://de.wikipedia.org/?curid=' + this.plagResponse.plags[this.printedPlagiarismCounter - 1].wiki_excerpts[j].id;
      doc.text(15, this.currentVerticallytTextPointer, link);
      this.currentVerticallytTextPointer += 9;
      if (this.currentVerticallytTextPointer > this.pageHeight) {
        doc.addPage();
        this.currentVerticallytTextPointer = 20;
      }
    }
  }

  /**
   * Print a given text to pdf. Automatic line breaks are supported ...
   * @param doc
   * @param {string} text
   */
  printTextToPdf(doc: any, text: string) {
    // Split the text into lines with length of 180mm
    const splittedLines = doc.splitTextToSize(text, 180);

    for (let j = 0; j < splittedLines.length; j++) {
      // Print each row to pdf
      doc.text(15, this.currentVerticallytTextPointer, splittedLines[j]);
      this.currentVerticallytTextPointer += 9;

      // Create a new page in case the old is to short for given text
      if (this.currentVerticallytTextPointer > this.pageHeight) {
        doc.addPage();
        this.currentVerticallytTextPointer = 20;
      }
    }
  }

  removeHTML(textWithHTML: string): string {
    return textWithHTML.replace(/(<([^>]+)>)/ig, '');
  }
}
