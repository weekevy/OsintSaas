import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const [users] = await db.execute(
      `SELECT email_alerts, email_frequency, push_notifications, 
              scan_complete_notify, threat_detected_notify, 
              weekly_report_notify, marketing_emails, 
              slack_webhook, discord_webhook
       FROM users WHERE id = ?`,
      [decoded.id]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    return NextResponse.json({
      success: true,
      settings: {
        emailAlerts: !!user.email_alerts,
        emailFrequency: user.email_frequency,
        pushNotifications: !!user.push_notifications,
        scanComplete: !!user.scan_complete_notify,
        threatDetected: !!user.threat_detected_notify,
        weeklyReport: !!user.weekly_report_notify,
        marketingEmails: !!user.marketing_emails,
        slackWebhook: user.slack_webhook,
        discordWebhook: user.discord_webhook
      }
    });

  } catch (error) {
    console.error('Fetch notification settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { 
      emailAlerts, 
      emailFrequency, 
      pushNotifications, 
      scanComplete, 
      threatDetected, 
      weeklyReport, 
      marketingEmails,
      slackWebhook,
      discordWebhook
    } = await request.json();

    await db.execute(
      `UPDATE users SET 
        email_alerts = ?,
        email_frequency = ?,
        push_notifications = ?,
        scan_complete_notify = ?,
        threat_detected_notify = ?,
        weekly_report_notify = ?,
        marketing_emails = ?,
        slack_webhook = ?,
        discord_webhook = ?
       WHERE id = ?`,
      [
        emailAlerts, 
        emailFrequency, 
        pushNotifications, 
        scanComplete, 
        threatDetected, 
        weeklyReport, 
        marketingEmails,
        slackWebhook || null,
        discordWebhook || null,
        decoded.id
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Notification settings updated successfully'
    });

  } catch (error) {
    console.error('Update notification settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
