import React from "react";
import { Link } from "react-router-dom";
import { Question } from "../types";
import "./QuestionItem.css";

interface QuestionListItemProps {
  question: Question;
}

const QuestionListItem: React.FC<QuestionListItemProps> = ({ question }) => {
  return (
    <div className="questionItemWrapper">
        <div className="questionItemTopComponent">
            <div className="questionItemVotes">
                <div className="questionItemVotesCount">{question.votes}</div>
                <div className="questionItemVotesText">votes</div>
            </div>
            <div className="questionItemContent">
                <Link to={`/question/${question.id}`} className="questionItemTitleLink">
                {question.title}
                </Link>
            </div>
            <div className="questionItemAskedAt">
                asked {Math.round((Date.now() - question.askedAt.getTime()) / 3600000)} hours ago
            </div>
        </div>
        <div className="questionItemBody">
            <p className="questionItemBodyText">{question.body}</p>
        </div>
        <div className="questionItemTags">
            {question.tags.map((tag) => (
            <span key={tag} className="text-sm bg-gray-200 px-2 py-1 rounded">
                {tag}
            </span>
            ))}
        </div>
    </div>
  );
};

export default QuestionListItem;
