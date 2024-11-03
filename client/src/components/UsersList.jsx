import React from 'react';

const Userlist = ({ user_list }) => {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-6 py-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Users in this room</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Number of users: {user_list.length}</p>
        <ul>
          {user_list.map((item, index) => (
            <li key={index} className="text-gray-700 dark:text-gray-200 mb-2">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Userlist;
