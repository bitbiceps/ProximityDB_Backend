import axios from 'axios'

const clickUpApi = axios.create({
  baseURL: 'https://api.clickup.com/api/v2',
  headers: {
    Authorization:  'pk_81513741_08H5Q6KM9A5H18XFT3F21AFN5IOUSPDR',
    'Content-Type': 'application/json',
  },
});

const normalize = (str) => str.trim();

const getCustomFields = async (listId) => {
  try {
    const response = await clickUpApi.get(`/list/${listId}/field`);
    return response.data?.fields || [];
  } catch (error) {
    console.error('Failed to fetch custom fields:', error.response?.data || error.message);
    return [];
  }
};

const createClickUpTask = async (createTaskDto) => {
  try {
    const listId = process.env.CLICK_UP_LIST_ID2;
    if (!listId) throw new Error('ClickUp List ID is not configured.');

    const customFields = await getCustomFields(listId);

    const customFieldMap = customFields.reduce((acc, field) => {
      acc[normalize(field.name)] = field.id;
      return acc;
    }, {});

    const { fullName, email, message, phoneNumber , service } = createTaskDto.formData;

    const fieldData = {
      'Full Name': fullName,
      'Email Address': email,
      'Contact Number': phoneNumber || '',
      'Message': message || '',
      'Service' : service || ''
    };

    const custom_fields = Object.entries(fieldData).reduce((arr, [key, value]) => {
      const fieldId = customFieldMap[normalize(key)];
      if (fieldId && value) {
        arr.push({ id: fieldId, value });
      } else if (!fieldId) {
        console.warn(`Custom field '${key}' not found in ClickUp.`);
      }
      return arr;
    }, []);

    const response = await clickUpApi.post(`/list/${listId}/task`, {
      name: fullName,
      description: createTaskDto.description,
      priority: 3,
      due_date: Date.now() + 86400000, // +1 day
      custom_fields,
    });

    console.log('Task created successfully');
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error.response?.data || error.message);
    throw error;
  }
};

export default createClickUpTask;
