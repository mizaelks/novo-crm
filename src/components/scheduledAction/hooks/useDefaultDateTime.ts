
export const useDefaultDateTime = () => {
  // Set default date to current date + 1 hour
  const today = new Date();
  today.setHours(today.getHours() + 1);
  const formattedDate = today.toISOString().split('T')[0];
  const formattedTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

  // Get today's date for min validation (allow today and future dates)
  const todayForMin = new Date().toISOString().split('T')[0];

  return {
    formattedDate,
    formattedTime,
    todayForMin
  };
};
