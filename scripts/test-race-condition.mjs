// Test Concurrent Account Creation Protection
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testConcurrency() {
  console.log('Testing concurrent account creation at boundary...');

  
  
  // Login as Super Admin
  
  const login = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'diudevcis', password: 'diudevcis' }),
  });
  const { token } = await login.json();

  // Fetch current users
  
  const usersRes = await fetch(`${BASE_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const usersData = await usersRes.json();
  console.log(`Initial active accounts: ${usersData.activeAccountsCount} / 5`);

  // 3. Disable one non-admin user so active count becomes 4
  const member = usersData.users.find(u => u.role === 'MEMBER' && u.status === 'ACTIVE');
  if (member) {
    await fetch(`${BASE_URL}/api/admin/users/${member.id}/disable`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`Disabled member ${member.email}, active count is now 4`);
  }

  // Fire 2 concurrent account creation requests
  console.log('Firing 2 concurrent creation requests simultaneously...');
  const [res1, res2] = await Promise.all([
    fetch(`${BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: 'Concurrent User A',
        email: `concurrent.a.${Date.now()}@upay.demo`,
        role: 'MEMBER',
        department: 'Test',
        password: 'diudevcis',
      }),
    }),
    fetch(`${BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: 'Concurrent User B',
        email: `concurrent.b.${Date.now()}@upay.demo`,
        role: 'MEMBER',
        department: 'Test',
        password: 'diudevcis',
      }),
    }),
  ]);

  const body1 = await res1.json();
  const body2 = await res2.json();

  console.log(`Req 1 status: ${res1.status} (${body1.success ? 'Created' : body1.error})`);
  console.log(`Req 2 status: ${res2.status} (${body2.success ? 'Created' : body2.error})`);

  // Verify final active accounts count
  const verifyRes = await fetch(`${BASE_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const verifyData = await verifyRes.json();
  console.log(`Final active accounts count: ${verifyData.activeAccountsCount}`);

  if (verifyData.activeAccountsCount > 5) {
    console.error('FAILED: Active accounts exceeded 5!');
    process.exit(1);
  } else {
    console.log('SUCCESS: Active accounts strictly bounded to <= 5.');
  }

  // Clean up test users / restore initial state
  const demoReset = await fetch(`${BASE_URL}/api/admin/reset`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Restored demo database to clean initial 5-account state.');
}

testConcurrency().catch(err => {
  console.error(err);
  process.exit(1);
});
