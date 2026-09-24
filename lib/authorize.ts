import { NextRequest } from "next/server";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "./current-user";
import { getUserModules } from "./user-modules";

export async function authorize(
  req: NextRequest,
  modulePath: string,
  permission:
    | "view"
    | "add"
    | "edit"
    | "delete"
    | "approve"
    | "print"
) {

  const user =
    await getCurrentUser(req);

  const modules =
    await getUserModules(user.id);

    


console.log(
  "AUTH DEBUG:",
  JSON.stringify(
    {
      userId: user.id,
      username: user.username,
      modules,
      lookingFor: modulePath,
      permission,
    },
    null,
    2
  )
);

  if (
    !hasPermission(
      modules,
      modulePath,
      permission
    )
  ) {
    throw new Error("FORBIDDEN");
  }

  return {
    ...user,
    modules,
  };

}