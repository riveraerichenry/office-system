export type Permission =
  | "view"
  | "add"
  | "edit"
  | "delete"
  | "approve"
  | "print";

export function hasPermission(
  modules: any[],
  modulePath: string,
  permission: Permission
) {
  const module = modules.find(
    (m) => m.path === modulePath
  );

  if (!module) return false;

  switch (permission) {
    case "view":
      return module.can_view;

    case "add":
      return module.can_add;

    case "edit":
      return module.can_edit;

    case "delete":
      return module.can_delete;

    case "approve":
      return module.can_approve;

    case "print":
      return module.can_print;

    default:
      return false;
  }
}