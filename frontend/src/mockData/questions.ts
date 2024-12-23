import { Question } from "../types";

export const questions: Question[] = [
  {
    id: 1,
    title: "How to center a div in CSS?",
    body: "I'm having trouble centering a div both vertically and horizontally. I've tried margin: auto but it's not working...",
    tags: ["css", "html", "frontend"],
    votes: 10,
    askedAt: new Date(Date.now() - 100000000),
    answers: [
      {
        id: 1,
        body: "You can use flexbox. For example: display: flex; justify-content: center; align-items: center;",
        postedAt: new Date(Date.now() - 50000000),
        votes: 2,
      },
    ],
  },
  {
    id: 2,
    title: "What is the difference between '==' and '===' in JavaScript?",
    body: "I see these two equality operators often, but I'm not sure what the difference is.",
    tags: ["javascript", "comparison", "operators"],
    votes: 5,
    askedAt: new Date(Date.now() - 200000000),
    answers: [
      {
        id: 1,
        body: "== checks for equality after type coercion, while === checks for equality without type coercion.",
        postedAt: new Date(Date.now() - 10000000),
        votes: 5,
      },
      {
        id: 2,
        body: "Always prefer === to avoid unexpected type conversions.",
        postedAt: new Date(Date.now() - 5000000),
        votes: 3,
      },
    ],
  },
];
