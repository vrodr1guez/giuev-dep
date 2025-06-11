import jwt from 'jsonwebtoken';

export interface MeetingOptions {
  topic: string;
  startTime: Date;
  duration: number; // in minutes
  timezone?: string;
  agenda?: string;
  attendees?: Array<{
    name: string;
    email: string;
  }>;
}

export interface MeetingResponse {
  id: string;
  topic: string;
  joinUrl: string;
  startUrl: string;
  password?: string;
  startTime: Date;
  duration: number;
}

export interface ZoomTokenPayload {
  iss: string;
  exp: number;
}

// Generate Zoom JWT token
function generateZoomJWT(): string {
  if (!process.env.ZOOM_API_KEY || !process.env.ZOOM_API_SECRET) {
    throw new Error('Zoom API credentials not configured');
  }

  const payload: ZoomTokenPayload = {
    iss: process.env.ZOOM_API_KEY,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
  };

  return jwt.sign(payload, process.env.ZOOM_API_SECRET);
}

// Create Zoom meeting
export async function createZoomMeeting(options: MeetingOptions): Promise<MeetingResponse> {
  if (!process.env.ZOOM_API_KEY || !process.env.ZOOM_API_SECRET) {
    throw new Error('Zoom API credentials not configured');
  }

  try {
    const token = generateZoomJWT();
    
    const meetingData = {
      topic: options.topic,
      type: 2, // Scheduled meeting
      start_time: options.startTime.toISOString(),
      duration: options.duration,
      timezone: options.timezone || 'America/New_York',
      agenda: options.agenda || 'GIU EV Charging Infrastructure Demo',
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        watermark: false,
        use_pmi: false,
        approval_type: 0, // Automatically approve
        audio: 'voip',
        auto_recording: 'none',
        waiting_room: true,
      },
    };

    const response = await fetch(`https://api.zoom.us/v2/users/me/meetings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meetingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Zoom API error: ${errorData.message}`);
    }

    const meeting = await response.json();
    
    return {
      id: meeting.id.toString(),
      topic: meeting.topic,
      joinUrl: meeting.join_url,
      startUrl: meeting.start_url,
      password: meeting.password,
      startTime: new Date(meeting.start_time),
      duration: meeting.duration,
    };
  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    throw error;
  }
}

// Update Zoom meeting
export async function updateZoomMeeting(
  meetingId: string, 
  options: Partial<MeetingOptions>
): Promise<boolean> {
  if (!process.env.ZOOM_API_KEY || !process.env.ZOOM_API_SECRET) {
    throw new Error('Zoom API credentials not configured');
  }

  try {
    const token = generateZoomJWT();
    
    const updateData: any = {};
    if (options.topic) updateData.topic = options.topic;
    if (options.startTime) updateData.start_time = options.startTime.toISOString();
    if (options.duration) updateData.duration = options.duration;
    if (options.agenda) updateData.agenda = options.agenda;

    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    return response.ok;
  } catch (error) {
    console.error('Error updating Zoom meeting:', error);
    return false;
  }
}

// Delete Zoom meeting
export async function deleteZoomMeeting(meetingId: string): Promise<boolean> {
  if (!process.env.ZOOM_API_KEY || !process.env.ZOOM_API_SECRET) {
    throw new Error('Zoom API credentials not configured');
  }

  try {
    const token = generateZoomJWT();
    
    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting Zoom meeting:', error);
    return false;
  }
}

// Generate demo meeting for scheduled demo
export async function generateDemoMeeting(demoData: {
  firstName: string;
  lastName: string;
  company: string;
  date: string;
  time: string;
  interests?: string[];
}): Promise<MeetingResponse> {
  const startTime = new Date(`${demoData.date}T${convertTimeToISO(demoData.time)}`);
  
  const interests = demoData.interests && demoData.interests.length > 0 
    ? `Focus areas: ${demoData.interests.join(', ')}` 
    : '';
  
  const agenda = `
    GIU EV Charging Infrastructure Demo for ${demoData.company}
    
    Attendee: ${demoData.firstName} ${demoData.lastName}
    Company: ${demoData.company}
    ${interests}
    
    Demo Agenda:
    • Platform Overview (10 min)
    • Live Feature Demonstration (20 min)
    • Q&A and Custom Solutions Discussion (15 min)
    • Next Steps (5 min)
  `.trim();

  return createZoomMeeting({
    topic: `GIU EV Demo - ${demoData.company}`,
    startTime,
    duration: 50, // 50-minute demo
    agenda,
    timezone: 'America/New_York',
  });
}

// Alternative: Microsoft Teams meeting generation
export async function createTeamsMeeting(options: MeetingOptions): Promise<MeetingResponse> {
  // This would require Microsoft Graph API setup
  // For now, return a placeholder implementation
  
  if (!process.env.TEAMS_WEBHOOK_URL) {
    throw new Error('Microsoft Teams integration not configured');
  }

  // Placeholder implementation - would need proper Microsoft Graph API integration
  const meetingId = `teams-${Date.now()}`;
  
  return {
    id: meetingId,
    topic: options.topic,
    joinUrl: `https://teams.microsoft.com/l/meetup-join/${meetingId}`,
    startUrl: `https://teams.microsoft.com/l/meetup-join/${meetingId}?role=presenter`,
    startTime: options.startTime,
    duration: options.duration,
  };
}

// Generic meeting creation that chooses platform based on configuration
export async function createMeeting(options: MeetingOptions): Promise<MeetingResponse> {
  // Prefer Zoom if configured, fallback to Teams
  if (process.env.ZOOM_API_KEY && process.env.ZOOM_API_SECRET) {
    return createZoomMeeting(options);
  } else if (process.env.TEAMS_WEBHOOK_URL) {
    return createTeamsMeeting(options);
  } else {
    throw new Error('No meeting platform configured. Please set up Zoom or Teams API credentials.');
  }
}

// Utility function to convert time string to ISO format
function convertTimeToISO(timeString: string): string {
  const [time, period] = timeString.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hours === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${(minutes || 0).toString().padStart(2, '0')}:00`;
}

// Meeting platform integration and health check

export interface MeetingPlatformStatus {
  configured: boolean;
  provider: string;
  available: boolean;
  details?: any;
}

export interface MeetingConfig {
  provider: 'zoom' | 'teams' | 'disabled';
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  enabled: boolean;
}

// Get meeting platform configuration
function getMeetingConfig(): MeetingConfig {
  const provider = process.env.MEETING_PROVIDER || 'disabled';
  const zoomApiKey = process.env.ZOOM_API_KEY;
  const zoomApiSecret = process.env.ZOOM_API_SECRET;
  const teamsWebhook = process.env.TEAMS_WEBHOOK_URL;
  
  return {
    provider: provider as 'zoom' | 'teams' | 'disabled',
    apiKey: zoomApiKey,
    apiSecret: zoomApiSecret,
    webhookUrl: teamsWebhook,
    enabled: provider !== 'disabled'
  };
}

// Meeting platform health check
export async function checkMeetingPlatform(): Promise<MeetingPlatformStatus> {
  const config = getMeetingConfig();
  
  if (!config.enabled) {
    return {
      configured: false,
      provider: 'disabled',
      available: false,
      details: { message: 'Meeting platform disabled' }
    };
  }
  
  if (config.provider === 'zoom') {
    const isConfigured = !!(config.apiKey && config.apiSecret);
    return {
      configured: isConfigured,
      provider: 'zoom',
      available: isConfigured,
      details: {
        hasApiKey: !!config.apiKey,
        hasApiSecret: !!config.apiSecret,
        message: isConfigured ? 'Zoom configured' : 'Zoom API credentials missing'
      }
    };
  }
  
  if (config.provider === 'teams') {
    const isConfigured = !!config.webhookUrl;
    return {
      configured: isConfigured,
      provider: 'teams',
      available: isConfigured,
      details: {
        hasWebhook: !!config.webhookUrl,
        message: isConfigured ? 'Teams webhook configured' : 'Teams webhook URL missing'
      }
    };
  }
  
  return {
    configured: false,
    provider: 'unknown',
    available: false,
    details: { message: 'Unknown meeting provider' }
  };
}

// Generate meeting link (mock implementation)
export async function generateMeetingLink(
  title: string,
  startTime: Date,
  duration: number = 60
): Promise<string | null> {
  const config = getMeetingConfig();
  
  if (!config.enabled) {
    console.log('Meeting platform disabled - no link generated');
    return null;
  }
  
  if (config.provider === 'zoom' && config.apiKey && config.apiSecret) {
    // In a real implementation, you would call the Zoom API
    // For now, return a mock meeting link
    const meetingId = Math.random().toString().substring(2, 12);
    const meetingLink = `https://zoom.us/j/${meetingId}?pwd=mock-password`;
    
    console.log(`Generated Zoom meeting link: ${meetingLink}`);
    return meetingLink;
  }
  
  if (config.provider === 'teams' && config.webhookUrl) {
    // In a real implementation, you would create a Teams meeting
    // For now, return a mock meeting link
    const meetingId = Math.random().toString(36).substring(2, 15);
    const meetingLink = `https://teams.microsoft.com/l/meetup-join/${meetingId}`;
    
    console.log(`Generated Teams meeting link: ${meetingLink}`);
    return meetingLink;
  }
  
  console.warn('Meeting platform not properly configured');
  return null;
}

// Send meeting invitation
export async function sendMeetingInvitation(
  email: string,
  title: string,
  startTime: Date,
  meetingLink: string,
  duration: number = 60
): Promise<boolean> {
  const config = getMeetingConfig();
  
  if (!config.enabled) {
    console.log('Meeting platform disabled - invitation not sent');
    return false;
  }
  
  // This would integrate with your email service
  console.log(`Meeting invitation would be sent to ${email}:`);
  console.log(`Title: ${title}`);
  console.log(`Start: ${startTime.toISOString()}`);
  console.log(`Duration: ${duration} minutes`);
  console.log(`Link: ${meetingLink}`);
  
  return true;
}

// Cancel/reschedule meeting
export async function cancelMeeting(meetingId: string): Promise<boolean> {
  const config = getMeetingConfig();
  
  if (!config.enabled) {
    console.log('Meeting platform disabled - cannot cancel meeting');
    return false;
  }
  
  console.log(`Meeting ${meetingId} would be cancelled`);
  return true;
}

// Get meeting details
export async function getMeetingDetails(meetingId: string): Promise<any | null> {
  const config = getMeetingConfig();
  
  if (!config.enabled) {
    console.log('Meeting platform disabled - cannot get meeting details');
    return null;
  }
  
  // Mock meeting details
  return {
    id: meetingId,
    title: 'GIU EV Platform Demo',
    status: 'scheduled',
    startTime: new Date().toISOString(),
    duration: 60,
    participants: [],
    link: `https://mock-meeting.com/${meetingId}`
  };
}

// List upcoming meetings
export async function getUpcomingMeetings(): Promise<any[]> {
  const config = getMeetingConfig();
  
  if (!config.enabled) {
    return [];
  }
  
  // Mock upcoming meetings
  return [
    {
      id: 'meeting-1',
      title: 'GIU EV Demo - TechCorp',
      startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      duration: 60,
      status: 'scheduled'
    },
    {
      id: 'meeting-2', 
      title: 'GIU EV Demo - GreenFleet',
      startTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      duration: 45,
      status: 'scheduled'
    }
  ];
}

// Send calendar invite (ICS format)
export function generateCalendarInvite(meeting: MeetingResponse, attendeeEmail: string): string {
  const startTime = meeting.startTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endTime = new Date(meeting.startTime.getTime() + meeting.duration * 60000)
    .toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GIU EV//Demo Scheduler//EN
BEGIN:VEVENT
UID:${meeting.id}@giuev.com
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${meeting.topic}
DESCRIPTION:Join the meeting: ${meeting.joinUrl}
LOCATION:${meeting.joinUrl}
ATTENDEE:MAILTO:${attendeeEmail}
ORGANIZER:MAILTO:sales@giuev.com
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
} 