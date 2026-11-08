import type { Scopes } from "wcz-layout/models";

export const scopes = {
  graph: "User.Read",
  api: "api://wistron.com/project-name/access_as_user",
  cognitiveServices: "https://cognitiveservices.azure.com/.default",
  file: "api://wistron.com/file-api/access_as_user",
  peoplesoft: "api://wistron.com/peoplesoft-api/access_as_user",
  approval: "api://wistron.com/approval/access_as_user",
  email: "api://wistron.com/email/access_as_user",
} as const satisfies Scopes;
