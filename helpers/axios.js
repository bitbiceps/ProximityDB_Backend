
import axios from "axios";
// Create an Axios instance with ClickUp's base URL and authentication headers
const clickUpApi = axios.create({
  baseURL: 'https://api.clickup.com/api/v2',  // Base URL for ClickUp API
  headers: {
    Authorization: process.env.CLICK_UP_API_KEY,  // Authorization header with PK Token
  },
});

export default clickUpApi
