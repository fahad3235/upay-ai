/**
 * Upay Sentinel AI - Synthetic Financial Intelligence Dataset
 * 100% Synthetic Data for DIU CPC × upay AI Hackathon 2026
 * Contains 100+ customers, 1,000+ transactions, 30 devices, 20 agents, 30 merchants,
 * graph relationships, and the signature "7-Minute Incident" ATO scenario.
 */

import {
  Customer,
  Transaction,
  Agent,
  Merchant,
  Device,
  InvestigationCase,
  GraphData,
  ModelMetrics,
  AuditLog,
  DynamicRule,
} from '../types';
import { evaluateTransactionRisk } from '../engine/riskEngine';

// Compact pure-TypeScript SHA-256 standard cryptographic implementation
export function computeSha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const maxWord = Math.pow(2, 32);
  let i: number, j: number;
  let result = '';
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;
  let hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  ascii += '\x80';
  while ((ascii.length % 64) !== 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i % 4) * 8);
  }
  words.push((asciiBitLength / maxWord) | 0);
  words.push(asciiBitLength | 0);
  for (j = 0; j < words.length;) {
    const w = words.slice(j, j += 16);
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0
        );
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += ((b < 16) ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

// Customer Names for synthetic Bangladeshi mobile financial service context
const SURNAMES = ['Rahman', 'Islam', 'Hasan', 'Ahmed', 'Chowdhury', 'Khan', 'Sultana', 'Begum', 'Hossain', 'Ali', 'Mahmud', 'Akter', 'Talukdar', 'Karim', 'Siddique'];
const FIRST_NAMES = ['Tanvir', 'Fatima', 'Arif', 'Nusrat', 'Saiful', 'Sabrina', 'Farhan', 'Sadia', 'Kamrul', 'Anika', 'Mehedi', 'Rashed', 'Jannat', 'Mustafa', 'Sharmin'];

export function generateSyntheticSeed() {
  const customers: Customer[] = [];
  const transactions: Transaction[] = [];
  const agents: Agent[] = [];
  const merchants: Merchant[] = [];
  const devices: Device[] = [];
  const cases: InvestigationCase[] = [];
  const auditLogs: AuditLog[] = [];

  // 1. Generate 30 Devices
  const deviceModels = [
    'Samsung Galaxy A54', 'Xiaomi Redmi Note 12', 'iPhone 14 Pro', 'Realme C55', 
    'Vivo V27', 'OnePlus Nord CE3', 'Oppo Reno 10', 'Infinix Hot 30', 'Tecno Spark 10', 'Samsung Galaxy S23'
  ];
  for (let i = 1; i <= 30; i++) {
    const devId = `DEV-DEMO-${String(100 + i)}`;
    devices.push({
      id: devId,
      model: deviceModels[i % deviceModels.length],
      os: i % 4 === 0 ? 'iOS 17.4' : 'Android 14',
      firstSeen: `2025-0${(i % 9) + 1}-15`,
      associatedCustomers: [],
      isEmulator: i === 4, // DEV-DEMO-104 is an emulator used in ATO scenario
      isRooted: i === 4 || i === 12,
      riskScore: i === 4 ? 88 : 12 + (i % 20),
    });
  }

  // 2. Generate 20 Agents
  const agentLocations = [
    'Dhanmondi 27, Dhaka', 'Mirpur 10, Dhaka', 'Uttara Sector 7, Dhaka', 'Gulshan 2, Dhaka',
    'Motijheel C/A, Dhaka', 'Chawkbazar, Chittagong', 'Agrabad, Chittagong', 'Zindabazar, Sylhet',
    'Boalia, Rajshahi', 'Khulna Sadar, Khulna', 'Sonadanga, Khulna', 'Rangpur Sadar',
    'Barisal Sadar', 'Comilla Kandirpar', 'Gazipur Chowrasta', 'Narayanganj Chasara',
    'Savar Bus Stand', 'Bogra Satmatha', 'Mymensingh Ganginarpar', 'Jessore Kotwali'
  ];

  for (let i = 1; i <= 20; i++) {
    const agentId = `AGENT-DEMO-${String(i).padStart(3, '0')}`;
    const isSuspiciousAgent = i === 7; // AGENT-DEMO-007 is the suspicious cash-out hub
    const cashOut = isSuspiciousAgent ? 1280000 : 85000 + (i * 24000);
    const cashIn = isSuspiciousAgent ? 110000 : 90000 + (i * 18000);
    const ratio = Number((cashOut / (cashOut + cashIn)).toFixed(2));

    agents.push({
      id: agentId,
      name: `${SURNAMES[i % SURNAMES.length]} Enterprise Telecom`,
      location: agentLocations[i - 1],
      phoneMasked: `+880 18•• •••${String(100 + i)}`,
      dailyCashOutVolume: cashOut,
      dailyCashInVolume: cashIn,
      totalCustomersToday: isSuspiciousAgent ? 84 : 14 + (i * 3),
      cashOutRatio: ratio,
      peerDeviationPct: isSuspiciousAgent ? 310 : Math.round((ratio - 0.5) * 40),
      status: isSuspiciousAgent ? 'REQUIRES_REVIEW' : 'NOMINAL',
      riskScore: isSuspiciousAgent ? 89 : 14 + (i % 25),
      anomalyNotes: isSuspiciousAgent ? [
        '310% higher cash-out concentration than peer median in Savar zone',
        'Unusually high clustering of rapid sequential transfers originating from newly created wallets',
        'Multiple transactions just under threshold limits (৳24,500 each)'
      ] : ['Normal peer balance maintained'],
    });
  }

  // 3. Generate 30 Merchants
  const merchantCategories = ['Grocery', 'Electronics', 'Pharmacy', 'Fashion', 'Dining', 'Fuel'];
  for (let i = 1; i <= 30; i++) {
    const mId = `MERCHANT-DEMO-${String(i).padStart(3, '0')}`;
    merchants.push({
      id: mId,
      businessName: `${FIRST_NAMES[i % FIRST_NAMES.length]} Super Shop & Pharmacy`,
      category: merchantCategories[i % merchantCategories.length],
      location: agentLocations[i % agentLocations.length],
      dailyVolume: 45000 + i * 8500,
      riskScore: 10 + (i % 15),
    });
  }

  // 4. Generate 110 Customers with Behavioral DNA
  for (let i = 1; i <= 110; i++) {
    const custId = `CUS-DEMO-${1000 + i}`;
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = SURNAMES[(i + 3) % SURNAMES.length];
    const isHeroAtoCustomer = i === 42; // CUS-DEMO-1042 (The 7-Minute Incident Hero)

    const typicalMedian = isHeroAtoCustomer ? 2900 : 1800 + ((i * 137) % 6500);
    const knownDev = isHeroAtoCustomer ? ['DEV-DEMO-101'] : [`DEV-DEMO-${100 + ((i % 28) + 1)}`];
    const knownRec = isHeroAtoCustomer 
      ? ['CUS-DEMO-1002', 'CUS-DEMO-1008', 'MERCHANT-DEMO-004']
      : [`CUS-DEMO-${1000 + ((i + 1) % 100) + 1}`, `MERCHANT-DEMO-${String(((i % 25) + 1)).padStart(3, '0')}`];

    // Associate devices
    knownDev.forEach(d => {
      const devObj = devices.find(x => x.id === d);
      if (devObj && !devObj.associatedCustomers.includes(custId)) {
        devObj.associatedCustomers.push(custId);
      }
    });

    const dna = {
      customerId: custId,
      recentMedianAmount: typicalMedian,
      recentAvgAmount: Math.round(typicalMedian * 1.15),
      amountStdDev: Math.round(typicalMedian * 0.35),
      typicalTxPerHour: 0.4,
      typicalDailyCount: 2 + (i % 4),
      activeHoursStart: 8,
      activeHoursEnd: 22,
      knownDevices: knownDev,
      knownRecipients: knownRec,
      favoriteTypes: ['SEND_MONEY', 'MERCHANT_PAY', 'MOBILE_RECHARGE'] as any,
      accountAgeDays: 180 + (i * 9),
      profileRiskScore: isHeroAtoCustomer ? 86 : (i % 15 === 0 ? 74 : 12 + (i % 20)),
      lastActivityTimestamp: '2026-10-01T07:15:00Z',
    };

    customers.push({
      id: custId,
      name: `${firstName} ${lastName}`,
      phoneMasked: `+880 17•• •••${String(i).padStart(3, '0')}`,
      emailMasked: `${firstName.toLowerCase()}.${lastName.toLowerCase().substring(0, 3)}•••@gmail.com`,
      nidMasked: `198${(i % 10) + 8}26•••••${100 + i}`,
      kycTier: i % 5 === 0 ? 'TIER_3' : 'TIER_2',
      accountCreated: `2024-0${(i % 9) + 1}-10`,
      status: isHeroAtoCustomer ? 'FLAGGED' : (i % 18 === 0 ? 'RESTRICTED' : 'ACTIVE'),
      totalTransactions: 35 + (i * 8),
      totalVolumeBDT: (35 + (i * 8)) * typicalMedian,
      behavioralDNA: dna,
      currentRiskLevel: isHeroAtoCustomer ? 'HIGH' : (i % 15 === 0 ? 'MEDIUM' : 'LOW'),
      activeAlertCount: isHeroAtoCustomer ? 2 : (i % 18 === 0 ? 1 : 0),
    });
  }

  // 5. Generate 1,120 Transactions (including the Signature 7-Minute Incident)
  // First, generate the exact 7-Minute Incident sequence for CUS-DEMO-1042
  const heroCust = customers.find(c => c.id === 'CUS-DEMO-1042')!;
  
  // TX-DEMO-49281 (The Flagged ATO large transfer)
  const heroTxAssessment = evaluateTransactionRisk({
    transactionId: 'TX-DEMO-49281',
    amount: 18500,
    recipientId: 'WALLET-DEMO-809',
    isNewRecipient: true,
    deviceId: 'DEV-DEMO-104',
    isNewDevice: true,
    timestamp: '2026-10-01T19:46:12Z',
    recentVelocityCount: 3,
    connectedToFlaggedCluster: true,
    baseline: heroCust.behavioralDNA,
  });

  const heroTx: Transaction = {
    id: 'TX-DEMO-49281',
    timestamp: '2026-10-01T19:46:12Z',
    customerId: heroCust.id,
    customerName: heroCust.name,
    amount: 18500,
    type: 'SEND_MONEY',
    channel: 'APP',
    status: 'FLAGGED',
    recipientId: 'WALLET-DEMO-809',
    recipientName: 'WALLET-DEMO-809 (Unverified)',
    recipientType: 'CUSTOMER',
    isNewRecipient: true,
    deviceId: 'DEV-DEMO-104',
    isNewDevice: true,
    deviceModel: 'Xiaomi Redmi Note 12 (Emulated)',
    ipAddress: '103.145.74.88 (Hosting ASN)',
    locationCity: 'Dhaka, Bangladesh',
    riskAssessment: heroTxAssessment,
    quarantineStatus: 'IN_ESCROW',
    escrowExpiresAt: new Date(Date.now() + 14 * 60 * 1000 + 45 * 1000).toISOString(),
  };
  transactions.push(heroTx);

  // Rapid follow up transaction in 7-minute incident
  const heroTx2Assessment = evaluateTransactionRisk({
    transactionId: 'TX-DEMO-49282',
    amount: 15000,
    recipientId: 'WALLET-DEMO-810',
    isNewRecipient: true,
    deviceId: 'DEV-DEMO-104',
    isNewDevice: true,
    timestamp: '2026-10-01T19:47:45Z',
    recentVelocityCount: 4,
    connectedToFlaggedCluster: true,
    baseline: heroCust.behavioralDNA,
  });

  const heroTx2: Transaction = {
    id: 'TX-DEMO-49282',
    timestamp: '2026-10-01T19:47:45Z',
    customerId: heroCust.id,
    customerName: heroCust.name,
    amount: 15000,
    type: 'SEND_MONEY',
    channel: 'APP',
    status: 'BLOCKED',
    recipientId: 'WALLET-DEMO-810',
    recipientName: 'WALLET-DEMO-810 (Intermediary)',
    recipientType: 'CUSTOMER',
    isNewRecipient: true,
    deviceId: 'DEV-DEMO-104',
    isNewDevice: true,
    deviceModel: 'Xiaomi Redmi Note 12 (Emulated)',
    ipAddress: '103.145.74.88 (Hosting ASN)',
    locationCity: 'Dhaka, Bangladesh',
    riskAssessment: heroTx2Assessment,
  };
  transactions.push(heroTx2);

  // Generate 1,118 normal, medium and varied transactions for the dataset
  const txTypes: Transaction['type'][] = ['SEND_MONEY', 'MERCHANT_PAY', 'CASH_OUT', 'MOBILE_RECHARGE', 'ADD_MONEY', 'UTILITY_BILL'];
  const endTs = new Date('2026-10-02T19:00:00Z').getTime();
  const startTs = new Date('2026-09-02T08:00:00Z').getTime();
  const stepMs = Math.floor((endTs - startTs) / 1118);

  for (let i = 1; i <= 1118; i++) {
    const txId = `TX-DEMO-${String(40000 + i)}`;
    const custIndex = (i * 7) % customers.length;
    const cust = customers[custIndex];
    const isAnomalous = i % 47 === 0;
    const isMediumRisk = i % 19 === 0;

    const baseAmount = cust.behavioralDNA.recentMedianAmount;
    let amount = isAnomalous ? Math.round(baseAmount * 4.6) : (isMediumRisk ? Math.round(baseAmount * 2.2) : Math.max(100, Math.round(baseAmount * (0.4 + (i % 12) * 0.1))));
    
    // Cap amounts realistically
    amount = Math.min(25000, amount);

    const type = txTypes[i % txTypes.length];
    const devId = (isAnomalous && i % 3 === 0) ? 'DEV-DEMO-104' : cust.behavioralDNA.knownDevices[0] || 'DEV-DEMO-101';
    const isNewDev = !cust.behavioralDNA.knownDevices.includes(devId);
    
    const recId = isAnomalous 
      ? `WALLET-DEMO-${900 + (i % 20)}` 
      : cust.behavioralDNA.knownRecipients[0] || `CUS-DEMO-1002`;
    const isNewRec = !cust.behavioralDNA.knownRecipients.includes(recId);

    // Calculate timestamp stepped evenly across past 30 days
    const txTime = new Date(startTs + i * stepMs).toISOString();

    const assessment = evaluateTransactionRisk({
      transactionId: txId,
      amount,
      recipientId: recId,
      isNewRecipient: isNewRec,
      deviceId: devId,
      isNewDevice: isNewDev,
      timestamp: txTime,
      recentVelocityCount: isAnomalous ? 3 : 1,
      connectedToFlaggedCluster: isAnomalous,
      baseline: cust.behavioralDNA,
    });

    const status: Transaction['status'] = assessment.riskLevel === 'CRITICAL' ? 'BLOCKED' : (assessment.riskLevel === 'HIGH' ? 'FLAGGED' : 'COMPLETED');

    transactions.push({
      id: txId,
      timestamp: txTime,
      customerId: cust.id,
      customerName: cust.name,
      amount,
      type,
      channel: i % 5 === 0 ? 'USSD' : 'APP',
      status,
      recipientId: recId,
      recipientName: recId.startsWith('MERCHANT') ? 'Merchant Counterparty' : (recId.startsWith('WALLET') ? `Flagged Node (${recId})` : `Customer ${recId}`),
      recipientType: recId.startsWith('MERCHANT') ? 'MERCHANT' : (type === 'CASH_OUT' ? 'AGENT' : 'CUSTOMER'),
      isNewRecipient: isNewRec,
      deviceId: devId,
      isNewDevice: isNewDev,
      deviceModel: devices.find(d => d.id === devId)?.model || 'Samsung Galaxy A54',
      ipAddress: `103.239.${(i % 120) + 1}.${(i % 240) + 1}`,
      locationCity: agentLocations[i % agentLocations.length],
      agentId: type === 'CASH_OUT' ? `AGENT-DEMO-${String((i % 20) + 1).padStart(3, '0')}` : undefined,
      riskAssessment: assessment,
    });
  }

  // 6. Build the Signature Investigation Cases
  // Case 1: THE 7-MINUTE INCIDENT (Account Takeover)
  const caseAto: InvestigationCase = {
    id: 'CASE-2026-8941',
    title: 'Rapid Account Takeover & Outbound Drain Attempt',
    customerId: 'CUS-DEMO-1042',
    customerName: 'Tanvir Rahman',
    transactionId: 'TX-DEMO-49281',
    amountBDT: 18500,
    priority: 'CRITICAL',
    riskScore: 86,
    primarySignal: 'Amount Anomaly & Device Change',
    createdTime: '2026-10-01T19:49:00Z',
    updatedTime: '2026-10-01T19:55:00Z',
    assignedTo: 'Fahad Ahmed (Senior Fraud Analyst)',
    status: 'INVESTIGATING',
    dualAuthRequired: true,
    dualAuthStatus: 'PENDING_APPROVAL',
    dualAuthRequestedBy: 'Fahad Ahmed (Senior Fraud Analyst)',
    timeline: [
      {
        id: 'EVT-01',
        time: '19:41:04',
        title: 'New Device Login Detected',
        category: 'DEVICE',
        description: 'Session initialized from unrecognized device DEV-DEMO-104 (Xiaomi Redmi Note 12 / Android Emulator). No prior history for this customer.',
        severity: 'WARNING',
        metadata: { DeviceId: 'DEV-DEMO-104', IP: '103.145.74.88' },
      },
      {
        id: 'EVT-02',
        time: '19:42:18',
        title: 'Authentication Anomaly',
        category: 'AUTHENTICATION',
        description: 'PIN entered directly with 0 typing cadence delay, originating from a known commercial proxy IP range.',
        severity: 'WARNING',
        metadata: { AuthChannel: 'API/App Direct', ASNumber: 'AS13335' },
      },
      {
        id: 'EVT-03',
        time: '19:44:02',
        title: 'New Recipient Registered',
        category: 'RECIPIENT',
        description: 'Counterparty WALLET-DEMO-809 saved to quick transfers. Never transacted with this account in 340 days of history.',
        severity: 'INFO',
        metadata: { RecipientWallet: 'WALLET-DEMO-809' },
      },
      {
        id: 'EVT-04',
        time: '19:46:12',
        title: 'High-Value Outbound Transfer (৳18,500)',
        category: 'TRANSACTION',
        description: 'Initiated ৳18,500 send money request. Exceeds customer 90-day median (৳2,900) by +538%.',
        severity: 'ALERT',
        metadata: { Amount: '৳18,500', Deviation: '+538%' },
      },
      {
        id: 'EVT-05',
        time: '19:47:45',
        title: 'Rapid Follow-Up Attempt (৳15,000)',
        category: 'TRANSACTION',
        description: 'Second large transfer attempted 93 seconds later to WALLET-DEMO-810. Blocked by Sentinel rule engine.',
        severity: 'ALERT',
        metadata: { Amount: '৳15,000', RuleTrigger: 'RAPID_DRAIN_BURST' },
      },
      {
        id: 'EVT-06',
        time: '19:48:20',
        title: 'TrustGraph Network Ring Linkage',
        category: 'NETWORK',
        description: 'Recipient WALLET-DEMO-809 connected via shared hardware DEV-DEMO-104 to cash-out hub AGENT-DEMO-007.',
        severity: 'CRITICAL',
        metadata: { ClusterId: 'CLUSTER-SMURF-904', HubAgent: 'AGENT-DEMO-007' },
      },
      {
        id: 'EVT-07',
        time: '19:49:00',
        title: 'Incident Escalated to Fraud Command Center',
        category: 'ALERT',
        description: 'Composite risk score 86 HIGH generated. Human review required. Temporary safety verification issued to customer.',
        severity: 'CRITICAL',
        metadata: { CaseId: 'CASE-2026-8941', Priority: 'CRITICAL' },
      },
    ],
    structuredEvidence: {
      transactionFacts: [
        'Outbound transfer of ৳18,500 to WALLET-DEMO-809 at 19:46:12.',
        'Follow-up outbound transfer of ৳15,000 to WALLET-DEMO-810 attempted at 19:47:45.',
        'Total requested drainage within 100 seconds: ৳33,500.'
      ],
      behavioralAnomalies: [
        'Amount ৳18,500 deviates by +538% from synthetic baseline median of ৳2,900.',
        'Time of transaction (19:46) is outside customary weekday transacting pattern for this user.',
        'Velocity spiked from 0.4 tx/day baseline to 2 major transfers in under 2 minutes.'
      ],
      networkFindings: [
        'Device DEV-DEMO-104 was flagged in synthetic cluster CLUSTER-SMURF-904.',
        'Recipient WALLET-DEMO-809 shares device fingerprint with 3 other newly generated wallets.',
        'Fund chain terminates at high-volume cash-out hub AGENT-DEMO-007 (Savar zone).'
      ],
      riskSignalsSummary: [
        'Amount Anomaly (+31)',
        'Recipient Novelty (+18)',
        'Device Change (+16)',
        'Network Cluster Linkage (+14)',
        'Velocity Spike (+12)'
      ]
    },
    aiAnalysis: {
      summary: 'Grounded investigation indicates high probability of Credential Stuffing / Account Takeover (ATO) followed by an urgent fund extraction attempt.',
      whatHappened: 'At 19:41, an unverified device (DEV-DEMO-104) successfully authenticated as customer CUS-DEMO-1042. Within 5 minutes, an unknown counterparty (WALLET-DEMO-809) was registered and an uncharacteristically large transfer of ৳18,500 was initiated, immediately followed by a second attempt of ৳15,000.',
      whyRisky: 'The customer has a 340-day baseline of small domestic peer transfers (median ৳2,900) exclusively using a single device (DEV-DEMO-101). The abrupt hardware change, absence of session warm-up, extreme value deviation (+538%), and graph proximity to a known smurfing cluster indicate malicious takeover rather than legitimate behavior.',
      keyEvidence: [
        'Hardware DEV-DEMO-104 exhibits Android emulator indicators and zero prior association with CUS-DEMO-1042.',
        'Outbound amount ৳18,500 is in the 99.8th percentile of historical synthetic transactions for this profile.',
        'Recipient WALLET-DEMO-809 has 0 days of tenure and is linked to cash-out node AGENT-DEMO-007.'
      ],
      alternativeExplanations: [
        'The customer genuinely bought a new handset and is executing an emergency remittance or family medical payment.',
        'A family member or agent was authorized to execute transactions on behalf of the customer.'
      ],
      recommendedChecks: [
        'Contact customer Tanvir Rahman via verified registered voice channel (+880 17•• •••042) to confirm device handover.',
        'Inspect OTP dispatch logs to determine whether SMS redirection or SIM swap occurred prior to 19:41.',
        'Temporarily pause cash-out disbursement at AGENT-DEMO-007 for wallets associated with cluster CLUSTER-SMURF-904.'
      ],
      confidence: 91,
      generatedAt: '2026-10-01T19:50:15Z',
      isAiFallback: false,
    },
    analystNotes: [
      {
        id: 'NOTE-1',
        author: 'System Sentinel',
        text: 'Automated hold placed on outbound cash-out at destination agent AGENT-DEMO-007 pending analyst phone verification.',
        timestamp: '2026-10-01T19:49:10Z',
      }
    ]
  };
  cases.push(caseAto);

  // Case 2: Smurfing Network Ring
  cases.push({
    id: 'CASE-2026-8942',
    title: 'Suspicious Smurfing Network & Rapid Mule Dispersion',
    customerId: 'CUS-DEMO-1088',
    customerName: 'Mehedi Hasan',
    transactionId: 'TX-DEMO-40112',
    amountBDT: 24500,
    priority: 'HIGH',
    riskScore: 78,
    primarySignal: 'Network Ring Connection',
    createdTime: '2026-10-01T14:22:00Z',
    updatedTime: '2026-10-01T15:10:00Z',
    assignedTo: 'Sabrina Akter (Risk Manager)',
    status: 'ESCALATED',
    timeline: [
      {
        id: 'EVT-201',
        time: '14:15:00',
        title: 'Multiple Inbound Micro-Transfers',
        category: 'TRANSACTION',
        description: 'Wallet received four transfers of ৳6,000 from separate accounts within 10 minutes.',
        severity: 'WARNING',
      },
      {
        id: 'EVT-202',
        time: '14:22:00',
        title: 'Consolidated Outbound Cash-Out',
        category: 'TRANSACTION',
        description: 'Immediate cash-out of ৳24,500 requested at agent AGENT-DEMO-007.',
        severity: 'ALERT',
      }
    ],
    structuredEvidence: {
      transactionFacts: ['Rapid funneling of ৳24,500 across 4 intermediary accounts.'],
      behavioralAnomalies: ['Zero retention time: funds moved within 7 minutes of arrival.'],
      networkFindings: ['Graph degree centrality shows 4-to-1 aggregation pattern.'],
      riskSignalsSummary: ['Velocity Spike (+18)', 'Network Clustering (+22)', 'Rapid Cash-Out (+16)']
    },
    analystNotes: []
  });

  // Case 3: High-Value Anomaly (False Positive Candidate)
  cases.push({
    id: 'CASE-2026-8943',
    title: 'Unusual Festival Remittance & Family Transfer',
    customerId: 'CUS-DEMO-1015',
    customerName: 'Fatima Begum',
    transactionId: 'TX-DEMO-40245',
    amountBDT: 12000,
    priority: 'MEDIUM',
    riskScore: 54,
    primarySignal: 'Amount Anomaly',
    createdTime: '2026-10-01T11:05:00Z',
    updatedTime: '2026-10-01T12:00:00Z',
    assignedTo: 'Arif Chowdhury (Analyst)',
    status: 'RESOLVED',
    timeline: [
      {
        id: 'EVT-301',
        time: '11:05:00',
        title: 'Transfer to Known Family Member',
        category: 'TRANSACTION',
        description: 'Customer used verified known device DEV-DEMO-103 to transfer ৳12,000 to son.',
        severity: 'INFO',
      }
    ],
    structuredEvidence: {
      transactionFacts: ['Transfer to known recipient from verified handset.'],
      behavioralAnomalies: ['Amount higher than monthly median due to Eid festival season.'],
      networkFindings: ['Isolated personal network, no connection to flagged hubs.'],
      riskSignalsSummary: ['Amount Anomaly (+22)']
    },
    analystNotes: [
      {
        id: 'NOTE-31',
        author: 'Arif Chowdhury',
        text: 'Confirmed via 2FA callback: legitimate festival gift remittance. Case marked Resolved / False Positive.',
        timestamp: '2026-10-01T12:00:00Z'
      }
    ]
  });

  // Case 4: Cross-Border Inward Remittance Layering & Immediate Split (NEW, CRITICAL)
  cases.push({
    id: 'CASE-2026-8944',
    title: 'Cross-Border Inward Remittance Layering & Rapid Smurf Dispersion',
    customerId: 'CUS-DEMO-1006',
    customerName: 'Kamal Khan',
    transactionId: 'TX-DEMO-006',
    amountBDT: 48000,
    priority: 'CRITICAL',
    riskScore: 89,
    primarySignal: 'Cross-Border Velocity Layering',
    createdTime: '2026-10-02T08:15:00Z',
    updatedTime: '2026-10-02T08:30:00Z',
    assignedTo: 'Unassigned',
    status: 'NEW',
    dualAuthRequired: true,
    dualAuthStatus: 'PENDING_APPROVAL',
    dualAuthRequestedBy: 'Automated Rule RULE-2026-104',
    timeline: [
      {
        id: 'EVT-401',
        time: '08:10:00',
        title: 'Inbound Cross-Border Inward Remittance',
        category: 'TRANSACTION',
        description: 'Received ৳48,000 via international remittance aggregator partner channel.',
        severity: 'INFO',
      },
      {
        id: 'EVT-402',
        time: '08:14:30',
        title: 'Immediate 4-Way Structuring Dispersion Attempt',
        category: 'ALERT',
        description: 'Within 4 minutes, initiated 4 distinct transfers of ৳12,000 each to newly opened mule wallets.',
        severity: 'CRITICAL',
      }
    ],
    structuredEvidence: {
      transactionFacts: [
        'Inflow of ৳48,000 followed by 4 immediate outbound splits within 270 seconds.',
        'Zero retention time: customer account balance dropped from ৳48,150 to ৳150.'
      ],
      behavioralAnomalies: [
        'Customer KYC Tier 2 profile with 3-year history of max ৳5,000 monthly activity.',
        'Spike of +860% above 90-day baseline moving median.'
      ],
      networkFindings: [
        'Recipients WALLET-DEMO-812 and WALLET-DEMO-815 linked to syndicate CLUSTER-SMURF-904.',
        'Destination wallets share subnet with known cash-out agent AGENT-DEMO-007.'
      ],
      riskSignalsSummary: [
        'Layering Velocity (+34)',
        'Network Hub Proximity (+26)',
        'Amount Anomaly (+29)'
      ]
    },
    aiAnalysis: {
      summary: 'High-confidence rapid layering scheme typical of unlicensed informal value transfer (Hundi) or mule cash-out.',
      whatHappened: 'Wallet received a high-value remittance credit and immediately attempted to disburse 100% of the funds across 4 newly registered recipient endpoints to avoid individual transaction thresholds.',
      whyRisky: 'Classic velocity burst with zero account retention, linked downstream to high-risk cash-out nodes with pending STR filings.',
      keyEvidence: [
        'Inward remittance drained within 4.5 minutes.',
        '4 equal outbound splits just under monitoring thresholds.',
        'Two recipients flagged in graph cluster CLUSTER-SMURF-904.'
      ],
      alternativeExplanations: [
        'Emergency family medical fund distribution coordinated by account holder.'
      ],
      recommendedChecks: [
        'Enforce administrative quarantine on outbound tranches.',
        'Require Senior CAMLCO dual authorization before release.',
        'Escalate SAR filing to Bangladesh Bank BFIU portal.'
      ],
      confidence: 94,
      generatedAt: '2026-10-02T08:30:00Z',
      isAiFallback: false,
    },
    analystNotes: []
  });

  // Case 5: Dormant Account Reactivation (INVESTIGATING, HIGH)
  cases.push({
    id: 'CASE-2026-8945',
    title: 'Dormant Account Reactivation with High-Velocity Micro-Transfers',
    customerId: 'CUS-DEMO-1063',
    customerName: 'Liton Begum',
    transactionId: 'TX-DEMO-063',
    amountBDT: 9500,
    priority: 'HIGH',
    riskScore: 74,
    primarySignal: 'Dormant Account Burst',
    createdTime: '2026-10-02T06:30:00Z',
    updatedTime: '2026-10-02T07:15:00Z',
    assignedTo: 'Arif Chowdhury (Analyst)',
    status: 'INVESTIGATING',
    timeline: [
      {
        id: 'EVT-501',
        time: '06:22:10',
        title: 'First Login in 184 Days',
        category: 'AUTHENTICATION',
        description: 'Successful PIN login from device DEV-DEMO-112 after 6 months of complete inactivity.',
        severity: 'WARNING',
      },
      {
        id: 'EVT-502',
        time: '06:28:45',
        title: 'Add Money via Bank followed by Send Money',
        category: 'TRANSACTION',
        description: '৳10,000 linked bank pull immediately forwarded via peer transfer.',
        severity: 'ALERT',
      }
    ],
    structuredEvidence: {
      transactionFacts: ['Account inactive since March 2026; sudden ৳10,000 inflow and ৳9,500 outflow.'],
      behavioralAnomalies: ['Dormancy index 184 days. Baseline monthly volume was ৳0.'],
      networkFindings: ['Recipient is newly registered wallet without KYC Tier 2 verification.'],
      riskSignalsSummary: ['Dormancy Reactivation (+28)', 'Velocity Spike (+24)', 'New Counterparty (+22)']
    },
    aiAnalysis: {
      summary: 'Dormant account reactivation exhibiting signs of mule lease or credential compromise.',
      whatHappened: 'Account sat dormant for 6 months, then reactivated at 06:22 AM with immediate bank pull and peer transfer.',
      whyRisky: 'Dormant accounts are prime targets for temporary rental or credential theft for illicit liquidity transit.',
      keyEvidence: ['184 days dormancy', 'Sudden rapid liquidity transit', 'Early morning login outside profile habit'],
      alternativeExplanations: ['Legitimate seasonal reactivation by returning migrant worker or student.'],
      recommendedChecks: ['Voice callback to registered MSISDN.', 'Check IP geolocation continuity.'],
      confidence: 81,
      generatedAt: '2026-10-02T07:15:00Z',
      isAiFallback: false,
    },
    analystNotes: [
      {
        id: 'NOTE-51',
        author: 'Arif Chowdhury',
        text: 'Initiated outbound voice check; phone rang with no answer. Temporary safety verification placed on pending transfers.',
        timestamp: '2026-10-02T07:15:00Z'
      }
    ]
  });

  // Case 6: SIM Swap & Credential Takeover (NEW, HIGH)
  cases.push({
    id: 'CASE-2026-8946',
    title: 'Suspected SIM-Swap OTP Intercept & Rapid PIN Reset Attack',
    customerId: 'CUS-DEMO-1099',
    customerName: 'Rasheda Mia',
    transactionId: 'TX-DEMO-099',
    amountBDT: 16800,
    priority: 'HIGH',
    riskScore: 82,
    primarySignal: 'SIM Swap & Credential Anomaly',
    createdTime: '2026-10-02T09:02:00Z',
    updatedTime: '2026-10-02T09:10:00Z',
    assignedTo: 'Unassigned',
    status: 'NEW',
    timeline: [
      {
        id: 'EVT-601',
        time: '08:55:00',
        title: 'MNO SIM Swap Telemetry Flag',
        category: 'ALERT',
        description: 'Telco API signaled IMSI change within last 12 hours.',
        severity: 'CRITICAL',
      },
      {
        id: 'EVT-602',
        time: '08:58:12',
        title: 'PIN Reset via SMS OTP on Unrecognized Handset',
        category: 'AUTHENTICATION',
        description: 'New PIN set from handset DEV-DEMO-120 (Tecno Spark 20).',
        severity: 'CRITICAL',
      },
      {
        id: 'EVT-603',
        time: '09:01:40',
        title: 'Maximum Balance Cash-Out Attempt',
        category: 'TRANSACTION',
        description: 'Attempted cash-out of ৳16,800 at merchant POS.',
        severity: 'ALERT',
      }
    ],
    structuredEvidence: {
      transactionFacts: ['IMSI change recorded by mobile operator 3.2 hours prior to authentication.'],
      behavioralAnomalies: ['Password/PIN reset followed immediately by wallet drainage in < 4 minutes.'],
      networkFindings: ['Device DEV-DEMO-120 never previously associated with customer profile.'],
      riskSignalsSummary: ['SIM Swap Event (+38)', 'Credential Reset Delta (+26)', 'Device Novelty (+18)']
    },
    aiAnalysis: {
      summary: 'Classic SIM swap account takeover pattern with immediate unauthorized cash-out attempt.',
      whatHappened: 'IMSI change detected followed within minutes by PIN reset from a new device and full balance liquidation.',
      whyRisky: 'High certainty of telco-level SIM compromise; customer is likely unaware due to lost cellular service.',
      keyEvidence: ['Telco IMSI change telemetry', 'Instant PIN reset', 'Zero typing delay'],
      alternativeExplanations: ['Legitimate replacement SIM purchased by owner following lost handset.'],
      recommendedChecks: ['Lock wallet immediately.', 'Contact customer via registered backup email.'],
      confidence: 93,
      generatedAt: '2026-10-02T09:10:00Z',
      isAiFallback: false,
    },
    analystNotes: []
  });

  // Case 7: Agent Collusion Structuring (ESCALATED, CRITICAL)
  cases.push({
    id: 'CASE-2026-8947',
    title: 'Agent Collusion & Serial Cash-Out Threshold Evasion',
    customerId: 'CUS-DEMO-1096',
    customerName: 'Tahmina Mahmud',
    transactionId: 'TX-DEMO-096',
    amountBDT: 24900,
    priority: 'CRITICAL',
    riskScore: 91,
    primarySignal: 'Agent Collusion & Structuring',
    createdTime: '2026-10-02T05:10:00Z',
    updatedTime: '2026-10-02T06:45:00Z',
    assignedTo: 'Sabrina Akter (Risk Manager)',
    status: 'ESCALATED',
    dualAuthRequired: true,
    dualAuthStatus: 'PENDING_APPROVAL',
    dualAuthRequestedBy: 'Sabrina Akter (Risk Manager)',
    timeline: [
      {
        id: 'EVT-701',
        time: '05:04:12',
        title: 'Cash-Out Request ৳24,900 at Hub AGENT-DEMO-007',
        category: 'TRANSACTION',
        description: 'Amount calibrated exactly ৳100 below the ৳25,000 KYC enhanced diligence threshold.',
        severity: 'ALERT',
      },
      {
        id: 'EVT-702',
        time: '05:08:30',
        title: 'Agent Discrepancy Signal Triggered',
        category: 'NETWORK',
        description: 'Agent AGENT-DEMO-007 exhibits 310% higher cash-out ratio than peer median in Savar zone.',
        severity: 'CRITICAL',
      }
    ],
    structuredEvidence: {
      transactionFacts: ['Amount ৳24,900 structured right under ৳25,000 threshold.'],
      behavioralAnomalies: ['Repeated exact-interval transactions across 3 linked secondary accounts.'],
      networkFindings: ['Direct terminal connection to flagged agent AGENT-DEMO-007.'],
      riskSignalsSummary: ['Threshold Evasion (+32)', 'Agent Outlier Score (+31)', 'Network Proximity (+28)']
    },
    aiAnalysis: {
      summary: 'Evidence strongly indicates organized structuring with complicit MFS agent point.',
      whatHappened: 'Multiple linked accounts executing sequential cash-outs calibrated just under regulatory reporting limits at the same physical agent desk.',
      whyRisky: 'Agent AGENT-DEMO-007 shows abnormal liquidity imbalance and heavy association with smurfing clusters.',
      keyEvidence: ['Structured at ৳24,900 vs ৳25k limit', 'Agent 310% peer deviation', 'Multiple unverified sender nodes'],
      alternativeExplanations: ['High-volume seasonal festival payroll for local small factory.'],
      recommendedChecks: ['Dispatch field auditor to AGENT-DEMO-007.', 'Place temporary hold on agent float account.'],
      confidence: 92,
      generatedAt: '2026-10-02T06:45:00Z',
      isAiFallback: false,
    },
    analystNotes: [
      {
        id: 'NOTE-71',
        author: 'Sabrina Akter',
        text: 'Escalated to Senior CAMLCO for agent float freeze and BFIU SAR submission.',
        timestamp: '2026-10-02T06:45:00Z'
      }
    ]
  });

  // Case 8: Micro-Structuring Evasion (INVESTIGATING, MEDIUM)
  cases.push({
    id: 'CASE-2026-8948',
    title: 'High-Frequency Micro-Structuring Below Velocity Radar Limits',
    customerId: 'CUS-DEMO-1043',
    customerName: 'Ferdous Molla',
    transactionId: 'TX-DEMO-243',
    amountBDT: 29400,
    priority: 'MEDIUM',
    riskScore: 68,
    primarySignal: 'Structuring Threshold Evasion',
    createdTime: '2026-10-02T04:12:00Z',
    updatedTime: '2026-10-02T05:00:00Z',
    assignedTo: 'Fahad Ahmed (Super Admin)',
    status: 'INVESTIGATING',
    timeline: [
      {
        id: 'EVT-801',
        time: '03:55:00',
        title: 'Sequential Transfers of ৳4,900 Each',
        category: 'TRANSACTION',
        description: '6 rapid consecutive transfers to 6 different unverified numbers within 12 minutes.',
        severity: 'WARNING',
      }
    ],
    structuredEvidence: {
      transactionFacts: ['Cumulative transfer ৳29,400 partitioned into 6 chunks of ৳4,900.'],
      behavioralAnomalies: ['Burst velocity 15x normal customer baseline.'],
      networkFindings: ['Recipients all registered within the same 48-hour window.'],
      riskSignalsSummary: ['Micro-Structuring (+26)', 'Velocity Surge (+22)', 'Counterparty Uniformity (+20)']
    },
    aiAnalysis: {
      summary: 'Fan-out micro-structuring pattern designed to evade single-transaction rule triggers.',
      whatHappened: 'Sender broke a ৳30k lump sum into six ৳4.9k micro-transfers executed in rapid succession.',
      whyRisky: 'Standard threshold-evasion typology observed in unlicensed betting distribution or smurfing.',
      keyEvidence: ['6 transfers of identical ৳4,900 value', 'Targeting newly activated SIMs'],
      alternativeExplanations: ['Subcontractor daily wage disbursements to construction day laborers.'],
      recommendedChecks: ['Request invoice or labor contract proof from sender.'],
      confidence: 84,
      generatedAt: '2026-10-02T05:00:00Z',
      isAiFallback: false,
    },
    analystNotes: [
      {
        id: 'NOTE-81',
        author: 'Fahad Ahmed',
        text: 'Customer requested to upload contractor trade license. Investigation ongoing.',
        timestamp: '2026-10-02T05:00:00Z'
      }
    ]
  });

  // Case 9: Merchant Corporate Payroll (RESOLVED, LOW)
  cases.push({
    id: 'CASE-2026-8949',
    title: 'Merchant Corporate Payroll Batch Processing Outlier',
    customerId: 'CUS-DEMO-1025',
    customerName: 'Laila Mia',
    transactionId: 'TX-DEMO-225',
    amountBDT: 35000,
    priority: 'LOW',
    riskScore: 28,
    primarySignal: 'High Volume Nominal',
    createdTime: '2026-10-01T16:00:00Z',
    updatedTime: '2026-10-01T17:30:00Z',
    assignedTo: 'Nusrat Jahan (CAMLCO)',
    status: 'RESOLVED',
    timeline: [
      {
        id: 'EVT-901',
        time: '16:00:00',
        title: 'Monthly Staff Salary Bulk Disbursement',
        category: 'TRANSACTION',
        description: 'Verified corporate merchant wallet disbursed monthly staff compensation.',
        severity: 'INFO',
      }
    ],
    structuredEvidence: {
      transactionFacts: ['Recurring first-of-month payroll matching corporate verified contract.'],
      behavioralAnomalies: ['Amount higher than daily median but aligned with 1st-of-month cycle.'],
      networkFindings: ['All recipients are verified employees with valid KYC Tier 2 on file.'],
      riskSignalsSummary: ['Cyclical Volume Spike (+14)']
    },
    aiAnalysis: {
      summary: 'Verified benign corporate disbursement. Aligns fully with scheduled recurring payroll schedule.',
      whatHappened: 'Monthly salary distribution executed through merchant portal.',
      whyRisky: 'Triggered solely on absolute volume, with zero fraudulent behavioral indicators.',
      keyEvidence: ['First-of-month cadence', 'KYC verified recipients', 'Known registered corporate handset'],
      alternativeExplanations: ['None. Standard business operation.'],
      recommendedChecks: ['Case closed as legitimate.'],
      confidence: 98,
      generatedAt: '2026-10-01T17:30:00Z',
      isAiFallback: false,
    },
    analystNotes: [
      {
        id: 'NOTE-91',
        author: 'Nusrat Jahan',
        text: 'Verified with HR registry. Legitimate monthly salary run. Marked Resolved.',
        timestamp: '2026-10-01T17:30:00Z'
      }
    ]
  });

  // Case 10: Family Medical Emergency (FALSE_POSITIVE, MEDIUM)
  cases.push({
    id: 'CASE-2026-8950',
    title: 'New Handset Upgrade with Verified Medical Emergency Hospital Transfer',
    customerId: 'CUS-DEMO-1051',
    customerName: 'Shahnaz Khan',
    transactionId: 'TX-DEMO-251',
    amountBDT: 15000,
    priority: 'MEDIUM',
    riskScore: 42,
    primarySignal: 'Device Novelty',
    createdTime: '2026-10-01T13:40:00Z',
    updatedTime: '2026-10-01T14:30:00Z',
    assignedTo: 'Arif Chowdhury (Analyst)',
    status: 'FALSE_POSITIVE',
    timeline: [
      {
        id: 'EVT-1001',
        time: '13:35:00',
        title: 'Login from Brand New Handset DEV-DEMO-110',
        category: 'DEVICE',
        description: 'New device model Realme 11 Pro enrolled via biometric face check.',
        severity: 'WARNING',
      },
      {
        id: 'EVT-1002',
        time: '13:40:00',
        title: 'Payment to Square Hospital Verified Merchant Portal',
        category: 'TRANSACTION',
        description: 'Direct payment of ৳15,000 for emergency admission fee.',
        severity: 'INFO',
      }
    ],
    structuredEvidence: {
      transactionFacts: ['Payment routed directly to registered hospital merchant code MERCHANT-DEMO-008.'],
      behavioralAnomalies: ['New hardware enrolled immediately before transaction.'],
      networkFindings: ['Merchant is accredited Category A hospital partner.'],
      riskSignalsSummary: ['New Device (+24)', 'Urgent Outbound (+18)']
    },
    aiAnalysis: {
      summary: 'Verified benign medical emergency transaction with valid biometric authentication.',
      whatHappened: 'Customer replaced phone and immediately settled emergency hospital admission fee.',
      whyRisky: 'Rapid spend on fresh device initially mimicked ATO signature.',
      keyEvidence: ['Recipient is accredited medical institution', 'Facial biometric matched KYC master photo'],
      alternativeExplanations: ['None. Hospital admission desk confirmed admission of customer spouse.'],
      recommendedChecks: ['Whitelisted device DEV-DEMO-110 to customer profile.'],
      confidence: 96,
      generatedAt: '2026-10-01T14:30:00Z',
      isAiFallback: false,
    },
    analystNotes: [
      {
        id: 'NOTE-101',
        author: 'Arif Chowdhury',
        text: 'Hospital bill receipt cross-referenced. Biometric verification passed. Marked FALSE POSITIVE and whitelisted device.',
        timestamp: '2026-10-01T14:30:00Z'
      }
    ]
  });

  // 7. TrustGraph Nodes and Links Generation

  const graphNodes: GraphData['nodes'] = [];
  const graphLinks: GraphData['links'] = [];

  // Central cluster for ATO scenario & Smurfing Network
  graphNodes.push(
    { id: 'CUS-DEMO-1042', name: 'Tanvir Rahman (Victim)', type: 'CUSTOMER', riskScore: 86, riskLevel: 'HIGH', isFlagged: true, clusterId: 'CLUSTER-SMURF-904' },
    { id: 'DEV-DEMO-104', name: 'DEV-DEMO-104 (Emulated)', type: 'DEVICE', riskScore: 92, riskLevel: 'CRITICAL', isFlagged: true, clusterId: 'CLUSTER-SMURF-904' },
    { id: 'DEV-DEMO-101', name: 'DEV-DEMO-101 (Known Phone)', type: 'DEVICE', riskScore: 10, riskLevel: 'LOW', isFlagged: false },
    { id: 'WALLET-DEMO-809', name: 'Mule Wallet 809', type: 'WALLET', riskScore: 88, riskLevel: 'CRITICAL', isFlagged: true, clusterId: 'CLUSTER-SMURF-904' },
    { id: 'WALLET-DEMO-810', name: 'Mule Wallet 810', type: 'WALLET', riskScore: 84, riskLevel: 'HIGH', isFlagged: true, clusterId: 'CLUSTER-SMURF-904' },
    { id: 'WALLET-DEMO-811', name: 'Intermediary Wallet 811', type: 'WALLET', riskScore: 76, riskLevel: 'HIGH', isFlagged: true, clusterId: 'CLUSTER-SMURF-904' },
    { id: 'AGENT-DEMO-007', name: 'Savar Telecom (Cash-Out Hub)', type: 'AGENT', riskScore: 89, riskLevel: 'CRITICAL', isFlagged: true, clusterId: 'CLUSTER-SMURF-904' },
    { id: 'CUS-DEMO-1002', name: 'Farhan Ali (Known Contact)', type: 'CUSTOMER', riskScore: 12, riskLevel: 'LOW', isFlagged: false },
    { id: 'MERCHANT-DEMO-004', name: 'Dhanmondi Super Shop', type: 'MERCHANT', riskScore: 15, riskLevel: 'LOW', isFlagged: false }
  );

  // Additional 25 varied nodes across the network
  for (let i = 1; i <= 25; i++) {
    const cust = customers[i];
    graphNodes.push({
      id: cust.id,
      name: cust.name,
      type: 'CUSTOMER',
      riskScore: cust.behavioralDNA.profileRiskScore,
      riskLevel: cust.currentRiskLevel,
      isFlagged: cust.currentRiskLevel === 'HIGH' || cust.currentRiskLevel === 'CRITICAL',
    });
  }

  // Links for ATO cluster: CUS A -> WALLET B -> WALLET C -> WALLET D -> AGENT E
  graphLinks.push(
    { id: 'L-1', source: 'CUS-DEMO-1042', target: 'DEV-DEMO-101', type: 'USED_DEVICE' },
    { id: 'L-2', source: 'CUS-DEMO-1042', target: 'DEV-DEMO-104', type: 'USED_DEVICE', isSuspicious: true },
    { id: 'L-3', source: 'CUS-DEMO-1042', target: 'WALLET-DEMO-809', type: 'SENT_TO', amount: 18500, isSuspicious: true },
    { id: 'L-4', source: 'CUS-DEMO-1042', target: 'WALLET-DEMO-810', type: 'SENT_TO', amount: 15000, isSuspicious: true },
    { id: 'L-5', source: 'WALLET-DEMO-809', target: 'WALLET-DEMO-811', type: 'TRANSFER_CHAIN', amount: 17800, isSuspicious: true },
    { id: 'L-6', source: 'WALLET-DEMO-811', target: 'AGENT-DEMO-007', type: 'VISITED_AGENT', amount: 17500, isSuspicious: true },
    { id: 'L-7', source: 'DEV-DEMO-104', target: 'WALLET-DEMO-809', type: 'SHARED_DEVICE', isSuspicious: true },
    { id: 'L-8', source: 'DEV-DEMO-104', target: 'WALLET-DEMO-810', type: 'SHARED_DEVICE', isSuspicious: true },
    { id: 'L-9', source: 'CUS-DEMO-1042', target: 'CUS-DEMO-1002', type: 'SENT_TO', amount: 2200 },
    { id: 'L-10', source: 'CUS-DEMO-1042', target: 'MERCHANT-DEMO-004', type: 'PAID_MERCHANT', amount: 850 }
  );

  // Additional background links
  for (let i = 1; i <= 20; i++) {
    const src = customers[i].id;
    const tgt = customers[(i + 3) % 25].id;
    graphLinks.push({
      id: `L-BG-${i}`,
      source: src,
      target: tgt,
      type: 'SENT_TO',
      amount: 1500 + i * 200,
    });
  }

  // Calculate degrees for nodes
  graphNodes.forEach(node => {
    node.degree = graphLinks.filter(l => l.source === node.id || l.target === node.id).length;
  });

  const graphData: GraphData = {
    nodes: graphNodes,
    links: graphLinks,
    summary: {
      totalNodes: graphNodes.length,
      totalLinks: graphLinks.length,
      flaggedNodes: graphNodes.filter(n => n.isFlagged).length,
      suspiciousClusters: 2,
      networkDensity: 0.084,
    }
  };

  // 8. Model Performance Metrics (Clean synthetic evaluation test results)
  const modelMetrics: ModelMetrics[] = [
    {
      name: 'Google Gemini 3.8 Flash Grounded Investigator',
      version: 'v3.8-grounded-flash',
      type: 'Generative Synthesis & Structured Evidence Reasoning',
      precision: 99.4,
      recall: 96.8,
      f1Score: 98.1,
      falsePositiveRate: 0.6,
      detectionRate: 96.8,
      avgInvestigationTimeSec: 1.8,
      syntheticSampleSize: 1120,
      featuresUsed: [
        'strictly_bounded_evidence_object',
        'baseline_variance_zscore',
        'hardware_emulator_telemetry',
        'cluster_hop_provenance',
        'human_analyst_review_gate',
        'zero_hallucination_boundary'
      ],
      datasetLabel: 'DIU CPC × upay 2026 Synthetic Benchmarking Corpus',
    },
    {
      name: 'Isolation Forest Anomaly Engine',
      version: 'v2.4-synthetic-baseline',
      type: 'Unsupervised Multi-Dimensional Outlier Detection',
      precision: 93.8,
      recall: 91.2,
      f1Score: 92.5,
      falsePositiveRate: 2.3,
      detectionRate: 91.2,
      avgInvestigationTimeSec: 42,
      syntheticSampleSize: 1120,
      featuresUsed: [
        'transaction_amount_zscore',
        'historical_median_ratio',
        'velocity_1hr_count',
        'recipient_novelty_flag',
        'device_hardware_hash_novelty',
        'circadian_hour_deviation',
        'graph_hop_distance_to_mule'
      ],
      datasetLabel: 'DIU CPC × upay 2026 Synthetic Benchmarking Corpus',
    },
    {
      name: 'TrustGraph Centrality & Ring Classifier',
      version: 'v1.8-graph-analytics',
      type: 'Graph Topology & Rapid Chain Detection',
      precision: 95.1,
      recall: 89.4,
      f1Score: 92.2,
      falsePositiveRate: 1.8,
      detectionRate: 89.4,
      avgInvestigationTimeSec: 35,
      syntheticSampleSize: 1120,
      featuresUsed: [
        'weighted_in_degree',
        'shared_hardware_multiplier',
        'temporal_retention_window_minutes',
        'cash_out_concentration_ratio',
        'bipartite_clustering_coefficient'
      ],
      datasetLabel: 'DIU CPC × upay 2026 Synthetic Benchmarking Corpus',
    },
    {
      name: 'Deterministic Behavioral Baseline DNA Engine',
      version: 'v3.1-behavioral-dna',
      type: 'Continuous 90-Day Baseline Profile Variance',
      precision: 97.2,
      recall: 94.6,
      f1Score: 95.9,
      falsePositiveRate: 1.1,
      detectionRate: 94.6,
      avgInvestigationTimeSec: 12,
      syntheticSampleSize: 1120,
      featuresUsed: [
        'median_amount_90d_ratio',
        'circadian_active_hours_window',
        'favorite_transaction_type_match',
        'device_pairing_history_count',
        'recipient_trust_score'
      ],
      datasetLabel: 'DIU CPC × upay 2026 Synthetic Benchmarking Corpus',
    },
    {
      name: 'Velocity & Rapid Dispersion Detector',
      version: 'v2.0-velocity-chain',
      type: 'Temporal Burst & Multi-Account Drain Defense',
      precision: 96.5,
      recall: 93.1,
      f1Score: 94.8,
      falsePositiveRate: 1.4,
      detectionRate: 93.1,
      avgInvestigationTimeSec: 8,
      syntheticSampleSize: 1120,
      featuresUsed: [
        'sliding_window_burst_counter',
        'inter_transaction_interval_seconds',
        'immediate_cashout_velocity',
        'cross_wallet_multiplexing'
      ],
      datasetLabel: 'DIU CPC × upay 2026 Synthetic Benchmarking Corpus',
    }
  ];

  // 9. Dynamic Rules (Hot-Reloadable Engine & Shadow Mode)
  const dynamicRules: DynamicRule[] = [
    {
      id: 'RULE-2026-001',
      name: 'Nighttime High-Value Drain Intercept',
      description: 'Intercept transfers > ৳15,000 initiated from unrecognized devices or during high-risk hours.',
      conditionField: 'amount',
      conditionOperator: '>',
      conditionValue: 15000,
      action: 'SOFT_QUARANTINE',
      mode: 'ACTIVE',
      enabled: true,
      createdBy: 'CAMLCO Compliance Office',
      createdAt: '2026-09-29T10:00:00Z',
      shadowMatchesCount: 14,
      falsePositiveRate: 0.8,
    },
    {
      id: 'RULE-2026-002',
      name: 'Emulator + Rapid Velocity Guard',
      description: 'Shadow testing: evaluate all transactions with riskScore >= 80 originating from emulators.',
      conditionField: 'riskScore',
      conditionOperator: '>=',
      conditionValue: 80,
      action: 'FLAG_FOR_REVIEW',
      mode: 'SHADOW',
      enabled: true,
      createdBy: 'Risk Analytics Lab',
      createdAt: '2026-09-30T14:30:00Z',
      shadowMatchesCount: 29,
      falsePositiveRate: 1.2,
    },
    {
      id: 'RULE-2026-003',
      name: 'Super High-Value Outbound Dual-Auth Gate',
      description: 'Enforce Maker-Checker Dual-Authorization for any single transaction exceeding ৳50,000.',
      conditionField: 'amount',
      conditionOperator: '>',
      conditionValue: 50000,
      action: 'BLOCK',
      mode: 'ACTIVE',
      enabled: true,
      createdBy: 'Super Admin',
      createdAt: '2026-10-01T08:00:00Z',
      shadowMatchesCount: 6,
      falsePositiveRate: 0.1,
    }
  ];

  // 10. Initial Cryptographically Chained Audit Logs (SHA-256 Block Chained)
  let lastHash = GENESIS_HASH;
  const initialLogs = [
    {
      id: 'LOG-001',
      timestamp: '2026-10-01T07:00:00Z',
      actor: 'System Admin',
      action: 'LOGIN' as const,
      resource: 'Sentinel Command Center',
      details: 'Analyst portal initialized in synthetic demo environment.'
    },
    {
      id: 'LOG-002',
      timestamp: '2026-10-01T19:46:15Z',
      actor: 'Quarantine Escrow Engine',
      action: 'QUARANTINE_RELEASED' as const,
      resource: 'TX-DEMO-49281',
      details: 'Automatic 15-minute soft quarantine window activated for ৳18,500 high-risk transfer.'
    },
    {
      id: 'LOG-003',
      timestamp: '2026-10-01T19:49:05Z',
      actor: 'Sentinel Risk Engine',
      action: 'CASE_OPENED' as const,
      resource: 'CASE-2026-8941',
      details: 'Automatic escalation for CUS-DEMO-1042 triggered by risk score 86 HIGH.'
    },
    {
      id: 'LOG-004',
      timestamp: '2026-10-01T19:50:00Z',
      actor: 'Fahad Ahmed (Senior Fraud Analyst)',
      action: 'DUAL_AUTH_REQUESTED' as const,
      resource: 'CASE-2026-8941',
      details: 'Requested Maker-Checker CAMLCO dual-authorization for wallet suspension & SAR submission.'
    }
  ];

  for (const raw of initialLogs) {
    const hash = calculateLogHash(lastHash, raw.id, raw.timestamp, raw.actor, raw.action, raw.resource, raw.details);
    auditLogs.push({
      ...raw,
      prevHash: lastHash,
      hash,
    });
    lastHash = hash;
  }
  // Store newest first for display
  auditLogs.reverse();

  return {
    customers,
    transactions,
    agents,
    merchants,
    devices,
    cases,
    graphData,
    modelMetrics,
    auditLogs,
    dynamicRules,
  };
}

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export function calculateLogHash(
  prevHash: string,
  id: string,
  timestamp: string,
  actor: string,
  action: string,
  resource: string,
  details: string
): string {
  return computeSha256(`${prevHash}|${id}|${timestamp}|${actor}|${action}|${resource}|${details}`);
}

// Global in-memory dataset instance with persistence & reset capability
let currentDataset = generateSyntheticSeed();

export function getDataset() {
  return currentDataset;
}

export function resetDatasetToSeed() {
  currentDataset = generateSyntheticSeed();
  return currentDataset;
}

export function addTransactionToDataset(tx: Transaction) {
  currentDataset.transactions.unshift(tx);
  const cust = currentDataset.customers.find(c => c.id === tx.customerId);
  if (cust && (tx.riskAssessment.riskLevel === 'HIGH' || tx.riskAssessment.riskLevel === 'CRITICAL')) {
    cust.activeAlertCount += 1;
    cust.currentRiskLevel = tx.riskAssessment.riskLevel;
  }
}

export function addCaseToDataset(newCase: InvestigationCase) {
  currentDataset.cases.unshift(newCase);
}

export function addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp' | 'prevHash' | 'hash'>) {
  const id = `LOG-${Date.now().toString().slice(-4)}`;
  const timestamp = new Date().toISOString();
  // auditLogs is stored newest first, so previous chronological block's hash is auditLogs[0]?.hash
  const prevHash = currentDataset.auditLogs[0]?.hash || GENESIS_HASH;
  const hash = calculateLogHash(prevHash, id, timestamp, entry.actor, entry.action, entry.resource, entry.details);

  const log: AuditLog = {
    ...entry,
    id,
    timestamp,
    prevHash,
    hash,
  };
  currentDataset.auditLogs.unshift(log);
  return log;
}

export function verifyAuditChain(logs: AuditLog[] = currentDataset.auditLogs) {
  const chronological = [...logs].reverse();
  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < chronological.length; i++) {
    const block = chronological[i];
    if (block.prevHash !== expectedPrevHash) {
      return {
        isValid: false,
        totalBlocks: logs.length,
        brokenIndex: i,
        brokenBlockId: block.id,
        reason: `Previous hash link broken at block ${block.id}. Expected ${expectedPrevHash.slice(0, 12)}..., found ${block.prevHash?.slice(0, 12)}...`,
        verifiedAt: new Date().toISOString(),
      };
    }
    const computed = calculateLogHash(
      block.prevHash || GENESIS_HASH,
      block.id,
      block.timestamp,
      block.actor,
      block.action,
      block.resource,
      block.details
    );
    if (computed !== block.hash) {
      return {
        isValid: false,
        totalBlocks: logs.length,
        brokenIndex: i,
        brokenBlockId: block.id,
        reason: `Cryptographic tamper detected at block ${block.id}: computed hash ${computed.slice(0, 12)}... does not match sealed hash ${block.hash?.slice(0, 12)}...`,
        verifiedAt: new Date().toISOString(),
      };
    }
    expectedPrevHash = block.hash!;
  }

  return {
    isValid: true,
    totalBlocks: logs.length,
    latestBlockHash: logs[0]?.hash || GENESIS_HASH,
    genesisHash: GENESIS_HASH,
    verifiedAt: new Date().toISOString(),
  };
}

export function getDynamicRules(): DynamicRule[] {
  return currentDataset.dynamicRules;
}

export function addDynamicRule(rule: DynamicRule): DynamicRule {
  currentDataset.dynamicRules.unshift(rule);
  return rule;
}

export function toggleDynamicRule(id: string): DynamicRule | null {
  const r = currentDataset.dynamicRules.find(rule => rule.id === id);
  if (!r) return null;
  r.enabled = !r.enabled;
  return r;
}

export function updateTransactionQuarantine(
  txId: string,
  status: Transaction['quarantineStatus']
): Transaction | null {
  const tx = currentDataset.transactions.find(t => t.id === txId);
  if (!tx) return null;
  tx.quarantineStatus = status;
  if (status === 'BLOCKED_BY_SENDER' || status === 'BLOCKED_BY_ANALYST') {
    tx.status = 'BLOCKED';
  } else if (status === 'RELEASED') {
    tx.status = 'COMPLETED';
  }
  return tx;
}

export function updateCaseDualAuth(
  caseId: string,
  status: 'APPROVED' | 'REJECTED',
  approver: string
): InvestigationCase | null {
  const c = currentDataset.cases.find(x => x.id === caseId);
  if (!c) return null;
  c.dualAuthStatus = status;
  c.dualAuthApprovedBy = approver;
  c.updatedTime = new Date().toISOString();
  return c;
}

export function evaluateDryRun(rule: Partial<DynamicRule>) {
  const txs = currentDataset.transactions;
  let matchesCount = 0;
  let totalValueBDT = 0;
  let lowRiskFalsePositives = 0;
  const sampleMatches: Transaction[] = [];

  for (const tx of txs) {
    let matches = false;
    const op = rule.conditionOperator || '>';
    const val = rule.conditionValue;

    if (rule.conditionField === 'amount') {
      const numVal = Number(val) || 0;
      if (op === '>') matches = tx.amount > numVal;
      else if (op === '>=') matches = tx.amount >= numVal;
      else if (op === '<') matches = tx.amount < numVal;
      else if (op === '<=') matches = tx.amount <= numVal;
      else if (op === '==') matches = tx.amount === numVal;
    } else if (rule.conditionField === 'riskScore') {
      const numVal = Number(val) || 0;
      const score = tx.riskAssessment?.riskScore || 0;
      if (op === '>') matches = score > numVal;
      else if (op === '>=') matches = score >= numVal;
      else if (op === '<') matches = score < numVal;
      else if (op === '<=') matches = score <= numVal;
      else if (op === '==') matches = score === numVal;
    } else if (rule.conditionField === 'isEmulator') {
      matches = tx.deviceId === 'DEV-DEMO-104' || (tx.deviceModel?.toLowerCase().includes('emulated') ?? false);
    } else if (rule.conditionField === 'isNewRecipient') {
      matches = tx.isNewRecipient === (String(val) === 'true' || val === true);
    } else if (rule.conditionField === 'velocity') {
      const vel = tx.riskAssessment?.signals?.find(s => s.name.includes('Velocity'))?.score || 0;
      matches = vel >= (Number(val) || 15);
    } else if (rule.conditionField === 'isNight') {
      const hours = new Date(tx.timestamp).getUTCHours();
      matches = hours >= 17 || hours <= 23;
    }

    if (matches) {
      matchesCount++;
      totalValueBDT += tx.amount;
      if (tx.riskAssessment?.riskLevel === 'LOW') {
        lowRiskFalsePositives++;
      }
      if (sampleMatches.length < 5) {
        sampleMatches.push(tx);
      }
    }
  }

  const fpr = matchesCount > 0 ? Number(((lowRiskFalsePositives / matchesCount) * 100).toFixed(1)) : 0.0;

  return {
    totalScanned: txs.length,
    matchesCount,
    totalValueBDT,
    estimatedFPR: fpr,
    sampleMatches,
  };
}
