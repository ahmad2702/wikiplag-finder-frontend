import { Plagarism } from '../plagarism';

export class PlagResponse {
  name: string;
  created_at: number;
  tagged_input_text: string;
  plags: Plagarism[];
}
