"use client";

import { useActionState, useRef } from "react";
import { changeUserRole } from "@/actions/users";
import { controlStyles } from "@/components/ui/field";
import type { Role } from "@/db/schema";
import { initialActionState } from "@/lib/action-state";
import { cn } from "@/lib/cn";
import { withToast } from "@/lib/with-toast";

interface RoleSelectProps {
  userId: number;
  role: Role;
  userName: string;
}

/** Liste déroulante qui change immédiatement le rôle d'un utilisateur. */
export function RoleSelect({ userId, role, userName }: RoleSelectProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [, formAction, pending] = useActionState(withToast(changeUserRole), initialActionState);

  return (
    <form ref={formRef} action={formAction}>
      <input type="hidden" name="id" value={userId} />
      <label htmlFor={`role-${userId}`} className="sr-only">
        Rôle de {userName}
      </label>
      <select
        id={`role-${userId}`}
        name="role"
        defaultValue={role}
        disabled={pending}
        onChange={() => formRef.current?.requestSubmit()}
        className={cn(controlStyles, "h-9 w-40")}
      >
        <option value="user">Utilisateur</option>
        <option value="admin">Administrateur</option>
      </select>
    </form>
  );
}
