// Verification script for UPAY SENTINEL AI - TITAN NEXUS Ω v7 Security Mode
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failCount++;
  }
}

async function runTests() {
  console.log('===============================================================');
  console.log('UPAY SENTINEL AI - SECURITY VERIFICATION SUITE');
  console.log('===============================================================\n');

  // Test 1: Public Health endpoint
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  assert(healthRes.status === 200, 'Public technical route /api/health returns 200');

  // Test 2: Protected Data API without token
  const dashNoAuth = await fetch(`${BASE_URL}/api/dashboard`);
  assert(dashNoAuth.status === 401, 'Unauthenticated /api/dashboard returns 401');

  const txNoAuth = await fetch(`${BASE_URL}/api/transactions`);
  assert(txNoAuth.status === 401, 'Unauthenticated /api/transactions returns 401');

  const graphNoAuth = await fetch(`${BASE_URL}/api/graph`);
  assert(graphNoAuth.status === 401, 'Unauthenticated /api/graph returns 401');

  const invNoAuth = await fetch(`${BASE_URL}/api/investigations`);
  assert(invNoAuth.status === 401, 'Unauthenticated /api/investigations returns 401');

  // Test 3: Secret/Dotfile protection
  const envReq = await fetch(`${BASE_URL}/.env`);
  assert(envReq.status === 404 || envReq.status === 403, 'Secret file /.env is blocked/inaccessible');

  // Test 4: Security Headers
  assert(dashNoAuth.headers.get('x-content-type-options') === 'nosniff', 'Header X-Content-Type-Options: nosniff present');
  assert(dashNoAuth.headers.get('x-frame-options') === 'DENY', 'Header X-Frame-Options: DENY present');
  assert(dashNoAuth.headers.get('referrer-policy') === 'strict-origin-when-cross-origin', 'Header Referrer-Policy present');

  // Test 5: Invalid credentials failure message
  const badLogin = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'baduser@upay.demo', password: 'badpassword' }),
  });
  const badLoginBody = await badLogin.json();
  assert(badLogin.status === 401, 'Invalid credentials returns 401');
  assert(badLoginBody.error === 'Invalid credentials.', 'Error message reveals strictly generic "Invalid credentials."');

  // Test 6: Successful Super Admin login
  const saLogin = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'diudevcis', password: 'diudevcis' }),
  });
  const saData = await saLogin.json();
  assert(saLogin.status === 200, 'Super Admin login returns 200');
  assert(!!saData.token, 'Super Admin login returns session token');
  assert(saData.user.role === 'SUPER_ADMIN', 'Super Admin role verified');
  assert(!saData.user.passwordHash, 'Password hash is NEVER exposed in API response');

  const saToken = saData.token;

  // Test 7: Authenticated API access with valid token
  const dashAuth = await fetch(`${BASE_URL}/api/dashboard`, {
    headers: { Authorization: `Bearer ${saToken}` },
  });
  assert(dashAuth.status === 200, 'Authenticated request with Bearer token succeeds with 200');
  assert(dashAuth.headers.get('cache-control')?.includes('no-store'), 'Authenticated response includes Cache-Control: no-store');

  // Test 8: Member Login & Role-Based Access Control (RBAC)
  const memberLogin = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'analyst.tanvir@upay.demo', password: 'diudevcis' }),
  });
  const memberData = await memberLogin.json();
  assert(memberLogin.status === 200, 'Member login succeeds');
  const memberToken = memberData.token;

  // Member attempting to access Admin endpoint -> 403 Forbidden
  const memberAdminReq = await fetch(`${BASE_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${memberToken}` },
  });
  assert(memberAdminReq.status === 403, 'Member calling /api/admin/users returns 403 Forbidden');

  // Viewer attempting to access Admin endpoint -> 403 Forbidden
  const viewerLogin = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'auditor.guest@upay.demo', password: 'diudevcis' }),
  });
  const viewerData = await viewerLogin.json();
  const viewerAdminReq = await fetch(`${BASE_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${viewerData.token}` },
  });
  assert(viewerAdminReq.status === 403, 'Viewer calling /api/admin/users returns 403 Forbidden');

  // Super Admin calling Admin endpoint -> 200 OK
  const saAdminReq = await fetch(`${BASE_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${saToken}` },
  });
  const saAdminData = await saAdminReq.json();
  assert(saAdminReq.status === 200, 'Super Admin calling /api/admin/users returns 200 OK');
  assert(saAdminData.activeAccountsCount === 5, 'Current active authorized accounts count is 5/5');

  // Test 9: Hard 5-Account Limit Enforcement
  const createSixth = await fetch(`${BASE_URL}/api/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${saToken}`,
    },
    body: JSON.stringify({
      name: 'Unauthorized Sixth User',
      email: 'sixth.user@upay.demo',
      role: 'MEMBER',
      department: 'Fraud',
      password: 'diudevcis',
    }),
  });
  const sixthBody = await createSixth.json();
  assert(createSixth.status === 400, 'Attempting to create 6th active account is rejected with 400');
  assert(sixthBody.error === 'Maximum authorized account limit reached.', 'Rejection reason states "Maximum authorized account limit reached."');

  // Test 10: Protect Last Super Admin
  const rootUser = saAdminData.users.find(u => u.role === 'SUPER_ADMIN');
  const demoteRoot = await fetch(`${BASE_URL}/api/admin/users/${rootUser.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${saToken}`,
    },
    body: JSON.stringify({ role: 'MEMBER' }),
  });
  assert(demoteRoot.status === 400, 'Demoting the last remaining SUPER_ADMIN is rejected with 400');

  const disableRoot = await fetch(`${BASE_URL}/api/admin/users/${rootUser.id}/disable`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${saToken}` },
  });
  assert(disableRoot.status === 400, 'Disabling the last remaining SUPER_ADMIN is rejected with 400');

  // Test 11: User Disablement and Immediate Session Revocation
  const targetMember = saAdminData.users.find(u => u.email === 'analyst.tanvir@upay.demo');
  const disableMember = await fetch(`${BASE_URL}/api/admin/users/${targetMember.id}/disable`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${saToken}` },
  });
  assert(disableMember.status === 200, 'Disabling member account succeeds');

  // Now the member token MUST be invalidated immediately
  const revokedMemberReq = await fetch(`${BASE_URL}/api/dashboard`, {
    headers: { Authorization: `Bearer ${memberToken}` },
  });
  assert(revokedMemberReq.status === 401, 'Disabled member session token is immediately invalidated (401)');

  // Re-enable member to restore original state
  const reenableMember = await fetch(`${BASE_URL}/api/admin/users/${targetMember.id}/disable`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${saToken}` },
  });
  assert(reenableMember.status === 200, 'Re-enabling member succeeds');

  // Test 12: Emergency System Lockdown
  const emergencyLockdown = await fetch(`${BASE_URL}/api/admin/emergency-lockdown`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${saToken}` },
  });
  const elData = await emergencyLockdown.json();
  assert(emergencyLockdown.status === 200, 'Emergency Lockdown execution succeeds');
  assert(elData.success === true, 'Emergency Lockdown confirmation returned');

  // Super Admin token remains active after lockdown
  const saStillActive = await fetch(`${BASE_URL}/api/dashboard`, {
    headers: { Authorization: `Bearer ${saToken}` },
  });
  assert(saStillActive.status === 200, 'Super Admin recovery session remains active after Emergency Lockdown');

  // Test 13: Admin Security Stats
  const secStats = await fetch(`${BASE_URL}/api/admin/security-stats`, {
    headers: { Authorization: `Bearer ${saToken}` },
  });
  const secStatsData = await secStats.json();
  assert(secStats.status === 200, 'Admin Security Stats returns 200');
  assert(secStatsData.maxAccounts === 5, 'Security stats report maxAccounts = 5');
  assert(Array.isArray(secStatsData.recentSecurityLogs), 'Security audit logs trail returned');

  console.log('\n===============================================================');
  console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('===============================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
