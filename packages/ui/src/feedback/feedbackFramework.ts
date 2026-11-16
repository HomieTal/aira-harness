import {
  DEFAULT_FEEDBACK_TICKET_FRAMEWORK,
  type AiraProvider,
  type FeedbackTicketFramework,
} from "@aira/shared";

export function inferFeedbackFrameworkFromAgentProvider(
  _provider: AiraProvider | null | undefined,
): FeedbackTicketFramework {
  return DEFAULT_FEEDBACK_TICKET_FRAMEWORK;
}
