import { 
  ToolDefinition, 
  ToolRiskLevel, 
  OrganizationRecord, 
  UserRecord, 
  AgentRecord, 
  OrgGovernancePolicy 
} from '../db/types';
import { db } from '../db/database';
import { PermissionService } from './permissionService';

export interface RiskEvaluationResult {
  riskLevel: ToolRiskLevel;
  requiresApproval: boolean;
  reason: string;
}

export class RiskEngine {
  /**
   * Evaluates the risk level and approval requirement for a proposed tool execution
   */
  public static evaluateToolRisk(
    tool: ToolDefinition,
    organization: OrganizationRecord,
    user: UserRecord,
    agent?: AgentRecord,
    context?: {
      clientId?: string;
      projectId?: string;
      input?: Record<string, any>;
      isApprovalExecution?: boolean;
    }
  ): RiskEvaluationResult {
    // 1. If executing an already approved approval record, bypass re-triggering approval
    if (context?.isApprovalExecution) {
      return {
        riskLevel: tool.risk_level,
        requiresApproval: false,
        reason: 'Action has been approved and validated by human operator.'
      };
    }

    let riskLevel = tool.risk_level;
    let requiresApproval = tool.requires_approval;
    let reason = `Standard risk level [${tool.risk_level}] for ${tool.name}.`;

    // 2. Fetch Organization AI Governance Policies
    const policies = db.get('governance_policies') || [];
    const orgPolicy: OrgGovernancePolicy = policies.find(p => p.organization_id === organization.id) || {
      id: `gov_${organization.id}`,
      organization_id: organization.id,
      official_truth_gate: true,
      external_communication_gate: true,
      design_publishing_gate: true,
      commercial_budget_enforcement: true,
      updated_at: new Date().toISOString()
    };

    // 3. Evaluate AI Governance Gates
    if (tool.id === 'communication.send') {
      if (orgPolicy.external_communication_gate) {
        requiresApproval = true;
        reason = 'External Communication Gate is active: Outbound messages require human review.';
      }
    }

    if (tool.id === 'memory.approve') {
      if (orgPolicy.official_truth_gate) {
        requiresApproval = true;
        reason = 'Official Truth Modification Gate is active: Elevating memory to official truth requires confirmation.';
      }
    }

    if (tool.id === 'memory.update' && context?.input?.status === 'OFFICIAL') {
      if (orgPolicy.official_truth_gate) {
        riskLevel = 'HIGH';
        requiresApproval = true;
        reason = 'Official Truth Modification Gate is active: Direct write to official memory requires confirmation.';
      }
    }

    if (tool.id === 'figma.publish' || tool.id === 'document.publish') {
      if (orgPolicy.design_publishing_gate) {
        requiresApproval = true;
        reason = 'Design Asset Publishing Gate is active: Deliverable publishing requires human verification.';
      }
    }

    if (tool.id === 'invoice.send' || tool.id === 'quotation.send' || tool.id === 'financial_action') {
      if (orgPolicy.commercial_budget_enforcement) {
        requiresApproval = true;
        reason = 'Commercial Budget Enforcement is active: Financial and quotation actions require studio confirmation.';
      }
    }

    // 4. Client-level overrides
    if (context?.clientId) {
      const clientPerms = PermissionService.getPermissions(organization.id, context.clientId);
      if (tool.id === 'communication.send' && clientPerms.send_client_messages === 'approval_required') {
        requiresApproval = true;
        reason = 'Client-specific rule enforces review before sending messages.';
      }
      if (tool.id === 'figma.publish' && clientPerms.publish_design === 'approval_required') {
        requiresApproval = true;
        reason = 'Client-specific rule enforces review before publishing designs.';
      }
      if (tool.id === 'invoice.send' && clientPerms.send_invoice === 'approval_required') {
        requiresApproval = true;
        reason = 'Client-specific rule enforces review before issuing invoices.';
      }
      if (tool.id === 'quotation.send' && clientPerms.send_quotation === 'approval_required') {
        requiresApproval = true;
        reason = 'Client-specific rule enforces review before sending quotations.';
      }
      if (tool.id === 'memory.update' && clientPerms.modify_client_memory === 'approval_required') {
        requiresApproval = true;
        reason = 'Client-specific rule enforces review for modifying memory.';
      }
    }

    // 5. Critical risk safety override
    if (riskLevel === 'CRITICAL') {
      requiresApproval = true;
      reason = 'CRITICAL SECURITY LEVEL: Requires strict confirmation before execution.';
    }

    return {
      riskLevel,
      requiresApproval,
      reason
    };
  }
}
