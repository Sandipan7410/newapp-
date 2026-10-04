export interface SampleTestCase {
  id: string;
  title: string;
  badge: string;
  description: string;
  documentTitle: string;
  documentUrl: string;
  date: string;
  text: string;
  expectedOutcomes: {
    decisionsCount: number;
    actionItemsCount: number;
    missingOwnerCheck: string;
    undecidedDiscussionCheck: string;
    missingDateCheck: string;
  };
}

export const SAMPLE_TEST_CASES: SampleTestCase[] = [
  {
    id: 'test-case-1',
    title: 'Test Case 1: Core Synthesis (Full Workflow)',
    badge: 'Comprehensive Sync',
    description:
      'Tests standard decision extraction, an action with an explicit owner & due date, an action with a Missing owner, and an undecided debate excluded from decisions.',
    documentTitle: 'Atlas Platform Q4 Architecture & Planning Notes',
    documentUrl: 'https://docs.google.com/document/d/1AtlasPlatform_Q4Notes_Sample/edit',
    date: '2026-10-02',
    expectedOutcomes: {
      decisionsCount: 2,
      actionItemsCount: 3,
      missingOwnerCheck: 'Action "Benchmark database query performance under 10k RPS" has Missing owner.',
      undecidedDiscussionCheck: 'KeyDB vs Redis migration debate is excluded from decisions.',
      missingDateCheck: 'Action "Audit third-party API rate limits" has Missing due date.',
    },
    text: `# Atlas Platform Q4 Architecture & Planning Notes
Date: October 2, 2026
Attendees: Sarah Chen (Engineering Lead), Marcus Vance (Product Manager), Elena Rostova (Staff Architect), Liam Kelly (DevOps)

## 1. Welcome & Project Scope
The committee convened to review Q4 platform investments and scalability bottlenecks observed during September high-traffic spikes.

## 2. Service Framework Standard
Sarah presented evaluation metrics for unifying microservices across the core product.
- Decision finalized: "We will standardize all new customer-facing backend services on Node.js and TypeScript starting in Q4."
- Unanimously adopted by the engineering committee.

## 3. Roadmapping Process
Marcus proposed adjusting the team sprint cadence.
- Decision finalized: "Shift engineering roadmaps to quarterly milestone reviews starting November 1, replacing bi-weekly roadmap churn."
- Team agreed to document this in the team wiki.

## 4. In-Memory Caching Strategy Debate (UNDECIDED DISCUSSION)
Elena presented benchmark tests suggesting KeyDB could provide superior multi-threading compared to our existing Redis clusters.
However, Liam raised severe concerns regarding memory limits, existing sentinel tooling compatibility, and the lack of an enterprise security audit.
Marcus suggested delaying any decision until load tests can be executed on staging.
After 25 minutes of heated debate, NO DECISION was made. The committee agreed to table this topic until next quarter's architecture summit.

## 5. Action Items & Follow-ups
- Sarah Chen will draft the TypeScript service template and linting configuration by Oct 15.
- Someone needs to benchmark database query performance under 10k RPS load before Oct 22. (Action item noted, but no owner was assigned during the meeting).
- Marcus Vance agreed to audit third-party API rate limits and alert thresholds, but no deadline was set.

## 6. Open Questions
- Question: Will the staging cloud budget accommodate the additional high-memory instances needed for the Q4 load test? (Elena to follow up with Finance).
`,
  },
  {
    id: 'test-case-2',
    title: 'Test Case 2: Undecided Discussion & Debate',
    badge: 'Debate vs Decision',
    description:
      'Focuses strictly on verifying that heated technical debates and rejected/tabled ideas are NOT extracted as decisions.',
    documentTitle: 'Data Pipeline Modernization - Tech Spike Review',
    documentUrl: 'https://docs.google.com/document/d/1DataPipeline_TechSpike_Sample/edit',
    date: '2026-10-03',
    expectedOutcomes: {
      decisionsCount: 1,
      actionItemsCount: 2,
      missingOwnerCheck: 'Action "Run query explain plans" has Missing owner.',
      undecidedDiscussionCheck: 'Proposed Apache Kafka migration was discussed and explicitly tabled; must not be recorded as a decision.',
      missingDateCheck: 'Action "Run query explain plans" has Missing due date.',
    },
    text: `# Data Pipeline Modernization - Tech Spike Review
Date: October 3, 2026
Chair: David Kim (Principal Data Engineer)

## Agenda: Ingestion Queue Architecture
David brought up a proposal to replace AWS SQS with an Apache Kafka cluster to support real-time stream aggregation.

### Discussion & Debate
- David strongly favored Kafka for stream partitions and event replay.
- Priya countered that Kafka cluster operational overhead would require at least 1.5 dedicated SREs which the team cannot afford.
- Jordan argued for Google Pub/Sub as a managed alternative.
- No consensus or agreement was reached. The team voted to pause the migration proposal and revisit only if event throughput exceeds 50,000 events/sec.
(Do not treat Kafka as approved).

### Concrete Decisions Made
- Agreed and approved: "Add read replicas to existing primary PostgreSQL database in us-east-1 to relieve immediate read strain."

### Actions
- Priya will provision the two PostgreSQL read replicas in Terraform by Oct 18.
- Urgent task: Someone needs to run query explain plans on the top 10 heaviest billing reports to identify missing composite indices.
`,
  },
  {
    id: 'test-case-3',
    title: 'Test Case 3: Ambiguous Action Item (No Owner)',
    badge: 'Missing Owner Test',
    description:
      'Tests that an action item without an explicit assignee is strictly tagged with owner as "Missing" and never hallucinated.',
    documentTitle: 'Customer Feedback & Q3 Churn Retrospective',
    documentUrl: 'https://docs.google.com/document/d/1CustomerFeedback_Q3Retro_Sample/edit',
    date: '2026-09-28',
    expectedOutcomes: {
      decisionsCount: 1,
      actionItemsCount: 3,
      missingOwnerCheck: 'Action "Consolidate customer survey quotes into summary presentation" explicitly has owner "Missing".',
      undecidedDiscussionCheck: 'Discounts policy brainstorm was undecided.',
      missingDateCheck: 'Action "Revise in-app onboarding tooltip copy" has Missing due date.',
    },
    text: `# Customer Feedback & Q3 Churn Retrospective
Date: September 28, 2026
Facilitator: Chloe Dupont

## Summary of Decisions
- Consensus reached: "Deprecate the legacy v1 export endpoint on November 30, 2026, and notify all remaining enterprise customers via banner."

## Brainstorming & Unfinalized Discussions
The team discussed whether to introduce a 20% retention discount for annual renewals who request cancellation. Finance objected; marketing asked for more research. Nothing was decided or approved.

## Assignments
- Chloe Dupont will draft the customer deprecation email announcement by October 10.
- Consolidate customer survey quotes into summary presentation for the executive staff meeting by October 12. (NOTE: The group discussed this urgent need, but no person took ownership).
- Revise in-app onboarding tooltip copy to clarify export options. Assigned to Jordan Lee. (Deadline was not discussed or confirmed).
`,
  },
  {
    id: 'test-case-4',
    title: 'Test Case 4: Missing Deadlines & Calendar Guard',
    badge: 'Date Guardrail Test',
    description:
      'Tests calendar scheduling guardrails: prevents scheduling calendar events when due dates are marked as "Missing".',
    documentTitle: 'Brand Identity & Design System Council',
    documentUrl: 'https://docs.google.com/document/d/1DesignSystem_Council_Sample/edit',
    date: '2026-09-30',
    expectedOutcomes: {
      decisionsCount: 1,
      actionItemsCount: 2,
      missingOwnerCheck: 'All owners present.',
      undecidedDiscussionCheck: 'Font licensing discussion was tabled.',
      missingDateCheck: 'Action "Build dark mode palette tokens" has Missing date and must block Calendar event creation until date is set.',
    },
    text: `# Brand Identity & Design System Council
Date: September 30, 2026

## Decision
- Approved: "Adopt Geist as the primary typeface for all web applications and documentation."

## Open Debate
Discussion took place regarding purchasing an extended commercial license for an experimental serif font. The proposal was shelved due to budget constraints.

## Next Steps
- Carlos Gomez: Build dark mode palette tokens in Figma and export CSS variables. (No deadline specified; Carlos will work on it when sprint permits).
- Maya Lin: Package the Geist font files and update the typography documentation site by October 14, 2026.
`,
  },
  {
    id: 'test-case-5',
    title: 'Test Case 5: Security Post-Mortem & High Urgency Actions',
    badge: 'Security Post-Mortem',
    description:
      'Verifies extraction of critical security decisions with exact verbatim quotes and strict attribution.',
    documentTitle: 'Incident Post-Mortem: Auth Token Invalidation Delay',
    documentUrl: 'https://docs.google.com/document/d/1Security_PostMortem_Sample/edit',
    date: '2026-10-01',
    expectedOutcomes: {
      decisionsCount: 2,
      actionItemsCount: 2,
      missingOwnerCheck: 'Action "Conduct quarterly tabletop security drill" has Missing owner and date.',
      undecidedDiscussionCheck: 'Zero-trust VPN overhaul discussion postponed to 2027.',
      missingDateCheck: 'Action "Conduct quarterly tabletop security drill" has Missing due date.',
    },
    text: `# Incident Post-Mortem: Auth Token Invalidation Delay
Date: October 1, 2026
Lead: Alex Mercer (VP Information Security)

## Executive Decisions
- Formal approval: "Enforce mandatory FIDO2 hardware security keys for all developer accounts with production access effective October 20, 2026."
- Formal approval: "Reduce maximum OAuth session token lifetime from 30 days to 24 hours."

## Postponed Explorations
The team explored a complete zero-trust network overlay using WireGuard, but acknowledged it would disrupt remote engineers without months of testing. Postponed to 2027 infrastructure planning.

## Corrective Actions
- Rachel Green will implement the 24-hour token revocation worker in auth-service by October 9, 2026.
- Conduct quarterly tabletop security drill for the engineering on-call rotation. (Action requested by leadership, owner and date unassigned).
`,
  },
];
