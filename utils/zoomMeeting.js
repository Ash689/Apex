// utils/zoomUtils.js

const axios = require('axios');
const qs = require('qs');

const clientId = process.env.ZOOM_CLIENTID;
const clientSecret = process.env.ZOOM_CLIENTSECRET;
const accountId = process.env.ZOOM_ACCOUNTID;

const generateAccessToken = async () => {
  const tokenUrl = 'https://zoom.us/oauth/token';
  const tokenData = {
    grant_type: 'account_credentials',
    account_id: accountId,
  };

  const tokenHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
  };

  try {
    const response = await axios.post(tokenUrl, qs.stringify(tokenData), { headers: tokenHeaders });
    return response.data.access_token;
  } catch (error) {
    console.error('Error generating access token:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function to create a Zoom meeting
const createZoomMeeting = async (token, tutorEmail, topic = 'Tutoring Session', bookingStartDateTime, duration = 40) => {
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const body = {
    topic: topic,
    type: 2, // 1 for instant meeting, 2 for scheduled meeting, etc.
    start_time: bookingStartDateTime,
    duration: duration,
    schedule_for: tutorEmail,
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: true,  // Allow participants to join before host
      mute_upon_entry: true,  // Mute participants upon entry
      waiting_room: false,  // Disable waiting room
    },
  };

  try {
    const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', body, config);
    return response.data;
  } catch (error) {
    console.error('Error creating meeting:', error.response ? error.response.data : error.message);
    throw error;
  }
};

module.exports = {
  generateAccessToken,
  createZoomMeeting,
};
