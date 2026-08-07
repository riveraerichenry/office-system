import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

export const lucideIcons = Object.entries(
  Icons
)
  .filter(
    ([name]) =>
      ![
        "createLucideIcon",
        "Icon",
      ].includes(name)
  )
  .map(([name, icon]) => ({
    name,
    icon: icon as LucideIcon,
  }));