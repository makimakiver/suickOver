export interface Question {
    id: number;
    title: string;
    body: string;
    tags: string[];
    votes: number;
    askedAt: Date;
    answers: Answer[];
  }
  
  export interface Answer {
    id: number;
    body: string;
    postedAt: Date;
    votes: number;
  }
  