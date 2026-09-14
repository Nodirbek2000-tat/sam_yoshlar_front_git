"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { Icon } from "@/components/icon";
import type { User } from "@/lib/types";

/**
 * Kirgan odam ro'yxatdan o'tish sahifasini ochsa — jimgina boshqa joyga
 * otib yubormaymiz, tanish yuz bilan kutib olamiz.
 */
export function AlreadyRegistered({
    user,
}: {
    user: Pick<User, "full_name" | "avatar" | "initials" | "role_display">;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
        >
            <div className="relative mx-auto grid size-28 place-items-center">
                {/* Avatar atrofida to'lqinlar */}
                {[0, 1].map((ring) => (
                    <motion.span
                        key={ring}
                        className="absolute inset-0 rounded-full border-2 border-accent"
                        initial={{ scale: 0.8, opacity: 0.6 }}
                        animate={{ scale: 1.45, opacity: 0 }}
                        transition={{ duration: 2.2, repeat: Infinity, delay: ring * 1.1, ease: "easeOut" }}
                    />
                ))}
                <motion.span
                    initial={{ scale: 0.5, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    className="relative grid size-24 place-items-center overflow-hidden rounded-full bg-invert text-2xl font-semibold text-on-invert ring-4 ring-page"
                >
                    {user.avatar ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={user.avatar} alt="" className="size-full object-cover" />
                    ) : (
                        user.initials
                    )}
                </motion.span>
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.35 }}
                    className="absolute bottom-1 right-1 grid size-8 place-items-center rounded-full bg-accent text-white ring-4 ring-page"
                >
                    <Icon name="check" size={15} strokeWidth={3} />
                </motion.span>
            </div>

            <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-7 text-3xl font-bold tracking-tight"
            >
                Siz allaqachon ro&apos;yxatdan o&apos;tgansiz
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-2 text-[15px] text-muted"
            >
                <span className="font-medium text-text">{user.full_name}</span> · {user.role_display}
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-8 grid gap-2.5"
            >
                <Link
                    href="/kabinet"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-invert py-3.5 text-[15px] font-semibold text-on-invert transition-opacity hover:opacity-90"
                >
                    Kabinetga o&apos;tish
                    <Icon
                        name="arrowRight"
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                </Link>
                <LogoutButton
                    name={user.full_name}
                    redirectTo="/royxatdan-otish"
                    className="rounded-xl border border-line py-3.5 text-[14px] font-medium text-muted transition-colors hover:bg-surface hover:text-text"
                >
                    Boshqa hisob bilan kirish
                </LogoutButton>
            </motion.div>
        </motion.div>
    );
}
