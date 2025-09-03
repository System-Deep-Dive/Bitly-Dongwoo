import http from 'k6/http';
import { check } from 'k6';

export function setup() {
  console.log('Setting up... fetching pre-generated URLs from the server.');
  
  const res = http.get('http://localhost:8080/urls/all');
  if (res.status !== 200 || !res.body) {
    console.error('Failed to fetch URLs in setup. Aborting test.');
    return { shortUrls: [] };
  }
  
  const urls = res.json();
  if (!urls || urls.length === 0) {
    console.error('Server returned no URLs for testing. Aborting.');
    return { shortUrls: [] };
  }

  console.log(`Setup complete. Fetched ${urls.length} URLs.`);
  return { shortUrls: urls };
}

export const options = {
  vus: 10,
  duration: '30s',
};

export default function (data) {
  if (!data.shortUrls || data.shortUrls.length === 0) {
    return; // Do nothing if setup failed
  }

  const shortUrl = data.shortUrls[Math.floor(Math.random() * data.shortUrls.length)];

  // We expect a 302 redirect. We turn off redirects to measure the server's response time for the redirect itself.
  const res = http.get(`http://localhost:8080/${shortUrl}`, { redirects: 0 });

  check(res, {
    'is status 302 (Redirect)': (r) => r.status === 302,
  });
}