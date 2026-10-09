import { db } from '../server/db/database';
import { ToolExecutionService } from '../server/services/toolExecutionService';
import { ToolRegistryService } from '../server/services/toolRegistryService';
import { PermissionService } from '../server/services/permissionService';
import { RiskEngine } from '../server/services/riskEngine';
import { ClientService } from '../server/services/clientService';
import { ProjectService } from '../server/services/projectService';
import { TaskService } from '../server/services/taskService';
import { MemoryService } from '../server/services/memoryService';
import { DocumentService } from '../server/services/documentService';

async function runTestSuite() {
  console.log('====================================================');
  console.log('MATIAS AI STUDIO OS - TOOL REGISTRY & PERMISSIONS TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (detail) console.error('   Detail:', detail);
      failed++;
    }
  }

  // Reset to seed
  db.resetToSeed();

  // Seed two test organizations for isolation testing
  const orgA = 'org_test_tenant_a';
  const orgB = 'org_test_tenant_b';

  db.update('organizations', list => [
    ...list.filter(o => o.id !== orgA && o.id !== orgB),
    {
      id: orgA,
      name: 'Tenant Studio A',
      slug: 'tenant-a',
      status: 'active',
      plan: 'Studio',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: orgB,
      name: 'Tenant Studio B',
      slug: 'tenant-b',
      status: 'active',
      plan: 'Studio',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  // Seed users with different roles
  const userOwner = 'user_test_owner';
  const userMember = 'user_test_member';
  const userViewer = 'user_test_viewer';

  db.update('users', list => [
    ...list.filter(u => ![userOwner, userMember, userViewer].includes(u.id)),
    {
      id: userOwner,
      email: 'owner-test@tenant-a.com',
      password_hash: 'hash',
      password_salt: 'salt',
      name: 'Owner Tester',
      platform_role: 'USER',
      status: 'active',
      last_active_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: userMember,
      email: 'member-test@tenant-a.com',
      password_hash: 'hash',
      password_salt: 'salt',
      name: 'Member Tester',
      platform_role: 'USER',
      status: 'active',
      last_active_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: userViewer,
      email: 'viewer-test@tenant-a.com',
      password_hash: 'hash',
      password_salt: 'salt',
      name: 'Viewer Tester',
      platform_role: 'USER',
      status: 'active',
      last_active_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  db.update('organization_members', list => [
    ...list.filter(m => ![userOwner, userMember, userViewer].includes(m.user_id)),
    { id: 'mem_a_owner', organization_id: orgA, user_id: userOwner, role: 'OWNER', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'mem_a_member', organization_id: orgA, user_id: userMember, role: 'MEMBER', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'mem_a_viewer', organization_id: orgA, user_id: userViewer, role: 'VIEWER', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ]);

  // Seed resources for Tenant A and Tenant B
  const clientA = 'client_tenant_a_1';
  const clientB = 'client_tenant_b_1';
  const projA = 'proj_tenant_a_1';
  const projB = 'proj_tenant_b_1';

  db.update('clients', list => [
    ...list.filter(c => c.id !== clientA && c.id !== clientB),
    {
      id: clientA,
      organization_id: orgA,
      company_name: 'Client Alpha',
      industry: 'Design',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: clientB,
      organization_id: orgB,
      company_name: 'Client Beta',
      industry: 'Robotics',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  db.update('projects', list => [
    ...list.filter(p => p.project_id !== projA && p.project_id !== projB),
    {
      project_id: projA,
      organization_id: orgA,
      client_id: clientA,
      project_name: 'Alpha Brand Initiative',
      project_type: 'Design',
      description: 'Alpha',
      status: 'in_progress',
      deadline: '2026-12-01',
      priority: 'high',
      progress: 50,
      assigned_agents: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      project_id: projB,
      organization_id: orgB,
      client_id: clientB,
      project_name: 'Beta Robotics Identity',
      project_type: 'Identity',
      description: 'Beta',
      status: 'in_progress',
      deadline: '2026-12-01',
      priority: 'normal',
      progress: 30,
      assigned_agents: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  db.update('client_memory', list => [
    ...list.filter(m => m.id !== 'mem_a' && m.id !== 'mem_b'),
    {
      id: 'mem_a',
      organization_id: orgA,
      client_id: clientA,
      category: 'Brand',
      key: 'Primary Tone',
      value: 'Restrained elegance',
      status: 'OFFICIAL',
      source_type: 'Doc',
      source_id: 'doc_1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mem_b',
      organization_id: orgB,
      client_id: clientB,
      category: 'Brand',
      key: 'Confidential Beta Strategy',
      value: 'Top secret robotics launch',
      status: 'OFFICIAL',
      source_type: 'Brief',
      source_id: 'doc_2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  db.update('documents', list => [
    ...list.filter(d => d.file_id !== 'doc_a' && d.file_id !== 'doc_b'),
    {
      file_id: 'doc_a',
      organization_id: orgA,
      client_id: clientA,
      category: 'Brand',
      filename: 'Alpha_Guidelines.pdf',
      uploaded_at: new Date().toISOString(),
      uploaded_by: 'Owner Tester',
      status: 'uploaded'
    },
    {
      file_id: 'doc_b',
      organization_id: orgB,
      client_id: clientB,
      category: 'Brief',
      filename: 'Beta_Confidential_Specs.pdf',
      uploaded_at: new Date().toISOString(),
      uploaded_by: 'Other User',
      status: 'uploaded'
    }
  ]);

  // Setup Agents in Org A
  const agentDesign = 'ag_test_design';
  const agentRestricted = 'ag_test_restricted';

  db.update('agents', list => [
    ...list.filter(a => ![agentDesign, agentRestricted].includes(a.id)),
    {
      id: agentDesign,
      organization_id: orgA,
      name: 'Design Agent Test',
      role: 'Design Specialist',
      description: 'Has tasks and projects tools',
      status: 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: agentRestricted,
      organization_id: orgA,
      name: 'Restricted Agent Test',
      role: 'Read-only Assistant',
      description: 'Lacks write tools',
      status: 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  db.update('agent_tools', list => [
    ...list.filter(at => ![agentDesign, agentRestricted].includes(at.agent_id)),
    { id: 'at_test_1', organization_id: orgA, agent_id: agentDesign, tool_id: 'tasks.create', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'at_test_2', organization_id: orgA, agent_id: agentDesign, tool_id: 'tasks.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ]);

  console.log('--- 1. ROLE-BASED ACCESS CONTROL TESTS ---');

  // Test 1: OWNER executes clients.create -> allowed
  const resOwnerCreate = await ToolExecutionService.executeTool({
    toolId: 'clients.create',
    organizationId: orgA,
    userId: userOwner,
    input: { company_name: 'Studio Alpha Partner', industry: 'Design' }
  });
  assert(resOwnerCreate.success === true && resOwnerCreate.status === 'completed', 'OWNER: clients.create -> allowed', resOwnerCreate);

  // Test 2: MEMBER executes clients.create -> allowed (MEMBER has clients.create in matrix)
  const resMemberCreate = await ToolExecutionService.executeTool({
    toolId: 'clients.create',
    organizationId: orgA,
    userId: userMember,
    input: { company_name: 'Studio Alpha Client 2', industry: 'Design' }
  });
  assert(resMemberCreate.success === true && resMemberCreate.status === 'completed', 'MEMBER: clients.create -> allowed with permission', resMemberCreate);

  // Test 3: VIEWER executes clients.create -> denied
  const resViewerCreate = await ToolExecutionService.executeTool({
    toolId: 'clients.create',
    organizationId: orgA,
    userId: userViewer,
    input: { company_name: 'Unauthorized Client', industry: 'Design' }
  });
  assert(resViewerCreate.success === false && resViewerCreate.errorCode === 'PERMISSION_DENIED', 'VIEWER: clients.create -> denied with PERMISSION_DENIED', resViewerCreate);

  console.log('\n--- 2. AGENT TOOL BOUNDARY TESTS ---');

  // Test 4: Agent without tool: tasks.create -> denied (AGENT_NOT_ALLOWED)
  const resRestrictedAgent = await ToolExecutionService.executeTool({
    toolId: 'tasks.create',
    organizationId: orgA,
    userId: userOwner,
    agentId: agentRestricted,
    clientId: clientA,
    projectId: projA,
    input: { title: 'Restricted Agent Task' }
  });
  assert(
    resRestrictedAgent.success === false && 
    (resRestrictedAgent.errorCode === 'AGENT_NOT_ALLOWED' || resRestrictedAgent.errorCode === 'PERMISSION_DENIED'),
    'Agent without tool: tasks.create -> denied (AGENT_NOT_ALLOWED)',
    resRestrictedAgent
  );

  // Test 5: Agent with tool: tasks.create -> allowed
  const resAllowedAgent = await ToolExecutionService.executeTool({
    toolId: 'tasks.create',
    organizationId: orgA,
    userId: userOwner,
    agentId: agentDesign,
    clientId: clientA,
    projectId: projA,
    input: { title: 'Design Agent Task Approved By Boundary' }
  });
  assert(resAllowedAgent.success === true && resAllowedAgent.status === 'completed', 'Agent with tool: tasks.create -> allowed', resAllowedAgent);

  console.log('\n--- 3. RISK ENGINE & APPROVAL WORKFLOW TESTS ---');

  // Test 6: communication.send -> triggers approval_required
  const resCommsSend = await ToolExecutionService.executeTool({
    toolId: 'communication.send',
    organizationId: orgA,
    userId: userOwner,
    clientId: clientA,
    input: { channel: 'Slack', recipient: 'Lead Partner', message: 'Campaign deliverables are live.' }
  });
  assert(
    resCommsSend.success === true && resCommsSend.status === 'waiting_approval' && Boolean(resCommsSend.approvalId),
    'communication.send -> approval required (status: waiting_approval)',
    resCommsSend
  );

  const approvalId = resCommsSend.approvalId!;

  // Test 7: Approve the action -> executes the approved action
  const approvalBeforeExec = db.get('approvals').find(a => a.id === approvalId);
  assert(Boolean(approvalBeforeExec && approvalBeforeExec.status === 'pending'), 'Approval record stored with status pending');

  const resApprove = await ToolExecutionService.executeTool({
    toolId: 'communication.send',
    organizationId: orgA,
    userId: userOwner,
    clientId: clientA,
    input: { channel: 'Slack', recipient: 'Lead Partner', message: 'Campaign deliverables are live.' },
    approvalId
  });
  assert(resApprove.success === true && resApprove.status === 'completed', 'Human approves -> action executed successfully', resApprove);

  const approvalAfterExec = db.get('approvals').find(a => a.id === approvalId);
  assert(Boolean(approvalAfterExec && approvalAfterExec.status === 'executed'), 'Approval marked as executed');

  // Test 8: Expired approval -> APPROVAL_EXPIRED
  const expiredApprovalId = 'appr_expired_test';
  db.update('approvals', list => [
    ...list,
    {
      id: expiredApprovalId,
      organization_id: orgA,
      client_id: clientA,
      requested_by_type: 'user',
      requested_by_id: userOwner,
      tool_id: 'communication.send',
      risk_level: 'HIGH',
      status: 'pending',
      original_input: { channel: 'Email', message: 'Expired' },
      reason: 'Expired action',
      expires_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 7200000).toISOString()
    }
  ]);

  const resExpired = await ToolExecutionService.executeTool({
    toolId: 'communication.send',
    organizationId: orgA,
    userId: userOwner,
    clientId: clientA,
    input: { channel: 'Email', message: 'Expired' },
    approvalId: expiredApprovalId
  });
  assert(resExpired.success === false && resExpired.errorCode === 'APPROVAL_EXPIRED', 'Expired approval -> APPROVAL_EXPIRED', resExpired);

  // Test 9: Rejected approval -> no execution
  const rejectedApprovalId = 'appr_rejected_test';
  db.update('approvals', list => [
    ...list,
    {
      id: rejectedApprovalId,
      organization_id: orgA,
      client_id: clientA,
      requested_by_type: 'user',
      requested_by_id: userOwner,
      tool_id: 'communication.send',
      risk_level: 'HIGH',
      status: 'rejected',
      original_input: { channel: 'Slack', message: 'Do not send' },
      reason: 'Rejected action',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  const resRejected = await ToolExecutionService.executeTool({
    toolId: 'communication.send',
    organizationId: orgA,
    userId: userOwner,
    clientId: clientA,
    input: { channel: 'Slack', message: 'Do not send' },
    approvalId: rejectedApprovalId
  });
  assert(resRejected.success === false, 'Rejected approval -> no execution', resRejected);

  console.log('\n--- 4. IDEMPOTENCY KEY TESTS ---');

  // Test 10: Same idempotency key executes only once
  const idempotencyKey = 'test_key_123456';
  const resFirstExec = await ToolExecutionService.executeTool({
    toolId: 'tasks.create',
    organizationId: orgA,
    userId: userOwner,
    clientId: clientA,
    projectId: projA,
    input: { title: 'Idempotent Task A' },
    idempotencyKey
  });
  assert(resFirstExec.success === true, 'First idempotent execution succeeds');

  const resSecondExec = await ToolExecutionService.executeTool({
    toolId: 'tasks.create',
    organizationId: orgA,
    userId: userOwner,
    clientId: clientA,
    projectId: projA,
    input: { title: 'Idempotent Task A' },
    idempotencyKey
  });
  assert(
    resSecondExec.success === true && resSecondExec.executionId === resFirstExec.executionId,
    'Second execution with same idempotency_key returns cached execution without duplicating',
    resSecondExec
  );

  console.log('\n--- 5. MULTI-TENANT ISOLATION TESTS (ORG A vs ORG B) ---');

  // Test 11: Tenant A attempts to access Tenant B's Client
  const resCrossTenantClient = await ToolExecutionService.executeTool({
    toolId: 'clients.read',
    organizationId: orgA,
    userId: userOwner,
    clientId: clientB, // Belongs to Org B!
    input: {}
  });
  assert(
    resCrossTenantClient.success === false && resCrossTenantClient.errorCode === 'TENANT_MISMATCH',
    'Tenant A attempting to read Client B -> TENANT_MISMATCH',
    resCrossTenantClient
  );

  // Test 12: Tenant A attempts to create Task in Project B
  const resCrossTenantTask = await ToolExecutionService.executeTool({
    toolId: 'tasks.create',
    organizationId: orgA,
    userId: userOwner,
    clientId: clientB,
    projectId: projB, // Belongs to Org B!
    input: { title: 'Intrusion Task' }
  });
  assert(
    resCrossTenantTask.success === false && resCrossTenantTask.errorCode === 'TENANT_MISMATCH',
    'Tenant A attempting to create Task in Project B -> TENANT_MISMATCH',
    resCrossTenantTask
  );

  // Test 13: Tenant A attempts to read Memory B
  const memoriesOrgA = MemoryService.getClientMemory(orgA, clientB);
  assert(memoriesOrgA.length === 0, 'MemoryService.getClientMemory(Org A, Client B) returns empty (strict isolation)');

  const memoryDirectOrgA = MemoryService.getMemory(orgA, 'mem_b');
  assert(memoryDirectOrgA === null, 'MemoryService.getMemory(Org A, mem_b) returns null');

  // Test 14: Tenant A attempts to read Document B
  const docsOrgA = DocumentService.getDocuments(orgA, clientB);
  assert(docsOrgA.length === 0, 'DocumentService.getDocuments(Org A, Client B) returns empty (strict isolation)');

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});
