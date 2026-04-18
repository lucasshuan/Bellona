"use client";

import { useState } from "react";
import { ChevronRight, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { DropdownItem, DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  EditProfileModal,
  type UserData,
} from "@/components/modals/profile/edit-profile-modal";

interface ProfileManageActionsProps {
  user: UserData;
}

export function ProfileManageActions({ user }: ProfileManageActionsProps) {
  const t = useTranslations();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  return (
    <>
      <DropdownMenu
        side="right"
        align="end"
        width={280}
        openOnHover
        trigger={
          <button
            type="button"
            className="no-lift group border-border relative z-10 -mt-px flex items-center gap-2 rounded-b-2xl border border-t-0 bg-[linear-gradient(180deg,rgb(20_13_22),rgb(11_8_15))] px-4 py-2.5 text-xs font-bold tracking-wider text-white/50 uppercase transition-colors hover:text-white"
          >
            <Settings2 className="size-4" />
            <span>{t("Admin.panel")}</span>
            <ChevronRight className="size-4 opacity-50 transition-transform group-hover:translate-x-1" />
          </button>
        }
      >
        <DropdownItem
          icon={Settings2}
          onClick={() => setIsEditProfileOpen(true)}
        >
          {t("Modals.EditProfile.trigger")}
        </DropdownItem>
      </DropdownMenu>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
      />
    </>
  );
}
