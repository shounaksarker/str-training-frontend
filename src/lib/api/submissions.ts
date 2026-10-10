import { fetchBackend } from "./client";
import { BACKEND_ENDPOINTS } from "./endpoints";
import type { SubmissionRead } from "./types";

export function getSubmission(id: number): Promise<SubmissionRead> {
  return fetchBackend<SubmissionRead>(BACKEND_ENDPOINTS.submission(id));
}

export function getSubmissions(): Promise<SubmissionRead[]> {
  return fetchBackend<SubmissionRead[]>(BACKEND_ENDPOINTS.submissions);
}
