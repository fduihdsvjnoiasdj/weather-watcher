const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const schedule = require('node-schedule');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Load VAPID keys from environment variables or a local JSON file
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'YOUR_PUBLIC_VAPID_KEY_HERE';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'YOUR_PRIVATE_VAPID_KEY_HERE';
const CONTACT_EMAIL = process.env.VAPID_CONTACT || 'mailto:example@example.com';

webpush.setVapidDetails(CONTACT_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory storage for subscriptions and scheduled jobs
const subscriptions = new Map(); // key: endpoint, value: subscription
const jobs = new Map(); // key: endpoint, value: scheduled job

/**
 * Endpoint to receive push subscription from the client. Stores the
 * subscription for later use.
 */
app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }
  subscriptions.set(subscription.endpoint, subscription);
  console.log('Registered subscription', subscription.endpoint);
  return res.status(201).json({ success: true });
});

/**
 * Endpoint to schedule notifications. Expects { subscription, time, rules } in body.
 * Schedules a daily job at the given HH:MM that fetches weather data and
 * evaluates rules; if rules are satisfied, sends a push notification.
 */
app.post('/api/schedule', (req, res) => {
  const { subscription, time, rules } = req.body;
  if (!subscription || !subscription.endpoint || !time) {
    return res.status(400).json({ error: 'Missing subscription or time' });
  }
  const endpoint = subscription.endpoint;
  // Save subscription
  subscriptions.set(endpoint, subscription);
  // Cancel previous job if any
  const oldJob = jobs.get(endpoint);
  if (oldJob) {
    oldJob.cancel();
  }
  // Parse time (HH:MM)
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const ruleList = Array.isArray(rules) ? rules : [];
  // Schedule daily job
  const job = schedule.scheduleJob({ hour, minute, tz: 'Europe/Prague' }, async () => {
    try {
      const shouldNotify = await evaluateRulesForSubscription(ruleList);
      if (shouldNotify) {
        await sendNotification(subscription, {
          title: 'Počasí splňuje vaše podmínky',
          body: 'Zkontrolujte předpověď na nadcházející hodiny.',
        });
      }
    } catch (err) {
      console.error('Error in scheduled job', err);
    }
  });
  jobs.set(endpoint, job);
  console.log(`Scheduled daily job for ${endpoint} at ${time}`);
  return res.status(201).json({ success: true });
});

/**
 * Helper to evaluate notification rules by fetching weather data. Returns true
 * only if all rules are satisfied. If no rules are provided, always returns true.
 */
async function evaluateRulesForSubscription(rules) {
  if (!rules || rules.length === 0) {
    return true;
  }
  // Hard-coded Prague coordinates; could be extended to include per-subscription locations
  const lat = 50.0755;
  const lon = 14.4378;
  // Fetch next 48h hourly forecast from ICON-D2
  const hourlyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,relativehumidity_2m&forecast_model=icon_d2&forecast_hours=48&timezone=Europe/Prague`;
  const res = await fetch(hourlyUrl);
  const data = await res.json();
  const times = data.hourly.time;
  const temps = data.hourly.temperature_2m;
  const precs = data.hourly.precipitation;
  const hums = data.hourly.relativehumidity_2m;
  const hourly = [];
  for (let i = 0; i < times.length; i++) {
    hourly.push({
      time: times[i],
      temperature: temps[i],
      precipitation: precs[i],
      humidity: hums[i],
    });
  }
  // Evaluate each rule (AND logic)
  return rules.every((rule) => {
    let count = 0;
    for (const item of hourly) {
      const val = getValue(item, rule.type);
      if (val === undefined || !compare(val, rule.comparator, rule.threshold)) {
        count = 0;
        continue;
      }
      count += 1;
      if (count >= rule.durationHours) {
        return true;
      }
    }
    return false;
  });
}

function getValue(item, type) {
  switch (type) {
    case 'temperature':
      return item.temperature;
    case 'precipitation':
      return item.precipitation;
    case 'humidity':
      return item.humidity;
    default:
      return undefined;
  }
}

function compare(a, op, b) {
  switch (op) {
    case '>':
      return a > b;
    case '>=':
      return a >= b;
    case '<':
      return a < b;
    case '<=':
      return a <= b;
    case '==':
      return a === b;
    default:
      return false;
  }
}

async function sendNotification(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log('Push sent');
  } catch (err) {
    console.error('Failed to send notification', err);
    // Remove invalid subscription
    if (err.statusCode === 410 || err.statusCode === 404) {
      subscriptions.delete(subscription.endpoint);
      const job = jobs.get(subscription.endpoint);
      if (job) job.cancel();
    }
  }
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`WeatherWatcher server listening on port ${PORT}`);
});