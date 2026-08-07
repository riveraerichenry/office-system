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

    


console.log("MODULES:", modules);

console.log("LOOKING FOR:", modulePath);
console.log("PERMISSION:", permission);

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