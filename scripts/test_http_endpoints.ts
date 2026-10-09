import { app } from '../server/app';
import { db } from '../server/db/database';
import http from 'http';

async function runHttpTests() {
  console.log('--- TESTING HTTP ENDPOINTS ---');
  db.resetToSeed();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}/api`;

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string, detail?: any) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      if (detail) console.error('  Detail:', detail);
      failed++;
    }
  }

  try {
    // 1. Login as owner
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@example.com', password: 'Owner123!' })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && Boolean(loginData.token), 'POST /api/auth/login');
    const token = loginData.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. GET /api/tools
    const toolsRes = await fetch(`${baseUrl}/tools`, { headers: authHeaders });
    const tools = await toolsRes.json();
    assert(toolsRes.status === 200 && Array.isArray(tools) && tools.length >= 20, 'GET /api/tools returns registered catalog');

    // 3. POST /api/tools/execute -> system.get_current_user
    const execRes = await fetch(`${baseUrl}/tools/execute`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ toolId: 'system.get_current_user', input: {} })
    });
    const execData = await execRes.json();
    assert(execRes.status === 200 && execData.success === true && Boolean(execData.data.user), 'POST /api/tools/execute for system.get_current_user');

    // 4. POST /api/tools/execute -> clients.create (real client creation)
    const createClientRes = await fetch(`${baseUrl}/tools/execute`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        toolId: 'clients.create',
        input: { company_name: 'Studio Autonomous Client', industry: 'Spatial AI' }
      })
    });
    const createClientData = await createClientRes.json();
    assert(
      createClientRes.status === 200 && 
      createClientData.success === true && 
      Boolean(createClientData.data.client.id), 
      'POST /api/tools/execute for clients.create creates real client record'
    );
    const createdClientId = createClientData.data.client.id;

    // 5. GET /api/agents
    const agentsRes = await fetch(`${baseUrl}/agents`, { headers: authHeaders });
    const agents = await agentsRes.json();
    assert(agentsRes.status === 200 && Array.isArray(agents) && agents.length >= 4, 'GET /api/agents returns agents with allowed and blocked tools');

    // 6. PATCH /api/agents/:id/tools
    const targetAgent = agents[0];
    const patchToolRes = await fetch(`${baseUrl}/agents/${targetAgent.id}/tools`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ toolId: 'system.get_current_organization', enabled: true })
    });
    const patchToolData = await patchToolRes.json();
    assert(patchToolRes.status === 200 && patchToolData.success === true, 'PATCH /api/agents/:id/tools updates tool permission boundary');

    // 7. GET /api/approvals
    const approvalsRes = await fetch(`${baseUrl}/approvals`, { headers: authHeaders });
    const approvals = await approvalsRes.json();
    assert(approvalsRes.status === 200 && Array.isArray(approvals), 'GET /api/approvals returns list of approvals');

    // 8. Trigger an approval requirement via communication.send
    const commsRes = await fetch(`${baseUrl}/tools/execute`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        toolId: 'communication.send',
        clientId: createdClientId,
        input: { channel: 'Slack', recipient: 'Lead Partner', message: 'Ready for delivery confirmation.' }
      })
    });
    const commsData = await commsRes.json();
    assert(commsRes.status === 202 && commsData.status === 'waiting_approval', 'POST /api/tools/execute returns 202 waiting_approval on high risk action');
    const newApprovalId = commsData.approvalId;

    // 9. POST /api/approvals/:id/approve -> executes real tool
    const approveRes = await fetch(`${baseUrl}/approvals/${newApprovalId}/approve`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({})
    });
    const approveData = await approveRes.json();
    assert(approveRes.status === 200 && approveData.approval.status === 'executed', 'POST /api/approvals/:id/approve immediately executes tool');

    // 10. GET /api/tool-executions
    const execsRes = await fetch(`${baseUrl}/tool-executions`, { headers: authHeaders });
    const execs = await execsRes.json();
    assert(execsRes.status === 200 && Array.isArray(execs) && execs.length > 0, 'GET /api/tool-executions returns real database execution log');

    // 11. GET & PATCH /api/governance
    const govRes = await fetch(`${baseUrl}/governance`, { headers: authHeaders });
    const govData = await govRes.json();
    assert(govRes.status === 200 && govData.official_truth_gate === true, 'GET /api/governance returns active gates');

    const updateGovRes = await fetch(`${baseUrl}/governance`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ design_publishing_gate: false })
    });
    const updatedGov = await updateGovRes.json();
    assert(updateGovRes.status === 200 && updatedGov.design_publishing_gate === false, 'PATCH /api/governance toggles gate');

  } finally {
    server.close();
  }

  console.log(`\nHTTP TESTS FINISHED: ${passed} PASSED, ${failed} FAILED.`);
  if (failed > 0) process.exit(1);
}

runHttpTests().catch(err => {
  console.error('HTTP test error:', err);
  process.exit(1);
});
