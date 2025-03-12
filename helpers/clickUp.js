import clickUpApi from "./axios.js";

const createTask = async (taskName, description) => {
    try {
      const response = await clickUpApi.post(
        `/list/${process.env.CLICK_UP_LIST_ID}/task`,  // Use relative URL here
        {
          name: taskName,           // The name of the task
          description: description, // Description of the task
          priority: 3,              // Optional: set task priority (1-4)
          due_date: Date.now() + 86400000, // Optional: set due date (1 day ahead)
        }
      );
  
      return response.data; // Return the created task data
    } catch (error) {
      console.error('Error creating task:', error.response ? error.response.data : error.message);
      throw error; // Throw the error to be caught in the route handler
    }
  };

  export default createTask