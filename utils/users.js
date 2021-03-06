// TODO: Connect this to a redis database

const users = [];

const addUser = ({ id, userName, roomName }) => {
  userName = userName.trim().toLowerCase();
  roomName = roomName.trim().toLowerCase();

  if (!userName || !roomName) {
    return {
      error: 'Username and room are required',
    };
  }

  // Check for existing user
  const userExist = users.find(user => {
    return user.roomName === roomName && user.userName === userName;
  });

  if (userExist) {
    return {
      error: 'Username is in use!',
    };
  }

  const status = 'active';
  const trustRate = 1;

  // Store user
  const user = { id, userName, roomName, status, trustRate };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    //return users.filter(user => user.id !== id);
    //or
    return users.splice(index, 1)[0]; //faster
  }
};

const getUser = id => {
  return users.find(user => user.id === id);
};

const getUsersInRoom = roomName => {
  roomName = roomName.trim().toLowerCase();
  return users.filter(user => user.roomName === roomName);
};

const updateUser = updatedUser => {
  const index = users.findIndex(user => user.id === updatedUser.id);

  if (index !== -1) {
    users[index] = updatedUser;
  }
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  updateUser,
};
