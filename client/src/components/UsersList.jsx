import React from 'react';

const Userlist = ({ user_list }) => {
  return (
    <div className="bg-white overflow-hidden">
      <div className="px-6 py-4">
        <h2 className="text-xl font-semibold mb-2">Users in this room</h2>
        <ul>
          {user_list.map((item, index) => (
            <li key={index} className="text-gray-700 mb-2">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Userlist;
