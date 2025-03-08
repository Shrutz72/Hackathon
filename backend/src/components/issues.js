// src/components/Issues.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Issues = () => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await api.get('/issues');
        setIssues(response.data);
      } catch (error) {
        console.error('Error fetching issues:', error);
      }
    };

    fetchIssues();
  }, []);

  return (
    <div>
      <h1>Issues</h1>
      <ul>
        {issues.map((issue) => (
          <li key={issue._id}>
            <h2>{issue.title}</h2>
            <p>{issue.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Issues;