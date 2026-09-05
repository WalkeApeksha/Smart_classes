export const generateUniqueId = (role) => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  let prefix = 'STU';
  if (role === 'admin') prefix = 'ADMIN';
  else if (role === 'teacher') prefix = 'TCH';
  else if (role === 'parent') prefix = 'PRN';
  return `${prefix}-${year}-${rand}`;
};

export default generateUniqueId;
